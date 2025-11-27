// src/logic/solver.js
import { BLANK, isValid } from './sudoku';

export function getCandidates(board, row, col) {
    if (board[row][col] !== BLANK) return [];
    const candidates = [];
    for (let num = 1; num <= 9; num++) {
        if (isValid(board, row, col, num)) {
            candidates.push(num);
        }
    }
    return candidates;
}

export function getHint(board) {
    // 1. Check for Naked Singles (only one candidate for a cell)
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (board[r][c] === BLANK) {
                const candidates = getCandidates(board, r, c);
                if (candidates.length === 1) {
                    return {
                        type: 'NAKED_SINGLE',
                        row: r,
                        col: c,
                        value: candidates[0],
                        message: `Cell (${r + 1}, ${c + 1}) has only one possible value: ${candidates[0]}.`,
                        highlight: [{ row: r, col: c }]
                    };
                }
            }
        }
    }

    // 2. Check for Hidden Singles (a number can only go in one spot in a unit)
    // Check Rows
    for (let r = 0; r < 9; r++) {
        const counts = {}; // num -> [cols]
        for (let c = 0; c < 9; c++) {
            if (board[r][c] === BLANK) {
                const candidates = getCandidates(board, r, c);
                candidates.forEach(num => {
                    if (!counts[num]) counts[num] = [];
                    counts[num].push(c);
                });
            }
        }
        for (const num in counts) {
            if (counts[num].length === 1) {
                const c = counts[num][0];
                return {
                    type: 'HIDDEN_SINGLE_ROW',
                    row: r,
                    col: c,
                    value: parseInt(num),
                    message: `In row ${r + 1}, the number ${num} can only go in cell (${r + 1}, ${c + 1}).`,
                    highlight: Array.from({ length: 9 }, (_, i) => ({ row: r, col: i }))
                };
            }
        }
    }

    // Check Cols
    for (let c = 0; c < 9; c++) {
        const counts = {}; // num -> [rows]
        for (let r = 0; r < 9; r++) {
            if (board[r][c] === BLANK) {
                const candidates = getCandidates(board, r, c);
                candidates.forEach(num => {
                    if (!counts[num]) counts[num] = [];
                    counts[num].push(r);
                });
            }
        }
        for (const num in counts) {
            if (counts[num].length === 1) {
                const r = counts[num][0];
                return {
                    type: 'HIDDEN_SINGLE_COL',
                    row: r,
                    col: c,
                    value: parseInt(num),
                    message: `In column ${c + 1}, the number ${num} can only go in cell (${r + 1}, ${c + 1}).`,
                    highlight: Array.from({ length: 9 }, (_, i) => ({ row: i, col: c }))
                };
            }
        }
    }

    // Check Blocks (3x3)
    for (let br = 0; br < 3; br++) {
        for (let bc = 0; bc < 3; bc++) {
            const counts = {}; // num -> [{r, c}]
            const startRow = br * 3;
            const startCol = bc * 3;
            const blockCells = [];

            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    const r = startRow + i;
                    const c = startCol + j;
                    blockCells.push({ row: r, col: c });
                    if (board[r][c] === BLANK) {
                        const candidates = getCandidates(board, r, c);
                        candidates.forEach(num => {
                            if (!counts[num]) counts[num] = [];
                            counts[num].push({ r, c });
                        });
                    }
                }
            }

            for (const num in counts) {
                if (counts[num].length === 1) {
                    const { r, c } = counts[num][0];
                    return {
                        type: 'HIDDEN_SINGLE_BLOCK',
                        row: r,
                        col: c,
                        value: parseInt(num),
                        message: `In this 3x3 block, the number ${num} can only go in cell (${r + 1}, ${c + 1}).`,
                        highlight: blockCells
                    };
                }
            }
        }
    }

    return {
        type: 'NONE',
        message: "No simple hints found. Try guessing or using advanced techniques."
    };
}
