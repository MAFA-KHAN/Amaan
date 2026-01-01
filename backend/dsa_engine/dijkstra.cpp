#include "dijkstra.h"
#include <set>
#include <algorithm>

/**
 * find_safest_path
 * What: Uses Dijkstra's algorithm to find the optimal path
 * DSA: Priority Queue (Min-Heap) for O(E log V) complexity
 * Optimization: Weights incorporate hazard penalties and safety bonuses
 */
PathResult Dijkstra::find_safest_path(const Graph& graph, int start_node, int end_node) {
    std::map<int, double> distances;
    std::map<int, int> predecessors;
    
    // Priority Queue stores pair<weight, node_id>
    // Greater comparison makes it a min-heap
    std::priority_queue<std::pair<double, int>, std::vector<std::pair<double, int>>, std::greater<std::pair<double, int>>> pq;

    for (int id : graph.get_all_node_ids()) {
        distances[id] = 1e18; // Infinity
    }

    if (!graph.has_node(start_node)) return {{}, 0, 0, false};

    distances[start_node] = 0;
    pq.push({0, start_node});

    while (!pq.empty()) {
        double current_dist = pq.top().first;
        int u = pq.top().second;
        pq.pop();

        if (current_dist > distances[u]) continue;
        if (u == end_node) break;

        for (const auto& edge : graph.get_neighbors(u)) {
            double weight = edge.get_weight();
            if (distances[u] + weight < distances[edge.destination_id]) {
                distances[edge.destination_id] = distances[u] + weight;
                predecessors[edge.destination_id] = u;
                pq.push({distances[edge.destination_id], edge.destination_id});
            }
        }
    }

    // Path Reconstruction
    if (distances[end_node] == 1e18) {
        return {{}, 0, 0, false};
    }

    std::vector<int> path;
    int curr = end_node;
    while (curr != start_node) {
        path.push_back(curr);
        curr = predecessors[curr];
    }
    path.push_back(start_node);
    std::reverse(path.begin(), path.end());

    // Calculate real distance and safety metrics
    double real_dist = 0;
    double hazard_sum = 0;
    for (size_t i = 0; i < path.size() - 1; ++i) {
        for (const auto& edge : graph.get_neighbors(path[i])) {
            if (edge.destination_id == path[i+1]) {
                real_dist += edge.distance;
                hazard_sum += edge.hazard_penalty;
                break;
            }
        }
    }

    // Safety score: 100 - (scaled hazard impact)
    double safety_score = 100.0 - (hazard_sum / (real_dist + 0.1) * 10.0);
    if (safety_score < 0) safety_score = 0;

    return {path, real_dist, safety_score, true};
}
