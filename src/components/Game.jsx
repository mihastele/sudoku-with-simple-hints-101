// src/components/Game.jsx
import React, { useState, useEffect, useCallback } from 'react';
import Board from './Board';
import Controls from './Controls';
import { generatePuzzle, copyBoard, BLANK } from '../logic/sudoku';
import { getHint } from '../logic/solver';
import './Game.css';

function Game() {
    const [board, setBoard] = useState([]);
    const [initialBoard, setInitialBoard] = useState([]);
    const [selectedCell, setSelectedCell] = useState(null); // {row, col}
    const [difficulty, setDifficulty] = useState('easy');
    const [hint, setHint] = useState(null);

    const startNewGame = useCallback((diff = difficulty) => {
        const { fullBoard, puzzle } = generatePuzzle(diff);
        setBoard(puzzle);
        setInitialBoard(copyBoard(puzzle));
        setSelectedCell(null);
        setHint(null);
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

        // If the move matches the hint, clear the hint
        if (hint && hint.row === row && hint.col === col && hint.value === num) {
            setHint(null);
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
    };

    const handleDifficultyChange = (newDiff) => {
        setDifficulty(newDiff);
        startNewGame(newDiff);
    };

    if (board.length === 0) return <div className="loading">Generating Puzzle...</div>;

    return (
        <div className="game-container">
            <div className="game-main">
                <Board
                    board={board}
                    initialBoard={initialBoard}
                    onCellClick={handleCellClick}
                    selectedCell={selectedCell}
                    highlights={hint ? hint.highlight : []}
                />
            </div>

            <div className="game-sidebar">
                <Controls
                    onNumberClick={handleNumberInput}
                    onNewGame={() => startNewGame()}
                    onHint={handleHint}
                    onDifficultyChange={handleDifficultyChange}
                    difficulty={difficulty}
                />

                {hint && (
                    <div className="hint-box">
                        <h3>Hint</h3>
                        <p>{hint.message}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Game;
