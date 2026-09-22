# Sadhana Mythri

Subscription-based virtual office platform for businesses that need a compliant, professional address without a physical office.

## Stack

- **Frontend:** React 19 + Vite + React Router
- **Backend:** FastAPI + SQLAlchemy
- **Database:** MySQL or PostgreSQL via `DATABASE_URL` (no built-in fallback — must be configured in `.env`)
- **Payments:** Razorpay (order creation + signature verification)

## Run locally

```powershell
# Terminal 1
cd backend
Copy-Item .env.example .env
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload

# Terminal 2
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

The frontend is available at `http://localhost:5173` and proxies API requests to `http://localhost:8000`.

`backend/.env` and `frontend/.env` are intentionally ignored by Git. Copy the adjacent `.env.example` files first and use a unique `SECRET_KEY` outside local development.

Backend environment variables (see `backend/.env.example`):

- `DATABASE_URL` — SQLAlchemy connection string, e.g. `mysql+pymysql://user:pass@host:3306/dbname` or `postgresql://user:pass@host/dbname`
- `SECRET_KEY` — JWT signing secret
- `FRONTEND_ORIGIN` — allowed CORS origin for the frontend
- `ADMIN_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` — seeded admin account credentials
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — Razorpay API credentials

## Core API routes

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/plans`
- `GET/POST /api/subscriptions`, `POST /api/subscriptions/{id}/renew`, `DELETE /api/subscriptions/{id}`
- `POST /api/payments/create-order`, `POST /api/payments/verify-payment`
- `GET/POST /api/verification`
- `GET/POST /api/business-details`
- `GET /api/invoices`
- `POST /api/chat/support`
- `GET /health`
- **Admin:** `GET /api/admin/users`, `DELETE /api/admin/users/{id}`, `GET /api/admin/subscriptions`, `GET /api/admin/verifications`, `PATCH /api/admin/verifications/{id}`, `GET /api/admin/verifications/{id}/document`
