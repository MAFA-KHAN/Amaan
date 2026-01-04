#include "dijkstra.h"
#include <set>
#include <algorithm>

/**
 * find_safest_path
 * Core algorithm to find the optimal path through the city graph.
 * This implementation uses the standard Dijkstra's algorithm but with weights
 * that are pre-optimized to include hazard penalties.
 */
PathResult Dijkstra::find_safest_path(const Graph& graph, int start_node, int end_node) {
    // Stores the minimum weight found to reach each node (ID -> Weight)
    std::map<int, double> distances;
    // Stores the predecessor of each node for path reconstruction (ID -> ID)
    std::map<int, int> predecessors;
    
    // Priority Queue to always expand the node with the smallest cumulative weight next.
    // Format: pair<cumulative_weight, node_id>
    // We use std::greater to turn the default max-heap into a min-heap.
    std::priority_queue<std::pair<double, int>, std::vector<std::pair<double, int>>, std::greater<std::pair<double, int>>> pq;

    // Initialization: Set all distances to 'infinity'
    for (int id : graph.get_all_node_ids()) {
        distances[id] = 1e18; 
    }

    // Safety check: ensure the starting location exists in the graph
    if (!graph.has_node(start_node)) return {{}, 0, 0, false};

    // The distance to the start node is always zero
    distances[start_node] = 0;
    pq.push({0, start_node});

    // Main Dijkstra Loop
    while (!pq.empty()) {
        double current_dist = pq.top().first; // Cumulative weight of current path
        int u = pq.top().second;            // ID of the node we are visiting
        pq.pop();

        // Optimization: If we found a shorter path to 'u' already, skip this entry
        if (current_dist > distances[u]) continue;
        
        // Target optimization: If we reached the destination, we can stop early
        if (u == end_node) break;

        // Explore all roads (edges) leading away from current node 'u'
        for (const auto& edge : graph.get_neighbors(u)) {
            // The edge weight here includes both the physical distance AND hazard penalty
            double weight = edge.get_weight();
            
            // Relaxation Step: If moving through 'u' to 'edge.destination_id' is shorter
            // than any path we've seen before, update it.
            if (distances[u] + weight < distances[edge.destination_id]) {
                distances[edge.destination_id] = distances[u] + weight;
                predecessors[edge.destination_id] = u; // Record how we got here
                pq.push({distances[edge.destination_id], edge.destination_id});
            }
        }
    }

    // Path Reconstruction logic: Trace back from destination to start using predecessors
    if (distances[end_node] == 1e18) {
        // If the distance is still 'infinity', no path exists
        return {{}, 0, 0, false};
    }

    std::vector<int> path;
    int curr = end_node;
    // Follow the breadcrumbs back to the start
    while (curr != start_node) {
        path.push_back(curr);
        curr = predecessors[curr];
    }
    path.push_back(start_node); // Add the starting node
    
    // The path was built backwards, so reverse it for the final result
    std::reverse(path.begin(), path.end());

    // Final Metric Calculation: Calculate the real physical distance and hazard impact
    double real_dist = 0;
    double hazard_sum = 0;
    for (size_t i = 0; i < path.size() - 1; ++i) {
        for (const auto& edge : graph.get_neighbors(path[i])) {
            if (edge.destination_id == path[i+1]) {
                real_dist += edge.distance;       // Accumulated real distance (km)
                hazard_sum += edge.hazard_penalty; // Accumulated hazard impact
                break;
            }
        }
    }

    // Safety score logic: 100 is perfect, subtract based on hazard density
    // We scale the hazard sum by distance to reflect "safety per km"
    double safety_score = 100.0 - (hazard_sum / (real_dist + 0.1) * 10.0);
    if (safety_score < 0) safety_score = 0; // Cap floor at zero

    return {path, real_dist, safety_score, true};
}
