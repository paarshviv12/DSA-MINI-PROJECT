# Emergency Room Triage System - API & React UI

The Emergency Room Triage System is now entirely powered by a **C++ REST API Server** communicating with a **React Frontend UI**, all while maintaining the core Data Structures & Algorithms.

## Architecture Change
- **Removed all `.h` files**: As requested, all C++ code has been merged into a monolithic `api_server.cpp` that contains all structure definitions and algorithms without needing separate header files.
- **REST API Backend (`api_server.cpp`)**: A C++ HTTP server runs on `http://localhost:8080`, exposing the DSA functionalities via JSON endpoints.
- **React UI (`/frontend`)**: A Vite-powered React UI replaces the terminal interactive menu, providing a modern, dynamic, responsive UI with polling to show real-time wait queues, triage stats, and predictions.

## Running the Application

Both servers are currently running in the background. If you need to start them manually later:

### 1. Start the C++ API Server
```bash
cd "/Users/paarshvivijoy/college/DSA MINI PROJECT"
g++ -std=c++17 -I./include -o er_api api_server.cpp -lpthread
./er_api
```
*(Runs on port 8080)*

### 2. Start the React UI
```bash
cd "/Users/paarshvivijoy/college/DSA MINI PROJECT/frontend"
npm install
npm run dev
```
*(Runs on port 5173)*

## Supported Features in UI
- **Patient Registration**: Add patients dynamically. They're instantly pushed into the C++ Priority Queue and AVL tree.
- **Triage Queue**: View real-time patients sorted exactly by Priority Queue's multi-key rules (`severity -> age -> time`).
- **Predictive Analytics**: View live bed demand forecasts and occupancy based on C++ analytical calculations.
- **Bed Allocation**: Admit the highest priority patient from the queue, invoking the DFS floor allocator.
- **Sample Data Loader**: Populate the system instantly.

The backend maintains 100% of the DSA operations: Merge Sort, Priority Queue (Min-Heap), AVL Tree, DFS Bed Allocator, and Greedy Wait-time algorithm.
