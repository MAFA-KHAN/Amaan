#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include "graph.h"
#include "dijkstra.h"
#include "kdtree.h"
#include "hazards.h"

using namespace std;

// Global engine components initialized at startup
Graph g;           // The city's spatial graph (Nodes and Edges)
KDTree qt;         // Persistent KD-Tree (not heavily used in this specific entry-point logic)
HazardManager hm;  // Manages real-time threat data

/**
 * initialize_data
 * Hardcodes the initial setup for the city of Islamabad.
 * In a production system, this would load from a SQL database or GeoJSON file.
 */
void initialize_data() {
    /**
     * DSA: Hash Map Insertion
     * We populate the graph with known safety intersections.
     * IDs here must match the ISLAMABAD_NODES in the frontend JavaScript.
     */
    g.add_node(1, 33.7103, 73.0571, "Blue Area");
    g.add_node(2, 33.7297, 73.0746, "F-6 Sector");
    g.add_node(3, 33.6844, 73.0479, "G-9 Sector");
    g.add_node(4, 33.7149, 73.0235, "E-9 Air University");
    g.add_node(5, 33.7077, 73.0501, "Centaurus Mall");
    g.add_node(6, 33.6934, 73.0102, "F-10 Markaz");
    g.add_node(7, 33.6844, 73.0751, "Shakar Parian");
    g.add_node(8, 33.6685, 73.0751, "I-8 Sector");

    /**
     * DSA: Adjacency List Connectivity
     * Defining the road network of the city.
     * Initial edges are added with 0 hazard; penalties are updated dynamically per request.
     */
    g.add_edge(1, 2, 2.5); // Blue Area to F-6 (2.5km)
    g.add_edge(1, 5, 1.2); // Blue Area to Centaurus (1.2km)
    g.add_edge(5, 3, 3.0); // Centaurus to G-9
    g.add_edge(3, 6, 2.8); // G-9 to F-10
    g.add_edge(4, 6, 3.5); // E-9 to F-10
    g.add_edge(1, 7, 4.0); // Blue Area to Shakar Parian
    g.add_edge(7, 8, 2.5); // Shakar Parian to I-8
    g.add_edge(8, 3, 3.5); // I-8 to G-9
}

/**
 * handle_route
 * Responds to the "route" command from Flask.
 * Logic:
 * 1. Parses hazard string.
 * 2. Injects penalties into a temporary graph.
 * 3. Runs Dijkstra.
 * 4. Outputs JSON result.
 */
void handle_route(int start_id, int end_id, const string& hazards_str) {
    // 1. Parse and Inject dynamic hazards into HazardManager
    // Input format: id|lat|lon|sev|type;id|lat|lon|sev|type
    stringstream ss(hazards_str);
    string segment;
    while (getline(ss, segment, ';')) {
        stringstream s_seg(segment);
        string id_s, lat_s, lon_s, sev_s, type;
        getline(s_seg, id_s, '|');
        getline(s_seg, lat_s, '|');
        getline(s_seg, lon_s, '|');
        getline(s_seg, sev_s, '|');
        getline(s_seg, type, '|');

        if (!id_s.empty() && !lat_s.empty() && !lon_s.empty()) {
            // Adds the hazard to the central registry for penalty evaluation
            hm.add_hazard({stoi(id_s), stod(lat_s), stod(lon_s), stoi(sev_s), type});
        }
    }

    /** 
     * 2. Edge-Weight Re-Optimization
     * Instead of modifying the global permanent graph, we create a 'Spatial Graph'
     * specifically for this request, incorporating current hazard penalties.
     */
    Graph spatial_graph;
    
    // Copy nodes over to the new graph structure
    for (int id : g.get_all_node_ids()) {
        const Node& n = g.get_node(id);
        spatial_graph.add_node(n.id, n.latitude, n.longitude, n.name);
    }
    
    /**
     * Lambda: add_weighted_edge
     * Calculates the real-world penalty for a road based on its proximity to hazards.
     */
    auto add_weighted_edge = [&](int u, int v, double dist) {
        const Node& n_u = g.get_node(u);
        const Node& n_v = g.get_node(v);
        
        // Calculate the safety penalty at both ends of the road segment
        double p1 = hm.get_penalty_for_location(n_u.latitude, n_u.longitude);
        double p2 = hm.get_penalty_for_location(n_v.latitude, n_v.longitude);
        
        // Use the average penalty of the two nodes as the road's cost impact
        double avg_penalty = (p1 + p2) / 2.0;
        
        // Add the edge to the spatial graph with the calculated penalty multiplied for impact
        spatial_graph.add_edge(u, v, dist, avg_penalty * 2.0); 
    };

    // Re-establishing the road network with hazard-aware weights
    add_weighted_edge(1, 2, 2.5);
    add_weighted_edge(1, 5, 1.2);
    add_weighted_edge(5, 3, 3.0);
    add_weighted_edge(3, 6, 2.8);
    add_weighted_edge(4, 6, 3.5);
    add_weighted_edge(1, 7, 4.0);
    add_weighted_edge(7, 8, 2.5);
    add_weighted_edge(8, 3, 3.5);

    // 3. DSA: Execute Dijkstra Pathfinding
    PathResult result = Dijkstra::find_safest_path(spatial_graph, start_id, end_id);

    // 4. JSON Serialization for Flask Bridge
    if (result.success) {
        cout << "{\"status\": \"success\", \"engine\": \"C++ Dijkstra\", \"data\": {";
        cout << "\"safety_score\": " << result.safety_score;
        cout << ", \"distance\": " << result.total_distance;
        cout << ", \"path\": [";
        for (size_t i = 0; i < result.path.size(); ++i) {
            cout << result.path[i] << (i == result.path.size() - 1 ? "" : ", ");
        }
        cout << "]}}" << endl;
    } else {
        cout << "{\"status\": \"error\", \"message\": \"No path found between nodes\"}" << endl;
    }
}

