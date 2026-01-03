import React, { useState } from 'react';
import {
    BarChart3, TrendingUp, AlertTriangle, CheckCircle,
    ArrowRight, File as FileIcon, Shield, Info,
    ChevronDown, ChevronUp, Quote, Download, Sparkles, RotateCcw, Edit2
} from 'lucide-react';
import { cn } from '../utils';
import { generateMarkdownSummary, generateWordHTML, downloadFile, downloadAsWord } from '../api';
import { useAnalysis } from '../context/AnalysisContext';

import defaultMockData from '../data/mockAnalysis.json';

const Card = ({ title, icon: Icon, children, className = "", extraHeader = null }) => (
    <div className={cn("bg-white rounded-xl shadow-sm border border-slate-200 p-5", className)}>
        <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 flex items-center space-x-2">
                {Icon && <Icon size={18} className="text-indigo-500" />}
                <span>{title}</span>
            </h3>
            {extraHeader}
        </div>
        {children}
    </div>
);

const SourceBadge = ({ source }) => {
    if (!source) return null;
    return (
        <div className="group relative inline-block ml-2">
            <Info size={14} className="text-slate-400 cursor-help hover:text-indigo-500 transition-colors" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="flex items-center justify-between border-b border-slate-700 pb-1 mb-2">
                    <span className="font-bold text-indigo-400">Source: Page {source.page_number || source.page}</span>
                    <button className="text-indigo-400 hover:text-indigo-300">Jump to PDF</button>
                </div>
                <p className="italic leading-relaxed">"{source.snippet}"</p>
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
            </div>
        </div>
    );
};

