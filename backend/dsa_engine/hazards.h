#ifndef HAZARDS_H
#define HAZARDS_H

#include <string>
#include <vector>
#include <map>

/**
 * Hazard structure
 * Represents a dangerous or restrictive area in Islamabad
 */
struct Hazard {
    int id;
    double latitude;
    double longitude;
    int severity; // 1-10
    std::string type; // Traffic, Construction, Crime, Weather
};

/**
 * HazardManager Class
 * What: Manages hazards and evaluates their impact on routes
 * DSA: Hash Map (std::map) for fast lookup by ID
 */
class HazardManager {
private:
    std::map<int, Hazard> hazards;

public:
    void add_hazard(Hazard h);
    double get_penalty_for_location(double lat, double lon, double radius = 0.005) const;
    std::vector<Hazard> get_all_hazards() const;
};

#endif // HAZARDS_H
