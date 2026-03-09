import { Elevator } from "../models/Elevator";
import { PassengerRequest } from "../models/Request";

export class Dispatcher {
    elevators: Elevator[];

    constructor(elevators: Elevator[]) {
        this.elevators = elevators;
    }

    assignRequest(request: PassengerRequest, isMorningRush: boolean = false): boolean {
        let bestElevator: Elevator | null = null;
        let lowestCost = Infinity;

        for (const elevator of this.elevators) {
            if (elevator.isFull) continue;

            const cost = this.calculateCost(elevator, request, isMorningRush);

            if (cost < lowestCost) {
                lowestCost = cost;
                bestElevator = elevator;
            }
        }

        if (bestElevator) {
            bestElevator.targetFloors.add(request.originFloor);
            // We also add destination to target floors later when boarded, but for planning we can add it now or later.
            // Easiest is to let the elevator add destination floor when the passenger actually boards.
            request.assignedElevatorId = bestElevator.id;
            return true;
        }

        return false; // No suitable elevator found (all full etc), will try again next tick
    }

    private calculateCost(elevator: Elevator, request: PassengerRequest, isMorningRush: boolean): number {
        let cost = Math.abs(elevator.currentFloor - request.originFloor);

        // UX Bias 1: Morning Rush Priority
        // If it's morning rush and the request originates from the lobby going UP, heavily prioritize this request.
        if (isMorningRush && request.originFloor === 1 && request.direction === "UP") {
            cost -= 50; // Massively lower cost makes it extremely likely to be assigned
        }

        // UX Bias 2: Wait Time Escalation
        // If a request has been waiting for more than 30 seconds, override the normal distance penalties 
        // to give it a sharp escalation in priority.
        if (request.waitTime > 30) {
            cost -= request.waitTime; // Decrease cost by wait time to prioritize oldest requests
        }

        if (elevator.direction === "IDLE") {
            // Idle elevators are good candidates, cost is mostly distance (modified by biases)
            return cost;
        }

        if (elevator.direction === request.direction) {
            // Elevator is moving in the same direction as the request
            if (
                (elevator.direction === "UP" && elevator.currentFloor <= request.originFloor) ||
                (elevator.direction === "DOWN" && elevator.currentFloor >= request.originFloor)
            ) {
                // Request is ahead of the elevator
                return cost;
            } else {
                // Request is behind the elevator, will have to finish its current run and come back
                return cost + 20; // High penalty
            }
        } else {
            // Elevator is moving in the opposite direction
            return cost + 15; // Moderate-high penalty
        }
    }
}
