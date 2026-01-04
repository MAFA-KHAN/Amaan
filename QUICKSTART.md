# AMAAN - Quick Start Guide

## Running the Application

### Option 1: Direct Frontend (No Backend)
The frontend works standalone with simulated DSA logic:

1. Open `frontend/index.html` in your browser
2. Click "Launch App" or "Start Navigation"
3. Use the suggestions dropdown to select Islamabad locations
4. Click "Find Route" to see the safety-optimized path

### Option 2: Full Stack (With Flask Backend)

#### Prerequisites
- Python 3.x
- C++ Compiler (g++ or MSVC)

#### Steps

1. **Compile the C++ Engine**:
```bash
cd backend/dsa_engine
g++ -std=c++17 graph.cpp kdtree.cpp dijkstra.cpp hazards.cpp main.cpp -o amaan_engine.exe
```

2. **Install Python Dependencies**:
```bash
cd ../
pip install flask flask-cors
```

3. **Start the Flask Server**:
```bash
python app.py
```

4. **Open the Frontend**:
Open `frontend/index.html` in your browser.

## Features Implemented

✅ **Hash Map Suggestions**: Type-ahead autocomplete for Islamabad landmarks  
✅ **Smart Pinning**: Color-coded markers for source (green) and destination (red)  
✅ **Hazard Visualization**: Orange warning circles scaled by severity  
✅ **Facility Detection**: Blue markers for nearest emergency services (KD-Tree simulation)  
✅ **Safety Scoring**: DSA-weighted route evaluation  
✅ **Responsive UI**: Dark theme with glassmorphic elements  

## Islamabad Locations Available
- Blue Area
- F-6 Sector
- G-9 Sector
- E-9 Air University
- Centaurus Mall
- F-10 Markaz
- Shakar Parian
- I-8 Sector

## Notes
- The Google Maps API key is included in `app.html`
- Backend is optional - frontend has full simulation mode
- All DSA concepts are documented in `docs/dsa_explanation.md`
