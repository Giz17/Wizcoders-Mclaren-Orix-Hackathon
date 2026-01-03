import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileType } from 'lucide-react';
import { cn } from '../utils';

const FileUpload = ({ onFileUpload }) => {
    const onDrop = useCallback(acceptedFiles => {
        // Select the first file if multiple are dropped (MVP limitation)
        if (acceptedFiles?.length > 0) {
            onFileUpload(acceptedFiles[0]);
        }
    }, [onFileUpload]);

    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf']
        },
        maxFiles: 1,
        multiple: false
    });

    return (
        <div className="h-full flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-sm border border-slate-200">
            <div
                {...getRootProps()}
                className={cn(
                    "w-full max-w-xl h-96 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ease-in-out",
                    isDragActive ? "border-indigo-500 bg-indigo-50 scale-[1.02]" : "border-slate-300 hover:border-slate-400 hover:bg-slate-50",
                    isDragReject && "border-red-500 bg-red-50"
                )}
            >
                <input {...getInputProps()} />

                <div className={cn(
                    "p-4 rounded-full bg-indigo-100 text-indigo-600 mb-6 transition-transform duration-300",
                    isDragActive && "scale-110"
                )}>
                    {isDragActive ? <FileType size={48} /> : <UploadCloud size={48} />}
                </div>

                <h3 className="text-2xl font-semibold text-slate-800 mb-2">
                    {isDragActive ? "Drop PDF here" : "Upload Financial Document"}
                </h3>

                <p className="text-slate-500 text-center max-w-sm mb-6">
                    Drag and drop your credit memo, financial report, or annual statement (PDF only)
                </p>

                <button className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200">
                    Browse Files
                </button>
            </div>

            <div className="mt-8 flex items-center space-x-8 text-sm text-slate-400">
                <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>Secure Upload</span>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>PDF Optimized</span>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>AI Analysis Ready</span>
                </div>
            </div>
        </div>
    );
};

export default FileUpload;
