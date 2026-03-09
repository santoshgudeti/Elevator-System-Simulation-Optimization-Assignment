import React, { useState } from 'react';
import { Play, Square, Settings, RefreshCw, BarChart2 } from 'lucide-react';

interface Props {
    onStart: () => void;
    onStop: () => void;
    onReset: () => void;
    onConfig: (floors: number, elevators: number, requestFreq: number) => void;
    onSpeed: (speed: number) => void;
    metrics: {
        avgWaitTime: number;
        avgTravelTime: number;
        completedCount: number;
        maxWaitTime: number;
        utilizationRate: number;
    } | undefined;
    simTime: number;
    activeRequests: number;
}

export const ControlPanel: React.FC<Props> = ({
    onStart, onStop, onReset, onConfig, onSpeed, metrics, simTime, activeRequests
}) => {
    const [floors, setFloors] = useState(10);
    const [elevators, setElevators] = useState(3);
    const [freq, setFreq] = useState(5);
    const [activeSpeed, setActiveSpeed] = useState(1);

    const applyConfig = () => {
        onConfig(floors, elevators, freq);
    };

    const setTimeSpeed = (s: number) => {
        setActiveSpeed(s);
        onSpeed(s);
    };

    return (
        <div className="bg-neutral-800 rounded-2xl p-6 shadow-xl border border-neutral-700 font-sans">
            <div className="flex items-center gap-2 mb-6 border-b border-neutral-700 pb-4">
                <Settings className="text-blue-400" size={24} />
                <h2 className="text-xl font-bold text-white">Simulation Controls</h2>
            </div>

            <div className="space-y-4 mb-6">
                <div>
                    <label className="text-sm text-neutral-400 font-medium block mb-1">Floors (k)</label>
                    <input
                        type="number" min="2" max="50" value={floors}
                        onChange={e => setFloors(Number(e.target.value))}
                        className="w-full bg-neutral-900 border border-neutral-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>
                <div>
                    <label className="text-sm text-neutral-400 font-medium block mb-1">Elevators (n)</label>
                    <input
                        type="number" min="1" max="10" value={elevators}
                        onChange={e => setElevators(Number(e.target.value))}
                        className="w-full bg-neutral-900 border border-neutral-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>
                <div>
                    <label className="text-sm text-neutral-400 font-medium block mb-1">Request Freq (secs)</label>
                    <input
                        type="number" min="1" max="20" value={freq}
                        onChange={e => setFreq(Number(e.target.value))}
                        className="w-full bg-neutral-900 border border-neutral-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>
                <button
                    onClick={applyConfig}
                    className="w-full mt-2 bg-neutral-700 hover:bg-neutral-600 text-white font-medium py-2 rounded-lg transition border border-neutral-600 flex justify-center items-center gap-2"
                >
                    <RefreshCw size={16} /> Apply Layout
                </button>
            </div>

            <div className="flex gap-2 mb-6">
                <button
                    onClick={onStart}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg flex justify-center items-center gap-2 font-bold transition shadow-lg shadow-emerald-900/50"
                >
                    <Play size={18} fill="currentColor" /> Start
                </button>
                <button
                    onClick={onStop}
                    className="flex-1 bg-amber-600 hover:bg-amber-500 text-white py-2 rounded-lg flex justify-center items-center gap-2 font-bold transition shadow-lg shadow-amber-900/50"
                >
                    <Square size={18} fill="currentColor" /> Stop
                </button>
                <button
                    onClick={onReset}
                    className="flex-1 bg-rose-600 hover:bg-rose-500 text-white py-2 rounded-lg flex justify-center items-center gap-2 font-bold transition shadow-lg shadow-rose-900/50"
                >
                    <RefreshCw size={18} fill="currentColor" /> Reset
                </button>
            </div>

            <div className="mb-6 bg-neutral-900 rounded-lg p-1 flex">
                {[1, 2, 5].map(s => (
                    <button
                        key={s}
                        onClick={() => setTimeSpeed(s)}
                        className={`flex-1 py-1 text-sm font-semibold rounded-md transition ${activeSpeed === s ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-white'}`}
                    >
                        {s}x Speed
                    </button>
                ))}
            </div>

            {/* Metrics Section */}
            <div className="mt-8 border-t border-neutral-700 pt-6">
                <div className="flex items-center gap-2 mb-4">
                    <BarChart2 className="text-blue-400" size={20} />
                    <h3 className="font-bold text-white">Live Metrics</h3>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-neutral-900 p-3 rounded-lg border border-neutral-700/50">
                        <p className="text-neutral-500 mb-1 text-xs uppercase tracking-wider">Sim Time</p>
                        <p className="text-xl font-mono text-blue-300">{simTime}s</p>
                    </div>
                    <div className="bg-neutral-900 p-3 rounded-lg border border-neutral-700/50">
                        <p className="text-neutral-500 mb-1 text-xs uppercase tracking-wider">Active Req</p>
                        <p className="text-xl font-mono text-amber-300">{activeRequests}</p>
                    </div>
                    <div className="bg-neutral-900 p-3 rounded-lg border border-neutral-700/50">
                        <p className="text-neutral-500 mb-1 text-xs uppercase tracking-wider">Avg Wait</p>
                        <p className="text-xl font-mono text-emerald-300">
                            {metrics ? metrics.avgWaitTime.toFixed(1) : '0.0'}s
                        </p>
                    </div>
                    <div className="bg-neutral-900 p-3 rounded-lg border border-neutral-700/50">
                        <p className="text-neutral-500 mb-1 text-xs uppercase tracking-wider">Avg Travel</p>
                        <p className="text-xl font-mono text-indigo-300">
                            {metrics ? metrics.avgTravelTime.toFixed(1) : '0.0'}s
                        </p>
                    </div>
                    <div className="bg-neutral-900 p-3 rounded-lg border border-neutral-700/50">
                        <p className="text-neutral-500 mb-1 text-xs uppercase tracking-wider">Max Wait</p>
                        <p className="text-xl font-mono text-rose-300">
                            {metrics ? metrics.maxWaitTime.toFixed(1) : '0.0'}s
                        </p>
                    </div>
                    <div className="bg-neutral-900 p-3 rounded-lg border border-neutral-700/50">
                        <p className="text-neutral-500 mb-1 text-xs uppercase tracking-wider">Utilization</p>
                        <p className="text-xl font-mono text-cyan-300">
                            {metrics ? metrics.utilizationRate.toFixed(1) : '0.0'}%
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
