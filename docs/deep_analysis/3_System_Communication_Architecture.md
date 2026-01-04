# 3. System Communication Architecture

## 3.1 The Three-Tier Architecture
Our system follows a classic Multi-Tier Architecture, optimized for local simulation.

`[Frontend (Client)]`  <-->  `[Middleware (Flask)]`  <-->  `[Backend Logic (C++)]`

## 3.2 Data Flow Pipeline (Step-by-Step)

### Step 1: The Request (JSON Payload)
When a user clicks "Find Route", the frontend constructs a **JSON Object**. We use JSON because it is the universal language of the web.
```json
{
  "start_lat": 33.6844,
  "start_lon": 73.0479,
  "end_lat": 33.7103,
  "end_lon": 73.0571,
  "hazards_active": true
}
```

### Step 2: The Transmission (REST API)
*   **Protocol:** HTTP/1.1
*   **Method:** `POST` (We use POST instead of GET because the payload might be large if we include complex hazard arrays).
*   **Endpoint:** `/api/evaluate_route`
*   **Behavior:** The call is **Asynchronous** (`async/await` in JS). The UI does not freeze; a loading spinner activates while waiting for the response.

### Step 3: The Data Transformation (Python)
Flask receives the JSON. It does not pass JSON to C++.
*   **Why?** Parsing JSON in C++ is tedious and requires heavy libraries (like `nlohmann/json`).
*   **Solution:** Python converts the complex JSON object into **Simple Command Line Arguments** (Strings and Integers).
    *   *Input:* `{"start": 1, "end": 2}`
    *   *Output:* `amaan_engine.exe route 1 2`

### Step 4: The Execution (Subprocess)
*   Python spawns a new process space.
*   **STDIN (Standard Input):** Not used in this iteration (all data via arguments).
*   **STDOUT (Standard Output):** The C++ engine prints the result directly to the console.
    *   *C++ Output:* `{"safety_score": 85, "distance": 4.2}`
*   Python captures this STDOUT string.

### Step 5: The Response (Render)
Python wraps the C++ output back into a standard HTTP Response (200 OK) and sends it to the browser.
*   The frontend parses the JSON.
*   If `status === "success"`, the route is drawn in Blue/Green/Red based on the safety score.

## 3.3 Why this Architecture?
1.  **Loose Coupling:** The Frontend doesn't know C++ exists. The C++ engine doesn't know the web exists. You can replace the frontend with a Mobile App, and the backend wouldn't care.
2.  **Security:** The C++ engine runs in a restricted user space. It cannot access browser cookies or session data directly.
