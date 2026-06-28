# Hotel Management System - Frontend

A React application for managing hotel operations.

## Tech Stack
- React 18 + React Router v6
- Axios for API calls
- Recharts for data visualization
- react-hot-toast for notifications
- date-fns for date formatting
- Inter + Playfair Display fonts

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Set REACT_APP_API_URL to your backend URL
   ```

3. **Start the app**
   ```bash
   npm start
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## Pages & Features

### Dashboard
- Real-time stats: occupancy rate, revenue, check-ins
- Weekly revenue bar chart
- Room status pie chart

### Rooms Management
- Grid view of all rooms with status
- Filter by status and type
- Add / edit / delete rooms
- Update room status directly (available → occupied → cleaning)
- Amenity tags

### Bookings
- Full booking table with status badges
- One-click Check In / Check Out / Cancel
- New booking form with guest & room selectors

### Guests
- Guest profiles with stay history
- Live search by name, email, phone
- ID document tracking
- Total stays & spending

### Staff Management (Admin / Manager only)
- Staff roster with role badges
- Add staff with role assignment
- Activate / deactivate accounts

## Design System
- Navy (#1a1a2e) + Gold (#c9a84c) palette
- Playfair Display (headers) + Inter (body)
- Card-based layout with subtle shadows
- Role-based access control (admin, manager, receptionist, housekeeping)

## Connecting to Backend
The app proxies `/api/*` to `http://localhost:5000` in development.
For production, set `REACT_APP_API_URL` in `.env`.
