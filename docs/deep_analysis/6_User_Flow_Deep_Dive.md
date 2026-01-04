# 6. User Flow Deep Dive (The Journey of a Coordinate)

This document traces the exact path of a user's request from the moment they click a button to the moment the map updates.

---

## Phase 1: The Input (Frontend)
1.  **User Action:** User selects "F-6 Sector" (Start) and "Blue Area" (End) from the dropdowns.
2.  **Validation:** `main.js` checks if start/end are identical. If so, it alerts "Start and End cannot be the same."
3.  **Loading State:** The "Find Route" button turns into a spinner. The map dims.

## Phase 2: The Handshake (API Boundary)
4.  **Packet Creation:** `main.js` creates a JSON packet:
    ```js
    { start_node: 2, end_node: 1 } // Using Graph Node IDs
    ```
5.  **Transmission:** The browser sends a `POST` request to `localhost:5000/api/evaluate_route`.

## Phase 3: The Orchestration (Python Middleware)
6.  **Reception:** `app.py` receives the request.
7.  **Hazard Assembly:** Python asks `ITPMockScraper`: "What are the current threats?"
    *   *Result:* "Protest at F-6, Traffic at I-8."
8.  **Command Construction:** Python builds the CLI string:
    `amaan_engine.exe route 2 1 "1004|33.72|73.07|8|Protest"`

## Phase 4: The Computation (C++ Engine)
9.  **Initialization:** `main.cpp` starts up. `graph.cpp` loads the static map (Nodes 1-8).
10. **Hazard Injection:** The engine parses the hazard string and feeds it into `HazardManager`.
11. **Graph Reweighting:**
    *   The engine looks at the road between F-6 and Blue Area.
    *   It asks `HazardManager`: "Is this road safe?"
    *   `HazardManager` replies: "No, a protest is nearby (Severity 8)."
    *   The engine **increases the weight** of that road edge by +800%.
12. **Pathfinding:** `Dijkstra::find_safest_path` runs. It sees the direct road is now "Time Cost = 5000" (due to penalty). It explores the detour via F-7 (Cost = 15).
13. **Verdict:** The engine outputs the safe detour path.

## Phase 5: The Visualization (Frontend)
14. **Response:** Python forwards the JSON back to the browser.
15. **Rendering:**
    *   `main.js` receives the path `[2, 7, 1]` (Taking the detour).
    *   It calls Google Maps API to draw a Blue line connecting these points.
    *   It updates the "Safety Score card" to show "Score: 85% (Protest Avoided)".
