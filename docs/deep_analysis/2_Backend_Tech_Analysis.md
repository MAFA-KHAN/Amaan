# 2. Backend Technical Analysis & Logic Layer

## 2.1 Technology Stack Overview

| Component | Technology Used | Rationale |
| :--- | :--- | :--- |
| **Orchestrator** | Python 3.9+ | Excellent for string handling, JSON parsing, and rapid API development. |
| **Web Framework** | Flask (Microframework) | Minimalist. No boilerplate. Perfect for a bridge API. |
| **Core Engine** | C++17 (GCC/MinGW) | Raw computational speed and memory management for Graph algorithms. |
| **Bridge** | `subprocess` Module | **Process Isolation** stability (see below). |

## 2.2 In-Depth Tool Analysis

### A. The "Dual-Brain" Architecture
**The Question:** "Why mix Python and C++?"
**The Answer:**
We utilize the **"Best Tool for the Job"** principle.
*   **Python (The Coordinator):** Python is slow at `for` loops but excellent at handling HTTP requests, JSON serialization, and text parsing. It acts as the "Manager."
*   **C++ (The Worker):** C++ is difficult for web servers but unbeatable for math. It handles the `O(E log V)` Dijkstra calculations and `O(log N)` spatial searches.
*   **Result:** We get the Development Speed of Python with the Execution Speed of C++.

### B. The `subprocess` Bridge vs. FFI (Foreign Function Interface)
**The Question:** "Why didn't you use `ctypes` or `pybind11`?"
**The Answer:**
We chose **Process Isolation** via `subprocess.run()`.
1.  **Stability:** If the C++ engine crashes (e.g., SEGFAULT due to bad memory), it **does not** take down the Web Server. The subprocess dies, Python catches the error, and returns a 500 status code safely. With `ctypes`, a C++ crash kills the entire Python backend.
2.  **Compilation Independence:** We can recompile the C++ binary (`amaan_engine.exe`) without stopping the Python web server (hot-swapping).

### C. Flask Microservice Pattern
**The Function:** `@app.route('/api/evaluate_route', methods=['POST'])`
**Unique Implementation:**
The Flask app is **Stateless**.
*   It does not hold the graph in memory permanently.
*   For every request, it spins up the C++ engine, which builds a **Dynamic Hazard Graph** tailored exactly to that moment in time (incorporating the latest ITP alerts).
*   This ensures that no "stale data" from a previous user's request usually affects the current user.

## 2.3 C++ Engine Compilation Flags
We use specific GCC flags for optimization:
*   `-O3`: Enables aggressive loop vectorization and function inlining.
*   `std=c++17`: Allows us to use modern features like Structured Binding (`auto [u, v] = ...`) which makes code cleaner and safer.
