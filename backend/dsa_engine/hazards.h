#ifndef HAZARDS_H
#define HAZARDS_H

#include <string>
#include <vector>
#include <map>

/**
 * Hazard Structure
 * Represents a dynamic threat or obstacle in the city (e.g., traffic jam, protest, road work).
 */
struct Hazard {
    int id;               // Unique primary key for the hazard event
    double latitude;      // Latitude coordinate of the hazard center
    double longitude;     // Longitude coordinate of the hazard center
    int severity;         // Magnitude of impact (1 = minor delay, 10 = complete blockage)
    std::string type;     // Classification (e.g., "Traffic", "Construction", "Protest")
};

/**
 * HazardManager Class
 * Responsibility: Tracks all active hazards and calculates their spatial impact on roads.
 * This class allows the engine to 'penalize' edges in the graph that are near danger zones.
 */
class HazardManager {
private:
    // Internal registry of all active hazards, indexed by ID for O(log N) access
    std::map<int, Hazard> hazards;

public:
    // Registers a new live hazard into the system
    void add_hazard(Hazard h);
    
    // Core logic: Evaluates the cumulative danger penalty for a specific coordinate
    // The 'radius' parameter defines the area of effect for each hazard.
    double get_penalty_for_location(double lat, double lon, double radius = 0.005) const;
    
    // Returns a flat list of all currently tracked hazards
    std::vector<Hazard> get_all_hazards() const;
};

#endif // HAZARDS_H
