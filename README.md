# Tadoba Andhari Tiger Reserve - Monitoring Portal

A web portal for the Forest Department to monitor wildlife observations, incidents, patrols, alerts and
analytical datasets for Tadoba Andhari Tiger Reserve (TATR). This is **Phase 1**: a complete, working
foundation with a government-style light interface, a secured REST API and a MongoDB database.
Advanced features (live data links, ML pipelines, LoRa sensor ingestion) plug into this base in later phases.

| Layer    | Technology                                                    |
|----------|---------------------------------------------------------------|
| Frontend | React 18, Vite, React Router 6, Leaflet (maps), plain CSS     |
| Backend  | Node.js (ES modules), Express 4, Mongoose 8                   |
| Database | MongoDB                                                       |
| Auth     | JWT (Bearer token), bcrypt password hashing, role-based access |

## Features in this phase

| Page                  | What works                                                                                 |
|-----------------------|--------------------------------------------------------------------------------------------|
| Sign in               | JWT login, session restore, auto sign-out on expiry                                        |
| Dashboard             | Live counts, latest alerts, recent observations, activity map                              |
| Forest Map            | Reserve / core / buffer zones, camera nodes, gates, villages, water bodies, sightings, incidents, patrol routes; layer toggles; time filter |
| Animal Observations   | Category tabs, search, date filter, pagination, add / edit / delete                        |
| Vegetation Analysis   | NDVI, canopy cover, habitat suitability records with summary cards; add / delete           |
| Incidents             | Type tabs, search, table, detail panel, status change, add / edit / delete                 |
| Patrol Activity       | Route map, coverage totals, patrol list, add patrol with optional waypoints                |
| Alerts                | Severity and status filters, review queue; **Escalate** creates a linked incident          |
| Reports               | Generate summaries for a date range from live data, view, print / save as PDF              |
| Data & Models         | Registry of datasets and models; add / delete (admin, analyst)                             |
| Settings              | Profile, change password, user management (admin)                                          |
| Accessibility         | Skip link, text size controls (A- A A+), keyboard focus styles, responsive layout          |

### Roles

| Role           | Read | Create / edit | Delete | Datasets & models | Users |
|----------------|:----:|:-------------:|:------:|:-----------------:|:-----:|
| admin          | yes  | yes           | yes    | yes               | yes   |
| forest_officer | yes  | yes           | yes    | read only         | no    |
| ranger         | yes  | yes           | no     | read only         | no    |
| analyst        | yes  | no            | no     | yes               | no    |

## Project structure

```
tadoba-portal/
├── README.md                 <- this file
├── docs/ENVIRONMENT.md       <- every environment variable explained
├── backend/
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── server.js         <- entry point (DB connect + listen)
│       ├── app.js            <- Express app (middleware, routes, error handling)
│       ├── config/           <- env, db connection, constants, zone geometry
│       ├── models/           <- Mongoose schemas
│       ├── controllers/      <- request handlers (business logic)
│       ├── routes/           <- route definitions (/api/...)
│       ├── middleware/       <- auth (JWT + roles), error handler
│       ├── utils/            <- ApiError, asyncHandler, generic CRUD factory
│       └── seed/seed.js      <- sample data loader
└── frontend/
    ├── .env.example
    ├── package.json, vite.config.js, index.html
    └── src/
        ├── main.jsx, App.jsx
        ├── api/              <- fetch client + API modules (one place for every endpoint)
        ├── config/           <- navigation, shared constants
        ├── context/          <- Auth and Toast providers
        ├── hooks/            <- useFetch, useDebounce, useFontSize
        ├── routes/           <- AppRoutes, ProtectedRoute
        ├── components/
        │   ├── layout/       <- GovHeader, Sidebar, AppLayout
        │   ├── common/       <- Badge, DataTable, Modal, FormModal, Pagination, ...
        │   └── map/          <- ForestMap (Leaflet) and layer definitions
        ├── pages/            <- one file per screen
        ├── styles/           <- variables, base, layout, components (light government theme)
        └── utils/            <- date and number formatting
```

## Prerequisites

* Node.js 18 or newer
* MongoDB 6 or newer running locally (`mongodb://127.0.0.1:27017`) **or** a MongoDB Atlas connection string

## Setup and run

