import React, { useState } from 'react';
import { Radar, Globe, Target, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StartScan() {
    const [scanTarget, setScanTarget] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleScan = async (e) => {
        e.preventDefault();
        if (!scanTarget) return;

        setIsScanning(true);
        setError(null);

        try {
            const response = await fetch('/api/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ target: scanTarget })
            });

            if (response.ok) {
                const data = await response.json();

                // Polling simulation for UI purposes until real polling is built
                setTimeout(() => {
                    navigate(`/scan/${data.scan_id}`);
                }, 3000);
            } else {
                throw new Error("Failed to start scan");
            }
        } catch (err) {
            console.error(err);
            setError("Failed to communicate with the scanner engine. Is the backend running?");
            setIsScanning(false);
        }
    };

    return (
        <div className="p-6 md:p-8 w-full min-h-full font-sans max-w-5xl mx-auto text-slate-100 flex flex-col justify-center">

            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center p-4 bg-cyan-500/10 rounded-full mb-6 border border-cyan-500/20 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
                    <Radar className="w-12 h-12 text-cyan-400" />
                </div>
                <h2 className="text-4xl font-bold tracking-tight mb-4">Launch Assessment</h2>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
                    Enter a domain, IP address, or CIDR range. The system will automatically orchestrate Nmap, Nikto, OWASP ZAP, and Threat Intelligence checks.
                </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl max-w-3xl mx-auto w-full relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-emerald-500"></div>

                <form onSubmit={handleScan} className="space-y-6">
                    <div>
                        <label htmlFor="target" className="block text-sm font-medium text-slate-300 mb-2">Target Asset</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Target className="h-5 w-5 text-slate-500" />
                            </div>
                            <input
                                id="target"
                                type="text"
                                value={scanTarget}
                                onChange={(e) => setScanTarget(e.target.value)}
                                disabled={isScanning}
                                placeholder="e.g., example.com, 10.0.0.1, or 192.168.1.0/24"
                                className="block w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-700 rounded-xl text-lg text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600 font-mono"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-lg flex items-start gap-3">
                            <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-rose-400">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isScanning}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-lg py-4 rounded-xl transition-all flex justify-center items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] relative"
                    >
                        {isScanning ? (
                            <>
                                <span className="absolute inset-0 w-full h-full rounded-xl overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent"></span>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Orchestrating Scanners...</span>
                            </>
                        ) : (
                            <>
                                <Globe className="w-5 h-5" />
                                Initiate Security Scan
                            </>
                        )}
                    </button>

                    <p className="text-center text-xs text-slate-500 mt-4 flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Authorized targets only. Use responsibly.
                    </p>
                </form>
            </div>

            {/* Feature Hints */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto text-center">
                <div>
                    <div className="bg-slate-900 border border-slate-800 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <span className="text-cyan-500 font-bold font-mono">01</span>
                    </div>
                    <h4 className="font-medium text-slate-200 mb-2">Automated Recon</h4>
                    <p className="text-sm text-slate-500">Discovers open ports and running services instantly.</p>
                </div>
                <div>
                    <div className="bg-slate-900 border border-slate-800 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <span className="text-cyan-500 font-bold font-mono">02</span>
                    </div>
                    <h4 className="font-medium text-slate-200 mb-2">Vulnerability Mapping</h4>
                    <p className="text-sm text-slate-500">Cross-references services with known CVE databases.</p>
                </div>
                <div>
                    <div className="bg-slate-900 border border-slate-800 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <span className="text-cyan-500 font-bold font-mono">03</span>
                    </div>
                    <h4 className="font-medium text-slate-200 mb-2">AI Summarization</h4>
                    <p className="text-sm text-slate-500">Generates executive reports and technical remediation.</p>
                </div>
            </div>

        </div>
    );
}
