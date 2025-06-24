# 🧾 Food Price Analytics – Frontend

A **simple analytical dashboard** for monitoring and comparing average prices of essential food products in Poland.  
This frontend is built with **React + TypeScript** and visualizes processed data from a backend API.

---

## 📌 Project Overview

This app is part of a complete analytical system for tracking the prices of basic food items like:

- 🥖 Bread  
- 🥛 Milk  
- 🥚 Eggs  


**System layers:**

1. ✅ Data ingestion – downloads and parses CSV/Excel files.
2. ✅ Data transformation – aggregates and stores data in SQLite (via backend API).
3. ✅ **Result layer (this app)** – displays charts, tables and export options.

---

## 🎯 Features

- 📈 Monthly average prices by product and region
- 🌍 Regional comparison (voivodeships)
- 📊 Table views with filters and sorting
- 📤 CSV export for further analysis
- 🔄 Connected to a RESTful API (FastAPI backend)

---

## 🛠️ Tech Stack

| Layer         | Technology          |
|---------------|---------------------|
| Frontend      | React, TypeScript   |
| Charts        | Recharts            |
| Styling       | CSS                 |
| API Client    | Axios               |
| Export        | Custom CSV logic    |

---


