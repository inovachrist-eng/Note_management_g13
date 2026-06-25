"""Routes des matières — équivalent de SubjectController.

  POST /subjects/add            créer (order_number auto)
  POST /subjects/update         modifier
  POST /subjects/delete         supprimer (+ réordonne les suivantes)
  POST /subjects/change-order   changer l'ordre (swap)
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.deps import get_current_user
from app.models import CourseModule, Subject, User
from app.routers._helpers import (
    apply_change_order,
    get_or_404,
    next_order_number,
    reorder_after_delete,
)
from app.schemas import ChangeOrderIn, IdIn, SubjectAddIn, SubjectModIn, SubjectOut

router = APIRouter(tags=["subjects"])


@router.post("/subjects/add", status_code=201)
def add_subject(
    payload: SubjectAddIn,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_or_404(db, CourseModule, payload.module_id, "Module")
    subject = Subject(
        module_id=payload.module_id,
        name=payload.name,
        order_number=next_order_number(db, Subject, "module_id", payload.module_id),
    )
    db.add(subject)
    db.commit()
    return {"message": "Matière ajoutée avec succès", "data": SubjectOut.model_validate(subject)}


@router.post("/subjects/update")
def mod_subject(
    payload: SubjectModIn,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    subject = get_or_404(db, Subject, payload.id, "Matière")
    subject.name = payload.name
    db.commit()
    return {"message": "Matière modifiée avec succès", "data": SubjectOut.model_validate(subject)}


@router.post("/subjects/delete")
def delete_subject(
    payload: IdIn,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    subject = get_or_404(db, Subject, payload.id, "Matière")
    parent_id, deleted_order = subject.module_id, subject.order_number
    db.delete(subject)
    reorder_after_delete(db, Subject, "module_id", parent_id, deleted_order)
    db.commit()
    return {"message": "Matière supprimée avec succès"}


@router.post("/subjects/change-order")
def change_subject_order(
    payload: ChangeOrderIn,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    subject = get_or_404(db, Subject, payload.id, "Matière")
    changed = apply_change_order(db, Subject, subject, "module_id", payload.order_number)
    if not changed:
        return {"message": "Aucun changement"}
    db.commit()
    return {"message": "Ordre de la matière modifié avec succès", "data": SubjectOut.model_validate(subject)}
