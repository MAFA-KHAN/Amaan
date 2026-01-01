#ifndef GRAPH_H
#define GRAPH_H

#include <vector>
#include <string>
#include <map>

/**
 * Node structure for the Graph
 * Represents a logical point in Islamabad (viva-friendly naming)
 */
struct Node {
    int id;
    double latitude;
    double longitude;
    std::string name;
};

/**
 * Edge structure for the Graph
 * Represents a connection between two nodes with weight optimization
 */
struct Edge {
    int destination_id;
    double distance;
    double hazard_penalty;
    double safety_bonus;
    
    // final_weight = distance + hazard_penalty - safety_bonus
    double get_weight() const;
};

/**
 * Graph Class
 * Uses Adjacency List (DSA Concept) to manage road relationships
 */
class Graph {
private:
    std::map<int, std::vector<Edge>> adjacency_list;
    std::map<int, Node> nodes;

public:
    void add_node(int id, double lat, double lon, std::string name = "");
    void add_edge(int u, int v, double dist, double hazard = 0.0, double safety = 0.0);
    
    const std::vector<Edge>& get_neighbors(int node_id) const;
    const Node& get_node(int node_id) const;
    bool has_node(int node_id) const;
    
    std::vector<int> get_all_node_ids() const;
};

#endif // GRAPH_H
