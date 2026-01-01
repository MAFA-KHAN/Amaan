#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include "graph.h"
#include "dijkstra.h"
#include "kdtree.h"
#include "hazards.h"

using namespace std;

// Global engine components
Graph g;
KDTree qt;
HazardManager hm;

/**
 * initialize_data
 * What: Loads mockup Islamabad data for the project demonstration
 */
void initialize_data() {
    // 1. Add Nodes (Islamabad Landmarks)
    g.add_node(1, 33.7103, 73.0601, "Blue Area");
    g.add_node(2, 33.7299, 73.0747, "F-6 Sector");
    g.add_node(3, 33.6923, 73.0238, "G-9 Sector");
    g.add_node(4, 33.7144, 73.0234, "E-9 (Air University)");
    g.add_node(5, 33.7077, 73.0501, "Centaurus Mall");

    // 2. Add Edges (Road connections with safety stats)
    // format: u, v, distance, hazard_penalty, safety_bonus
    g.add_edge(1, 2, 2.5, 0.5, 0.2); // Blue Area to F-6
    g.add_edge(1, 5, 1.2, 0.1, 0.5); // Blue Area to Centaurus
    g.add_edge(5, 3, 3.0, 1.5, 0.0); // Centaurus to G-9 (Higher hazard)
    g.add_edge(1, 3, 5.0, 0.2, 1.0); // Blue Area to G-9 (Longer but safer)
    g.add_edge(3, 4, 2.8, 0.3, 0.1); // G-9 to E-9
    g.add_edge(5, 4, 3.5, 0.0, 0.8); // Centaurus to E-9

    // 3. Add Facilities (Hospitals, Police, etc.)
    qt.insert({101, "PIMS Hospital", "Emergency", 33.7051, 73.0451});
    qt.insert({102, "Margalla Police Station", "Security", 33.7199, 73.0647});
    qt.insert({103, "G-9 Markaz Fire Station", "Fire", 33.6823, 73.0238});

    // 4. Add Hazards (Real-time alerts)
    hm.add_hazard({501, 33.7000, 73.0400, 8, "Traffic Jam - Blue Area Plaza"});
    hm.add_hazard({502, 33.7200, 73.0700, 5, "Road Construction - F-7 Link"});
}

/**
 * print_route_json
 * What: Formats output for Flask
 */
void handle_route(int start, int end) {
    PathResult res = Dijkstra::find_safest_path(g, start, end);
    if (!res.success) {
        cout << "{\"status\": \"error\", \"message\": \"No path found\"}" << endl;
        return;
    }

    cout << "{\"status\": \"success\", \"data\": {";
    cout << "\"path\": [";
    for (size_t i = 0; i < res.path.size(); ++i) {
        cout << res.path[i] << (i == res.path.size() - 1 ? "" : ",");
    }
    cout << "], \"distance\": " << res.total_distance;
    cout << ", \"safety_score\": " << res.safety_score;
    cout << "}}" << endl;
}

/**
 * handle_nearest
 */
void handle_nearest(double lat, double lon) {
    Facility f = qt.find_nearest(lat, lon);
    cout << "{\"status\": \"success\", \"data\": {";
    cout << "\"id\": " << f.id << ", \"name\": \"" << f.name << "\", \"type\": \"" << f.type << "\"";
    cout << ", \"lat\": " << f.latitude << ", \"lon\": " << f.longitude;
    cout << "}}" << endl;
}

int main(int argc, char* argv[]) {
    initialize_data();

    if (argc < 2) {
        cout << "{\"status\": \"error\", \"message\": \"No command provided\"}" << endl;
        return 1;
    }

    string cmd = argv[1];
    if (cmd == "route" && argc == 4) {
        handle_route(stoi(argv[2]), stoi(argv[3]));
    } else if (cmd == "nearest" && argc == 4) {
        handle_nearest(stod(argv[2]), stod(argv[3]));
    } else {
        cout << "{\"status\": \"error\", \"message\": \"Invalid command or arguments\"}" << endl;
    }

    return 0;
}
