#ifndef KDTREE_H
#define KDTREE_H

#include <vector>
#include <string>
#include <memory>

/**
 * Facility structure
 * This struct represents a point of interest (POI) in our spatial database.
 * Each facility has attributes that help identify it and its location.
 */
struct Facility {
    int id;               // Unique primary key for the facility
    std::string name;     // Human-readable name (e.g., "PIMS Hospital")
    std::string type;     // Category of facility (e.g., "Emergency", "Security")
    double latitude;      // WGS84 Latitude coordinate
    double longitude;     // WGS84 Longitude coordinate
};

/**
 * KD-Node
 * A fundamental building block of the KD-Tree (K-Dimensional Tree).
 * It stores a Facility and owns its child nodes using smart pointers.
 */
struct KDNode {
    Facility facility;              // The spatial data stored at this node
    std::unique_ptr<KDNode> left;   // Subtree representing the 'lesser' half-space
    std::unique_ptr<KDNode> right;  // Subtree representing the 'greater' half-space

    // Constructor to initialize a leaf node with facility data
    KDNode(Facility f) : facility(f), left(nullptr), right(nullptr) {}
};

/**
 * KD-Tree Class
 * Purpose: Provides O(log N) average-case complexity for nearest-neighbor searches.
 * This is significantly faster than O(N) linear search as it partitions space.
 * For 2D spatial data (Lat/Lon), this is a 2-D Tree.
 */
class KDTree {
private:
    std::unique_ptr<KDNode> root; // The root of the spatial tree

    // Recursive helper to insert a new facility into the appropriate quadrant
    std::unique_ptr<KDNode> insert_recursive(std::unique_ptr<KDNode> node, Facility f, int depth);
    
    // Recursive search logic for finding the closest node to a query point
    void find_nearest_recursive(KDNode* node, double lat, double lon, int depth, Facility& best, double& best_dist);
    
    // Mathematical helper to calculate Euclidean distance (used as a heuristic)
    double calculate_distance(double lat1, double lon1, double lat2, double lon2);

public:
    // Default constructor: creates an empty tree
    KDTree() : root(nullptr) {}
    
    // Public API to insert a facility into the structure
    void insert(Facility f);
    
    // Public API to find the closest facility to the given coordinates
    Facility find_nearest(double lat, double lon);
};

#endif // KDTREE_H
