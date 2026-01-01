#include "graph.h"
#include <stdexcept>

/**
 * get_weight function implementation
 * Why: This exists to provide a single point of truth for route evaluation.
 * DSA: Simple mathematical optimization.
 */
double Edge::get_weight() const {
    // AMAAN Formula: Safest route isn't always shortest
    return distance + hazard_penalty - safety_bonus;
}

/**
 * add_node function
 * What: Adds a new geographic point to the graph
 * DSA: Map storage for O(log N) lookup
 */
void Graph::add_node(int id, double lat, double lon, std::string name) {
    nodes[id] = {id, lat, lon, name};
}

/**
 * add_edge function
 * What: Connects two nodes with weights
 * DSA: Adjacency List (Common Graph representation)
 */
void Graph::add_edge(int u, int v, double dist, double hazard, double safety) {
    adjacency_list[u].push_back({v, dist, hazard, safety});
    // Assuming bi-directional roads for Islamabad base logic
    adjacency_list[v].push_back({u, dist, hazard, safety});
}

/**
 * get_neighbors function
 * What: Returns all connections for a node
 * DSA: Fast access via adjacency list
 */
const std::vector<Edge>& Graph::get_neighbors(int node_id) const {
    if (adjacency_list.find(node_id) == adjacency_list.end()) {
        static std::vector<Edge> empty;
        return empty;
    }
    return adjacency_list.at(node_id);
}

/**
 * get_node function
 * What: Retrieves node details
 */
const Node& Graph::get_node(int node_id) const {
    if (nodes.find(node_id) == nodes.end()) {
        throw std::runtime_error("Node not found");
    }
    return nodes.at(node_id);
}

bool Graph::has_node(int node_id) const {
    return nodes.find(node_id) != nodes.end();
}

std::vector<int> Graph::get_all_node_ids() const {
    std::vector<int> ids;
    for (auto const& [id, node] : nodes) {
        ids.push_back(id);
    }
    return ids;
}
