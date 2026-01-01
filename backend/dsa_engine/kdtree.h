#ifndef KDTREE_H
#define KDTREE_H

#include <vector>
#include <string>
#include <memory>

/**
 * Facility structure
 * Represents points of interest (Emergencies, Schools, etc.)
 */
struct Facility {
    int id;
    std::string name;
    std::string type;
    double latitude;
    double longitude;
};

/**
 * KD-Node
 * Represents a node in the KD-Tree space partitioning structure
 */
struct KDNode {
    Facility facility;
    std::unique_ptr<KDNode> left;
    std::unique_ptr<KDNode> right;

    KDNode(Facility f) : facility(f), left(nullptr), right(nullptr) {}
};

/**
 * KD-Tree Class
 * What: Used for efficient location-based searching
 * DSA: K-Dimensional Tree (K=2 for Lat/Lon)
 * Efficiency: O(log N) for nearest neighbors vs O(N) brute force
 */
class KDTree {
private:
    std::unique_ptr<KDNode> root;

    std::unique_ptr<KDNode> insert_recursive(std::unique_ptr<KDNode> node, Facility f, int depth);
    void find_nearest_recursive(KDNode* node, double lat, double lon, int depth, Facility& best, double& best_dist);
    double calculate_distance(double lat1, double lon1, double lat2, double lon2);

public:
    KDTree() : root(nullptr) {}
    void insert(Facility f);
    Facility find_nearest(double lat, double lon);
};

#endif // KDTREE_H
