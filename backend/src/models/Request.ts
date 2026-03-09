export type RequestDirection = "UP" | "DOWN";

export class PassengerRequest {
    id: string;
    originFloor: number;
    destinationFloor: number;
    direction: RequestDirection;
    timestamp: number;
    waitTime: number;
    travelTime: number;
    status: "WAITING" | "BOARDED" | "COMPLETED";
    assignedElevatorId: number | null;

    constructor(originFloor: number, destinationFloor: number, timestamp: number) {
        this.id = Math.random().toString(36).substr(2, 9);
        this.originFloor = originFloor;
        this.destinationFloor = destinationFloor;
        this.direction = destinationFloor > originFloor ? "UP" : "DOWN";
        this.timestamp = timestamp;
        this.waitTime = 0;
        this.travelTime = 0;
        this.status = "WAITING";
        this.assignedElevatorId = null;
    }
}
