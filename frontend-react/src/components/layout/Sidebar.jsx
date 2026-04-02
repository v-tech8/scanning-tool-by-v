import React from 'react';
import { Home, Radar, History, ShieldAlert, FileText } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
    const location = useLocation();

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: Home },
        { name: 'Start Scan', path: '/scan', icon: Radar },
        { name: 'Scan History', path: '/history', icon: History },
        { name: 'Threat Intel', path: '/intel', icon: ShieldAlert },
        { name: 'Reports', path: '/reports', icon: FileText },
    ];

    return (
        <div className="w-64 h-full bg-slate-900 border-r border-slate-800 flex flex-col hidden md:flex shrink-0">
            <div className="p-6">
                <h1 className="text-xl font-bold text-cyan-400 flex items-center gap-2 tracking-wide">
                    <ShieldAlert className="w-6 h-6" />
                    SecOps Core
                </h1>
            </div>
            <nav className="flex-1 px-4 space-y-2 mt-4">
                {navItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.path);
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium text-sm">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* System Status Indicator at bottom of Sidebar */}
            <div className="p-4 mt-auto">
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                    <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">System Status</div>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        <span className="text-sm font-medium text-slate-300">All Systems Operational</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
