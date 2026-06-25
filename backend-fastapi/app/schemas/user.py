from datetime import datetime

from app.schemas.academic_year import AcademicYearFull
from app.schemas.common import ORMModel


class UserOut(ORMModel):
    id: int
    full_name: str
    email: str
    created_at: datetime | None = None
    updated_at: datetime | None = None


class UserFull(UserOut):
    """Profil + toute la hiérarchie (route /user-full)."""

    academic_years: list[AcademicYearFull] = []
