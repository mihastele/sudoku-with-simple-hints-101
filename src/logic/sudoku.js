// src/logic/sudoku.js

export const BLANK = 0;

export function getEmptyBoard() {
    return Array.from({ length: 9 }, () => Array(9).fill(BLANK));
}

export function isValid(board, row, col, num) {
    // Check row
    for (let x = 0; x < 9; x++) {
        if (board[row][x] === num && x !== col) return false;
    }

    // Check col
    for (let y = 0; y < 9; y++) {
        if (board[y][col] === num && y !== row) return false;
    }

    // Check 3x3 box
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[startRow + i][startCol + j] === num && (startRow + i !== row || startCol + j !== col)) {
                return false;
            }
        }
    }

    return true;
}

function solveBoard(board) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === BLANK) {
                const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
                // Shuffle for randomness
                for (let i = nums.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [nums[i], nums[j]] = [nums[j], nums[i]];
                }

                for (const num of nums) {
                    if (isValid(board, row, col, num)) {
                        board[row][col] = num;
                        if (solveBoard(board)) return true;
                        board[row][col] = BLANK;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

export function generateFullBoard() {
    const board = getEmptyBoard();
    solveBoard(board);
    return board;
}

export function copyBoard(board) {
    return board.map(row => [...row]);
}

export function generatePuzzle(difficulty = 'easy') {
    const fullBoard = generateFullBoard();
    const puzzle = copyBoard(fullBoard);

    let attempts = difficulty === 'easy' ? 30 : difficulty === 'medium' ? 45 : 55;

    // Simple masking: remove random cells
    // Note: This doesn't guarantee a unique solution, but good enough for a simple game.
    // For a "learning guide", we might want to ensure it's solvable by logic.
    // We'll stick to random removal for now.

    while (attempts > 0) {
        let row = Math.floor(Math.random() * 9);
        let col = Math.floor(Math.random() * 9);
        if (puzzle[row][col] !== BLANK) {
            puzzle[row][col] = BLANK;
            attempts--;
        }
    }

    return { fullBoard, puzzle };
}
