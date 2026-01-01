# DSA Concepts in AMAAN

AMAAN is built on standard Data Structures and Algorithms chosen for efficiency and relevance to navigation safety.

## 1. Dijkstra's Algorithm (Path Optimization)
- **Use Case**: Calculating the "Safest + Shortest" route.
- **Why**: Standard Dijkstra finds the shorest path by distance. We modified the weight function:
  `final_weight = distance + (hazard_penalty * severity) - (safety_bonus)`
- **Complexity**: $O(E \log V)$ using a Priority Queue.

## 2. KD-Tree (Spatial Indexing)
- **Use Case**: Finding the nearest emergency facility (Hospital, Police, Fire).
- **Why**: Traditional $O(N)$ linear scans are too slow for large datasets. KD-Tree partitions Islamabad's geography into 2D space for $O(\log N)$ searches.
- **Complexity**: $O(\log N)$ for nearest neighbor search.

## 3. Adjacency List (Graph Representation)
- **Use Case**: Managing the logical road network of Islamabad.
- **Why**: Most road networks are sparse. Adjacency lists save memory compared to Adjacency Matrices and allow fast neighbor traversal.
- **Complexity**: $O(V + E)$ space.

## 4. Hash Map (Hazard Indexing)
- **Use Case**: Fast lookup for specific hazard types and alert IDs.
- **Complexity**: $O(1)$ average case lookup.

## 5. Priority Queue (Min-Heap)
- **Use Case**: Auxiliary structure for the Dijkstra algorithm to always expand the node with the current lowest "safety cost".
