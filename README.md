# ⚔️ War Assets 3D

<div align="center">

![War Assets 3D Banner](app_store_screenshots/banner.jpg)

<br/>

[![Google Play Testing](https://img.shields.io/badge/Google_Play-Closed_Testing-34A853?style=for-the-badge&logo=googleplay&logoColor=white)](https://play.google.com/apps/testing/com.alper.warassets)
[![Platform](https://img.shields.io/badge/Platform-Android-3DDC84?style=for-the-badge&logo=android&logoColor=white)](https://play.google.com/apps/testing/com.alper.warassets)

<br/>

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-000020?style=flat-square&logo=expo&logoColor=white)](https://expo.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-000000?style=flat-square&logo=threedotjs&logoColor=white)](https://threejs.org/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)

<br/>

*Browse, inspect, and explore high-fidelity 3D military assets — tanks, aircraft, naval vessels and more — with detailed multilingual specifications.*

</div>

---

## 🎯 Overview

**War Assets 3D** is a mobile application for viewing and exploring high-fidelity 3D military hardware. Users can rotate, zoom, and inspect detailed models alongside technical specifications sourced from open intelligence data — covering vehicles, aircraft, naval vessels, and weapons systems from around the world.

This repository contains the full ecosystem: the mobile app, the backend CDN service, and a suite of Python data processing tools.

---

## 📲 Download & Test

> **Closed Testing is now live on Google Play.**
> Join the program to get early access and help shape the app before public release.

<div align="center">

[![Join Closed Testing](https://img.shields.io/badge/Join_Closed_Testing-Google_Play-34A853?style=for-the-badge&logo=googleplay&logoColor=white)](https://play.google.com/apps/testing/com.alper.warassets)

</div>

---

## 📸 Screenshots

<div align="center">

| Home | Asset Detail | 3D Viewer |
|:---:|:---:|:---:|
| ![Home](app_store_screenshots/en/google_play_screenshot_1.png) | ![Detail](app_store_screenshots/en/google_play_screenshot_2.png) | ![3D View](app_store_screenshots/en/google_play_screenshot_4.png) 

</div>

---

## 🏗️ Architecture

```mermaid
graph TD
    User([📱 User]) <--> Mobile[Mobile App\nExpo / React Native]
    Mobile <--> SQLite[(Local DB\nSQLite)]
    Mobile <--> CDN[Backend CDN\nExpress / S3]
    CDN <--> R2[(Cloudflare R2\nStorage)]
    Scripts[🐍 Python Scripts] --> CDN
    Scripts --> SQLite
```

---

## 📂 Repository Structure

| Directory | Description | Stack |
| :--- | :--- | :--- |
| [`/mobile`](/mobile) | Main mobile app for 3D visualization | React Native, Expo, Three.js, Zustand |
| [`/backend-cdn`](/backend-cdn) | Asset delivery service for images and models | Node.js, Express, AWS-SDK (R2) |
| [`/scripts`](/scripts) | Data scrapers, OSINT tools, and model converters | Python, Boto3 |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **Python** v3.9+
- **Expo CLI** — `npm install -g expo-cli`
- A Cloudflare R2 bucket (or compatible S3 storage)

### Environment Setup

Create a `.env` file in the project root:

```env
SKETCHFAB_TOKEN=your_token
R2_BUCKET_NAME=your_bucket
R2_ACCOUNT_ID=your_id
R2_ACCESS_KEY_ID=your_key
R2_SECRET_ACCESS_KEY=your_secret
```

### Run Locally

```bash
# 1. Start the backend CDN
cd backend-cdn
npm install
npm start

# 2. Launch the mobile app
cd mobile
npm install
npx expo start
```

---

## 🛠️ Data Processing Suite

The scripts/ directory contains Python tooling for maintaining and enriching the asset database:

| Script | Purpose |
| :--- | :--- |
| [intelligent_fetcher.py](scripts/intelligent_fetcher.py) | Automates asset discovery and R2 synchronization |
| [metadata_refiner.py](scripts/metadata_refiner.py) | Async Wikipedia + Groq LLM pipeline for enriching asset specs |
| [converter.py](scripts/converter.py) | Handles model format conversions for optimized mobile rendering |
| [populate_osint.py](scripts/populate_osint.py) | Scrapes technical specifications and threat assessment data |

---

## 🌍 Asset Coverage

The database currently includes **757+ military assets** with multilingual specifications (🇹🇷 TR · 🇷🇺 RU · 🇸🇦 AR · 🇨🇳 ZH) across the following categories:

- 🪖 Ground Vehicles — MBTs, IFVs, APCs, Artillery
- ✈️ Aircraft — Fighters, Bombers, Helicopters, UAVs
- ⚓ Naval — Destroyers, Submarines, Carriers, Frigates
- 🔫 Weapons Systems — Missiles, Small Arms, MANPADS

---

## 📜 License

This project is licensed under the **ISC License**.

---

<div align="center">

Built for military history enthusiasts and 3D visualization fans.

</div>