"""Routes des semestres — équivalent de SemesterController.

  POST /add_semester      créer (order_number auto)
  POST /mod_semester      modifier
  POST /delete_semester   supprimer (+ réordonne les suivants)
  POST /change_semester   changer l'ordre (swap)
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.deps import get_current_user
from app.models import AcademicYear, Semester, User
from app.routers._helpers import (
    apply_change_order,
    get_or_404,
    next_order_number,
    reorder_after_delete,
)
from app.schemas import ChangeOrderIn, IdIn, SemesterAddIn, SemesterModIn, SemesterOut

router = APIRouter(tags=["semesters"])


@router.post("/add_semester", status_code=201)
def add_semester(
    payload: SemesterAddIn,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_or_404(db, AcademicYear, payload.academic_year_id, "Année académique")
    semester = Semester(
        academic_year_id=payload.academic_year_id,
        name=payload.name,
        order_number=next_order_number(db, Semester, "academic_year_id", payload.academic_year_id),
    )
    db.add(semester)
    db.commit()
    return {"message": "Semestre ajouté avec succès", "data": SemesterOut.model_validate(semester)}


@router.post("/mod_semester")
def mod_semester(
    payload: SemesterModIn,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    semester = get_or_404(db, Semester, payload.id, "Semestre")
    semester.name = payload.name
    db.commit()
    return {"message": "Semestre modifié avec succès", "data": SemesterOut.model_validate(semester)}


@router.post("/delete_semester")
def delete_semester(
    payload: IdIn,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    semester = get_or_404(db, Semester, payload.id, "Semestre")
    parent_id, deleted_order = semester.academic_year_id, semester.order_number
    db.delete(semester)
    reorder_after_delete(db, Semester, "academic_year_id", parent_id, deleted_order)
    db.commit()
    return {"message": "Semestre supprimé avec succès"}


@router.post("/change_semester")
def change_semester(
    payload: ChangeOrderIn,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    semester = get_or_404(db, Semester, payload.id, "Semestre")
    changed = apply_change_order(db, Semester, semester, "academic_year_id", payload.order_number)
    if not changed:
        return {"message": "Aucun changement"}
    db.commit()
    return {"message": "Ordre modifié avec succès", "data": SemesterOut.model_validate(semester)}
