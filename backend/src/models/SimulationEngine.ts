import { Elevator, Direction } from "./Elevator";
import { PassengerRequest } from "./Request";
import { Dispatcher } from "../scheduler/Dispatcher";

export class SimulationEngine {
    numFloors: number;
    elevators: Elevator[];
    requests: PassengerRequest[];
    simTime: number; // in seconds
    isRunning: boolean;
    dispatcher: Dispatcher;

    // Configuration Constants
    static TIME_PER_FLOOR = 2; // 2 seconds to traverse 1 floor
    static TIME_DOOR_OPERATION = 3; // 3 seconds to open or close
    static TIME_PASSENGER_BOARDING = 2; // 2 seconds per passenger

    constructor(numElevators: number, numFloors: number) {
        this.numFloors = numFloors;
        this.elevators = [];
        for (let i = 0; i < numElevators; i++) {
            this.elevators.push(new Elevator(i + 1));
        }
        this.requests = [];
        this.simTime = 0;
        this.isRunning = false;
        this.dispatcher = new Dispatcher(this.elevators);
    }

    addRequest(req: PassengerRequest) {
        this.requests.push(req);
        // Attempt initial assignment
        const isMorningRush = this.simTime < 300; // First 5 mins simulated
        this.dispatcher.assignRequest(req, isMorningRush);
    }

    tick() {
        if (!this.isRunning) return;

        this.simTime += 1; // Advance 1 second

        // 1. Update Requests Wait Times
        for (const req of this.requests) {
            if (req.status === "WAITING") {
                req.waitTime += 1;
            } else if (req.status === "BOARDED") {
                req.travelTime += 1;
            }
        }

        // 2. Process Elevator States
        for (const elevator of this.elevators) {
            if (elevator.direction !== "IDLE" || elevator.doorState !== "CLOSED") {
                elevator.busyTicks += 1;
            }

            if (elevator.ticksUntilNextState > 0) {
                elevator.ticksUntilNextState -= 1;

                // If the door was opening/closing and just finished:
                if (elevator.ticksUntilNextState === 0 && elevator.doorState === "OPEN") {
                    // Doors are fully open. Let passengers on and off.
                    this.handlePassengers(elevator);
                }
                continue;
            }

            this.processElevatorTick(elevator);
        }

        // 3. Retry dispatching unassigned requests
        const isMorningRush = this.simTime < 300;
        for (const req of this.requests) {
            if (req.status === "WAITING" && req.assignedElevatorId === null) {
                this.dispatcher.assignRequest(req, isMorningRush);
            }
        }
    }

    handlePassengers(elevator: Elevator) {
        // 1. Unboard passengers
        const completing = this.requests.filter(r => r.status === "BOARDED" && r.assignedElevatorId === elevator.id && r.destinationFloor === elevator.currentFloor);
        for (const req of completing) {
            req.status = "COMPLETED";
            elevator.passengerCount -= 1;
        }

        // 2. Board passengers
        const boarding = this.requests.filter(r => r.status === "WAITING" && r.assignedElevatorId === elevator.id && r.originFloor === elevator.currentFloor);
        for (const req of boarding) {
            if (!elevator.isFull) {
                req.status = "BOARDED";
                elevator.passengerCount += 1;
                elevator.targetFloors.add(req.destinationFloor);
            } else {
                // BUG FIX: Release the stuck passenger back into the pool to be re-assigned
                req.assignedElevatorId = null;
            }
        }

        // Close doors automatically after boarding
        elevator.doorState = "CLOSED";
    }

    processElevatorTick(elevator: Elevator) {
        // This is a placeholder for the actual look/scan state machine
        // that we will implement next.
        if (elevator.targetFloors.size === 0) {
            elevator.direction = "IDLE";
            return;
        }

        // Simple continuous SCAN logic
        // Determine target based on current direction
        const targets = Array.from(elevator.targetFloors);

        // Sort targets to find next logical stop
        let target = elevator.currentFloor;
        if (elevator.direction === "UP") {
            const above = targets.filter(f => f > elevator.currentFloor).sort((a, b) => a - b);
            if (above.length > 0) {
                target = above[0];
            } else {
                const below = targets.filter(f => f < elevator.currentFloor).sort((a, b) => b - a);
                if (below.length > 0) {
                    elevator.direction = "DOWN";
                    target = below[0];
                }
            }
        } else if (elevator.direction === "DOWN") {
            const below = targets.filter(f => f < elevator.currentFloor).sort((a, b) => b - a);
            if (below.length > 0) {
                target = below[0];
            } else {
                const above = targets.filter(f => f > elevator.currentFloor).sort((a, b) => a - b);
                if (above.length > 0) {
                    elevator.direction = "UP";
                    target = above[0];
                }
            }
        } else {
            // IDLE
            if (targets.length > 0) {
                // Just pick the closest
                targets.sort((a, b) => Math.abs(a - elevator.currentFloor) - Math.abs(b - elevator.currentFloor));
                target = targets[0];
                elevator.direction = target > elevator.currentFloor ? "UP" : "DOWN";
            } else {
                // IDLE PARKING LOGIC
                // If Morning Rush is active (e.g. sim time < 5 minutes), park at Lobby (1)
                const isMorningRush = this.simTime < 300;
                if (isMorningRush && elevator.currentFloor !== 1) {
                    target = 1;
                    elevator.direction = "DOWN";
                    // Don't set door states or add to target floors, just move
                }
            }
        }


        if (elevator.currentFloor < target) {
            elevator.currentFloor += 1;
            elevator.direction = "UP";
            elevator.ticksUntilNextState = SimulationEngine.TIME_PER_FLOOR;
        } else if (elevator.currentFloor > target) {
            elevator.currentFloor -= 1;
            elevator.direction = "DOWN";
            elevator.ticksUntilNextState = SimulationEngine.TIME_PER_FLOOR;
        } else {
            // Arrived
            elevator.targetFloors.delete(target);
            elevator.doorState = "OPEN";
            elevator.ticksUntilNextState = SimulationEngine.TIME_DOOR_OPERATION * 2; // delay to keep doors open
        }
    }
}
