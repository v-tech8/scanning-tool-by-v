import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Filter } from 'lucide-react';

export default function Reports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // We can reuse the history endpoint to find scans that have reports
        const fetchReports = async () => {
            try {
                const res = await fetch('/api/scans/history');
                if (res.ok) {
                    const data = await res.json();
                    setReports(data.scans || []);
                }
            } catch (err) {
                console.error("Error fetching history for reports:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    return (
        <div className="p-6 md:p-8 w-full min-h-full font-sans max-w-7xl mx-auto text-slate-100">
            <header className="mb-8 border-b border-slate-800 pb-6 flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-8 h-8 text-indigo-400" />
                        <h2 className="text-3xl font-bold tracking-tight">Compliance & Reports</h2>
                    </div>
                    <p className="text-slate-400">Download executive summaries and detailed technical findings.</p>
                </div>

                <div className="flex gap-3">
                    <button className="bg-slate-800 hover:bg-slate-700 text-sm px-4 py-2 rounded-lg flex items-center gap-2 border border-slate-700 transition-colors">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                    <button className="bg-slate-800 hover:bg-slate-700 text-sm px-4 py-2 rounded-lg flex items-center gap-2 border border-slate-700 transition-colors">
                        <Calendar className="w-4 h-4" /> Date Range
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full text-center text-slate-500 py-10">Loading reports...</div>
                ) : reports.length === 0 ? (
                    <div className="col-span-full text-center text-slate-500 py-10">No reports generated yet.</div>
                ) : (
                    reports.map((scan) => (
                        <div key={scan.scan_id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors group relative overflow-hidden flex flex-col h-full">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-transparent rounded-bl-full pointer-events-none"></div>

                            <div className="flex justify-between items-start mb-4">
                                <FileText className="w-6 h-6 text-indigo-400" />
                                <span className="text-xs font-mono text-slate-500">{new Date(scan.timestamp).toLocaleDateString()}</span>
                            </div>

                            <h3 className="font-semibold text-lg text-slate-200 mb-1 leading-tight line-clamp-2">Security Assessment: {scan.target}</h3>
                            <p className="text-sm text-slate-400 mb-6 font-mono text-xs">ID: {scan.scan_id.substring(0, 8)}</p>

                            <div className="mt-auto pt-4 border-t border-slate-800/50 flex gap-3">
                                {scan.report_path ? (
                                    <a
                                        href={`/results/${scan.report_path}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex-1 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 text-sm font-medium py-2 rounded border border-indigo-500/20 flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <Download className="w-4 h-4" /> {scan.report_path.endsWith('.html') ? 'HTML' : 'PDF'}
                                    </a>
                                ) : (
                                    <span className="flex-1 bg-slate-800/50 text-slate-500 text-sm font-medium py-2 rounded border border-slate-800/50 flex items-center justify-center gap-2 cursor-not-allowed">
                                        <Download className="w-4 h-4" /> No Report
                                    </span>
                                )}
                                <a
                                    href={`/results/${scan.scan_id}.json`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium py-2 rounded border border-slate-700 flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Download className="w-4 h-4" /> JSON
                                </a>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
