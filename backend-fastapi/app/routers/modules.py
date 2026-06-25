"""Routes des modules — équivalent de CourseModuleController.

  POST /modules/add            créer (order_number auto)
  POST /modules/update         modifier (name et/ou credits)
  POST /modules/delete         supprimer (+ réordonne les suivants)
  POST /modules/change-order   changer l'ordre (swap)
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.deps import get_current_user
from app.models import CourseModule, Semester, User
from app.routers._helpers import (
    apply_change_order,
    get_or_404,
    next_order_number,
    reorder_after_delete,
)
from app.schemas import ChangeOrderIn, IdIn, ModuleAddIn, ModuleModIn, ModuleOut

router = APIRouter(tags=["modules"])


@router.post("/modules/add", status_code=201)
def add_module(
    payload: ModuleAddIn,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_or_404(db, Semester, payload.semester_id, "Semestre")
    module = CourseModule(
        semester_id=payload.semester_id,
        name=payload.name,
        credits=payload.credits,
        order_number=next_order_number(db, CourseModule, "semester_id", payload.semester_id),
    )
    db.add(module)
    db.commit()
    return {"message": "Module ajouté avec succès", "data": ModuleOut.model_validate(module)}


@router.post("/modules/update")
def mod_module(
    payload: ModuleModIn,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    module = get_or_404(db, CourseModule, payload.id, "Module")
    # Mise à jour partielle : seuls les champs réellement fournis sont modifiés
    fields = payload.model_dump(exclude_unset=True, exclude={"id"})
    for key, value in fields.items():
        setattr(module, key, value)
    db.commit()
    return {"message": "Module modifié avec succès", "data": ModuleOut.model_validate(module)}


@router.post("/modules/delete")
def delete_module(
    payload: IdIn,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    module = get_or_404(db, CourseModule, payload.id, "Module")
    parent_id, deleted_order = module.semester_id, module.order_number
    db.delete(module)
    reorder_after_delete(db, CourseModule, "semester_id", parent_id, deleted_order)
    db.commit()
    return {"message": "Module supprimé avec succès"}


@router.post("/modules/change-order")
def change_module_order(
    payload: ChangeOrderIn,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    module = get_or_404(db, CourseModule, payload.id, "Module")
    changed = apply_change_order(db, CourseModule, module, "semester_id", payload.order_number)
    if not changed:
        return {"message": "Aucun changement"}
    db.commit()
    return {"message": "Ordre du module modifié avec succès", "data": ModuleOut.model_validate(module)}
