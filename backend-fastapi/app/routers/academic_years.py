"""Routes des années académiques — équivalent de AcademicYearController.

  POST /add_academic_years      créer
  POST /mod_academic_years      modifier
  POST /delete-academic-years   supprimer   (tirets — identique à Laravel)
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.deps import get_current_user
from app.models import AcademicYear, User
from app.routers._helpers import get_or_404
from app.schemas import AcademicYearAddIn, AcademicYearModIn, AcademicYearOut, IdIn

router = APIRouter(tags=["academic_years"])


@router.post("/add_academic_years")
def add_academic_years(
    payload: AcademicYearAddIn,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    year = AcademicYear(user_id=current.id, name=payload.name)
    db.add(year)
    db.commit()
    return {
        "message": "Nouvelle année scolaire ajoutée",
        "data": AcademicYearOut.model_validate(year),
    }


@router.post("/mod_academic_years")
def mod_academic_years(
    payload: AcademicYearModIn,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    year = get_or_404(db, AcademicYear, payload.id, "Année académique")
    year.name = payload.name
    db.commit()
    return {
        "message": "Modifié avec succès",
        "data": AcademicYearOut.model_validate(year),
    }


@router.post("/delete-academic-years")
def delete_academic_years(
    payload: IdIn,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    year = get_or_404(db, AcademicYear, payload.id, "Année académique")
    data = AcademicYearOut.model_validate(year)
    db.delete(year)
    db.commit()
    return {"message": "Année académique supprimée avec succès", "data": data}
