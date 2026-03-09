# Elevator System Simulation & Optimization

This project is a full-stack web simulation of an elevator scheduling algorithm handling $n$ elevators serving $k$ floors. The system visualizes the elevators in real-time while a backend Node.js server calculates wait times, travel times, and implements specific UX biases (Wait Time Escalation, Morning Rush Priority, and Predictive Parking).

## Project Structure
- **/backend**: Node.js + Socket.io Simulation Engine
- **/frontend**: React + Vite + TailwindCSS + Framer Motion visualizer
- **PRD.md**: Project Requirements Document detailing the plan
- **Report.md**: A 1-2 page technical writeup of the algorithm and UX biases as requested in the assignment

## How to Run Locally

### 1. Start the Backend Simulation Engine
Open a terminal and run the following:
```bash
cd backend
npm install
npm run dev
```
*(The backend will run on `http://localhost:3001` with nodemon)*

### 2. Start the Frontend Visualizer
Open a second terminal and run the following:
```bash
cd frontend
npm install
npm run dev
```
*(The frontend will run on `http://localhost:5173` using Vite)*

## Usage
1. Open up the provided local URL in your browser (usually `http://localhost:5173`).
2. Type in your desired configuration: number of floors ($k$), number of elevators ($n$), and the request generation frequency.
3. Click **Apply Layout**.
4. Click **Start** to begin the simulation.
5. Watch the metrics panel dynamically track Average Wait Time and Average Travel Time as the traffic generator spawns random passengers.
