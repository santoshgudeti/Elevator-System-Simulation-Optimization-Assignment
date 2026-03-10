import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Building } from './components/Building.tsx';
import { ControlPanel } from './components/ControlPanel.tsx';

interface ElevatorState {
    id: number;
    currentFloor: number;
    direction: "UP" | "DOWN" | "IDLE";
    doorState: "OPEN" | "CLOSED" | "OPENING" | "CLOSING";
    targetFloors: number[];
    passengerCount: number;
    capacity: number;
}

interface RequestState {
    id: string;
    originFloor: number;
    destinationFloor: number;
    direction: "UP" | "DOWN";
    status: string;
    assignedElevatorId: number | null;
}

interface SystemState {
    time: number;
    elevators: ElevatorState[];
    requests: RequestState[];
    metrics: {
        avgWaitTime: number;
        avgTravelTime: number;
        completedCount: number;
        maxWaitTime: number;
        utilizationRate: number;
    };
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
const socket: Socket = io(BACKEND_URL, {
    transports: ['websocket', 'polling'] // Try WebSocket first to skip slow HTTP polling
});

function App() {
    const [state, setState] = useState<SystemState | null>(null);
    const [numFloors, setNumFloors] = useState(10);
    // Remove unused explicit numElevators state if we don't display it directly

    useEffect(() => {
        socket.on('simState', (newState: SystemState) => {
            setState(newState);
        });

        return () => {
            socket.off('simState');
        };
    }, []);

    const handleStart = () => socket.emit('start');
    const handleStop = () => socket.emit('stop');
    const handleReset = () => socket.emit('reset');
    const handleConfig = (nf: number, ne: number, rF: number) => {
        setNumFloors(nf);
        socket.emit('config', { numFloors: nf, numElevators: ne, requestFrequency: rF });
    };
    const handleSpeed = (speed: number) => socket.emit('setSpeed', speed);

    return (
        <div className="min-h-screen bg-neutral-900 text-slate-100 p-8 flex flex-col items-center">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-8 tracking-tight">
                Elevator Simulation Engine
            </h1>

            <div className="flex flex-col xl:flex-row gap-8 w-full max-w-7xl">
                {/* Left Side: Controls & Metrics */}
                <div className="w-full xl:w-1/3 flex flex-col gap-6">
                    <ControlPanel
                        onStart={handleStart}
                        onStop={handleStop}
                        onReset={handleReset}
                        onConfig={handleConfig}
                        onSpeed={handleSpeed}
                        metrics={state?.metrics}
                        simTime={state?.time || 0}
                        activeRequests={state?.requests.length || 0}
                    />
                </div>

                {/* Right Side: Visual Simulation */}
                <div className="w-full xl:w-2/3 bg-neutral-800 p-6 rounded-2xl shadow-2xl border border-neutral-700 overflow-x-auto">
                    {state ? (
                        <Building
                            numFloors={numFloors}
                            elevators={state.elevators}
                            requests={state.requests}
                        />
                    ) : (
                        <div className="h-96 flex items-center justify-center text-neutral-400 animate-pulse">
                            Waiting for backend connection...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
