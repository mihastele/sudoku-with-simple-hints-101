// src/components/Board.jsx
import React from 'react';
import Cell from './Cell';
import './Board.css';

function Board({ board, initialBoard, onCellClick, selectedCell, highlights = [] }) {
    return (
        <div className="sudoku-board">
            {board.map((row, r) => (
                <div key={r} className="board-row">
                    {row.map((val, c) => {
                        const isSelected = selectedCell && selectedCell.row === r && selectedCell.col === c;
                        const isInitial = initialBoard[r][c] !== 0;

                        // Check if this cell is in the highlights array
                        const isHighlighted = highlights.some(h => h.row === r && h.col === c);

                        // Optional: Check if related to selected cell (same row/col/block)
                        let isRelated = false;
                        if (selectedCell) {
                            const sameRow = r === selectedCell.row;
                            const sameCol = c === selectedCell.col;
                            const sameBlock = Math.floor(r / 3) === Math.floor(selectedCell.row / 3) &&
                                Math.floor(c / 3) === Math.floor(selectedCell.col / 3);
                            isRelated = (sameRow || sameCol || sameBlock) && !isSelected;
                        }

                        return (
                            <Cell
                                key={`${r}-${c}`}
                                value={val}
                                onClick={() => onCellClick(r, c)}
                                isSelected={isSelected}
                                isInitial={isInitial}
                                isHighlighted={isHighlighted}
                                isRelated={isRelated}
                            />
                        );
                    })}
                </div>
            ))}
        </div>
    );
}

export default Board;