const AnalysisDashboard = ({ data }) => {
    const { settings } = useAnalysis();
    const [activeTab, setActiveTab] = useState('summary'); // 'summary' | '5cs' | 'financials' | 'risks'
    const [editMode, setEditMode] = useState(false);
    const [editedData, setEditedData] = useState({});
    const [isExporting, setIsExporting] = useState(false);

    // Use passed data or fall back to mock data
    const displayData = data || defaultMockData;
    
    // Get report preferences from settings
    const { includeExecutiveSummary, include5Cs, includeRiskAssessment } = settings.reportPreferences;

    const handleExportMarkdown = () => {
        setIsExporting(true);
        try {
            const markdown = generateMarkdownSummary(displayData);
            downloadFile(markdown, 'credit_memo.md', 'text/markdown');
        } finally {
            setIsExporting(false);
        }
    };

    const handleExportWord = () => {
        setIsExporting(true);
        try {
            downloadAsWord(displayData, 'credit_memo.docx');
        } finally {
            setIsExporting(false);
        }
    };

    const handleEditSummary = (field, value) => {
        setEditedData(prev => ({
            ...prev,
            summary: {
                ...prev.summary,
                [field]: value
            }
        }));
    };

    const handleResetEdits = () => {
        setEditedData({});
        setEditMode(false);
    };

    const getDisplayValue = (path, defaultValue) => {
        const keys = path.split('.');
        let value = displayData;
        for (const key of keys) {
            value = value?.[key];
            if (value === undefined) return defaultValue;
        }
        return value || defaultValue;
    };

    const renderSummary = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Executive Summary Card */}
            <Card title="Executive Summary" icon={FileIcon} extraHeader={
                <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                    displayData.summary.recommendation === 'Approve' || displayData.summary.recommendation === 'Positive' ? "bg-emerald-100 text-emerald-700" :
                        displayData.summary.recommendation === 'Conditional Approval' || displayData.summary.recommendation === 'Neutral' ? "bg-amber-100 text-amber-700" :
                            "bg-rose-100 text-rose-700"
                )}>
                    {displayData.summary.recommendation}
                </span>
            }>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                    {displayData.summary.executive_summary}
                </p>
                <div className="mt-6 space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Key Takeaways</h4>
                    <ul className="space-y-2">
                        {displayData.summary.key_takeaways?.map((item, i) => (
                            <li key={i} className="flex items-start space-x-2 text-sm text-slate-700">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </Card>

            <div className="grid grid-cols-2 gap-4">
                <Card title="Confidence Rank" icon={Shield}>
                    <div className="flex flex-col items-center justify-center py-2">
                        <div className="text-3xl font-bold text-indigo-600">
                            {Math.round(displayData.metadata?.overall_confidence * 100) || 0}%
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Based on {displayData.metadata?.pages_analyzed || 0} analyzed pages</p>
                    </div>
                </Card>
                <Card title="Risk Level" icon={AlertTriangle}>
                    <div className="flex flex-col items-center justify-center py-2">
                        <div className="text-3xl font-bold text-emerald-500">
                            Low
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Calculated from refined metrics</p>
                    </div>
                </Card>
            </div>
        </div>
    );

    const render5Cs = () => (
        <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
            {Object.entries(displayData.credit_analysis_5cs || {}).map(([key, value]) => (
                <Card key={key} title={key.toUpperCase()} icon={CheckCircle} className="border-l-4 border-l-indigo-500">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-sm text-slate-600 leading-relaxed italic">
                            {value.assessment || value.equity_position || value.loan_purpose || value.repayment_source}
                        </p>
                        <div className="flex items-center space-x-1">
                            {value.source_citations?.map((src, i) => (
                                <SourceBadge key={i} source={src} />
                            ))}
                        </div>
                    </div>

                    {/* Specialized Inner Data */}
                    {key === 'capacity' && value.ratios && (
                        <div className="mt-3 flex gap-4 pt-3 border-t border-slate-50">
                            {Object.entries(value.ratios).map(([rKey, rVal]) => (
                                <div key={rKey} className="text-center bg-slate-50 px-3 py-1 rounded">
                                    <p className="text-[10px] text-slate-400 uppercase font-bold">{rKey}</p>
                                    <p className="text-sm font-bold text-slate-700">{rVal}x</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {key === 'collateral' && value.pledged_assets && (
                        <div className="mt-3 pt-3 border-t border-slate-50">
                            <div className="flex flex-wrap gap-2">
                                {value.pledged_assets.map((asset, i) => (
                                    <span key={i} className="text-[13px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">{asset}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>
            ))}
        </div>
    );

    const renderFinancials = () => (
        <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
            <Card title="Key Financial Indicators" icon={BarChart3}>
                <div className="space-y-6">
                    {displayData.financial_metrics?.map((metric, i) => (
                        <div key={i} className="group pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center space-x-2">
                                    <span className="text-xs font-bold text-indigo-400 uppercase">{metric.category}</span>
                                    <span className="text-sm font-semibold text-slate-800">{metric.label}</span>
                                    <SourceBadge source={metric.source} />
                                </div>
                                <div className={cn(
                                    "text-lg font-bold",
                                    metric.status === 'healthy' ? "text-emerald-500" : 
                                    metric.status === 'critical' ? "text-rose-600" : "text-amber-500"
                                )}>
                                    {metric.value}{metric.unit === '%' ? '%' : metric.unit === 'ratio' ? 'x' : ''}
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                                <span>{metric.is_calculated ? 'Algorithm Calculated' : 'Direct Extractions'}</span>
                                <span className={cn(
                                    "uppercase font-semibold",
                                    metric.status === 'healthy' ? "text-emerald-600" :
                                    metric.status === 'critical' ? "text-rose-600" : "text-amber-600"
                                )}>{metric.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );

    const renderRisks = () => (
        <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
            <Card title="Red Flags & Mitigants" icon={AlertTriangle}>
                {displayData.risk_assessment?.red_flags?.map((flag, i) => (
                    <div key={i} className="bg-rose-50 border border-rose-100 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-rose-700 text-sm">{flag.issue}</span>
                            <span className="text-[10px] bg-rose-200 text-rose-800 px-2 py-0.5 rounded-full font-bold uppercase">{flag.severity} RISK</span>
                        </div>
                        <p className="text-xs text-rose-600 mb-3 italic">" {flag.source?.snippet} "</p>
                        <div className="bg-white/60 p-2 rounded text-xs text-rose-900 border border-rose-200">
                            <span className="font-bold">Mitigant:</span> {flag.mitigant}
                        </div>
                    </div>
                ))}
            </Card>

            <div className="grid grid-cols-2 gap-4">
                <Card title="Strengths" icon={CheckCircle} className="bg-emerald-50/30 border-emerald-100">
                    <ul className="space-y-3">
                        {displayData.risk_assessment?.strengths?.map((s, i) => (
                            <li key={i} className="text-xs text-slate-700 flex items-start space-x-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
                                <span>{s.text} <SourceBadge source={s.source} /></span>
                            </li>
                        ))}
                    </ul>
                </Card>
                <Card title="Weaknesses" icon={AlertTriangle} className="bg-amber-50/30 border-amber-100">
                    <ul className="space-y-3">
                        {displayData.risk_assessment?.weaknesses?.map((w, i) => (
                            <li key={i} className="text-xs text-slate-700 flex items-start space-x-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 shrink-0" />
                                <span>{w.text} <SourceBadge source={w.source} /></span>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col pt-2">
            {/* Export & Edit Toolbar */}
            <div className="flex items-center justify-between gap-2 mb-4 pb-4 border-b border-slate-200">
                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleExportMarkdown}
                        disabled={isExporting}
                        className="flex items-center space-x-1 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                        <Download size={14} />
                        <span>Markdown</span>
                    </button>
                    <button
                        onClick={handleExportWord}
                        disabled={isExporting}
                        className="flex items-center space-x-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                        <FileIcon size={14} />
                        <span>Word Doc</span>
                    </button>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setEditMode(!editMode)}
                        className={cn(
                            "flex items-center space-x-1 px-3 py-2 rounded-lg text-xs font-semibold transition-colors",
                            editMode
                                ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        )}
                    >
                        <Edit2 size={14} />
                        <span>{editMode ? 'Editing' : 'Edit'}</span>
                    </button>
                    {editMode && (
                        <button
                            onClick={handleResetEdits}
                            className="flex items-center space-x-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                        >
                            <RotateCcw size={14} />
                            <span>Reset</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Edit Mode Panel */}
            {editMode && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 space-y-3">
                    <h4 className="font-semibold text-amber-900 text-sm">Edit Content</h4>
                    <textarea
                        value={editedData.summary?.executive_summary || displayData.summary?.executive_summary || ''}
                        onChange={(e) => handleEditSummary('executive_summary', e.target.value)}
                        placeholder="Edit executive summary..."
                        className="w-full p-2 border border-amber-300 rounded text-xs font-mono resize-none h-24 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                const markdown = generateMarkdownSummary(editedData.summary ? { ...displayData, summary: editedData.summary } : displayData);
                                downloadFile(markdown, 'credit_memo_edited.md', 'text/markdown');
                            }}
                            className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                            <Download size={12} className="inline mr-1" />
                            Save as Markdown
                        </button>
                        <button
    onClick={() => {
        downloadAsWord(
            editedData.summary
                ? { ...displayData, summary: editedData.summary }
                : displayData,
            "credit_memo_edited.docx"
        );
    }}
    className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
>
    <Download size={12} className="inline mr-1" />
    Save as Word
</button>

                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl mb-6 self-start w-full">
                {[
                    includeExecutiveSummary && { id: 'summary', label: 'Summary' },
                    include5Cs && { id: '5cs', label: '5Cs Analysis' },
                    { id: 'financials', label: 'Financials' }, // Always show financials
                    includeRiskAssessment && { id: 'risks', label: 'Risk Factors' },
                ].filter(Boolean).map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all duration-200",
                            activeTab === tab.id
                                ? "bg-white text-indigo-600 shadow-sm"
                                : "text-slate-500 hover:text-slate-800"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-10">
                {activeTab === 'summary' && includeExecutiveSummary && renderSummary()}
                {activeTab === 'summary' && !includeExecutiveSummary && (
                    <div className="text-center p-8 text-slate-400">
                        <Info size={48} className="mx-auto mb-4 opacity-50" />
                        <p>Executive Summary is disabled in settings</p>
                    </div>
                )}
                {activeTab === '5cs' && include5Cs && render5Cs()}
                {activeTab === '5cs' && !include5Cs && (
                    <div className="text-center p-8 text-slate-400">
                        <Info size={48} className="mx-auto mb-4 opacity-50" />
                        <p>5Cs Analysis is disabled in settings</p>
                    </div>
                )}
                {activeTab === 'financials' && renderFinancials()}
                {activeTab === 'risks' && includeRiskAssessment && renderRisks()}
                {activeTab === 'risks' && !includeRiskAssessment && (
                    <div className="text-center p-8 text-slate-400">
                        <Info size={48} className="mx-auto mb-4 opacity-50" />
                        <p>Risk Assessment is disabled in settings</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalysisDashboard;
