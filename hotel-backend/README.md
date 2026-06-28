# Hotel Management System - Backend

A RESTful API built with Node.js, Express, and MongoDB.

## Tech Stack
- Node.js + Express.js
- MongoDB + Mongoose ODM
- JWT Authentication
- bcryptjs for password hashing

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

3. **Start the server**
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/update-password | Update password |

### Rooms
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/rooms | Get all rooms |
| GET | /api/rooms/available | Get available rooms |
| GET | /api/rooms/:id | Get room by ID |
| POST | /api/rooms | Create room |
| PUT | /api/rooms/:id | Update room |
| PATCH | /api/rooms/:id/status | Update room status |
| DELETE | /api/rooms/:id | Delete room |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/bookings | Get all bookings |
| GET | /api/bookings/today | Today's check-ins/outs |
| GET | /api/bookings/:id | Get booking by ID |
| POST | /api/bookings | Create booking |
| PUT | /api/bookings/:id | Update booking |
| PATCH | /api/bookings/:id/check-in | Check in guest |
| PATCH | /api/bookings/:id/check-out | Check out guest |
| PATCH | /api/bookings/:id/cancel | Cancel booking |

### Guests
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/guests | Get all guests |
| GET | /api/guests/:id | Get guest by ID |
| POST | /api/guests | Create guest |
| PUT | /api/guests/:id | Update guest |
| DELETE | /api/guests/:id | Delete guest |

### Staff
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/staff | Get all staff |
| GET | /api/staff/:id | Get staff by ID |
| POST | /api/staff | Create staff |
| PUT | /api/staff/:id | Update staff |
| PATCH | /api/staff/:id/toggle-status | Toggle active status |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dashboard/stats | Get dashboard statistics |
| GET | /api/dashboard/revenue-report | Revenue report |

## User Roles
- **admin** – Full access
- **manager** – Manage rooms, bookings, guests, staff
- **receptionist** – Manage bookings and guests
- **housekeeping** – View and update room status
