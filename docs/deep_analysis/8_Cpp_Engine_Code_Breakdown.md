# 8. C++ Engine Code Breakdown

This document provides a "Developer's Guide" to the contents of `backend/dsa_engine/`.

---

## A. [main.cpp] - The Orchestrator
**Role:** The entry point. It parses command line arguments and decides which algorithm to run.
*   `initialize_data()`: Hardcodes the map of Islamabad. In a real app, this would query a standard SQL database.
*   `handle_route()`: The "Meat" of the program. It creates a **Temporary Spatial Graph**. Why temporary? Because traffic changes every minute. We copy the static city map, apply current hazard penalties to the edges, and *then* run Dijkstra.
*   `handle_dynamic_nearest()`: Builds a KD-Tree on-the-fly for a list of candidate locations (e.g., "Find nearest open pharmacy").

## B. [dijkstra.cpp] - The Pathfinder
**Role:** The core routing logic.
*   **Key Modification:** Standard Dijkstra minimizes `Distance`. Ours minimizes `Distance + Penalty`.
*   **Priority Queue:** We use `std::priority_queue<pair<double, int>>`. This is the "Magic" that makes it efficient. It ensures we always process the most promising road next.
*   **Path Reconstruction:** Once the destination is reached, we backtrack using a `predecessors` map to generate the list of nodes [1, 2, 5...].

## C. [kdtree.cpp] - The Spatial Searcher
**Role:** Finding the nearest X to Y.
*   `struct KDNode`: A tree node that splits the world. Left child has smaller coordinates, Right child has larger.
*   `insert_recursive`: The logic that builds the tree. It alternates depth: Level 0 splits by Latitude, Level 1 by Longitude, Level 2 by Lat, etc.
*   `find_nearest_recursive`: The search function. It uses **Pruning**: if the current "Best Distance" is smaller than the distance to the splitting line, we don't even look at the other side of the tree.

## D. [graph.cpp] - The World Model
**Role:** Representing the city.
*   `adjacency_list`: `std::map<int, vector<Edge>>`.
    *   An array won't work because Node IDs (e.g., 5001) are sparse. A map maps the ID to the list of roads.
*   `Edge::get_weight()`: This single line of code `return dist + hazard` is what separates AMAAN from a regular map.

## E. [hazards.cpp] - The Threat Database
**Role:** Managing risk.
*   `get_penalty_for_location(lat, lon)`:
    *   Iterates through active hazards.
    *   Calculates `d` = distance to hazard.
    *   If `d < 500m`: Returns a penalty. The closer you are, the higher the penalty.
    *   This creates a "Force Field" around dangers that pushes the Dijkstra path away.
