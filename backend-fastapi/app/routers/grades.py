"""Routes des notes — équivalent de GradeController.

  POST /grades/add            ajouter (order_number auto, type défaut "examen")
  POST /grades/update         modifier (score / type / session)
  POST /grades/delete         supprimer (+ réordonne les suivantes)
  POST /grades/change-order   changer l'ordre (swap)
  POST /grades/free           notes libres N1–N10 (type "libre", session 0)
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.deps import get_current_user
from app.models import Grade, Subject, User
from app.routers._helpers import (
    apply_change_order,
    get_or_404,
    next_order_number,
    reorder_after_delete,
)
from app.schemas import ChangeOrderIn, FreeGradesIn, GradeAddIn, GradeModIn, GradeOut, IdIn

router = APIRouter(tags=["grades"])


@router.post("/grades/add", status_code=201)
def add_grade(
    payload: GradeAddIn,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_or_404(db, Subject, payload.subject_id, "Matière")
    grade = Grade(
        subject_id=payload.subject_id,
        type=payload.type or "examen",
        session=payload.session,
        score=payload.score,
        order_number=next_order_number(db, Grade, "subject_id", payload.subject_id),
    )
    db.add(grade)
    db.commit()
    return {"message": "Note ajoutée avec succès", "data": GradeOut.model_validate(grade)}


@router.post("/grades/update")
def mod_grade(
    payload: GradeModIn,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    grade = get_or_404(db, Grade, payload.id, "Note")
    fields = payload.model_dump(exclude_unset=True, exclude={"id"})
    for key, value in fields.items():
        setattr(grade, key, value)
    db.commit()
    return {"message": "Note modifiée avec succès", "data": GradeOut.model_validate(grade)}


@router.post("/grades/delete")
def delete_grade(
    payload: IdIn,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    grade = get_or_404(db, Grade, payload.id, "Note")
    parent_id, deleted_order = grade.subject_id, grade.order_number
    db.delete(grade)
    reorder_after_delete(db, Grade, "subject_id", parent_id, deleted_order)
    db.commit()
    return {"message": "Note supprimée avec succès"}


@router.post("/grades/change-order")
def change_grade_order(
    payload: ChangeOrderIn,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    grade = get_or_404(db, Grade, payload.id, "Note")
    changed = apply_change_order(db, Grade, grade, "subject_id", payload.order_number)
    if not changed:
        return {"message": "Aucun changement"}
    db.commit()
    return {"message": "Ordre de la note modifié avec succès", "data": GradeOut.model_validate(grade)}


@router.post("/grades/free")
def free_grades(
    payload: FreeGradesIn,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_or_404(db, Subject, payload.subject_id, "Matière")
    grades = payload.grades or []

    # Remplace les anciennes notes libres de la matière
    db.query(Grade).filter(
        Grade.subject_id == payload.subject_id, Grade.type == "libre"
    ).delete(synchronize_session=False)

    for index, score in enumerate(grades):
        if score is None:
            continue
        db.add(
            Grade(
                subject_id=payload.subject_id,
                type="libre",
                session=0,
                score=score,
                order_number=index + 1,
            )
        )

    db.commit()
    return {"message": "Notes libres sauvegardées avec succès", "count": len(grades)}
