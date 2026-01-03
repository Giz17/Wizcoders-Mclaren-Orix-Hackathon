import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useAnalysis } from '../context/AnalysisContext';
import { generateWordHTML, downloadFile } from '../api';
import { Save, Download, FileText, RotateCcw, RefreshCw } from 'lucide-react';

const ReportEditor = () => {
    const { analysisData } = useAnalysis();
    const [editorContent, setEditorContent] = useState('');
    const [lastSavedContent, setLastSavedContent] = useState('');

    useEffect(() => {
        if (analysisData) {
            // Generate initial HTML from data
            const initialHtml = generateWordHTML(analysisData);
            setEditorContent(initialHtml);
            setLastSavedContent(initialHtml);
        } else {
            setEditorContent('<h1>No analysis data found</h1><p>Please upload a document on the home page first.</p>');
        }
    }, [analysisData]);

    const handleSave = () => {
        setLastSavedContent(editorContent);
        // ideally save to backend here
        alert("Draft saved locally! (Backend persistence not implemented yet)");
    };

    const handleReset = () => {
        if (analysisData && window.confirm("Are you sure? This will discard your current edits.")) {
            const initialHtml = generateWordHTML(analysisData);
            setEditorContent(initialHtml);
        }
    };

    const handleRegenerate = () => {
        if (analysisData) {
            console.log("Forcing regeneration with latest API logic");
            const html = generateWordHTML(analysisData);
            setEditorContent(html);
        }
    };

    const handleExportWord = () => {
        // We reuse the logic but pass the *edited* HTML content directly
        // Since downloadAsWord in api.js expects 'data' object to regenerate HTML,
        // we need a slightly different approach or a new utility helper.
        // Let's just do it inline here for simplicity since we have raw HTML.

        const htmlWithHeaders = `
         <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
         <head><meta charset="utf-8"><title>Export</title></head><body>${editorContent}</body></html>
         `;
        const blob = new Blob(['\ufeff', htmlWithHeaders], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'credit_memo_edited.doc'; // .doc works better for HTML-as-Word
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['blockquote', 'code-block'],
            [{ 'color': [] }, { 'background': [] }],
            ['clean']
        ],
    };

    return (
        <div className="h-full flex flex-col p-6 bg-slate-50/50">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <FileText className="text-indigo-600" />
                        Report Editor
                    </h1>
                    <p className="text-slate-500 text-sm">Refine the AI-generated credit memo.</p>
                </div>

                <div className="flex gap-2">
                    <button onClick={handleReset} className="flex items-center gap-1 px-3 py-2 text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors">
                        <RotateCcw size={16} /> <span className="hidden sm:inline">Reset</span>
                    </button>
                    <button onClick={handleRegenerate} className="flex items-center gap-1 px-3 py-2 text-indigo-600 bg-indigo-50 border border-indigo-200 rounded hover:bg-indigo-100 transition-colors" title="Force Regenerate">
                        <RefreshCw size={16} /> <span className="hidden sm:inline">Regen V2</span>
                    </button>
                    <button onClick={handleSave} className="flex items-center gap-1 px-3 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700 transition-colors">
                        <Save size={16} /> <span className="hidden sm:inline">Save Draft</span>
                    </button>
                    <button onClick={handleExportWord} className="flex items-center gap-1 px-3 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors">
                        <Download size={16} /> <span className="hidden sm:inline">Export Word</span>
                    </button>
                </div>
            </div>

            <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                <ReactQuill
                    theme="snow"
                    value={editorContent}
                    onChange={setEditorContent}
                    modules={modules}
                    className="flex-1 flex flex-col h-full [&>.ql-container]:flex-1 [&>.ql-container]:overflow-y-auto [&>.ql-container]:text-base"
                />
            </div>
        </div>
    );
};

export default ReportEditor;
