# 🛡️ AMAAN - Location Intelligence & Safety Navigation

<div align="center">

![AMAAN Logo](assets/logo/logo.png)

**Navigate Islamabad Safely with Intelligence**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Made with Love](https://img.shields.io/badge/Made%20with-❤️-red.svg)](https://github.com/MAFA-KHAN/Amaan)
[![For Islamabad](https://img.shields.io/badge/Built%20for-Islamabad-brightgreen.svg)](https://github.com/MAFA-KHAN/Amaan)

[Live Demo](#-live-demo) • [Features](#-features) • [Installation](#-installation) • [Documentation](#-documentation)

</div>

---

## 📖 About AMAAN

**AMAAN** (A-M-A-A-N) is a cutting-edge **Location Intelligence & Safety Navigation** system designed specifically for **Islamabad, Pakistan**. Unlike traditional navigation apps, AMAAN prioritizes **safety over speed**, using advanced Data Structures and Algorithms (DSA) to evaluate routes based on:

- 🚨 **Hazard proximity** (traffic, construction, incidents)
- 🏥 **Emergency facility access**
- 🛡️ **Safety scoring** (0-100 scale)
- 📍 **Real-time location intelligence**

### 🎯 Core Philosophy

> **Google Maps** provides visualization and base routing  
> **AMAAN DSA Engine** provides intelligence and safety evaluation

---

## ✨ Features

### 🗺️ Smart Navigation
- **Google Places Autocomplete**: Search any location in Islamabad
- **GPS Auto-Location**: Automatically detects your current position
- **Multi-Route Evaluation**: Analyzes multiple routes and selects the safest
- **Real-time Routing**: Dynamic route calculation with Google Directions API

### 🛡️ Safety Intelligence
- **Safety Scoring**: 0-100 scale based on hazard proximity
- **Hazard Detection**: Visual warnings for traffic, construction, and incidents
- **Emergency Facilities**: Auto-detection of nearest hospitals, police, fire stations
- **Route Optimization**: Balances distance with safety factors

### 🎨 Modern UI/UX
- **Dark Theme**: Premium glassmorphic design
- **Color-Coded Pins**: 
  - 🟢 Green (Source)
  - 🔴 Red (Destination)
  - 🟠 Orange (Hazards)
  - 🔵 Blue (Facilities)
- **Responsive Design**: Works on all screen sizes
- **Toggleable Sidebar**: Clean, distraction-free interface

### 🧠 DSA Concepts Implemented
- **Hash Map**: Location indexing (Google Places)
- **Graph Traversal**: Road network analysis
- **Dijkstra's Algorithm**: Shortest path (Google Directions)
- **KD-Tree**: Nearest facility search (O(log N))
- **Priority Queue**: Route ranking
- **Custom Scoring**: Safety evaluation algorithm

---

## 🚀 Live Demo

### Quick Start (No Installation Required)
1. Clone the repository
2. Open `frontend/index.html` in your browser
3. Click "Launch App"
4. Allow location access (optional)
5. Start navigating!

**Note**: Requires internet connection for Google Maps API

---

## 📦 Installation

### Prerequisites
- Modern web browser (Chrome, Firefox, Edge)
- Internet connection
- (Optional) Python 3.x for backend
- (Optional) C++ compiler for DSA engine

### Frontend Only (Recommended for Demo)
```bash
# Clone the repository
git clone https://github.com/MAFA-KHAN/Amaan.git
cd Amaan

# Open in browser
# Windows
start frontend/index.html

# macOS
open frontend/index.html

# Linux
xdg-open frontend/index.html
```

### Full Stack Setup (Optional)

#### 1. Compile C++ DSA Engine
```bash
cd backend/dsa_engine
g++ -std=c++17 graph.cpp kdtree.cpp dijkstra.cpp hazards.cpp main.cpp -o amaan_engine
```

#### 2. Install Python Dependencies
```bash
cd ../
pip install flask flask-cors
```

#### 3. Run Flask Backend
```bash
python app.py
```

#### 4. Open Frontend
Navigate to `http://localhost:5000` or open `frontend/index.html`

---

## 📂 Project Structure

```
AMAAN/
├── frontend/
│   ├── index.html              # Landing page
│   ├── app.html                # Main navigation app
│   ├── test.html               # Feature testing dashboard
│   ├── css/
│   │   ├── style.css           # Landing page styles
│   │   └── app.css             # App styles
│   └── js/
│       ├── landing.js          # Landing page logic
│       └── main.js             # Core app logic (Google Places + DSA)
│
├── backend/
│   ├── app.py                  # Flask API server
│   └── dsa_engine/             # C++ DSA Core
│       ├── graph.cpp/h         # Graph data structure
│       ├── dijkstra.cpp/h      # Path optimization
│       ├── kdtree.cpp/h        # Spatial indexing
│       ├── hazards.cpp/h       # Hazard management
│       └── main.cpp            # CLI interface
│
├── docs/
│   ├── architecture.md         # System architecture
│   └── dsa_explanation.md      # DSA concepts explained
│
├── assets/
│   └── logo/                   # Branding assets
│
├── FEATURE_GUIDE.md            # Complete feature documentation
├── QUICKSTART.md               # Quick start guide
├── TESTING.md                  # Testing instructions
└── README.md                   # This file
```

---

## 🎓 DSA Concepts

### 1. **Graph Data Structure**
- **Purpose**: Represent Islamabad's road network
- **Implementation**: Adjacency list
- **Complexity**: O(V + E) space

### 2. **Dijkstra's Algorithm**
- **Purpose**: Find shortest/safest path
- **Weights**: `distance + hazard_penalty - safety_bonus`
- **Complexity**: O(E log V) with priority queue

### 3. **KD-Tree**
- **Purpose**: Nearest facility search
- **Dimensions**: 2D (latitude, longitude)
- **Complexity**: O(log N) search

### 4. **Hash Map**
- **Purpose**: Location indexing, facility categorization
- **Complexity**: O(1) average lookup

### 5. **Priority Queue**
- **Purpose**: Route ranking by safety score
- **Complexity**: O(log N) insertion/deletion

---

## 🧪 Testing

### Manual Testing
```bash
# Open test dashboard
open frontend/test.html
```

### Feature Checklist
- ✅ Google Places Autocomplete (any Islamabad location)
- ✅ GPS auto-location
- ✅ Smart pin placement (green/red/orange/blue)
- ✅ Route calculation with safety scoring
- ✅ Hazard visualization
- ✅ Nearest facility detection
- ✅ Sidebar toggle
- ✅ Responsive design

See [TESTING.md](TESTING.md) for detailed test cases.

---

## 📚 Documentation

- **[FEATURE_GUIDE.md](FEATURE_GUIDE.md)**: Complete feature documentation
- **[QUICKSTART.md](QUICKSTART.md)**: Quick start guide
- **[docs/architecture.md](docs/architecture.md)**: System architecture
- **[docs/dsa_explanation.md](docs/dsa_explanation.md)**: DSA concepts explained

---

## 🛠️ Technologies Used

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Google Maps JavaScript API
- Google Places API
- Google Directions API
- Font Awesome Icons
- Google Fonts (Outfit)

### Backend (Optional)
- Python Flask
- C++ (DSA Engine)
- JSON communication

---

## 🌟 Key Highlights

### Academic Excellence
- ✅ **DSA-Heavy**: Every feature ties to a data structure or algorithm
- ✅ **Well-Documented**: Extensive inline comments and documentation
- ✅ **Presentation-Ready**: Easy to explain and demonstrate
- ✅ **Production-Quality**: Clean, maintainable code

### Real-World Application
- ✅ **Islamabad-Centric**: Tailored for Pakistan's capital
- ✅ **Safety-First**: Prioritizes user safety over speed
- ✅ **Scalable**: Architecture supports expansion
- ✅ **Modern UI**: Premium, responsive design

---

## 🎯 Use Cases

1. **Daily Commuters**: Find safest routes to work/school
2. **Emergency Services**: Optimize response routes
3. **Tourists**: Navigate Islamabad safely
4. **Urban Planning**: Analyze traffic patterns and hazards
5. **Research**: Study safety-based navigation algorithms

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **MAFA KHAN** - *Initial work* - [MAFA-KHAN](https://github.com/MAFA-KHAN)

---

## 🙏 Acknowledgments

- Google Maps Platform for visualization APIs
- Islamabad community for inspiration
- Open-source DSA community for algorithms
- All contributors and testers

---

## 📞 Contact

- **Email**: contact@islamabade9auniversity.edu.pk
- **GitHub**: [@MAFA-KHAN](https://github.com/MAFA-KHAN)
- **Project Link**: [https://github.com/MAFA-KHAN/Amaan](https://github.com/MAFA-KHAN/Amaan)

---

## 🗺️ Roadmap

- [ ] Real-time traffic integration
- [ ] Weather-based hazard detection
- [ ] Mobile app (React Native)
- [ ] Multi-city support
- [ ] User-reported hazards
- [ ] Route history and analytics
- [ ] Offline mode with cached maps

---

<div align="center">

**Built with ❤️ for Islamabad**

⭐ Star this repo if you find it useful!

[Report Bug](https://github.com/MAFA-KHAN/Amaan/issues) • [Request Feature](https://github.com/MAFA-KHAN/Amaan/issues)

</div>
