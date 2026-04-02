import React, { useState, useEffect } from 'react';
import { History, Search, ChevronRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ScanHistory() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch('/api/scans/history');
                if (res.ok) {
                    const data = await res.json();
                    setHistory(data.scans || []);
                }
            } catch (err) {
                console.error("Error fetching history:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    return (
        <div className="p-6 md:p-8 w-full min-h-full font-sans max-w-7xl mx-auto text-slate-100">
            <header className="mb-8 border-b border-slate-800 pb-6 flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <History className="w-8 h-8 text-cyan-400" />
                        <h2 className="text-3xl font-bold tracking-tight">Scan History</h2>
                    </div>
                    <p className="text-slate-400">Review past assessments and trace vulnerability timelines.</p>
                </div>
            </header>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
                    <div className="relative w-64">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search by target or ID..."
                            className="bg-slate-900 border border-slate-700 text-sm rounded-lg pl-9 pr-3 py-2 w-full focus:outline-none focus:border-cyan-500 text-slate-200"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="bg-slate-950/50 text-xs uppercase text-slate-400 font-semibold border-b border-slate-800">
                            <tr>
                                <th className="px-6 py-4">Scan ID</th>
                                <th className="px-6 py-4">Target Asset</th>
                                <th className="px-6 py-4">Date & Time</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                                        Loading history...
                                    </td>
                                </tr>
                            ) : history.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                                        No scan history found.
                                    </td>
                                </tr>
                            ) : (
                                history.map((scan) => (
                                    <tr key={scan.scan_id} className="hover:bg-slate-800/20 transition-colors group">
                                        <td className="px-6 py-4 font-mono text-xs text-slate-400">{scan.scan_id.substring(0, 8)}...</td>
                                        <td className="px-6 py-4 font-medium text-slate-200">{scan.target}</td>
                                        <td className="px-6 py-4 text-slate-400">{new Date(scan.timestamp).toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            {scan.status === 'completed' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                                                    <ShieldCheck className="w-3.5 h-3.5" /> Completed
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-500/10 text-rose-400 text-xs font-medium border border-rose-500/20">
                                                    <AlertCircle className="w-3.5 h-3.5" /> {scan.status}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                to={`/scan/${scan.scan_id}`}
                                                className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                                            >
                                                View <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
