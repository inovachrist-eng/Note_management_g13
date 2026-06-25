"""Package des schémas Pydantic.

Réexporte tous les schémas pour conserver `from app.schemas import XxxIn/XxxOut`.
"""

from app.schemas.academic_year import (
    AcademicYearAddIn,
    AcademicYearModIn,
    AcademicYearOut,
    AcademicYearFull,
)
from app.schemas.auth import MagicLinkIn, RegisterIn, VerifyIn
from app.schemas.common import ChangeOrderIn, IdIn
from app.schemas.grade import FreeGradesIn, GradeAddIn, GradeModIn, GradeOut
from app.schemas.module import ModuleAddIn, ModuleModIn, ModuleOut, ModuleFull
from app.schemas.semester import (
    SemesterAddIn,
    SemesterModIn,
    SemesterOut,
    SemesterFull,
)
from app.schemas.subject import SubjectAddIn, SubjectModIn, SubjectOut, SubjectFull
from app.schemas.user import UserFull, UserOut

__all__ = [
    "RegisterIn",
    "MagicLinkIn",
    "VerifyIn",
    "IdIn",
    "ChangeOrderIn",
    "AcademicYearAddIn",
    "AcademicYearModIn",
    "AcademicYearOut",
    "AcademicYearFull",
    "SemesterAddIn",
    "SemesterModIn",
    "SemesterOut",
    "SemesterFull",
    "ModuleAddIn",
    "ModuleModIn",
    "ModuleOut",
    "ModuleFull",
    "SubjectAddIn",
    "SubjectModIn",
    "SubjectOut",
    "SubjectFull",
    "GradeAddIn",
    "GradeModIn",
    "GradeOut",
    "FreeGradesIn",
    "UserOut",
    "UserFull",
]
