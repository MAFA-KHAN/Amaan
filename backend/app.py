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
    start_node = data.get('start_node')
    end_node = data.get('end_node')
    
    if start_node is None or end_node is None:
        return jsonify({"status": "error", "message": "Missing start or end node"}), 400
        
    res = run_engine("route", start_node, end_node)
    return jsonify(res)

@app.route('/api/nearest_facility', methods=['GET'])
def nearest_facility():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    
    if not lat or not lon:
        return jsonify({"status": "error", "message": "Missing coordinates"}), 400
        
    res = run_engine("nearest", lat, lon)
    return jsonify(res)

@app.route('/api/hazards', methods=['GET'])
def get_hazards():
    # In a full impl, this might call the engine too
    # For now, we return a standard list for the frontend to render pins
    hazards = [
        {"id": 501, "lat": 33.7000, "lon": 73.0400, "severity": 8, "type": "Traffic Jam"},
        {"id": 502, "lat": 33.7200, "lon": 73.0700, "severity": 5, "type": "Construction"}
    ]
    return jsonify({"status": "success", "data": hazards})

if __name__ == '__main__':
    # Add a check for the engine executable
    if not os.path.exists(ENGINE_PATH):
        print(f"WARNING: C++ Engine not found at {ENGINE_PATH}. Please compile it first.")
    
    app.run(debug=True, port=5000)
