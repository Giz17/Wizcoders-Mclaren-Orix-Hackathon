/**
 * Export utilities for credit memo data
 */
/**
 * Generate Markdown summary from analysis data
 */
const safe = (val, defaultVal = '') => (val === undefined || val === null ? defaultVal : val);

export const generateMarkdownSummary = (data) => {
    if (!data) return "# Error: No Data Available";

    let markdown = "# Credit Memo Report\n\n";

    // Header info
    markdown += `**Document Type:** ${safe(data.document_type, 'Financial Document')}\n`;
    const confidence = data.metadata?.overall_confidence
        ? Math.round(data.metadata.overall_confidence * 100) + '%'
        : 'Draft';
    markdown += `**Confidence Level:** ${confidence}\n\n`;

    // Executive Summary
    markdown += "## 1. Executive Summary\n\n";
    if (data.summary?.executive_summary) {
        markdown += safe(data.summary.executive_summary) + "\n\n";
    } else {
        markdown += "_No executive summary available._\n\n";
    }

    if (data.summary?.key_takeaways && Array.isArray(data.summary.key_takeaways)) {
        markdown += "**Key Takeaways:**\n";
        data.summary.key_takeaways.forEach(item => {
            if (item) markdown += `- ${item}\n`;
        });
        markdown += "\n";
    }

    // 5Cs Analysis
    if (data.credit_analysis_5cs) {
        markdown += "## 2. Credit Analysis (5Cs)\n\n";
        Object.entries(data.credit_analysis_5cs).forEach(([key, value]) => {
            if (!value) return;
            markdown += `### ${key.toUpperCase()}\n`;
            const content = value.assessment || value.equity_position || value.loan_purpose || value.repayment_source || 'No analysis provided.';
            markdown += safe(content) + "\n\n";
            if (value.highlights && Array.isArray(value.highlights)) {
                markdown += "**Highlights:**\n";
                value.highlights.forEach(h => {
                    if (h) markdown += `- ${h}\n`;
                });
                markdown += "\n";
            }
        });
    }

    // Financial Metrics
    if (data.financial_metrics && Array.isArray(data.financial_metrics)) {
        markdown += "## 3. Financial Metrics\n\n";
        data.financial_metrics.forEach(metric => {
            if (!metric) return;
            const unit = metric.unit === '%' ? '%' : metric.unit === 'ratio' ? 'x' : '';
            const name = [metric.category, metric.label || metric.name].filter(Boolean).join(' - ') || 'Unknown Metric';
            markdown += `- **${safe(name)}:** ${safe(metric.value, 'N/A')}${unit} (${safe(metric.status, 'Unknown')})\n`;
        });
        markdown += "\n";
    }

    // Risk Assessment
    if (data.risk_assessment) {
        markdown += "## 4. Risk Assessment\n\n";
        if (data.risk_assessment.red_flags && Array.isArray(data.risk_assessment.red_flags)) {
            markdown += "**Red Flags:**\n";
            data.risk_assessment.red_flags.forEach(flag => {
                if (!flag) return;
                markdown += `- **${safe(flag.issue, 'Issue')}** (${safe(flag.severity, 'Medium')} Risk): ${safe(flag.mitigant, 'No mitigant listed')}\n`;
            });
            markdown += "\n";
        }

        if (data.risk_assessment.strengths && Array.isArray(data.risk_assessment.strengths)) {
            markdown += "**Strengths:**\n";
            data.risk_assessment.strengths.forEach(s => {
                if (s?.text) markdown += `- ${s.text}\n`;
            });
            markdown += "\n";
        }

        if (data.risk_assessment.weaknesses && Array.isArray(data.risk_assessment.weaknesses)) {
            markdown += "**Weaknesses:**\n";
            data.risk_assessment.weaknesses.forEach(w => {
                if (w?.text) markdown += `- ${w.text}\n`;
            });
            markdown += "\n";
        }
    }

    // Recommendation
    markdown += "## 5. Final Recommendation\n\n";
    markdown += `**Recommendation:** ${safe(data.summary?.recommendation, 'Pending')}\n\n`;
    if (data.summary?.recommendation_justification) {
        markdown += `**Justification:** ${data.summary.recommendation_justification}\n`;
    }

    return markdown;
};

/**
 * Generate HTML table for Word document
 */
