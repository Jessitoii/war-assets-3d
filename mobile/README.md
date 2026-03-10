# 📱 War Assets - Mobile App

[![React Native](https://img.shields.io/badge/React_Native-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-000020?style=flat-square&logo=expo&logoColor=white)](https://expo.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-000000?style=flat-square&logo=threedotjs&logoColor=white)](https://threejs.org/)
[![Zustand](https://img.shields.io/badge/Zustand-443E38?style=flat-square&logo=react&logoColor=white)](https://github.com/pmndrs/zustand)

A high-fidelity mobile application built with **React Native** and **Expo**, designed to visualize military hardware in immersive 3D.

## 🚀 Features
- **Interactive 3D View:** Real-time rendering of GLB models using `@react-three/fiber` and `@react-three/drei`.
- **Smart Data Sync:** Seamless integration with SQLite (`expo-sqlite`) for offline browsing.
- **Dynamic Assets:** On-demand fetching of high-res textures and models from the CDN.
- **Advanced Navigation:** Smooth transitions and gesture handling.
- **State Management:** Fast and lightweight state handling with **Zustand**.

## 🏗️ Tech Stack
- **Core:** React Native, TypeScript, Expo
- **Graphics:** Three.js, React Three Fiber
- **Storage:** SQLite, Expo FileSystem
- **Animation:** Reanimated, Worklets
- **Navigation:** React Navigation v7

## ⚡ Quick Start

### Installation
```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install
```

### Development
```bash
# Start the Expo development server
npx expo start

# Run on Android
npx expo run:android

# Run on iOS
npx expo run:ios
```

## 📂 Folder Structure
- `/components`: Reusable UI elements (3D Viewers, Lists, Buttons).
- `/screens`: Primary application views.
- `/services`: API clients and SQLite bridge.
- `/store`: Zustand state management.
- `/hooks`: Custom React hooks for business logic.

---
*Part of the [War Assets 3D](file:///d:/Software/Expo/War-Assets-3D-main/README.md) Ecosystem*
