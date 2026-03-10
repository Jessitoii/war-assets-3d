# 🛡️ War Assets 3D

![War Assets 3D Banner](C:\Users\alper\.gemini\antigravity\brain\d055e15f-dd70-41da-a83f-a5856f620422\war_assets_3d_banner_1773167927276.png)

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white)](https://threejs.org/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)

**War Assets 3D** is a comprehensive ecosystem for viewing, managing, and exploring high-fidelity 3D military assets. This repository contains the mobile application, the backend CDN service, and a suite of Python-based data processing tools.

---

## 🏗️ Project Architecture

```mermaid
graph TD
    User([User]) <--> Mobile[Mobile App - Expo/React Native]
    Mobile <--> SQLite[(Local DB - SQLite)]
    Mobile <--> CDN[Backend CDN - Express/S3]
    CDN <--> R2[(Cloudflare R2 Storage)]
    Scripts[Python Scripts] --> CDN
    Scripts --> SQLite
```

---

## 📂 Repository Structure

| Directory | Description | Technology Stack |
| :--- | :--- | :--- |
| [`/mobile`](file:///d:/Software/Expo/War-Assets-3D-main/mobile) | The main mobile app for 3D visualization. | React Native, Expo, Three.js, Zustand |
| [`/backend-cdn`](file:///d:/Software/Expo/War-Assets-3D-main/backend-cdn) | Asset delivery service for images and models. | Node.js, Express, AWS-SDK (R2) |
| [Root Scripts](file:///d:/Software/Expo/War-Assets-3D-main/) | Data scrapers and model converters. | Python, Boto3, OSINT Scrapers |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18+)
- **Python** (v3.9+)
- **Expo CLI** (`npm install -g expo-cli`)

### 2. Environment Setup
Create a `.env` file in the root with the following variables:
```env
SKETCHFAB_TOKEN=your_token
R2_BUCKET_NAME=your_bucket
R2_ACCOUNT_ID=your_id
R2_ACCESS_KEY_ID=your_key
R2_SECRET_ACCESS_KEY=your_secret
```

### 3. Quick Run
1. **Initialize Backend:**
   ```bash
   cd backend-cdn && npm install && npm start
   ```
2. **Launch Mobile App:**
   ```bash
   cd mobile && npm install && npx expo start
   ```

---

## 🛠️ Data Processing Suite (Python)

The root folder contains several scripts to maintain the asset database:
- `intelligent_fetcher.py`: Automates asset discovery and R2 synchronization.
- `converter.py`: Handles model format conversions for optimized mobile rendering.
- `populate_osint.py`: Scrapes technical specifications and threat data.

---

## 📜 License
This project is licensed under the **ISC License**.

---

<p align="center">
  Developed with ❤️ for the 3D Visualization Community.
</p>
