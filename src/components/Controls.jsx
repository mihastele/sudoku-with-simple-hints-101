// src/components/Controls.jsx
import React from 'react';
import './Controls.css';

function Controls({ onNumberClick, onNewGame, onHint, onDifficultyChange, difficulty, onAnalyze, isHintActive }) {
    return (
        <div className="controls">
            <div className="game-actions">
                <select
                    value={difficulty}
                    onChange={(e) => onDifficultyChange(e.target.value)}
                    className="difficulty-select"
                >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                </select>
                <button className="btn-primary" onClick={onNewGame}>New Game</button>
                <button className="btn-secondary" onClick={onHint}>Hint 💡</button>
                <button className="btn-secondary" onClick={onAnalyze} disabled={!isHintActive}>Analyze 🔍</button>
            </div>

            <div className="number-pad">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <button key={num} className="num-btn" onClick={() => onNumberClick(num)}>
                        {num}
                    </button>
                ))}
                <button className="num-btn clear-btn" onClick={() => onNumberClick(0)}>
                    ⌫
                </button>
            </div>
        </div>
    );
}

export default Controls;
