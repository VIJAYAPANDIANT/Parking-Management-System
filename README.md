# Parking Management System

A full-stack application for managing parking slots, entries, exits, and a dashboard for overview.

## Project Structure

```text
Parking Management System/
├── backend/            # Express.js server
│   ├── db/            # SQLite database and connection
│   ├── routes/        # API routes (auth, slots, parking, dashboard)
│   ├── server.js      # Entry point
│   └── package.json
└── frontend/           # Vite + React application
    ├── src/           # Components, pages, and logic
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## Features

- **Authentication**: Secure login and registration for administrators.
- **Slot Management**: View and manage available parking slots.
- **Entry & Exit**: Track vehicle entries and exits with automatic timing.
- **Dashboard**: Real-time overview of occupancy and revenue metrics.
- **Responsive UI**: Built with React and Tailwind CSS for a premium look.

## Setup Instructions

### Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. The database (`parking.db`) is already initialized in `backend/db/`.

### Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Start the Backend
From the `backend` directory:
```bash
npm start
```
The server will run on [http://localhost:5000](http://localhost:5000).

### Start the Frontend
From the `frontend` directory:
```bash
npm run dev
```
The application will be available at [http://localhost:5173](http://localhost:5173).

## Technologies Used

- **Backend**: Node.js, Express, better-sqlite3, JWT, bcryptjs.
- **Frontend**: React, Vite, Tailwind CSS, Lucide React, Axios.
