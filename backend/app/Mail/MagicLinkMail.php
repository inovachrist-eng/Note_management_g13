<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class MagicLinkMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $magicUrl,
        public readonly string $userName,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Votre lien de connexion — LMD Académie');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.magic-link');
    }

    public function attachments(): array
    {
        return [];
    }
}
