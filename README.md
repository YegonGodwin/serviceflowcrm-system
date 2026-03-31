# Serviceflow CRM - Project Overview

Serviceflow is a full-stack CRM and service management application designed for managing clients, employees, service requests, contracts, and finances. It features a multi-role dashboard system (Admin, Client, Employee) and integrates with M-Pesa for payments and payouts.

## Tech Stack

### Frontend
- **Framework:** React 19 (Vite)
- **Styling:** Tailwind CSS 4
- **Routing:** React Router 7
- **Icons:** Lucide React
- **HTTP Client:** Axios
- **State Management:** React Context API (Auth, Sidebar)

### Backend
- **Runtime:** Node.js
- **Framework:** Express 5
- **Database:** MongoDB (via Mongoose)
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs
- **Integrations:** Safaricom M-Pesa API (STK Push & B2C Payouts)

## Project Structure

```text
Serviceflow-fullstack/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # UI components grouped by role
│   │   │   ├── admin/      # Admin dashboard and management components
│   │   │   ├── client/     # Client dashboard and service request components
│   │   │   ├── employee/   # Employee dashboard and task components
│   │   │   └── ui/         # Reusable UI primitives (buttons, badges)
│   │   ├── context/        # Auth and Sidebar state management
│   │   ├── lib/            # Utility functions (PDF generation)
│   │   └── services/       # API integration layer
├── server/                 # Express Backend
│   ├── config/             # Database connection setup
│   ├── controllers/        # API request handlers
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express route definitions
│   └── utils/              # Helper utilities (M-Pesa integration)
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- M-Pesa Developer Account (for sandbox keys)

### Environment Variables

#### Server (`server/.env`)
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

# M-Pesa Configuration
CONSUMER_KEY=your_mpesa_consumer_key
CONSUMER_SECRET=your_mpesa_consumer_secret
SHORTCODE=your_mpesa_shortcode
PASSKEY=your_mpesa_passkey
CALLBACK_URL=your_callback_url

# M-Pesa B2C (Optional for employee payouts)
B2C_SHORTCODE=your_b2c_shortcode
INITIATOR_NAME=your_initiator_name
SECURITY_CREDENTIAL=your_security_credential
B2C_CALLBACK_URL=your_b2c_callback_url
```

#### Client (`client/.env`)
The client currently relies on the backend being at `http://localhost:5000/api` (as seen in `client/src/services/api.ts`).

### Installation and Running

#### 1. Setup Backend
```bash
cd server
npm install
npm run dev
```

#### 2. Setup Frontend
```bash
cd client
npm install
npm run dev
```

## Development Conventions

- **Frontend:**
  - Components are located in `client/src/components`.
  - Use functional components and hooks.
  - Role-based routing is managed in `client/src/App.tsx`.
  - Authentication state is managed via `AuthContext`.
- **Backend:**
  - Controllers handle business logic and are located in `server/controllers`.
  - Routes are defined in `server/routes` and linked in `server/index.js`.
  - Database models follow the Mongoose schema pattern in `server/models`.
- **Styling:** Use Tailwind CSS 4 utility classes directly in components.
- **API Calls:** All frontend API calls should go through the `axios` instance in `client/src/services/api.ts`.
