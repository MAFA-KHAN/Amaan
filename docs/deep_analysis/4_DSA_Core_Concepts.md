# 4. DSA Core Concepts: "Tiny" vs. "Bigfoot"

We categorize our Data Structures into **Components (Tiny)** and **Engines (Bigfoot)**.

---

## 4.1 "Tiny Concepts" (The Building Blocks)

### A. `std::vector` (Dynamic Arrays)
*   **Usage:** Used to store the Adjacency List (neighbors of a road) and the list of Hazards.
*   **Why?**
    *   **Cache Locality:** Vectors store data contiguously in RAM. When the CPU fetches one neighbor, it pre-fetches the next few automatically into the L1 Cache. This makes iteration (`for` loops) extremely fast compared to Linked Lists.
    *   **Performance:** Random access is O(1).

### B. `std::map` (Red-Black Tree)
*   **Usage:** Used to store the `Graph::nodes` (ID -> Node Data).
*   **Why?**
    *   We need to look up intersections by their ID (e.g., "Node 5").
    *   `std::map` keeps keys sorted and allows search in **O(log N)** time.
    *   It handles "sparse" data better than a massive array if IDs are non-sequential (e.g., Node 1, Node 500, Node 999).

### C. `struct` (Data Encapsulation)
*   **Usage:** `struct Node`, `struct Edge`, `struct Hazard`.
*   **Why?**
    *   Unlike Classes, Structs in our usage are "Plain Old Data" (POD). They have public members and no hidden overhead.
    *   They group related data (Lat/Lon/ID) so they can be passed to functions as a single unit.

---

## 4.2 "Bigfoot Concepts" (The Heavy Lifters)

### D. Dijkstra’s Algorithm (With Priority Queue)
*   **The Problem:** Finding the path from A to B.
*   **The Naive Solution:** Breadth-First Search (BFS). BFS treats all roads as equal length.
*   **The AMAAN Solution:** Dijkstra allows "Weights".
    *   **The "Weight":** $W = Distance + (HazardPenalty \times Multiplier)$.
    *   **The Optimizer:** We use `std::priority_queue` (Min-Heap).
    *   **Why?** The Min-Heap ensures we *always* expand the current shortest/safest path first. We never waste time processing a "bad" route.
    *   **Complexity:** $O(E \log V)$ where E is edges (roads) and V is vertices (intersections).

### E. KD-Tree (k-Dimensional Tree)
*   **The Problem:** "Find the nearest hospital."
*   **The Naive Solution:** A `for` loop checking every hospital in the city. ($O(N)$). Using this on a national scale (100,000 locations) lags the server.
*   **The AMAAN Solution:** Spatial Partitioning.
    *   **How:** The tree splits the world into "Left/Right" (Latitude) and "Top/Bottom" (Longitude) recursively.
    *   **Pruning:** If we are looking for a hospital in Sector F-6, the algorithm can mathematically prove that it *doesn't* need to look at any hospitals in Rawalpindi. It "prunes" (cuts off) that entire branch of the tree.
    *   **Complexity:** $O(\log N)$. For 1,000,000 items, it only takes ~20 comparisons.
