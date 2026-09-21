from sqlalchemy.orm import Session
from app.auth.security import hash_password
from app.models.models import Plan, User
from app.utils.config import settings

DEFAULT_PLANS = [
    ("essential", "Starter Plan", 2999, 0),
    ("business", "Growth Plan", 4999, 2),
    ("enterprise", "Enterprise Plan", 6999, 8),
]


# Insert or update the default subscription plans in the database
def ensure_plans(db: Session):
    for plan_id, name, price, days in DEFAULT_PLANS:
        plan = db.get(Plan, plan_id)
        if not plan:
            db.add(
                Plan(
                    id=plan_id,
                    name=name,
                    price=price,
                    workspace_days=days,
                )
            )
        else:
            plan.name = name
            plan.price = price
            plan.workspace_days = days

    db.commit()


# Create the admin user from settings if one doesn't already exist
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
