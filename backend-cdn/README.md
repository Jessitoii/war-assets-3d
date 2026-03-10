# 🌐 War Assets - Backend CDN

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![AWS SDK](https://img.shields.io/badge/AWS_SDK-232F3E?style=flat-square&logo=amazonwebservices&logoColor=white)](https://aws.amazon.com/sdk-for-javascript/)

The **Backend CDN Service** acts as a high-performance middleware between the mobile application and our asset storage (Cloudflare R2 / S3).

## ✨ Key Features
- **Presigned URLs:** Secure, time-limited access to private assets.
- **Asset Upload:** Multi-part upload support for 3D models and high-res textures via `multer`.
- **Security:** Built-in protection with `helmet`, `cors`, and `rate-limit`.
- **Cloudflare R2 Native:** Optimized for S3-compatible cloud storage.

## 🛠️ Tech Stack
- **Framework:** Express.js (Node.js)
- **Storage Connectivity:** `@aws-sdk/client-s3`
- **Networking:** Axios, CORS
- **Middleware:** Multer, Helmet, Rate-Limiter-Flexible

## ⚙️ Configuration
The service requires a `.env` file in the `backend-cdn/` folder:
```env
PORT=3000
R2_BUCKET_NAME=...
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
```

## 🚀 Execution
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

## 📂 Internal Structure
- `/src`: Core logic and Express routes.
- `/public`: Local cache and static assets.
- `node_modules`: Resolved dependencies.

---
*Part of the [War Assets 3D](file:///d:/Software/Expo/War-Assets-3D-main/README.md) Ecosystem*
