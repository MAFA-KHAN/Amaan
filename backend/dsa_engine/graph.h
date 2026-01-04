#ifndef GRAPH_H
#define GRAPH_H

#include <vector>
#include <string>
#include <map>

/**
 * Node Structure
 * Represents a geographical intersection or a significant landmark in the city.
 */
struct Node {
    int id;               // Unique numerical identifier for the node
    double latitude;      // Latitude coordinate (WGS84)
    double longitude;     // Longitude coordinate (WGS84)
    std::string name;     // Name of the intersection or landmark
};

/**
 * Edge Structure
 * Represents a road segment connecting two nodes (Intersections).
 * Our engine optimizes the 'weight' (cost) of these roads dynamically.
 */
struct Edge {
    int destination_id;    // The ID of the node this road leads to
    double distance;       // Physical length of the road in kilometers
    double hazard_penalty; // Artificial cost increase based on danger (e.g., crime or traffic)
    double safety_bonus;   // Artificial cost decrease for well-lit or secured paths
    
    /**
     * get_weight
     * Calculates the 'cost' of traversing this road.
     * We aim for: MIN(Distance + Danger - Safety)
     */
    double get_weight() const;
};

/**
 * Graph Class
 * The spatial backbone of the AMAAN engine.
 * It uses an Adjacency List (std::map -> vector) to store node connections.
 * Rationale: Efficient for sparse graphs like road networks.
 */
class Graph {
private:
    // Adjacency List: Maps a Node ID to a list of outgoing Edges
    std::map<int, std::vector<Edge>> adjacency_list;
    // Node Map: Provides quick O(log N) lookup to find node details by ID
    std::map<int, Node> nodes;

public:
    // Adds a new intersection/landmark to the city graph
    void add_node(int id, double lat, double lon, std::string name = "");
    
    // Connects two nodes with a physical road and optional predefined safety metrics
    void add_edge(int u, int v, double dist, double hazard = 0.0, double safety = 0.0);
    
    // Returns all outward-bound roads from a specific node
    const std::vector<Edge>& get_neighbors(int node_id) const;
    
    // Retrieves details (lat, lon, name) for a given Node ID
    const Node& get_node(int node_id) const;
    
    // Returns true if the node exists in our graph dataset
    bool has_node(int node_id) const;
    
    // Returns a list of all unique Node IDs present in the graph
    std::vector<int> get_all_node_ids() const;
};

#endif // GRAPH_H
