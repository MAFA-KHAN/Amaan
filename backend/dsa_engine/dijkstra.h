#ifndef DIJKSTRA_H
#define DIJKSTRA_H

#include "graph.h"
#include <vector>
#include <queue>
#include <map>

/**
 * Path Result
 * Contains the final optimized route and metadata
 */
struct PathResult {
    std::vector<int> path;
    double total_distance;
    double safety_score; // Higher is better
    bool success;
};

/**
 * Dijkstra Class
 * What: Calculates the shortest PATH given optimized weights
 * DSA: Priority Queue based Dijkstra (O(E log V))
 */
class Dijkstra {
public:
    static PathResult find_safest_path(const Graph& graph, int start_node, int end_node);
};

#endif // DIJKSTRA_H
