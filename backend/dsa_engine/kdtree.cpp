#include "kdtree.h"
#include <cmath>
#include <algorithm>

/**
 * calculate_distance
 * Calculates the Euclidean distance squared between two points in 2D space.
 * We use the squared distance (x² + y²) instead of the actual distance (sqrt(x² + y²))
 * to avoid expensive square root calculations, as relative comparison remains the same.
 */
double KDTree::calculate_distance(double lat1, double lon1, double lat2, double lon2) {
    // Standard Euclidean distance formula: Δx² + Δy²
    return std::pow(lat1 - lat2, 2) + std::pow(lon1 - lon2, 2);
}

/**
 * insert_recursive
 * A recursive function that inserts a Facility into the KD-Tree.
 * The tree alternates the splitting axis at each level of depth:
 * Even depth: Split by Latitude (X-axis)
 * Odd depth: Split by Longitude (Y-axis)
 */
std::unique_ptr<KDNode> KDTree::insert_recursive(std::unique_ptr<KDNode> node, Facility f, int depth) {
    // Base Case: If we reach a null pointer, create a new leaf node here
    if (!node) {
        return std::make_unique<KDNode>(f);
    }

    // Determine current splitting axis: 0 for Latitude, 1 for Longitude
    int axis = depth % 2; 
    
    if (axis == 0) {
        // Splitting by Latitude
        if (f.latitude < node->facility.latitude)
            // Recurse into the left child if the new point is 'less' than the current node
            node->left = insert_recursive(std::move(node->left), f, depth + 1);
        else
            // Recurse into the right child if it's 'greater' or equal
            node->right = insert_recursive(std::move(node->right), f, depth + 1);
    } else {
        // Splitting by Longitude
        if (f.longitude < node->facility.longitude)
            // Recurse into the left child for lesser longitude
            node->left = insert_recursive(std::move(node->left), f, depth + 1);
        else
            // Recurse into the right child for greater longitude
            node->right = insert_recursive(std::move(node->right), f, depth + 1);
    }

    // Return the (potentially modified) node pointer to rebuild the tree structure
    return node;
}

// Public entry point for insertion
void KDTree::insert(Facility f) {
    root = insert_recursive(std::move(root), f, 0);
}

/**
 * find_nearest_recursive
 * The heart of the KD-Tree: explores the spatial tree to find the point with the 
 * smallest distance to the target query (lat, lon).
 */
void KDTree::find_nearest_recursive(KDNode* node, double lat, double lon, int depth, Facility& best, double& best_dist) {
    // Termination: If we exceed leaf nodes, just return
    if (!node) return;

    // 1. Evaluate current node as a candidate for the 'best' (nearest)
    double d = calculate_distance(lat, lon, node->facility.latitude, node->facility.longitude);
    if (d < best_dist) {
        best_dist = d;      // Update minimum distance found so far
        best = node->facility; // Keep track of the facility details
    }

    // 2. Decide which subtree (left/right) is most likely to contain the nearest neighbor
    int axis = depth % 2;
    KDNode* next = (axis == 0) ? (lat < node->facility.latitude ? node->left.get() : node->right.get()) 
                               : (lon < node->facility.longitude ? node->left.get() : node->right.get());
    
    // Store the other branch as a secondary option for potential backtracking
    KDNode* other = (next == node->left.get()) ? node->right.get() : node->left.get();

    // 3. Recurse down the 'ideal' branch first
    find_nearest_recursive(next, lat, lon, depth + 1, best, best_dist);

    // 4. Pruning Logic: Check if it's even POSSIBLE for a closer point to exist in the other branch.
    // We calculate the distance from the query point to the hyper-plane (the line) splitting this node.
    double axis_dist = (axis == 0) ? std::pow(lat - node->facility.latitude, 2) 
                                   : std::pow(lon - node->facility.longitude, 2);
    
    // If the distance to the splitting line is LESS than our current best distance, 
    // there might be a closer point on the other side of the line.
    if (axis_dist < best_dist) {
        find_nearest_recursive(other, lat, lon, depth + 1, best, best_dist);
    }
}

// Public entry point for nearest-neighbor search
Facility KDTree::find_nearest(double lat, double lon) {
    Facility best = {-1, "None", "None", 0, 0};
    double best_dist = 1e18; // Start with 'infinity' to ensure the first node is accepted
    
    // Search starting from the root at depth 0
    find_nearest_recursive(root.get(), lat, lon, 0, best, best_dist);
    return best;
}
