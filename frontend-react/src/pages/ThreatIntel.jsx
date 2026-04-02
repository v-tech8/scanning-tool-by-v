import React, { useState, useEffect } from 'react';
import { ShieldAlert, Globe, Activity, Terminal, Loader2 } from 'lucide-react';

export default function ThreatIntel() {
    const [status, setStatus] = useState({ virustotal: 'Loading...', abuseipdb: 'Loading...', shodan: 'Loading...' });
    const [feed, setFeed] = useState([
        { ip: '194.26.29.11', type: 'Brute Force', src: 'AbuseIPDB', conf: '99%' },
        { ip: '45.133.1.20', type: 'Malware C2', src: 'VirusTotal', conf: '85%' },
        { ip: '8.8.8.8', type: 'Clean', src: 'Multiple', conf: '0%' },
    ]);
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetch('/api/intel/status')
            .then(res => res.json())
            .then(data => setStatus(data))
            .catch(err => console.error(err));
    }, []);

    const handleLookup = async () => {
        if (!query) return;
        setIsLoading(true);
        try {
            const res = await fetch('/api/intel/lookup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query })
            });
            if (res.ok) {
                const data = await res.json();
                if (data.threats) {
                    setFeed(prev => [...data.threats, ...prev].slice(0, 10)); // Keep top 10
                }
            }
        } catch (err) {
            console.error("Lookup failed:", err);
        } finally {
            setIsLoading(false);
            setQuery('');
        }
    };
    return (
        <div className="p-6 md:p-8 w-full min-h-full font-sans max-w-7xl mx-auto text-slate-100">
            <header className="mb-8 border-b border-slate-800 pb-6 flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <ShieldAlert className="w-8 h-8 text-rose-500" />
                        <h2 className="text-3xl font-bold tracking-tight">Global Threat Intel</h2>
                    </div>
                    <p className="text-slate-400">Live feeds and IP reputation integrations (AbuseIPDB & VirusTotal).</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Simulated Feed */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
                        <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-cyan-400" /> Live Threat Feed
                        </h3>
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping text-rose-400 absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                        </span>
                    </div>
                    <div className="p-0">
                        <ul className="divide-y divide-slate-800/50">
                            {feed.map((threat, i) => (
                                <li key={i} className="p-4 hover:bg-slate-800/30 transition-colors flex justify-between items-center">
                                    <div>
                                        <div className="font-mono text-sm text-slate-200">{threat.ip}</div>
                                        <div className="text-xs text-slate-500 mt-1">Source: {threat.src}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-sm tracking-wide font-medium ${threat.type === 'Clean' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {threat.type}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1">Confidence: {threat.conf}</div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* API Status */}
                <div className="flex flex-col gap-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
                        <h3 className="font-semibold text-slate-200 flex items-center gap-2 mb-4">
                            <Globe className="w-4 h-4 text-cyan-400" /> Integration Status
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 rounded bg-slate-950/50 border border-slate-800">
                                <span className="text-sm font-medium">VirusTotal API</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${status.virustotal === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>{status.virustotal}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded bg-slate-950/50 border border-slate-800">
                                <span className="text-sm font-medium">AbuseIPDB API</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${status.abuseipdb === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>{status.abuseipdb}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded bg-slate-950/50 border border-slate-800">
                                <span className="text-sm font-medium">Shodan API</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${status.shodan === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>{status.shodan}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm flex-1">
                        <h3 className="font-semibold text-slate-200 flex items-center gap-2 mb-4">
                            <Terminal className="w-4 h-4 text-cyan-400" /> Manual Intel Lookup
                        </h3>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="IP Hash or Domain..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                                className="bg-slate-950 border border-slate-700 text-sm rounded-lg px-4 py-2 flex-1 focus:outline-none focus:border-cyan-500 text-slate-200 font-mono"
                            />
                            <button
                                onClick={handleLookup}
                                disabled={isLoading || !query}
                                className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-[0_0_15px_rgba(6,182,212,0.2)] flex items-center justify-center min-w-[80px]"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Lookup"}
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
