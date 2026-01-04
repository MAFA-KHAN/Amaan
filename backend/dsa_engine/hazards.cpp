#include "hazards.h"
#include <cmath>

/**
 * add_hazard
 * Adds a new hazard to the manager's registry.
 * DSA Complexity: O(log N) for insertion into a Balanced Binary Search Tree (std::map).
 */
void HazardManager::add_hazard(Hazard h) {
    // Stores the hazard using its unique ID as the key
    hazards[h.id] = h;
}

/**
 * get_penalty_for_location
 * This function determines how dangerous a specific geographic coordinate is
 * based on its proximity to all known active hazards.
 *
 * Parameters:
 * - lat, lon: The coordinates of the location to evaluate.
 * - radius: The maximum distance (in coordinate units) at which a hazard affects a location.
 */
double HazardManager::get_penalty_for_location(double lat, double lon, double radius) const {
    double total_penalty = 0;
    
    // Iterate through every active hazard in the database
    // DSA Rationale: For a small number of hazards (demo scale), linear iteration is acceptable.
    for (auto const& [id, h] : hazards) {
        // Calculate the straight-line (Euclidean) distance to the hazard center
        double dist = std::sqrt(std::pow(lat - h.latitude, 2) + std::pow(lon - h.longitude, 2));
        
        // If the location is within the hazard's 'zone of influence'
        if (dist < radius) {
            /**
             * Linear Decay Penalty Formula:
             * Penalty = Severity * (1.0 - RelativeDistance)
             * This ensures that being right on top of a hazard yields the maximum penalty,
             * while being at the edge of the radius yields a penalty near zero.
             */
            total_penalty += h.severity * (1.0 - (dist / radius));
        }
    }
    
    // Returns the cumulative penalty from all nearby threats
    return total_penalty;
}

/**
 * get_all_hazards
 * Transforms the internal map into a flat vector for easier processing or JSON serialization.
 */
std::vector<Hazard> HazardManager::get_all_hazards() const {
    std::vector<Hazard> list;
    // Extract each hazard value from the map
    for (auto const& [id, h] : hazards) {
        list.push_back(h);
    }
    return list;
}