export const generateWordHTML = (data) => {
    if (!data) return "<html><body><h1>Error</h1><p>No data to export</p></body></html>";

    // Add Office Namespaces to avoid corruption warnings
    let html = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
        <meta charset="UTF-8">
        <title>Credit Memo Report</title>
        <!--[if gte mso 9]>
        <xml>
        <w:WordDocument>
        <w:View>Print</w:View>
        <w:Zoom>100</w:Zoom>
        <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
            body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; }
            h1 { color: #1e3a8a; font-size: 16pt; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
            h2 { color: #374151; font-size: 14pt; margin-top: 20px; border-bottom: 1px solid #e5e7eb; }
            h3 { color: #4b5563; font-size: 12pt; font-weight: bold; margin-top: 15px; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
            th { background-color: #f3f4f6; font-weight: bold; }
            .metric-value { font-weight: bold; color: #059669; }
            .risk-high { color: #dc2626; font-weight: bold; }
            .risk-medium { color: #f59e0b; font-weight: bold; }
            ul { margin: 10px 0; padding-left: 20px; }
            li { margin-bottom: 5px; }
            .recommendation { 
                padding: 15px; 
                border: 1px solid #ccc;
                background-color: #f9fafb;
                margin: 15px 0;
            }
        </style>
    </head>
    <body>
        <h1>Credit Memo Report</h1>
        <p><strong>Document Type:</strong> ${safe(data.document_type, 'Financial Document')}</p>
        <p><strong>Confidence Level:</strong> ${data.metadata?.overall_confidence ? Math.round(data.metadata.overall_confidence * 100) + '%' : 'Draft'}</p>
    `;

    // Executive Summary
    html += `<h2>1. Executive Summary</h2>`;
    if (data.summary?.executive_summary) {
        html += `<p>${safe(data.summary.executive_summary)}</p>`;
    } else {
        html += `<p><em>No executive summary available.</em></p>`;
    }

    if (data.summary?.key_takeaways && Array.isArray(data.summary.key_takeaways)) {
        html += `<h3>Key Takeaways</h3><ul>`;
        data.summary.key_takeaways.forEach(item => {
            if (item) html += `<li>${item}</li>`;
        });
        html += `</ul>`;
    }

    // 5Cs Analysis
    if (data.credit_analysis_5cs) {
        html += `<h2>2. Credit Analysis (5Cs)</h2>`;
        Object.entries(data.credit_analysis_5cs).forEach(([key, value]) => {
            if (!value) return;
            html += `<h3>${key.toUpperCase()}</h3>`;
            // Match AnalysisDashboard exactly: removed value.analysis to prevent shadowing other keys
            const content = value.assessment || value.equity_position || value.loan_purpose || value.repayment_source || 'No analysis provided.';
            html += `<p>${safe(content)}</p>`;
            if (value.highlights && Array.isArray(value.highlights)) {
                html += `<ul>`;
                value.highlights.forEach(h => {
                    if (h) html += `<li>${h}</li>`;
                });
                html += `</ul>`;
            }
        });
    }

    // Financial Metrics
    if (data.financial_metrics && Array.isArray(data.financial_metrics)) {
        html += `<h2>3. Financial Metrics</h2>`;
        html += `<table><tr><th>Metric</th><th>Value</th><th>Status</th></tr>`;
        data.financial_metrics.forEach(metric => {
            if (!metric) return;
            const statusClass = metric.status === 'healthy' ? 'metric-value' : 'risk-medium';
            const unit = metric.unit === '%' ? '%' : metric.unit === 'ratio' ? 'x' : '';
            // Match AnalysisDashboard: combine category and label
            const name = [metric.category, metric.label || metric.name].filter(Boolean).join(' - ') || 'Unknown Metric';
            html += `<tr><td>${safe(name)}</td><td class="${statusClass}">${safe(metric.value, '0')}${unit}</td><td>${safe(metric.status, '-')}</td></tr>`;
        });
        html += `</table>`;
    }

    // Risk Assessment
    if (data.risk_assessment) {
        html += `<h2>4. Risk Assessment</h2>`;
        if (data.risk_assessment.red_flags && Array.isArray(data.risk_assessment.red_flags)) {
            html += `<h3>Red Flags</h3><ul>`;
            data.risk_assessment.red_flags.forEach(flag => {
                if (!flag) return;
                const riskClass = flag.severity === 'High' ? 'risk-high' : 'risk-medium';
                html += `<li><span class="${riskClass}">${safe(flag.issue)}</span> (${safe(flag.severity)}): ${safe(flag.mitigant)}</li>`;
            });
            html += `</ul>`;
        }

        const renderList = (title, list) => {
            if (list && Array.isArray(list) && list.length > 0) {
                html += `<h3>${title}</h3><ul>`;
                list.forEach(item => {
                    if (item?.text) html += `<li>${item.text}</li>`;
                });
                html += `</ul>`;
            }
        };

        renderList('Strengths', data.risk_assessment.strengths);
        renderList('Weaknesses', data.risk_assessment.weaknesses);
    }

    // Recommendation
    const recommendation = data.summary?.recommendation || 'Pending';
    html += `<div class="recommendation">
        <h2>5. Final Recommendation</h2>
        <p><strong>Recommendation:</strong> ${recommendation}</p>
        ${data.summary?.recommendation_justification ? `<p><strong>Justification:</strong> ${data.summary.recommendation_justification}</p>` : ''}
    </div>`;

    html += `</body></html>`;
    return html;
};

/**
 * Convert HTML to formatted text for markdown/plain text export
 */
export const htmlToText = (html) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
};

/**
 * Download content as file
 */
export const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};

/**
 * Download as Word document (using html2pdf or similar)
 */
export async function downloadAsWord(memo, filename = "credit_memo.docx") {
    const res = await fetch("https://huggingface.co/spaces/giz17/Wizcoders-Mclaren-Orix-Hackathon/download/word", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(memo)
    });

    const blob = await res.blob(); // ✅ REAL DOCX
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    window.URL.revokeObjectURL(url);
};


/**
 * Simplify text using backend API
 */
export const simplifyText = async (text, apiKey) => {
    try {
        const response = await fetch('/api/simplify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({ text })
        });

        if (!response.ok) {
            throw new Error('Failed to simplify text');
        }

        const data = await response.json();
        return data.simplified_text || text;
    } catch (error) {
        console.error('Simplify error:', error);
        return text;
    }
};

