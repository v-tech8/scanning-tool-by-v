import React, { useState, useEffect } from 'react';
import { ShieldCheck, Download, AlertTriangle, AlertCircle, Info, ChevronRight, Activity, Terminal } from 'lucide-react';

export default function ScanResults({ scanId }) {
    const [scanData, setScanData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch the specific scan JSON from the results directory
        const fetchScanData = async () => {
            try {
                // Wait for the orchestrator to save the result
                const res = await fetch(`/results/${scanId}.json`);
                if (res.ok) {
                    const data = await res.json();
                    setScanData(data);
                }
            } catch (err) {
                console.error("Error fetching scan data:", err);
            } finally {
                setLoading(false);
            }
        };

        // If scan is still running, we'd poll status. Assuming it's done for this view:
        fetchScanData();
    }, [scanId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                <div className="w-8 h-8 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin mb-4"></div>
                Analyzing scan telemetry...
            </div>
        );
    }

    if (!scanData) {
        return <div className="p-8 text-rose-400">Scan results not found or still processing.</div>;
    }

    const { target, categorized, ai_analysis, report_path } = scanData;

    return (
        <div className="p-6 md:p-8 w-full min-h-full font-sans max-w-7xl mx-auto text-slate-100">
            <header className="flex justify-between items-end mb-8 border-b border-slate-800 pb-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <ShieldCheck className="w-8 h-8 text-emerald-400" />
                        <h2 className="text-3xl font-bold tracking-tight">Scan Intelligence Report</h2>
                    </div>
                    <p className="text-slate-400 font-mono text-lg">Target: <span className="text-cyan-400">{target}</span></p>
                </div>

                {report_path && (
                    <a
                        href={`/results/${report_path.split('/').pop()}`}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors border border-slate-700"
                    >
                        <Download className="w-4 h-4" />
                        Download PDF Report
                    </a>
                )}
            </header>

            {/* AI Summary Section */}
            {ai_analysis && (
                <div className="mb-8 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg shadow-cyan-900/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
                    <h3 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
                        <Terminal className="w-5 h-5" />
                        AI Threat Analysis
                    </h3>
                    <div className="text-slate-300 leading-relaxed text-sm mb-6 whitespace-pre-line">
                        {ai_analysis.summary}
                    </div>

                    {ai_analysis.remediation && ai_analysis.remediation.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Recommended Remediation Steps</h4>
                            <ul className="space-y-2">
                                {ai_analysis.remediation.map((step, idx) => (
                                    <li key={idx} className="flex gap-2 text-sm text-slate-300 bg-slate-950/50 p-3 rounded border border-slate-800/50">
                                        <ChevronRight className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                        <span>{step}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* Raw Findings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FindingColumn
                    title="Critical Vulnerabilities"
                    icon={AlertCircle}
                    color="text-rose-400"
                    items={categorized?.critical || []}
                    borderClass="border-rose-500/20"
                    bgClass="bg-rose-500/5"
                />

                <FindingColumn
                    title="High Risk Exposures"
                    icon={AlertTriangle}
                    color="text-orange-400"
                    items={categorized?.potential || []}
                    borderClass="border-orange-500/20"
                    bgClass="bg-orange-500/5"
                />

                <FindingColumn
                    title="Informational"
                    icon={Info}
                    color="text-cyan-400"
                    items={categorized?.informational || []}
                    borderClass="border-cyan-500/20"
                    bgClass="bg-cyan-500/5"
                />
            </div>
        </div>
    );
}

function FindingColumn({ title, icon: Icon, color, items, borderClass, bgClass }) {
    return (
        <div className={`rounded-xl border border-slate-800 bg-slate-900/50 flex flex-col h-[500px]`}>
            <div className={`p-4 border-b ${borderClass} ${bgClass} flex items-center justify-between`}>
                <h3 className={`font-semibold ${color} flex items-center gap-2`}>
                    <Icon className="w-4 h-4" />
                    {title}
                </h3>
                <span className={`text-xs font-bold px-2 py-1 rounded bg-slate-950 ${color}`}>{items.length}</span>
            </div>
            <div className="p-4 overflow-y-auto flex-1 space-y-3">
                {items.length === 0 ? (
                    <div className="text-slate-500 text-sm text-center mt-10">No findings in this category.</div>
                ) : (
                    items.map((item, idx) => (
                        <div key={idx} className="bg-slate-950 border border-slate-800 p-3 rounded text-sm text-slate-300 leading-snug">
                            {item}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
