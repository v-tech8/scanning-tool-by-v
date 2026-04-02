import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import ScanResults from './pages/ScanResults';
import StartScan from './pages/StartScan';
import ScanHistory from './pages/ScanHistory';
import ThreatIntel from './pages/ThreatIntel';
import Reports from './pages/Reports';

function App() {
    return (
        <Router>
            <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-100 selection:bg-cyan-500/30">
                <Sidebar />
                <main className="flex-1 overflow-y-auto w-full">
                    <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/scan" element={<StartScan />} />
                        <Route path="/scan/:scanId" element={<ScanResultsWrapper />} />
                        <Route path="/history" element={<ScanHistory />} />
                        <Route path="/intel" element={<ThreatIntel />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="*" element={<div className="p-8 text-center"><h2 className="text-2xl mt-20 text-slate-400">Page not implemented yet</h2></div>} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

import { useParams } from 'react-router-dom';
function ScanResultsWrapper() {
    const { scanId } = useParams();
    return <ScanResults scanId={scanId} />;
}

export default App;
