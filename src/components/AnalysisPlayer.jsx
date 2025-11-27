// src/components/AnalysisPlayer.jsx
import React, { useState, useEffect } from 'react';
import './AnalysisPlayer.css';

function AnalysisPlayer({ steps, onClose, onStepChange }) {
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        if (steps.length > 0) {
            onStepChange(steps[0]);
        }
    }, [steps, onStepChange]);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            const next = currentStep + 1;
            setCurrentStep(next);
            onStepChange(steps[next]);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            const prev = currentStep - 1;
            setCurrentStep(prev);
            onStepChange(steps[prev]);
        }
    };

    if (!steps || steps.length === 0) return null;

    return (
        <div className="analysis-player">
            <div className="analysis-header">
                <h3>Analysis</h3>
                <button className="close-btn" onClick={onClose}>×</button>
            </div>

            <div className="analysis-content">
                <p>{steps[currentStep].message}</p>
            </div>

            <div className="analysis-controls">
                <button
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    className="nav-btn"
                >
                    ← Prev
                </button>
                <span className="step-indicator">
                    {currentStep + 1} / {steps.length}
                </span>
                <button
                    onClick={handleNext}
                    disabled={currentStep === steps.length - 1}
                    className="nav-btn"
                >
                    Next →
                </button>
            </div>
        </div>
    );
}

export default AnalysisPlayer;
