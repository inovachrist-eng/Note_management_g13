"""Erreur applicative renvoyée au format de Laravel : {"message": ..., "errors": {...}}.

Le frontend React lit `err.response.data.message` puis `err.response.data.errors.<champ>[0]`,
on conserve donc exactement ce contrat.
"""


class ApiError(Exception):
    def __init__(self, status_code: int, message: str, errors: dict | None = None):
        self.status_code = status_code
        self.message = message
        self.errors = errors
        super().__init__(message)
