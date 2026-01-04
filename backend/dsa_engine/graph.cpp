#include "graph.h"
#include <stdexcept>

/**
 * Edge::get_weight
 * This is the 'Cost Function' for our Dijkstra algorithm.
 * It determines how 'expensive' it is to travel a road.
 * Calculation: Distance (km) + Danger Penalty - Safety Bonus
 * Rationale: Allows the engine to prefer a slightly longer but safer route.
 */
double Edge::get_weight() const {
    // AMAAN Formula: We integrate safety variables directly into the pathfinding cost.
    return distance + hazard_penalty - safety_bonus;
}

/**
 * Graph::add_node
 * Adds a new geographic location (Node) to our internal city map.
 * We use a std::map for storage to achieve O(log N) lookup time when
 * we need to retrieve node details later.
 */
void Graph::add_node(int id, double lat, double lon, std::string name) {
    // nodes is a std::map<int, Node>
    nodes[id] = {id, lat, lon, name};
}

/**
 * Graph::add_edge
 * Creates a physical connection (Road) between two nodes.
 * We implement this using an Adjacency List.
 */
void Graph::add_edge(int u, int v, double dist, double hazard, double safety) {
    // 1. Add connection from Node U to Node V
    adjacency_list[u].push_back({v, dist, hazard, safety});
    
    // 2. Add connection from Node V to Node U (assuming two-way traffic for Islamabad)
    adjacency_list[v].push_back({u, dist, hazard, safety});
}

/**
 * Graph::get_neighbors
 * Returns a list of all roads connected to the specified node.
 * This is heavily used by the Dijkstra algorithm during the 'relaxation' phase.
 */
const std::vector<Edge>& Graph::get_neighbors(int node_id) const {
    // Check if the node has any outgoing connections at all
    if (adjacency_list.find(node_id) == adjacency_list.end()) {
        // Return an empty vector if no connections exist
        static std::vector<Edge> empty;
        return empty;
    }
    // Return the reference to the neighbor vector for efficiency (no copying)
    return adjacency_list.at(node_id);
}

/**
 * Graph::get_node
 * Fetches the metadata (lat, lon, name) for a specific ID.
 */
const Node& Graph::get_node(int node_id) const {
    // Boundary Check: If node doesn't exist, throw an exception
    if (nodes.find(node_id) == nodes.end()) {
        throw std::runtime_error("Critical Error: Node " + std::to_string(node_id) + " not found in C++ Graph model.");
    }
    return nodes.at(node_id);
}

/**
 * Graph::has_node
 * Simple boolean check for node existence.
 */
bool Graph::has_node(int node_id) const {
    return nodes.find(node_id) != nodes.end();
}

/**
 * Graph::get_all_node_ids
 * Aggregates and returns a vector of every Node ID in the system.
 */
std::vector<int> Graph::get_all_node_ids() const {
    std::vector<int> ids;
    // Iterate through the map and collect the keys (IDs)
    for (auto const& [id, node] : nodes) {
        ids.push_back(id);
    }
    return ids;
}
