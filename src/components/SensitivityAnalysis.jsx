import React, { useState, useEffect } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { RotateCcw, Activity, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';

const SensitivityAnalysis = () => {
    const { analysisData, settings } = useAnalysis();

    // Default values if no data is present (e.g., direct navigation or mock fallback)
    const defaultMetrics = {
        liquidity: 1.5,
        ebitdaMargin: 15,
        debtToEquity: 1.8,
        netProfitMargin: 10,
        cash: 500000
    };

    const [baseMetrics, setBaseMetrics] = useState(defaultMetrics);
    const [scenarios, setScenarios] = useState(defaultMetrics);

    // Load data from context when available
    useEffect(() => {
        if (analysisData?.financial_metrics) {
            // Helper to extract value safely. 
            // Note: This logic assumes a specific structure in financial_metrics. 
            // We loop through to find matching categories/labels or rely on fixed indices if known.
            // For resilience, we'll look for keywords.
            const getMetric = (keyword) => {
                const metric = analysisData.financial_metrics.find(m =>
                    m.label.toLowerCase().includes(keyword.toLowerCase()) ||
                    m.category.toLowerCase().includes(keyword.toLowerCase())
                );
                return metric ? parseFloat(metric.value.toString().replace(/[^0-9.-]/g, '')) : null;
            };

            const loadedMetrics = {
                liquidity: getMetric('Current Ratio') || getMetric('Liquidity') || defaultMetrics.liquidity,
                ebitdaMargin: getMetric('EBITDA') || defaultMetrics.ebitdaMargin,
                debtToEquity: getMetric('Debt-to-Equity') || defaultMetrics.debtToEquity,
                netProfitMargin: getMetric('Net Profit') || defaultMetrics.netProfitMargin,
                cash: getMetric('Cash') || defaultMetrics.cash
            };

            setBaseMetrics(loadedMetrics);
            setScenarios(loadedMetrics);
        }
    }, [analysisData]);

    const handleChange = (metric, value) => {
        setScenarios(prev => ({
            ...prev,
            [metric]: parseFloat(value)
        }));
    };

    const resetValues = () => {
        setScenarios(baseMetrics);
    };

    const calculateRisk = (metrics) => {
        let riskScore = 0;
        // Use settings if available, otherwise fallback to defaults (safety check)
        const thresholds = settings?.riskThresholds || { debtToEquity: 2.5, liquidity: 1.0, netProfitMargin: 5.0 };

        if (metrics.debtToEquity > thresholds.debtToEquity) riskScore += 2;
        if (metrics.liquidity < thresholds.liquidityRatio) riskScore += 2;
        if (metrics.ebitdaMargin < 10) riskScore += 1; // Hardcoded fallback or add to settings later
        if (metrics.netProfitMargin < thresholds.netProfitMargin) riskScore += 1;

        if (riskScore >= 4) return { label: 'High Risk', color: 'text-rose-600', bg: 'bg-rose-100', border: 'border-rose-200' };
        if (riskScore >= 2) return { label: 'Medium Risk', color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200' };
        return { label: 'Low Risk', color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-200' };
    };

    const currentRisk = calculateRisk(scenarios);
    const baseRisk = calculateRisk(baseMetrics);

    const chartData = [
        { name: 'Liquidity', Base: baseMetrics.liquidity, Simulated: scenarios.liquidity },
        { name: 'D/E Ratio', Base: baseMetrics.debtToEquity, Simulated: scenarios.debtToEquity },
        // Percentages are on a different scale, might be better to visualize separately or normalize, 
        // but for simplicity we'll keep ratios together and margins together if needed.
        // Let's split into two charts or just show these two critical ratios for the main chart.
    ];

    const marginData = [
        { name: 'EBITDA %', Base: baseMetrics.ebitdaMargin, Simulated: scenarios.ebitdaMargin },
        { name: 'Net Profit %', Base: baseMetrics.netProfitMargin, Simulated: scenarios.netProfitMargin },
    ];

    return (
        <div className="h-full flex flex-col p-6 space-y-6 bg-slate-50/50 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Activity className="text-indigo-600" />
                        Sensitivity Analysis
                    </h1>
                    <p className="text-slate-500 text-sm">Stress-test financial health by adjusting key indicators.</p>
                </div>
                <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${currentRisk.bg} ${currentRisk.border}`}>
                    <AlertTriangle size={18} className={currentRisk.color} />
                    <span className={`font-bold ${currentRisk.color}`}>{currentRisk.label}</span>
                    {currentRisk.label !== baseRisk.label && (
                        <span className="text-xs text-slate-400 ml-2">(Changed from {baseRisk.label})</span>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Controls Panel */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-semibold text-slate-700">Model Inputs</h3>
                            <button
                                onClick={resetValues}
                                className="text-xs flex items-center gap-1 text-slate-500 hover:text-indigo-600 transition-colors"
                            >
                                <RotateCcw size={12} /> Reset
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Liquidity Slider */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Liquidity Ratio</span>
                                    <span className="font-mono font-bold text-indigo-600">{scenarios.liquidity.toFixed(2)}x</span>
                                </div>
                                <input
                                    type="range" min="0.5" max="5.0" step="0.1"
                                    value={scenarios.liquidity}
                                    onChange={(e) => handleChange('liquidity', e.target.value)}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                />
                            </div>

                            {/* Debt-to-Equity Slider */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Debt-to-Equity</span>
                                    <span className="font-mono font-bold text-rose-600">{scenarios.debtToEquity.toFixed(2)}</span>
                                </div>
                                <input
                                    type="range" min="0.0" max="10.0" step="0.1"
                                    value={scenarios.debtToEquity}
                                    onChange={(e) => handleChange('debtToEquity', e.target.value)}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                                />
                            </div>

                            {/* EBITDA Margin Slider */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">EBITDA Margin</span>
                                    <span className="font-mono font-bold text-emerald-600">{scenarios.ebitdaMargin.toFixed(1)}%</span>
                                </div>
                                <input
                                    type="range" min="-10" max="50" step="0.5"
                                    value={scenarios.ebitdaMargin}
                                    onChange={(e) => handleChange('ebitdaMargin', e.target.value)}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                />
                            </div>

                            {/* Net Profit Margin Slider */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Net Profit Margin</span>
                                    <span className="font-mono font-bold text-emerald-600">{scenarios.netProfitMargin.toFixed(1)}%</span>
                                </div>
                                <input
                                    type="range" min="-20" max="40" step="0.5"
                                    value={scenarios.netProfitMargin}
                                    onChange={(e) => handleChange('netProfitMargin', e.target.value)}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                />
                            </div>

                            {/* Cash Input */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600 flex items-center gap-1"><DollarSign size={12} /> Cash & Equivalents</span>
                                </div>
                                <input
                                    type="number"
                                    value={scenarios.cash}
                                    onChange={(e) => handleChange('cash', e.target.value)}
                                    className="w-full p-2 border border-slate-300 rounded font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Visualization Panel */}
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex-1">
                        <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                            <TrendingUp size={16} /> Projected Ratios Impact
                        </h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip
                                        cursor={{ fill: '#f1f5f9' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    <Bar dataKey="Base" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Simulated" fill="#6366f1" radius={[4, 4, 0, 0]}>
                                        {
                                            chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.Simulated < entry.Base ? '#f43f5e' : '#6366f1'} />
                                            ))
                                        }
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex-1">
                        <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                            <Activity size={16} /> Margins Comparison
                        </h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={marginData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} unit="%" />
                                    <Tooltip
                                        cursor={{ fill: '#f1f5f9' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    <Bar dataKey="Base" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Simulated" fill="#10b981" radius={[4, 4, 0, 0]}>
                                        {
                                            marginData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.Simulated < entry.Base ? '#f59e0b' : '#10b981'} />
                                            ))
                                        }
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SensitivityAnalysis;
