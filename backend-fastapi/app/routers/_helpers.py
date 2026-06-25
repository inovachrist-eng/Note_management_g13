"""Fonctions utilitaires partagées par les routers (recherche + gestion de l'ordre).

Reproduit la logique de réordonnancement des controllers Laravel :
- auto-incrément de `order_number` à la création,
- décalage des éléments suivants après une suppression,
- échange propre (swap) lors d'un changement d'ordre.
"""

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.errors import ApiError


def get_or_404(db: Session, model, obj_id: int, label: str):
    """Équivalent de findOrFail() : renvoie l'objet ou lève une 404."""
    obj = db.get(model, obj_id)
    if obj is None:
        raise ApiError(404, f"{label} introuvable")
    return obj


def next_order_number(db: Session, model, parent_field: str, parent_value: int) -> int:
    """max(order_number) + 1 pour ce parent (auto-incrément), comme en Laravel."""
    current_max = (
        db.query(func.max(model.order_number))
        .filter(getattr(model, parent_field) == parent_value)
        .scalar()
    )
    return (current_max or 0) + 1


def reorder_after_delete(db: Session, model, parent_field, parent_value, deleted_order):
    """Décrémente l'ordre des éléments situés après celui qui vient d'être supprimé."""
    (
        db.query(model)
        .filter(
            getattr(model, parent_field) == parent_value,
            model.order_number > deleted_order,
        )
        .update(
            {model.order_number: model.order_number - 1},
            synchronize_session=False,
        )
    )


def apply_change_order(db: Session, model, obj, parent_field: str, new_order: int) -> bool:
    """Déplace `obj` à `new_order` en décalant les autres. Renvoie False si aucun changement."""
    old_order = obj.order_number
    if old_order == new_order:
        return False

    parent_value = getattr(obj, parent_field)

    if new_order < old_order:
        # Montée : les éléments entre new_order et old_order-1 descendent d'un cran
        (
            db.query(model)
            .filter(
                getattr(model, parent_field) == parent_value,
                model.order_number >= new_order,
                model.order_number <= old_order - 1,
            )
            .update({model.order_number: model.order_number + 1}, synchronize_session=False)
        )
    else:
        # Descente : les éléments entre old_order+1 et new_order montent d'un cran
        (
            db.query(model)
            .filter(
                getattr(model, parent_field) == parent_value,
                model.order_number >= old_order + 1,
                model.order_number <= new_order,
            )
            .update({model.order_number: model.order_number - 1}, synchronize_session=False)
        )

    obj.order_number = new_order
    return True
