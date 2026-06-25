"""Package des modèles SQLAlchemy.

Importer ce package enregistre toutes les tables sur Base.metadata (nécessaire avant
create_all). On réexporte chaque modèle pour conserver `from app.models import User`.
"""

from app.models.access_token import AccessToken
from app.models.academic_year import AcademicYear
from app.models.course_module import CourseModule
from app.models.grade import Grade
from app.models.magic_link_token import MagicLinkToken
from app.models.semester import Semester
from app.models.subject import Subject
from app.models.user import User

__all__ = [
    "User",
    "AcademicYear",
    "Semester",
    "CourseModule",
    "Subject",
    "Grade",
    "MagicLinkToken",
    "AccessToken",
]