/**
 * handle_dynamic_nearest
 * Demonstration of Global KD-Tree Search.
 * This function builds a decision tree on the fly from a list of candidates.
 */
void handle_dynamic_nearest(double user_lat, double user_lon, const string& candidates_str) {
    KDTree dynamic_tree; // Temporary KD-Tree for this specific search
    stringstream ss(candidates_str);
    string segment;
    
    // Format: name|lat|lon;name|lat|lon
    while (getline(ss, segment, ';')) {
        stringstream s_seg(segment);
        string name, lat_s, lon_s;
        getline(s_seg, name, '|');
        getline(s_seg, lat_s, '|');
        getline(s_seg, lon_s, '|');
        
        if (!name.empty() && !lat_s.empty() && !lon_s.empty()) {
            // DSA: O(log N) insertion into KD-Tree
            dynamic_tree.insert({0, name, "Dynamic", stod(lat_s), stod(lon_s)});
        }
    }
    
    // DSA: O(log N) Nearest Neighbor search
    Facility f = dynamic_tree.find_nearest(user_lat, user_lon);
    
    // Output JSON back to Flask
    cout << "{\"status\": \"success\", \"engine\": \"C++ KD-Tree\", \"data\": {";
    cout << "\"name\": \"" << f.name << "\", \"type\": \"Nearest Identified by C++\"";
    cout << ", \"lat\": " << f.latitude << ", \"lon\": " << f.longitude;
    cout << "}}" << endl;
}

/**
 * MAIN ENTRY POINT
 * The Python backend calls this executable with command-line arguments.
 */
int main(int argc, char* argv[]) {
    // 1. Initialize the static city map
    initialize_data();

    // 2. Argument validation
    if (argc < 2) {
        cout << "{\"status\": \"error\", \"message\": \"No command provided\"}" << endl;
        return 1;
    }

    // 3. Command Routing
    string cmd = argv[1];
    
    if (cmd == "dynamic_nearest" && argc == 5) {
        // Find nearest facility using KD-Tree
        handle_dynamic_nearest(stod(argv[2]), stod(argv[3]), argv[4]);
    } else if (cmd == "route" && argc == 5) {
        // Command signature: amaan_engine route <start_id> <end_id> <hazards_str>
        handle_route(stoi(argv[2]), stoi(argv[3]), argv[4]);
    } else {
        // Error handling for invalid CLI calls
        cout << "{\"status\": \"error\", \"message\": \"Invalid command or arguments. Provided: " << cmd << " with " << argc << " args.\"}" << endl;
    }

    return 0; // Success
}
