import React from 'react';
import { motion } from 'framer-motion';
import { Users, ArrowUp, ArrowDown } from 'lucide-react';

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

interface BuildingProps {
    numFloors: number;
    elevators: ElevatorState[];
    requests: RequestState[];
}

export const Building: React.FC<BuildingProps> = ({ numFloors, elevators, requests }) => {
    // Config layout constants
    const floorHeight = 64; // px
    // Adjust height based on floor count
    const buildingHeight = numFloors * floorHeight;

    // Generate floor array from top to bottom
    const floorsArray = Array.from({ length: numFloors }, (_, i) => numFloors - i);

    return (
        <div className="relative w-full overflow-x-auto overflow-y-hidden" style={{ height: buildingHeight + 60 }}>
            <div className="min-w-max flex pl-12 pr-4 relative" style={{ height: buildingHeight }}>

                {/* Floor Markers & Hall Call Buttons */}
                <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between" style={{ height: buildingHeight }}>
                    {floorsArray.map(floorNum => {
                        const floorReqs = requests.filter(r => r.originFloor === floorNum && r.status === "WAITING");
                        const hasUp = floorReqs.some(r => r.direction === "UP");
                        const hasDown = floorReqs.some(r => r.direction === "DOWN");

                        return (
                            <div
                                key={`label-${floorNum}`}
                                className="flex flex-col items-center justify-center border-b border-neutral-700/30"
                                style={{ height: floorHeight }}
                            >
                                <span className="text-xs font-bold text-neutral-400 mb-1">F{floorNum}</span>
                                <div className="flex gap-1">
                                    <ArrowUp size={12} className={hasUp ? "text-emerald-400" : "text-neutral-600"} />
                                    <ArrowDown size={12} className={hasDown ? "text-emerald-400" : "text-neutral-600"} />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Shaft Backgrounds */}
                <div className="flex gap-8 ml-4">
                    {elevators.map((elevator, i) => (
                        <div
                            key={`shaft-${i}`}
                            className="relative w-20 bg-neutral-900 border-x border-neutral-700 shadow-inner"
                            style={{ height: buildingHeight }}
                        >
                            {/* Floor dividers within shaft */}
                            {floorsArray.map(f => (
                                <div
                                    key={`divider-${i}-${f}`}
                                    className="absolute w-full border-b border-neutral-800/50"
                                    style={{ top: (numFloors - f) * floorHeight, height: floorHeight }}
                                />
                            ))}

                            {/* Elevator Car (Framer Motion for smooth movement) */}
                            <motion.div
                                className={`absolute left-1 right-1 rounded-sm border-2 overflow-hidden flex flex-col justify-center items-center shadow-lg
                  ${elevator.capacity <= elevator.passengerCount ? 'border-rose-500 bg-rose-950/40' : 'border-blue-500 bg-blue-900/30'}
                `}
                                style={{ height: floorHeight - 8 }}
                                animate={{
                                    // Calculate top position: (total floors - current floor) * floor height, plus a bit of padding
                                    top: (numFloors - elevator.currentFloor) * floorHeight + 4
                                }}
                                transition={{
                                    duration: 0.8, // Smoothness
                                    ease: "linear",
                                }}
                            >
                                {/* Doors Visualization */}
                                <div className="absolute inset-0 flex justify-between pointer-events-none">
                                    <motion.div
                                        className="h-full bg-slate-700 w-[49%]"
                                        animate={{ x: elevator.doorState === "OPEN" ? "-100%" : "0%" }}
                                        transition={{ duration: 0.5 }}
                                    />
                                    <motion.div
                                        className="h-full bg-slate-700 w-[49%]"
                                        animate={{ x: elevator.doorState === "OPEN" ? "100%" : "0%" }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>

                                {/* Internal Info Overlay */}
                                <div className="z-10 bg-black/60 rounded px-2 py-1 flex flex-col items-center">
                                    <div className="text-white text-xs font-bold font-mono">
                                        {elevator.direction === "UP" ? "▲" : elevator.direction === "DOWN" ? "▼" : "—"}
                                    </div>
                                    <div className="flex items-center gap-1 mt-1 text-emerald-300">
                                        <Users size={12} />
                                        <span className="text-xs font-bold leading-none">{elevator.passengerCount}</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Ground Line */}
            <div className="h-4 bg-neutral-700 w-full mt-2 rounded-sm border-t border-neutral-600 relative overflow-hidden">
                <div className="absolute inset-x-0 bottom-0 h-1 bg-emerald-500/20" />
            </div>
        </div>
    );
};
