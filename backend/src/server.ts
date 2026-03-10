import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { SimulationEngine } from './models/SimulationEngine';
import { PassengerRequest } from './models/Request';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // allow all for local dev
    }
});

let engine = new SimulationEngine(3, 10);
let simInterval: NodeJS.Timeout | null = null;
let trafficInterval: NodeJS.Timeout | null = null;
let tickRate = 1000; // 1 second real-time = 1 sim second by default
let requestFrequency = 5; // new request roughly every 5 seconds

function runSimulation() {
    engine.tick();

    // Calculate running metrics
    const completedReqs = engine.requests.filter(r => r.status === "COMPLETED");
    const avgWaitTime = completedReqs.length ? completedReqs.reduce((acc, r) => acc + r.waitTime, 0) / completedReqs.length : 0;
    const avgTravelTime = completedReqs.length ? completedReqs.reduce((acc, r) => acc + r.travelTime, 0) / completedReqs.length : 0;
    const maxWaitTime = engine.requests.length ? Math.max(...engine.requests.map(r => r.waitTime)) : 0;

    // Calculate utilization rate (0 to 100%)
    const totalBusyTicks = engine.elevators.reduce((acc, e) => acc + e.busyTicks, 0);
    const maxPossibleTicks = Math.max(1, engine.simTime * engine.elevators.length);
    const utilizationRate = (totalBusyTicks / maxPossibleTicks) * 100;

    // Broadcast state
    io.emit("simState", {
        time: engine.simTime,
        elevators: engine.elevators,
        requests: engine.requests.filter(r => r.status !== "COMPLETED"),
        metrics: {
            avgWaitTime,
            avgTravelTime,
            completedCount: completedReqs.length,
            maxWaitTime,
            utilizationRate
        }
    });
}

function generateTraffic() {
    if (!engine.isRunning) return;
    // Determine if morning rush
    const isMorningRush = engine.simTime < 300; // First 5 mins simulated

    let origin = 1;
    let dest = 1;

    if (isMorningRush && Math.random() < 0.7) {
        // 70% of requests from lobby during morning rush
        origin = 1;
        dest = Math.floor(Math.random() * (engine.numFloors - 1)) + 2;
    } else {
        // Completely random
        origin = Math.floor(Math.random() * engine.numFloors) + 1;
        dest = Math.floor(Math.random() * engine.numFloors) + 1;
        while (origin === dest) dest = Math.floor(Math.random() * engine.numFloors) + 1;
    }

    const req = new PassengerRequest(origin, dest, engine.simTime);
    engine.addRequest(req);
}

io.on('connection', (socket) => {
    console.log('Frontend connected:', socket.id);

    // Send immediate state so the frontend doesn't hang waiting for 'start'
    runSimulation();

    socket.on("config", (data: { numElevators: number, numFloors: number, requestFrequency: number }) => {
        engine = new SimulationEngine(data.numElevators, data.numFloors);
        requestFrequency = data.requestFrequency || 5;
        io.emit("message", "System reconfigured.");
    });

    socket.on("start", () => {
        if (!engine.isRunning) {
            engine.isRunning = true;
            if (!simInterval) simInterval = setInterval(runSimulation, tickRate);
            if (!trafficInterval) trafficInterval = setInterval(generateTraffic, tickRate * requestFrequency);
        }
    });

    socket.on("stop", () => {
        engine.isRunning = false;
        if (simInterval) clearInterval(simInterval);
        if (trafficInterval) clearInterval(trafficInterval);
        simInterval = null;
        trafficInterval = null;
    });

    socket.on("reset", () => {
        engine.isRunning = false;
        if (simInterval) clearInterval(simInterval);
        if (trafficInterval) clearInterval(trafficInterval);
        simInterval = null;
        trafficInterval = null;
        engine = new SimulationEngine(engine.elevators.length, engine.numFloors);
        io.emit("message", "System reset.");
        runSimulation(); // Broadcast the new 0 state immediately
    });

    socket.on("setSpeed", (speed: number) => {
        // 1x = 1000ms, 2x = 500ms, 5x = 200ms
        tickRate = 1000 / speed;
        if (engine.isRunning) {
            if (simInterval) clearInterval(simInterval);
            simInterval = setInterval(runSimulation, tickRate);
            if (trafficInterval) clearInterval(trafficInterval);
            trafficInterval = setInterval(generateTraffic, tickRate * requestFrequency);
        }
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Backend simulation server running on port ${PORT}`);
});
