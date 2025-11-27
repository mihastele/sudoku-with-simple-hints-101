// src/components/Cell.jsx
import React from 'react';

function Cell({
    value,
    onClick,
    isSelected,
    highlightType, // 'source', 'line', 'target', or undefined
    isInitial,
    isError,
    isRelated
}) {
    const classes = [
        'cell',
        isSelected ? 'selected' : '',
        highlightType ? `highlight-${highlightType}` : '',
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
