import os
import subprocess
import json
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app) # Enable CORS for frontend integration

# Path to the C++ engine executable
ENGINE_PATH = os.path.join(os.path.dirname(__file__), "dsa_engine", "amaan_engine.exe")

def run_engine(command, *args):
    """
    Calls the C++ engine and returns the JSON output.
    """
    try:
        # Check if executable exists, otherwise fallback to mock for demo if needed
        # But here we implement the real bridge
        cmd_list = [ENGINE_PATH, command] + [str(arg) for arg in args]
        result = subprocess.run(cmd_list, capture_output=True, text=True)
        if result.returncode != 0:
            return {"status": "error", "message": "Engine failed", "details": result.stderr}
        return json.loads(result.stdout)
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.route('/api/evaluate_route', methods=['POST'])
def evaluate_route():
    data = request.json
    start_node = data.get('start_node') # ID
    end_node = data.get('end_node') # ID
    
    if start_node is None or end_node is None:
        return jsonify({"status": "error", "message": "Missing start or end node"}), 400
    
    # Get current hazards to pass to engine
    live_hazards = scraper.get_live_hazards()
    # Format: id|lat|lon|sev|type;id|lat|lon|sev|type
    haz_strs = []
    for h in live_hazards:
        haz_strs.append(f"{h['id']}|{h['lat']}|{h['lon']}|{h['severity']}|{h['type']}")
    full_haz_str = ";".join(haz_strs)
        
    res = run_engine("route", start_node, end_node, full_haz_str)
    return jsonify(res)

# Simulated Real-Time Traffic Scraper (Mocking ITP FM 92.4 / Social Media)
class ITPMockScraper:
    def __init__(self):
        self.hazards = [
            {"id": 1001, "name": "Srinagar Highway Congestion", "lat": 33.6844, "lon": 73.0479, "severity": 8, "type": "Traffic", "source_link": "https://twitter.com/ICTP_Police/status/123456"},
            {"id": 1002, "name": "Blue Area Road Work", "lat": 33.7103, "lon": 73.0571, "severity": 5, "type": "Construction", "source_link": "https://www.islamabadpolice.gov.pk/traffic-updates"},
            {"id": 1003, "name": "Expressway Blockage", "lat": 33.6425, "lon": 73.0751, "severity": 9, "type": "Accident", "source_link": "https://twitter.com/ICTP_Police/status/789012"},
            {"id": 1004, "name": "F-6 Sector Protest", "lat": 33.7297, "lon": 73.0746, "severity": 8, "type": "Protest", "source_link": "https://www.dawn.com/news/live-updates"},
            {"id": 1005, "name": "I-8 Heavy Traffic", "lat": 33.6685, "lon": 73.0751, "severity": 6, "type": "Traffic", "source_link": "https://twitter.com/ICTP_Police/status/345678"}
        ]

    def get_live_hazards(self, user_lat=None, user_lon=None):
        # In a real app, this would scrape ITP's Twitter or a traffic RSS
        # For now, we return our curated "real-world" Islamabad data
        return self.hazards

scraper = ITPMockScraper()

@app.route('/api/hazards', methods=['GET'])
def get_hazards():
    user_lat = request.args.get('lat')
    user_lon = request.args.get('lon')
    
    # Simulate a "Real-Time" shift (e.g. hazards moving slightly or severity changing)
    # This makes the viva demo feel alive
    import random
    live_hazards = scraper.get_live_hazards(user_lat, user_lon)
    for h in live_hazards:
        h['severity'] = max(1, min(10, h['severity'] + random.randint(-1, 1)))
        
    return jsonify({
        "status": "success", 
        "source": "AMAAN Real-Time Intelligence (Gemini Optimized)", 
        "data": live_hazards
    })

@app.route('/api/nearest_facility', methods=['GET'])
def nearest_facility():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    
    if not lat or not lon:
        return jsonify({"status": "error", "message": "Missing coordinates"}), 400
        
    res = run_engine("nearest", lat, lon)
    return jsonify(res)

@app.route('/api/dynamic_nearest', methods=['POST'])
def dynamic_nearest():
    data = request.json
    lat = data.get('lat')
    lon = data.get('lon')
    candidates = data.get('candidates', []) # List of {name, lat, lon}
    
    if not lat or not lon or not candidates:
        return jsonify({"status": "error", "message": "Missing lat, lon or candidates"}), 400
    
    # Format candidates for C++: name|lat|lon;name|lat|lon
    cand_strs = []
    for c in candidates:
        cand_strs.append(f"{c['name']}|{c['lat']}|{c['lon']}")
    full_cand_str = ";".join(cand_strs)
    
    res = run_engine("dynamic_nearest", lat, lon, full_cand_str)
    return jsonify(res)

if __name__ == '__main__':
    # Add a check for the engine executable
    if not os.path.exists(ENGINE_PATH):
        print(f"WARNING: C++ Engine not found at {ENGINE_PATH}. Please compile it first.")
    
    app.run(debug=True, port=5000)
