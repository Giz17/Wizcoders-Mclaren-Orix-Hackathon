import React, { useState } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { Save, Shield, FileText, Server, Sliders, AlertTriangle } from 'lucide-react';

const Settings = () => {
    const { settings, updateSettings } = useAnalysis();

    // Local state to manage form inputs before saving (optional, but real-time is fine too)
    const [localSettings, setLocalSettings] = useState(settings);
    const [saved, setSaved] = useState(false);

    const handleChange = (section, key, value) => {
        setLocalSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: value
            }
        }));
        setSaved(false);
    };

    const handleSave = () => {
        updateSettings(localSettings);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8 pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Sliders className="text-indigo-600" />
                        Settings
                    </h1>
                    <p className="text-slate-500 text-sm">Configure analysis parameters and preferences.</p>
                </div>
                <button
                    onClick={handleSave}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${saved ? 'bg-emerald-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                >
                    <Save size={18} />
                    {saved ? 'Saved!' : 'Save Changes'}
                </button>
            </div>

            {/* Risk Thresholds */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                    <Shield className="text-rose-500" size={20} />
                    <h2 className="text-lg font-bold text-slate-800">Risk Thresholds</h2>
                </div>
                <p className="text-sm text-slate-500 mb-6">Define the boundaries for "High Risk" flags. If a metric breaches these values, it will be flagged red.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Min Liquidity Ratio</label>
                        <input
                            type="number"
                            step="0.1"
                            value={localSettings.riskThresholds.liquidityRatio}
                            onChange={(e) => handleChange('riskThresholds', 'liquidityRatio', parseFloat(e.target.value))}
                            className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <p className="text-xs text-slate-400 mt-1">Default: 1.0</p>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Max Debt-to-Equity</label>
                        <input
                            type="number"
                            step="0.1"
                            value={localSettings.riskThresholds.debtToEquity}
                            onChange={(e) => handleChange('riskThresholds', 'debtToEquity', parseFloat(e.target.value))}
                            className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <p className="text-xs text-slate-400 mt-1">Default: 2.5</p>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Min Net Profit Margin (%)</label>
                        <input
                            type="number"
                            step="1.0"
                            value={localSettings.riskThresholds.netProfitMargin}
                            onChange={(e) => handleChange('riskThresholds', 'netProfitMargin', parseFloat(e.target.value))}
                            className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <p className="text-xs text-slate-400 mt-1">Default: 5%</p>
                    </div>
                </div>
            </div>

            {/* Report Preferences */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                    <FileText className="text-blue-500" size={20} />
                    <h2 className="text-lg font-bold text-slate-800">Report Preferences</h2>
                </div>
                <div className="space-y-4">
                    <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                        <span className="font-medium text-slate-700">Include Executive Summary</span>
                        <input
                            type="checkbox"
                            checked={localSettings.reportPreferences.includeExecutiveSummary}
                            onChange={(e) => handleChange('reportPreferences', 'includeExecutiveSummary', e.target.checked)}
                            className="w-5 h-5 text-indigo-600 rounded bg-gray-100 border-gray-300 focus:ring-indigo-500"
                        />
                    </label>
                    <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                        <span className="font-medium text-slate-700">Include 5Cs Analysis</span>
                        <input
                            type="checkbox"
                            checked={localSettings.reportPreferences.include5Cs}
                            onChange={(e) => handleChange('reportPreferences', 'include5Cs', e.target.checked)}
                            className="w-5 h-5 text-indigo-600 rounded bg-gray-100 border-gray-300 focus:ring-indigo-500"
                        />
                    </label>
                    <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                        <span className="font-medium text-slate-700">Include Risk Assessment</span>
                        <input
                            type="checkbox"
                            checked={localSettings.reportPreferences.includeRiskAssessment}
                            onChange={(e) => handleChange('reportPreferences', 'includeRiskAssessment', e.target.checked)}
                            className="w-5 h-5 text-indigo-600 rounded bg-gray-100 border-gray-300 focus:ring-indigo-500"
                        />
                    </label>
                </div>
            </div>

            {/* API Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 opacity-75">
                <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                    <Server className="text-emerald-500" size={20} />
                    <h2 className="text-lg font-bold text-slate-800">System & API</h2>
                </div>
                <div className="flex items-center gap-2 mb-4 bg-amber-50 p-3 rounded text-amber-800 text-sm border border-amber-200">
                    <AlertTriangle size={16} />
                    These settings affect the backend connection. Use caution.
                </div>
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Groq/LLM API Key</label>
                        <input
                            type="password"
                            placeholder="gsk_..."
                            value={localSettings.apiSettings.apiKey}
                            onChange={(e) => handleChange('apiSettings', 'apiKey', e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                        />
                        <p className="text-xs text-slate-400 mt-1">Leave blank to use server environment variable.</p>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">AI Model</label>
                        <select
                            value={localSettings.apiSettings.model}
                            onChange={(e) => handleChange('apiSettings', 'model', e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                        >
                            <option value="meta-llama/llama-4-scout-17b-16e-instruct">Llama 4 Scout (Default)</option>
                            <option value="mixtral-8x7b-32768">Mixtral 8x7b</option>
                            <option value="llama2-70b-4096">Llama2 70b</option>
                            <option value="llama3-70b-8192">Llama3 70b</option>
                            <option value="gemma-7b-it">Gemma 7b</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
