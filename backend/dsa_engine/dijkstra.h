#ifndef DIJKSTRA_H
#define DIJKSTRA_H

#include "graph.h"
#include <vector>
#include <queue>
#include <map>

/**
 * PathResult
 * A structure to store the outcome of a route search.
 * It encapsulates the final path, total distance, and calculated safety.
 */
struct PathResult {
    std::vector<int> path;       // Sequence of Node IDs representing the route
    double total_distance;      // Cumulative length of the route in kilometers
    double safety_score;        // Normalized score (0-100) based on hazard proximity
    bool success;               // True if a path was found, false otherwise
};

/**
 * Dijkstra Class
 * Implements Dijkstra's Shortest Path Algorithm with a focus on safety.
 * This class provides static methods to compute the optimal path through the graph.
 * Time Complexity: O(E log V) using a Priority Queue (Min-Heap).
 */
class Dijkstra {
public:
    // Core function to find the safest path between two nodes in a given graph.
    static PathResult find_safest_path(const Graph& graph, int start_node, int end_node);
};

#endif // DIJKSTRA_H
