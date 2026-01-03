import React, { useState, useEffect, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ZoomIn, ZoomOut, Search, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '../utils';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

const PDFViewer = ({ file }) => {
    const [numPages, setNumPages] = useState(null);
    const [scale, setScale] = useState(1.0);

    // Search State
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [matches, setMatches] = useState([]);
    const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
    const [isIndexing, setIsIndexing] = useState(false);
    const [pdfDocument, setPdfDocument] = useState(null);

    // Reset state when file changes
    useEffect(() => {
        setMatches([]);
        setSearchText('');
        setCurrentMatchIndex(0);
    }, [file]);

    const onDocumentLoadSuccess = (pdf) => {
        setPdfDocument(pdf);
        setNumPages(pdf.numPages);
    };

    const performSearch = useCallback(async (query, pdfDocument) => {
        if (!query || !pdfDocument) return;

        setIsIndexing(true);
        const newMatches = [];
        const lowerQuery = query.toLowerCase();

        for (let i = 1; i <= pdfDocument.numPages; i++) {
            const page = await pdfDocument.getPage(i);
            const textContent = await page.getTextContent();
            const text = textContent.items.map(item => item.str).join(' ');

            if (text.toLowerCase().includes(lowerQuery)) {
                // Rough count approximation for matches on this page
                // Note: This logic assumes 'matches' maps to search render logic 1 to 1.
                // Since we highlight *every* instance in customTextRenderer, we assume
                // querySelectorAll('.search-match') will find all of them in order.
                const regex = new RegExp(lowerQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
                const count = (text.match(regex) || []).length;

                for (let m = 0; m < count; m++) {
                    newMatches.push({ pageIndex: i, matchIndex: m });
                }
            }
        }

        setMatches(newMatches);
        setIsIndexing(false);
        if (newMatches.length > 0) {
            setCurrentMatchIndex(0);
        }
    }, []);

    // Trigger search when text changes (debounced)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchText.length > 2 && pdfDocument) {
                performSearch(searchText, pdfDocument);
            } else if (searchText.length === 0) {
                setMatches([]);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchText, pdfDocument, performSearch]);

    // Match Navigation
    const nextMatch = () => {
        if (matches.length === 0) return;
        const newIndex = (currentMatchIndex + 1) % matches.length;
        setCurrentMatchIndex(newIndex);
    };

    const prevMatch = () => {
        if (matches.length === 0) return;
        const newIndex = (currentMatchIndex - 1 + matches.length) % matches.length;
        setCurrentMatchIndex(newIndex);
    };

    // Scroll to match
    useEffect(() => {
        const timer = setTimeout(() => {
            const matchesEls = document.querySelectorAll('.search-match');
            if (matchesEls[currentMatchIndex]) {
                matchesEls[currentMatchIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
        return () => clearTimeout(timer);
    }, [currentMatchIndex, matches]);

    // Custom Text Renderer
    const textRenderer = useCallback((textItem) => {
        if (!searchText) return textItem.str;

        const regex = new RegExp(`(${searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        const parts = textItem.str.split(regex);

        return parts.map((part) => {
            if (regex.test(part)) {
                return `<mark class="bg-yellow-200 text-black bg-opacity-50 cursor-pointer search-match">${part}</mark>`;
            }
            return part;
        }).join('');
    }, [searchText]);

    return (
        <div className="flex flex-col h-full bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-700 relative">
            {/* Toolbar */}
            <div className="h-12 bg-slate-900 flex items-center justify-between px-4 border-b border-slate-700 text-slate-300 z-20 relative">
                <div className="flex items-center space-x-2 text-sm">
                    {/* Search Toggle */}
                    <button
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                        className={cn("p-1.5 rounded transition-colors", isSearchOpen ? "bg-indigo-600 text-white" : "hover:bg-slate-700 text-slate-400")}
                        title="Search"
                    >
                        <Search size={18} />
                    </button>

                    {isSearchOpen && (
                        <div className="flex items-center bg-slate-800 rounded ml-2 border border-slate-600 animate-in slide-in-from-left-2 duration-200">
                            <input
                                type="text"
                                placeholder="Find..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                className="bg-transparent border-none text-sm text-white px-3 py-1.5 w-32 focus:ring-0 focus:outline-none placeholder:text-slate-500"
                                autoFocus
                            />
                            <div className="flex border-l border-slate-600">
                                <button onClick={prevMatch} className="p-1.5 hover:bg-slate-700 text-slate-400">
                                    <ChevronUp size={14} />
                                </button>
                                <button onClick={nextMatch} className="p-1.5 hover:bg-slate-700 text-slate-400">
                                    <ChevronDown size={14} />
                                </button>
                            </div>
                            {matches.length > 0 && (
                                <span className="text-xs text-slate-500 px-2 font-mono">
                                    {currentMatchIndex + 1}/{matches.length}
                                </span>
                            )}
                        </div>
                    )}

                    <div className="h-4 w-px bg-slate-700 mx-2"></div>
                    <span>{numPages ? `${numPages} Pages` : 'Loading...'}</span>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
                        className="p-1 hover:bg-slate-700 rounded"
                    >
                        <ZoomOut size={18} />
                    </button>
                    <span className="text-xs w-10 text-center">{(scale * 100).toFixed(0)}%</span>
                    <button
                        onClick={() => setScale(s => Math.min(2.0, s + 0.1))}
                        className="p-1 hover:bg-slate-700 rounded"
                    >
                        <ZoomIn size={18} />
                    </button>
                </div>
            </div>

            {/* PDF Canvas - Continuous Scroll */}
            <div className="flex-1 overflow-auto bg-slate-500/10 flex justify-center p-4 relative">
                {isIndexing && (
                    <div className="sticky top-4 z-50 self-start ml-auto bg-slate-900/90 px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 text-xs font-medium text-indigo-400 border border-slate-700 backdrop-blur-sm">
                        <Loader2 size={12} className="animate-spin" />
                        Indexing...
                    </div>
                )}

                <Document
                    file={file}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={
                        <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                            <Loader2 size={32} className="animate-spin mb-4" />
                            <p>Loading PDF...</p>
                        </div>
                    }
                >
                    {numPages && Array.from(new Array(numPages), (el, index) => (
                        <Page
                            key={`page_${index + 1}`}
                            pageNumber={index + 1}
                            scale={scale}
                            className="shadow-xl mb-6 last:mb-0"
                            renderTextLayer={true}
                            renderAnnotationLayer={true}
                            customTextRenderer={textRenderer}
                        />
                    ))}
                </Document>
            </div>
        </div>
    );
};

export default PDFViewer;
