from sqlalchemy.orm import Session
from app.models.models import Plan

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
