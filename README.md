# 🔍 LostFinder — AI-Powered Lost & Found Platform

A full-stack web application that helps people report, search, and recover lost items. Uses AI-powered semantic matching to automatically connect lost items with found ones, plus a complete claims system, real-time notifications, and an admin dashboard.

![Status](https://img.shields.io/badge/status-active-success)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)
![TypeScript](https://img.shields.io/badge/typescript-5.x-blue)

---




Demo Video
https://github.com/user-attachments/assets/ae57bff1-84b2-46c3-b046-5d07392adbb0

## ✨ Features

- **🔐 Authentication** — JWT-based signup/login with role-based access (USER / ADMIN)
- **📦 Item Reporting** — Report lost or found items with photos, descriptions, categories, and map coordinates
- **🤖 AI Matching** — Sentence-transformer embeddings compare item descriptions and surface likely matches with confidence scores
- **🏷️ Object Detection** — Upload an image and the app auto-detects objects (backpack, phone, laptop, etc.) using COCO-SSD in the browser
- **🗺️ Maps** — Click-to-place map picker on the report form (Leaflet + OpenStreetMap), read-only map on item pages
- **🤝 Claims System** — Users claim found items with a verification message; item owners review and approve/reject claims
- **🔔 Real-time Notifications** — Socket.IO pushes instant toasts: "New claim on your item" and "Your claim was approved"
- **📊 Admin Dashboard** — Platform stats, all claims moderation, and user role management
- **🔍 Search & Browse** — Full-text search on titles and descriptions, filter by LOST / FOUND / RESOLVED status

---

## 🧱 Tech Stack

### Backend
| Layer | Tech |
|---|---|
| Runtime | Node.js + Express + TypeScript |
| ORM | Prisma |
| Database | PostgreSQL (hosted on Supabase) with **pgvector** extension |
| Auth | JWT + bcrypt |
| Real-time | Socket.IO |
| File storage | Supabase Storage |
| AI inference | Supabase Edge Functions (Deno) running `gte-small` |

### Frontend
| Layer | Tech |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS (custom design system) |
| Routing | React Router |
| HTTP | Axios |
| Maps | Leaflet + react-leaflet (OpenStreetMap tiles) |
| Icons | Lucide React |
| Object detection | TensorFlow.js + COCO-SSD |
| Real-time | socket.io-client |

---

## 🏗️ Architecture
