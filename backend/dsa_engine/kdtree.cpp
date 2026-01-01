#include "kdtree.h"
#include <cmath>
#include <algorithm>

/**
 * calculate_distance
 * Simple Euclidean distance squared for coordinate comparison
 * Why: Efficient for comparing relative proximity in small city scales
 */
double KDTree::calculate_distance(double lat1, double lon1, double lat2, double lon2) {
    return std::pow(lat1 - lat2, 2) + std::pow(lon1 - lon2, 2);
}

/**
 * insert_recursive
 * DSA: Recursive insertion partitioning space by X (Lat) and Y (Lon) alternatively
 */
std::unique_ptr<KDNode> KDTree::insert_recursive(std::unique_ptr<KDNode> node, Facility f, int depth) {
    if (!node) {
        return std::make_unique<KDNode>(f);
    }

    int axis = depth % 2; // 0 for Lat, 1 for Lon
    
    if (axis == 0) {
        if (f.latitude < node->facility.latitude)
            node->left = insert_recursive(std::move(node->left), f, depth + 1);
        else
            node->right = insert_recursive(std::move(node->right), f, depth + 1);
    } else {
        if (f.longitude < node->facility.longitude)
            node->left = insert_recursive(std::move(node->left), f, depth + 1);
        else
            node->right = insert_recursive(std::move(node->right), f, depth + 1);
    }

    return node;
}

void KDTree::insert(Facility f) {
    root = insert_recursive(std::move(root), f, 0);
}

/**
 * find_nearest_recursive
 * DSA: Efficiently prunes branches of the tree that cannot possibly contain a closer point
 */
void KDTree::find_nearest_recursive(KDNode* node, double lat, double lon, int depth, Facility& best, double& best_dist) {
    if (!node) return;

    double d = calculate_distance(lat, lon, node->facility.latitude, node->facility.longitude);
    if (d < best_dist) {
        best_dist = d;
        best = node->facility;
    }

    int axis = depth % 2;
    KDNode* next = (axis == 0) ? (lat < node->facility.latitude ? node->left.get() : node->right.get()) 
                               : (lon < node->facility.longitude ? node->left.get() : node->right.get());
    KDNode* other = (next == node->left.get()) ? node->right.get() : node->left.get();

    find_nearest_recursive(next, lat, lon, depth + 1, best, best_dist);

    // Pruning: Check if we need to search the other side of the plane
    double axis_dist = (axis == 0) ? std::pow(lat - node->facility.latitude, 2) 
                                   : std::pow(lon - node->facility.longitude, 2);
    
    if (axis_dist < best_dist) {
        find_nearest_recursive(other, lat, lon, depth + 1, best, best_dist);
    }
}

Facility KDTree::find_nearest(double lat, double lon) {
    Facility best = {-1, "None", "None", 0, 0};
    double best_dist = 1e18; // Infinity
    find_nearest_recursive(root.get(), lat, lon, 0, best, best_dist);
    return best;
}
