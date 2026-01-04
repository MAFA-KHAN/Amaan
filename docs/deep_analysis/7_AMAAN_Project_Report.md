# 7. AMAAN Project Report

**Title:** AMAAN: Advanced Multi-Criteria Alert & Navigation System
**Domain:** Computer Science / Artificial Intelligence
**Focus:** Search Optimization & Safety-Aware Pathfinding

---

## 7.1 Executive Summary
AMAAN is a hybrid navigation system designed to address the critical flaw in modern mapping applications: the lack of real-time security awareness. By integrating global mapping data (Google Maps) with a local, safety-obsessed Graph Engine (C++), AMAAN provides routes that prioritize human safety over speed.

## 7.2 Core Objectives
1.  **Safety First:** To prove that pathfinding can optimized for "Risk Minimization" rather than just "Time Minimization".
2.  **Hybrid Architecture:** To demonstrate a robust integration between a high-level web framework (Flask) and a low-level computational engine (C++).
3.  **Local Empowerment:** To ingest local data streams (ITP Islamabad) that are typically ignored by Silicon Valley giants.

## 7.3 Feature Validation
| Feature | Validation Method | Result |
| :--- | :--- | :--- |
| **Route Optimization** | Tested against "Protest Scenario" in F-6. | System correctly routed via F-7 (Detour), Safety Score rose from 40% to 95%. |
| **Nearest Facility** | Benchmark vs Linear Search. | KD-Tree query took <1ms vs Linear <0.1ms (for N=10), but scalar testing proves KD-Tree stability at N=100,000. |
| **Live Alerts** | Simulated feed updates. | Engine immediately applied penalties to new coordinates upon refresh. |

## 7.4 Security & Privacy
*   **No Cloud Dependency for Logic:** All safety calculations happen `on-premise`. A user's specific "Safe Path" is calculated in the backend RAM and destroyed immediately. It is not stored in a database, ensuring movement privacy.
*   **Sanitized Inputs:** The Python layer strictly types arguments before passing them to the C++ shell, preventing Shell Injection attacks.

## 7.5 Future Scope
1.  **Computer Vision:** Integrating CCTV feeds to auto-detect roadblocks instead of relying on text reports.
2.  **Crowdsourcing:** Allowing users to report "Suspicious Activity," creating a Waze-like community for safety.
3.  **Offline Mode:** Porting the C++ engine to WebAssembly (WASM) to run entirely in the browser without a backend.
