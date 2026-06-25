"""Envoi du lien magique — équivalent de Mail::to(...)->send(new MagicLinkMail(...)).

Deux modes (réglés par MAIL_MAILER dans .env) :
  - "log"  : le lien est affiché dans la console du serveur (idéal en développement,
             comme le mailer "log" de Laravel). Aucun serveur SMTP requis.
  - "smtp" : envoi réel via smtplib vers le serveur configuré.
"""

import logging
import smtplib
from email.message import EmailMessage

from app.core.config import settings

logger = logging.getLogger("mailer")


def _build_message(to_email: str, full_name: str, magic_url: str) -> EmailMessage:
    msg = EmailMessage()
    msg["Subject"] = "Votre lien de connexion"
    msg["From"] = f"{settings.mail_from_name} <{settings.mail_from}>"
    msg["To"] = to_email
    msg.set_content(
        f"Bonjour {full_name},\n\n"
        f"Cliquez sur ce lien pour vous connecter (valable "
        f"{settings.magic_link_ttl_minutes} minutes) :\n\n{magic_url}\n\n"
        f"Si vous n'êtes pas à l'origine de cette demande, ignorez cet email."
    )
    return msg


def send_magic_link(to_email: str, full_name: str, magic_url: str) -> None:
    if settings.mail_mailer == "smtp":
        msg = _build_message(to_email, full_name, magic_url)
        with smtplib.SMTP(settings.mail_host, settings.mail_port) as server:
            if settings.mail_username and settings.mail_password:
                server.starttls()
                server.login(settings.mail_username, settings.mail_password)
            server.send_message(msg)
        logger.info("Lien magique envoyé par SMTP à %s", to_email)
        return

    # Mode "log" : on affiche le lien dans la console
    logger.info(
        "\n"
        "┌─────────────────────────────────────────────────────────────\n"
        "│  ✉️  LIEN MAGIQUE (mode log — aucun email réel envoyé)\n"
        "│  Pour : %s <%s>\n"
        "│  Lien : %s\n"
        "└─────────────────────────────────────────────────────────────",
        full_name,
        to_email,
        magic_url,
    )
