import React, { useState, useEffect } from 'react';
import { AlertCircle, Shield, AlertTriangle, Info, Radar, ChevronRight } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function Dashboard() {
    const [scanTarget, setScanTarget] = useState('');
    const [isScanning, setIsScanning] = useState(false);

    const [dashboardData, setDashboardData] = useState({
        metrics: { critical: 0, high: 0, medium: 0, scanned_ips: 0 },
        recent_activity: [],
        timeline: []
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/dashboard/stats');
                if (response.ok) {
                    const data = await response.json();
                    setDashboardData(data);
                }
            } catch (err) {
                console.error("Failed to fetch dashboard stats", err);
            }
        };
        fetchStats();
        const interval = setInterval(fetchStats, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleScan = async (e) => {
        e.preventDefault();
        if (!scanTarget) return;
        setIsScanning(true);
        try {
            const response = await fetch('/api/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ target: scanTarget })
            });
            if (response.ok) {
                setTimeout(() => {
                    setIsScanning(false);
                    setScanTarget('');
                    // In a real app, redirect to scan tracking view
                }, 2000);
            }
        } catch (err) {
            console.error(err);
            setIsScanning(false);
        }
    };

    return (
        <div className="p-6 md:p-8 w-full min-h-full font-sans max-w-7xl mx-auto">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Security Overview</h2>
                    <p className="text-slate-400 text-sm mt-1">Real-time threat analysis and vulnerability assessment.</p>
                </div>

                {/* Active Scan Indicator */}
                {isScanning && (
                    <div className="flex items-center gap-3 bg-cyan-500/10 border border-cyan-500/20 px-4 py-2 rounded-full">
                        <div className="w-4 h-4 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin"></div>
                        <span className="text-sm font-medium text-cyan-400 animate-pulse">Scanning {scanTarget}...</span>
                    </div>
                )}
            </header>

            {/* Visual Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
                <StatCard title="Critical Threats" count={dashboardData.metrics.critical} icon={AlertCircle} color="text-rose-500" bg="bg-rose-500/10" border="border-rose-500/20" />
                <StatCard title="High Risk" count={dashboardData.metrics.high} icon={AlertTriangle} color="text-orange-500" bg="bg-orange-500/10" border="border-orange-500/20" />
                <StatCard title="Medium Issues" count={dashboardData.metrics.medium} icon={Info} color="text-amber-500" bg="bg-amber-500/10" border="border-amber-500/20" />
                <StatCard title="Total Scanned IP" count={dashboardData.metrics.scanned_ips} icon={Shield} color="text-emerald-500" bg="bg-emerald-500/10" border="border-emerald-500/20" />
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Charts Section */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-slate-100 tracking-wide">Attack Timeline</h3>
                        <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded">Last 24 Hours</span>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dashboardData.timeline} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="time" stroke="#475569" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis stroke="#475569" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#f1f5f9' }}
                                    itemStyle={{ color: '#06b6d4' }}
                                />
                                <Area type="monotone" dataKey="threats" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorThreats)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Action / Quick Scan Section */}
                <div className="flex flex-col gap-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm flex-1">
                        <h3 className="text-lg font-semibold text-slate-100 tracking-wide mb-2 flex items-center gap-2">
                            <Radar className="w-5 h-5 text-cyan-500" />
                            Quick Scan
                        </h3>
                        <p className="text-sm text-slate-400 mb-6 leading-relaxed">Enter a domain, IP address, or CIDR block to initiate an immediate reconnaissance scan.</p>

                        <form onSubmit={handleScan}>
                            <div className="relative mb-4">
                                <input
                                    type="text"
                                    value={scanTarget}
                                    onChange={(e) => setScanTarget(e.target.value)}
                                    disabled={isScanning}
                                    placeholder="e.g., 10.0.0.1 or scanme.nmap.org"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-4 pr-10 py-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600 font-mono disabled:opacity-50"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isScanning}
                                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-3 rounded-lg transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                            >
                                {isScanning ? 'Initializing...' : 'Launch Intelligence Scan'}
                            </button>
                        </form>
                    </div>

                    {/* Quick Links / Recent Actions */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Recent Activity</h3>
                        <ul className="space-y-4">
                            {dashboardData.recent_activity.length > 0 ? (
                                dashboardData.recent_activity.map((activity, i) => (
                                    <ActivityItem
                                        key={activity.id || i}
                                        target={activity.target}
                                        time={new Date(activity.time).toLocaleString() || "Recent"}
                                        status={activity.status}
                                        statusColor={activity.statusColor}
                                    />
                                ))
                            ) : (
                                <p className="text-slate-500 text-sm">No recent scans found.</p>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, count, icon: Icon, color, bg, border }) {
    return (
        <div className={`p-6 rounded-xl border ${bg} ${border} bg-opacity-30 flex items-start justify-between backdrop-blur-sm shadow-sm transition-transform hover:-translate-y-1 duration-300`}>
            <div>
                <p className="text-slate-400 text-sm font-medium mb-2">{title}</p>
                <h3 className={`text-4xl font-bold ${color} tracking-tight`}>{count}</h3>
            </div>
            <div className={`p-3 rounded-lg ${bg}`}>
                <Icon className={`w-6 h-6 ${color}`} />
            </div>
        </div>
    );
}

function ActivityItem({ target, time, status, statusColor }) {
    return (
        <li className="flex items-start gap-3 group cursor-pointer">
            <div className="mt-1 bg-slate-800 p-1.5 rounded text-slate-400 group-hover:text-cyan-400 transition-colors">
                <ChevronRight className="w-4 h-4" />
            </div>
            <div>
                <div className="text-sm font-medium font-mono text-slate-200 leading-tight">{target}</div>
                <div className={`text-xs mt-1 ${statusColor}`}>{status}</div>
                <div className="text-xs text-slate-500 mt-0.5">{time}</div>
            </div>
        </li>
    );
}
