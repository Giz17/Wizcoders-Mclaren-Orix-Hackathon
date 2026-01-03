import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from './components/Layout';
import FileUpload from './components/FileUpload';
import PDFViewer from './components/PDFViewer';
import AnalysisDashboard from './components/AnalysisDashboard';
import SensitivityAnalysis from './components/SensitivityAnalysis';
import ReportEditor from './components/ReportEditor';
import { Loader2, AlertCircle } from 'lucide-react';
import Settings from './components/Settings';
import { AuthProvider } from './context/AuthContext';
import { AnalysisProvider, useAnalysis } from './context/AnalysisContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';


// Separate Analysis component to keep App.jsx clean
const Analysis = () => {
  // Use context instead of local state for data persistence
  const { analysisData, setAnalysisData, settings } = useAnalysis();
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = async (uploadedFile) => {
    setFile(uploadedFile);
    setIsProcessing(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", uploadedFile);
    // Send settings along with the file
    formData.append("settings", JSON.stringify(settings));

    try {
      // Connect to the actual backend endpoint
      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const data = await response.json();
      setAnalysisData(data);
    } catch (err) {
      console.error("Backend connection error:", err);
      setError("Failed to analyze document. Is the backend running?");
      setFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300 h-full">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-800">Processing Document...</h3>
          <p className="text-slate-500">Extracting 5Cs, financial metrics, and risk factors.</p>
          <p className="text-xs text-slate-400 mt-2">This may take up to 30 seconds.</p>
        </div>
      </div>
    );
  }

  // Display Error State
  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center fade-in h-full">
        <div className="text-center max-w-md p-6 bg-rose-50 border border-rose-200 rounded-xl">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-rose-700">Analysis Error</h3>
          <p className="text-sm text-rose-600 mb-4">{error}</p>
          <button
            onClick={() => setError(null)}
            className="px-4 py-2 bg-white border border-rose-200 text-rose-700 rounded-lg hover:bg-rose-100 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Success State
  if (file && analysisData) {
    return (
      <div className="flex-1 flex flex-row gap-6 h-full p-2 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
        <div className="w-1/2 h-full min-w-[400px]">
          <PDFViewer file={file} />
        </div>
        <div className="w-1/2 h-full min-w-[400px] overflow-hidden">
          {/* We'll pass the real data prop if we update Dashboard to accept it, 
              but for now Dashboard likely imports mockData. 
              Ideally we should pass: <AnalysisDashboard data={analysisData} /> 
          */}
          <AnalysisDashboard data={analysisData} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center fade-in h-full">
      <div className="w-full max-w-4xl px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Financial Analysis <span className="text-indigo-600">Reimagined</span>
          </h1>
          <p className="text-lg text-slate-500">
            Upload your credit memos and get instant AI-powered insights.
          </p>
        </div>
        <FileUpload onFileUpload={handleFileUpload} />
      </div>
    </div>
  );
};

// Placeholder components for other routes
// const Dashboard = () => <div className="p-6 text-2xl font-bold">Main Dashboard Placeholder</div>;
// const Reports = () => <div className="p-6 text-2xl font-bold">Financial Reports Placeholder</div>;

function App() {
  return (
    <AuthProvider>
      <AnalysisProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Analysis />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <SensitivityAnalysis />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/editor" element={
              <ProtectedRoute>
                <Layout>
                  <ReportEditor />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/settings" element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </AnalysisProvider>
    </AuthProvider>
  );
}

export default App;