```bash
# 1. Backend
cd backend
cp .env.example .env          # edit JWT_SECRET and the seed admin password (see docs/ENVIRONMENT.md)
npm install
npm run seed                  # creates the admin user and sample data (only on an empty database)
npm run dev                   # API on http://localhost:5000/api

# 2. Frontend (new terminal)
cd frontend
cp .env.example .env
npm install
npm run dev                   # Portal on http://localhost:5173
```

Sign in with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` from `backend/.env`
(defaults: `admin@tadoba.local` / `ChangeMe@12345`). The seed also creates `ranger@tadoba.local`
and `analyst@tadoba.local` with the same password so you can check role restrictions.
**Change all default passwords before any shared deployment.**

`npm run seed:reset` wipes the portal collections and reseeds.

### How frontend and backend are connected

* In development the Vite dev server proxies `/api` to `VITE_DEV_PROXY_TARGET` (default `http://localhost:5000`), so no CORS setup is needed.
* In production set `VITE_API_BASE_URL` to the full API URL before `npm run build`, and add the portal's origin to `CLIENT_ORIGIN` in the backend `.env`.
* Every endpoint the UI calls is declared once in `frontend/src/api/resources.js`.
* Allowed values (zones, statuses, priorities, ...) live in `backend/src/config/constants.js` and are mirrored in `frontend/src/config/constants.js`. Change both together.

### Production build

```bash
cd frontend && npm run build        # static files in frontend/dist (serve with Nginx or any static host)
cd backend  && NODE_ENV=production npm start
```

In production the backend refuses to start with the default `JWT_SECRET`.

## API summary

All routes are under `/api`. Everything except `/health` and `/auth/login` needs `Authorization: Bearer <token>`.
List endpoints accept `page`, `limit`, `search`, `sort`, `days` and resource-specific filters, and return `{ items, total, page, pages }`.

| Resource        | Endpoints                                                                                   |
|-----------------|---------------------------------------------------------------------------------------------|
| Health          | `GET /health`                                                                               |
| Auth            | `POST /auth/login`, `GET /auth/me`, `PATCH /auth/me`, `POST /auth/change-password`          |
| Users (admin)   | `GET /users`, `POST /users`, `PATCH /users/:id/active`                                      |
| Dashboard       | `GET /dashboard/summary`, `GET /dashboard/map-layers?days=30`                               |
| Observations    | `GET/POST /observations`, `GET/PATCH/DELETE /observations/:id` (filters: `category`, `source`) |
| Incidents       | `GET/POST /incidents`, `GET/PATCH/DELETE /incidents/:id` (filters: `type`, `status`, `priority`) |
| Patrols         | `GET/POST /patrols`, `GET/PATCH/DELETE /patrols/:id` (filters: `status`, `zone`)            |
| Vegetation      | `GET/POST /vegetation`, `GET/PATCH/DELETE /vegetation/:id` (filters: `zone`, `health`)      |
| Alerts          | `GET/POST /alerts`, `GET/PATCH/DELETE /alerts/:id`, `PATCH /alerts/:id/review`              |
| Reports         | `GET /reports`, `POST /reports/generate`, `GET/DELETE /reports/:id`                         |
| Datasets/Models | `GET/POST /datasets`, `/models`, plus `/:id` (write access: admin, analyst)                 |

## Adding a new module later

1. Backend: model in `models/`, a `createCrud(Model, {...})` controller, and one line in `routes/index.js` using `buildCrudRouter`.
2. Frontend: add the endpoint to `api/resources.js`, a page in `pages/`, a route in `routes/AppRoutes.jsx` and an entry in `config/navigation.js`.

## Notes and known limits of this phase

* All seeded records and zone boundaries are **illustrative sample data**, not survey data. Load official GIS layers before operational use.
* The logo is a neutral placeholder. Use the department's approved emblem and branding under the applicable government guidelines.
* The base map uses OpenStreetMap tiles and needs internet access. Offline tiles can be added later for low-connectivity deployments.
* Evidence photos, live camera feeds, LoRa sensor ingestion, satellite/ML pipelines and notifications are intentionally **not** part of this phase.
* Not yet included: automated tests, audit logging, password reset by email, and image upload storage.
* Before deployment: use HTTPS, a strong `JWT_SECRET`, a MongoDB user with a password, and restrict `CLIENT_ORIGIN`.
