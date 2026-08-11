# Sadhana Mythri

Subscription-based virtual office platform for businesses that need a compliant, professional address without a physical office.

## Stack

- **Frontend:** React + Vite
- **Backend:** FastAPI + SQLAlchemy
- **Database:** SQLite locally (configure `DATABASE_URL` for production)

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

## Core API routes

- `POST /api/auth/register`, `POST /api/auth/login`
- `GET /api/plans`
- `GET/POST /api/subscriptions`
- `GET/POST /api/verification`
- `GET /api/invoices`
- `GET /api/admin/users`