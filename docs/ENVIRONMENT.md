# Environment variables

Copy each `.env.example` to `.env` and edit. `.env` files are git-ignored and must never be committed.

## backend/.env

| Variable              | Required | Default                                     | Description |
|-----------------------|:--------:|---------------------------------------------|-------------|
| `NODE_ENV`            | no       | `development`                               | `development` shows request logs and full error messages. `production` hides server error details and enforces a real `JWT_SECRET`. |
| `PORT`                | no       | `5000`                                      | Port the API listens on. |
| `CLIENT_ORIGIN`       | yes (prod) | `http://localhost:5173`                   | Allowed browser origin(s) for CORS. Separate several with commas. |
| `MONGODB_URI`         | yes      | `mongodb://127.0.0.1:27017/tadoba_portal`   | MongoDB connection string. For Atlas: `mongodb+srv://USER:PASS@cluster.mongodb.net/tadoba_portal`. |
| `JWT_SECRET`          | yes      | dev-only value                              | Secret used to sign login tokens. Use 48+ random bytes: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`. Changing it signs everyone out. |
| `JWT_EXPIRES_IN`      | no       | `8h`                                        | Token lifetime (`30m`, `8h`, `7d`). |
| `SEED_ADMIN_NAME`     | no       | `Forest Officer`                            | Name of the first admin created by `npm run seed`. |
| `SEED_ADMIN_EMAIL`    | no       | `admin@tadoba.local`                        | Login email of that admin. |
| `SEED_ADMIN_PASSWORD` | no       | `ChangeMe@12345`                            | Initial password for the seeded admin (also used for the sample ranger and analyst accounts). Minimum 8 characters. |

The seed variables are only read by `npm run seed` / `npm run seed:reset`.

## frontend/.env

Vite only exposes variables that start with `VITE_`. They are read at build time.

| Variable                | Required | Default                  | Description |
|-------------------------|:--------:|--------------------------|-------------|
| `VITE_API_BASE_URL`     | no       | `/api`                   | API base URL used by the browser. Keep `/api` in development (proxied). In production use the full URL, e.g. `https://portal.example.gov.in/api`, or keep `/api` if your web server proxies it. |
| `VITE_DEV_PROXY_TARGET` | no       | `http://localhost:5000`  | Where the Vite dev server forwards `/api`. Used only by `npm run dev`. |

## Typical configurations

**Local development** - use the defaults, only change `JWT_SECRET` and the seed password.

**Production (single domain behind Nginx)**

```
# backend/.env
NODE_ENV=production
PORT=5000
CLIENT_ORIGIN=https://portal.example.gov.in
MONGODB_URI=mongodb://USER:PASSWORD@db-host:27017/tadoba_portal?authSource=admin
JWT_SECRET=<48+ random bytes>
JWT_EXPIRES_IN=8h

# frontend/.env (before npm run build)
VITE_API_BASE_URL=/api
```

Nginx serves `frontend/dist` and proxies `/api` to `http://127.0.0.1:5000`.
