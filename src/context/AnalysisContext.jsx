import React, { createContext, useContext, useState } from 'react';

const AnalysisContext = createContext(null);

export const AnalysisProvider = ({ children }) => {
    const [analysisData, setAnalysisData] = useState(null);

    // Initial Default Settings
    const defaultSettings = {
        riskThresholds: {
            liquidityRatio: 1.0,
            debtToEquity: 2.5,
            netProfitMargin: 5.0
        },
        reportPreferences: {
            include5Cs: true,
            includeRiskAssessment: true,
            includeExecutiveSummary: true
        },
        apiSettings: {
            model: 'meta-llama/llama-4-scout-17b-16e-instruct',
            apiKey: '' // Blank by default
        }
    };

    // Load from localStorage or use defaults
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('appSettings');
        return saved ? JSON.parse(saved) : defaultSettings;
    });

    const updateSettings = (newSettings) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);
        localStorage.setItem('appSettings', JSON.stringify(updated));
    };

    return (
        <AnalysisContext.Provider value={{ analysisData, setAnalysisData, settings, updateSettings }}>
            {children}
        </AnalysisContext.Provider>
    );
};

export const useAnalysis = () => {
    const context = useContext(AnalysisContext);
    if (!context) {
        throw new Error('useAnalysis must be used within an AnalysisProvider');
    }
    return context;
};
