// src/components/Game.jsx
import React, { useState, useEffect, useCallback } from 'react';
import Board from './Board';
import Controls from './Controls';
import AnalysisPlayer from './AnalysisPlayer';
import { generatePuzzle, copyBoard, BLANK } from '../logic/sudoku';
import { getHint, getAnalysis } from '../logic/solver';
import './Game.css';

function Game() {
    const [board, setBoard] = useState([]);
    const [initialBoard, setInitialBoard] = useState([]);
    const [selectedCell, setSelectedCell] = useState(null); // {row, col}
    const [difficulty, setDifficulty] = useState('easy');
    const [hint, setHint] = useState(null);

    // Analysis State
    const [analysisSteps, setAnalysisSteps] = useState([]);
    const [currentAnalysisStep, setCurrentAnalysisStep] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const startNewGame = useCallback((diff = difficulty) => {
        const { fullBoard, puzzle } = generatePuzzle(diff);
        setBoard(puzzle);
        setInitialBoard(copyBoard(puzzle));
        setSelectedCell(null);
        setHint(null);
        setIsAnalyzing(false);
        setAnalysisSteps([]);
        setCurrentAnalysisStep(null);
    }, [difficulty]);

    useEffect(() => {
        startNewGame();
    }, []); // Run once on mount

    const handleCellClick = (row, col) => {
        setSelectedCell({ row, col });
        // Clear hint if user selects a different cell (optional, but good for UX)
        // setHint(null); 
    };

    const handleNumberInput = useCallback((num) => {
        if (!selectedCell) return;
        const { row, col } = selectedCell;

        // Cannot edit initial cells
        if (initialBoard[row][col] !== BLANK) return;

        const newBoard = copyBoard(board);
        newBoard[row][col] = num;
        setBoard(newBoard);

        // If the move matches the hint, clear the hint and analysis
        if (hint && hint.row === row && hint.col === col && hint.value === num) {
            setHint(null);
            setIsAnalyzing(false);
            setAnalysisSteps([]);
        }
    }, [board, selectedCell, initialBoard, hint]);

    // Keyboard support
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!selectedCell) return;

            const { row, col } = selectedCell;

            if (e.key >= '1' && e.key <= '9') {
                handleNumberInput(parseInt(e.key));
            } else if (e.key === 'Backspace' || e.key === 'Delete') {
                handleNumberInput(0);
            } else if (e.key === 'ArrowUp') {
                setSelectedCell(prev => ({ ...prev, row: Math.max(0, prev.row - 1) }));
            } else if (e.key === 'ArrowDown') {
                setSelectedCell(prev => ({ ...prev, row: Math.min(8, prev.row + 1) }));
            } else if (e.key === 'ArrowLeft') {
                setSelectedCell(prev => ({ ...prev, col: Math.max(0, prev.col - 1) }));
            } else if (e.key === 'ArrowRight') {
                setSelectedCell(prev => ({ ...prev, col: Math.min(8, prev.col + 1) }));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedCell, handleNumberInput]);

    const handleHint = () => {
        const newHint = getHint(board);
        setHint(newHint);
        // Reset analysis when getting a new hint
        setIsAnalyzing(false);
        setAnalysisSteps([]);
    };

    const handleAnalyze = () => {
        if (!hint) return;
        const steps = getAnalysis(board, hint);
        setAnalysisSteps(steps);
        setIsAnalyzing(true);
    };

    const handleAnalysisStepChange = (step) => {
        setCurrentAnalysisStep(step);
    };

    const handleCloseAnalysis = () => {
        setIsAnalyzing(false);
        setAnalysisSteps([]);
        setCurrentAnalysisStep(null);
    };

    const handleDifficultyChange = (newDiff) => {
        setDifficulty(newDiff);
        startNewGame(newDiff);
    };

    if (board.length === 0) return <div className="loading">Generating Puzzle...</div>;

    // Determine what highlights to show
    let highlights = [];
    if (isAnalyzing && currentAnalysisStep) {
        highlights = currentAnalysisStep.highlight;
    } else if (hint) {
        highlights = hint.highlight;
    }

    return (
        <div className="game-container">
            <div className="game-main">
                <Board
                    board={board}
                    initialBoard={initialBoard}
                    onCellClick={handleCellClick}
                    selectedCell={selectedCell}
                    highlights={highlights}
                />
            </div>

            <div className="game-sidebar">
                <Controls
                    onNumberClick={handleNumberInput}
                    onNewGame={() => startNewGame()}
                    onHint={handleHint}
                    onDifficultyChange={handleDifficultyChange}
                    difficulty={difficulty}
                    onAnalyze={handleAnalyze}
                    isHintActive={!!hint && hint.type !== 'NONE'}
                />

                {hint && !isAnalyzing && (
                    <div className="hint-box">
                        <h3>Hint</h3>
                        <p>{hint.message}</p>
                    </div>
                )}

                {isAnalyzing && (
                    <AnalysisPlayer
                        steps={analysisSteps}
                        onClose={handleCloseAnalysis}
                        onStepChange={handleAnalysisStepChange}
                    />
                )}
            </div>
        </div>
    );
}

export default Game;
