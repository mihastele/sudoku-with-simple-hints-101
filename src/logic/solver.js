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

export function getAnalysis(board, hint) {
    if (!hint || hint.type === 'NONE') return [];

    const steps = [];

    // Case 1: Naked Single (Cell has only 1 candidate)
    // We want to show why all OTHER numbers are impossible.
    if (hint.type === 'NAKED_SINGLE') {
        const { row, col, value } = hint;
        for (let num = 1; num <= 9; num++) {
            if (num === value) continue;

            // Find why 'num' is invalid for (row, col)
            // Check row
            let conflict = null;
            for (let c = 0; c < 9; c++) {
                if (board[row][c] === num) {
                    conflict = { type: 'row', r: row, c: c };
                    break;
                }
            }
            if (!conflict) {
                // Check col
                for (let r = 0; r < 9; r++) {
                    if (board[r][col] === num) {
                        conflict = { type: 'col', r: r, c: col };
                        break;
                    }
                }
            }
            if (!conflict) {
                // Check block
                const startRow = Math.floor(row / 3) * 3;
                const startCol = Math.floor(col / 3) * 3;
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        if (board[startRow + i][startCol + j] === num) {
                            conflict = { type: 'block', r: startRow + i, c: startCol + j };
                            break;
                        }
                    }
                }
            }

            if (conflict) {
                steps.push({
                    message: `${num} is not possible because it's already in the ${conflict.type} at (${conflict.r + 1}, ${conflict.c + 1}).`,
                    highlight: [{ row: conflict.r, col: conflict.c }, { row, col }], // Highlight conflict and target
                    invalidNumber: num // Optional: to show ghost number in target cell
                });
            }
        }
        steps.push({
            message: `Therefore, ${value} is the only possible value for this cell.`,
            highlight: [{ row, col }],
            isConclusion: true
        });
    }

    // Case 2: Hidden Single (Number can only go in one spot in a unit)
    // We want to show why the target number cannot go in ANY OTHER empty cell in that unit.
    else if (hint.type.startsWith('HIDDEN_SINGLE')) {
        const { row, col, value } = hint;

        // Helper to find conflict for 'value' at (r, c)
        const findConflict = (r, c) => {
            // Check row
            for (let x = 0; x < 9; x++) {
                if (x !== c && board[r][x] === value) return { r, c: x, type: 'row' };
            }
            // Check col
            for (let y = 0; y < 9; y++) {
                if (y !== r && board[y][c] === value) return { r: y, c, type: 'col' };
            }
            // Check block
            const sr = Math.floor(r / 3) * 3;
            const sc = Math.floor(c / 3) * 3;
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    const br = sr + i;
                    const bc = sc + j;
                    if ((br !== r || bc !== c) && board[br][bc] === value) {
                        return { r: br, c: bc, type: 'block' };
                    }
                }
            }
            return null;
        };

        if (hint.type === 'HIDDEN_SINGLE_ROW') {
            for (let c = 0; c < 9; c++) {
                if (c === col || board[row][c] !== BLANK) continue;
                const conflict = findConflict(row, c);
                if (conflict) {
                    steps.push({
                        message: `${value} cannot go in (${row + 1}, ${c + 1}) because of the ${value} at (${conflict.r + 1}, ${conflict.c + 1}).`,
                        highlight: [{ row: conflict.r, col: conflict.c }, { row, col: c }],
                        invalidNumber: value,
                        targetCell: { row, col: c } // The cell we are proving is invalid
                    });
                }
            }
        } else if (hint.type === 'HIDDEN_SINGLE_COL') {
            for (let r = 0; r < 9; r++) {
                if (r === row || board[r][col] !== BLANK) continue;
                const conflict = findConflict(r, col);
                if (conflict) {
                    steps.push({
                        message: `${value} cannot go in (${r + 1}, ${col + 1}) because of the ${value} at (${conflict.r + 1}, ${conflict.c + 1}).`,
                        highlight: [{ row: conflict.r, col: conflict.c }, { row: r, col }],
                        invalidNumber: value,
                        targetCell: { row: r, col }
                    });
                }
            }
        } else if (hint.type === 'HIDDEN_SINGLE_BLOCK') {
            const startRow = Math.floor(row / 3) * 3;
            const startCol = Math.floor(col / 3) * 3;
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    const r = startRow + i;
                    const c = startCol + j;
                    if ((r === row && c === col) || board[r][c] !== BLANK) continue;
                    const conflict = findConflict(r, c);
                    if (conflict) {
                        steps.push({
                            message: `${value} cannot go in (${r + 1}, ${c + 1}) because of the ${value} at (${conflict.r + 1}, ${conflict.c + 1}).`,
                            highlight: [{ row: conflict.r, col: conflict.c }, { row: r, col: c }],
                            invalidNumber: value,
                            targetCell: { row: r, col: c }
                        });
                    }
                }
            }
        }

        steps.push({
            message: `Therefore, ${value} must go in (${row + 1}, ${col + 1}) as it's the only spot left in this unit.`,
            highlight: [{ row, col }],
            isConclusion: true
        });
    }

    return steps;
}
