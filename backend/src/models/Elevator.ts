export type Direction = "UP" | "DOWN" | "IDLE";
export type DoorState = "OPEN" | "CLOSED" | "OPENING" | "CLOSING";

export class Elevator {
    id: number;
    currentFloor: number;
    direction: Direction;
    doorState: DoorState;
    targetFloors: Set<number>;
    passengerCount: number;
    capacity: number;

    // Timing state
    ticksUntilNextState: number;
    busyTicks: number;

    constructor(id: number, capacity: number = 10) {
        this.id = id;
        this.currentFloor = 1; // Base floor is 1
        this.direction = "IDLE";
        this.doorState = "CLOSED";
        this.targetFloors = new Set();
        this.passengerCount = 0;
        this.capacity = capacity;
        this.ticksUntilNextState = 0;
        this.busyTicks = 0;
    }

    get isFull(): boolean {
        return this.passengerCount >= this.capacity;
    }
}
