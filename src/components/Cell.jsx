// src/components/Cell.jsx
import React from 'react';

function Cell({
    value,
    onClick,
    isSelected,
    isHighlighted,
    isInitial,
    isError,
    isRelated // For row/col/block highlighting (optional polish)
}) {
    const classes = [
        'cell',
        isSelected ? 'selected' : '',
        isHighlighted ? 'highlighted' : '',
        isInitial ? 'initial' : '',
        isError ? 'error' : '',
        isRelated ? 'related' : '',
        value === 0 ? 'empty' : ''
    ].filter(Boolean).join(' ');

    return (
        <div className={classes} onClick={onClick}>
            {value !== 0 ? value : ''}
        </div>
    );
}

export default Cell;
