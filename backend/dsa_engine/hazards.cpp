#include "hazards.h"
#include <cmath>

/**
 * add_hazard
 * DSA: O(log N) insertion into map
 */
void HazardManager::add_hazard(Hazard h) {
    hazards[h.id] = h;
}

/**
 * get_penalty_for_location
 * What: Calculates a cost penalty based on nearby hazards
 * DSA: Brute force comparison (optimized for small N)
 * Rationale: In a real app, hazards could also be in a KD-Tree, 
 * but for this viva demo, a map with range checking is sufficient.
 */
double HazardManager::get_penalty_for_location(double lat, double lon, double radius) const {
    double total_penalty = 0;
    for (auto const& [id, h] : hazards) {
        double dist = std::sqrt(std::pow(lat - h.latitude, 2) + std::pow(lon - h.longitude, 2));
        if (dist < radius) {
            // Penalty = severity * proximity_factor
            total_penalty += h.severity * (1.0 - (dist / radius));
        }
    }
    return total_penalty;
}

std::vector<Hazard> HazardManager::get_all_hazards() const {
    std::vector<Hazard> list;
    for (auto const& [id, h] : hazards) {
        list.push_back(h);
    }
    return list;
}
