from sqlalchemy.orm import Session
from app.auth.security import hash_password
from app.models.models import Plan, User
from app.utils.config import settings

DEFAULT_PLANS = [
    ("essential", "Essential", 999, 0),
    ("business", "Business", 1999, 2),
    ("enterprise", "Enterprise", 3999, 8),
]


def ensure_plans(db: Session):
    for plan_id, name, price, days in DEFAULT_PLANS:
        if not db.get(Plan, plan_id):
            db.add(
                Plan(
                    id=plan_id,
                    name=name,
                    price=price,
                    workspace_days=days,
                )
            )

    db.commit()


def ensure_admin(db: Session):
    if not settings.admin_password or db.query(User).filter(User.email == settings.admin_email).first():
        return

    db.add(User(
        full_name=settings.admin_name,
        email=settings.admin_email,
        password_hash=hash_password(settings.admin_password),
        is_admin=True,
    ))
    db.commit()
