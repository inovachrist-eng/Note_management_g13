<!DOCTYPE html>
<html lang="fr" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Votre lien de connexion</title>

  {{-- Tailwind CSS injecté par CDN (rendu navigateur uniquement : ignoré par les clients mail) --}}
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: { sans: ['Segoe UI', 'Arial', 'sans-serif'] },
          boxShadow: { brand: '0 4px 12px rgba(22,163,74,0.30)' },
        },
      },
    };
  </script>

  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset email-safe (conservé : nécessaire hors navigateur) */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #eef2f1; }
    .btn-link:hover { background-color: #15803d !important; }
    @media screen and (max-width: 600px) {
      .card-pad { padding: 32px 24px !important; }
      .h1 { font-size: 22px !important; }
    }
    @media (prefers-color-scheme: dark) {
      body, .bg { background-color: #0f172a !important; }
      .card { background-color: #1e293b !important; border-color: #334155 !important; }
      .h1, .logo-text { color: #f8fafc !important; }
      .text { color: #cbd5e1 !important; }
      .muted { color: #94a3b8 !important; }
      .url-box { background-color: #0f172a !important; border-color: #334155 !important; }
      .url { color: #94a3b8 !important; }
      .divider { border-color: #334155 !important; }
    }
  </style>
</head>
<body class="m-0 p-0 w-full bg-[#eef2f1]" style="margin:0; padding:0; background-color:#eef2f1;">
  <!-- Preheader (texte d'aperçu masqué) -->
  <div class="hidden max-h-0 overflow-hidden opacity-0" style="display:none; max-height:0; overflow:hidden; opacity:0; mso-hide:all;">
    Votre lien de connexion sécurisé Groupe 13 — valable 15 minutes.
  </div>

  <table role="presentation" class="bg w-full bg-[#eef2f1]" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#eef2f1;">
    <tr>
      <td align="center" class="py-10 px-4" style="padding:40px 16px;">

        <!-- Conteneur -->
        <table role="presentation" class="w-full max-w-[540px]" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:540px; width:100%;">

          <!-- Bandeau dégradé -->
          <tr>
            <td class="bg-gradient-to-br from-green-600 to-teal-700 rounded-t-2xl py-9 px-10" style="background:linear-gradient(135deg,#16a34a 0%,#0f766e 100%); background-color:#16a34a; border-radius:16px 16px 0 0; padding:36px 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="w-12 h-12 rounded-xl bg-white/20 text-center align-middle text-white text-[22px] font-bold" style="background-color:rgba(255,255,255,0.18); border-radius:12px; width:48px; height:48px; text-align:center; vertical-align:middle; font-family:'Segoe UI',Arial,sans-serif; font-size:22px; font-weight:700; color:#ffffff;">
                    13
                  </td>
                  <td class="logo-text pl-3.5 text-white text-lg font-semibold tracking-tight" style="padding-left:14px; font-family:'Segoe UI',Arial,sans-serif; font-size:18px; font-weight:600; color:#ffffff; letter-spacing:0.2px;">
                    Groupe 13
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Carte principale -->
          <tr>
            <td class="card card-pad bg-white border border-t-0 border-gray-200 rounded-b-2xl p-10" style="background-color:#ffffff; border:1px solid #e5e7eb; border-top:0; border-radius:0 0 16px 16px; padding:40px;">

              <!-- Icône / badge -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" class="mb-6" style="margin-bottom:24px;">
                <tr>
                </tr>
              </table>

              <h1 class="h1 m-0 mb-3 text-2xl font-bold text-gray-900 leading-tight" style="margin:0 0 12px; font-family:'Segoe UI',Arial,sans-serif; font-size:24px; font-weight:700; color:#111827; line-height:1.3;">
                Bonjour {{ $userName }},
              </h1>

              <p class="text m-0 mb-7 text-[15px] text-gray-600 leading-[1.7]" style="margin:0 0 28px; font-family:'Segoe UI',Arial,sans-serif; font-size:15px; color:#4b5563; line-height:1.7;">
                Vous avez demandé un lien de connexion sécurisé, sans mot de passe.
                Cliquez sur le bouton ci-dessous pour accéder à votre espace.
              </p>

              <!-- Bouton bulletproof -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" class="mb-2" style="margin:0 0 8px;">
                <tr>
                  <td align="center" bgcolor="#16a34a" class="rounded-[10px]" style="border-radius:10px;">
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="{{ $magicUrl }}" style="height:48px;v-text-anchor:middle;width:240px;" arcsize="20%" stroke="f" fillcolor="#16a34a">
                    <w:anchorlock/>
                    <center style="color:#ffffff;font-family:'Segoe UI',Arial,sans-serif;font-size:15px;font-weight:600;">Se connecter →</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href="{{ $magicUrl }}" class="btn-link inline-block bg-green-600 hover:bg-green-700 text-white no-underline text-[15px] font-semibold py-3.5 px-9 rounded-[10px] shadow-brand" style="display:inline-block; background-color:#16a34a; color:#ffffff; text-decoration:none; font-family:'Segoe UI',Arial,sans-serif; font-size:15px; font-weight:600; padding:14px 36px; border-radius:10px; box-shadow:0 4px 12px rgba(22,163,74,0.30);">
                      Se connecter&nbsp;&rarr;
                    </a>
                    <!--<![endif]-->
                  </td>
                </tr>
              </table>

              <!-- Note d'expiration -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" class="mt-6" style="margin:24px 0 0;">
                <tr>
                  <td class="muted text-[13px] text-gray-500 leading-snug" style="font-family:'Segoe UI',Arial,sans-serif; font-size:13px; color:#6b7280; line-height:1.5;">
                    &nbsp; Ce lien est valable <strong class="text-green-600" style="color:#16a34a;">15&nbsp;minutes</strong> et ne peut être utilisé qu'une seule fois.
                  </td>
                </tr>
              </table>

              <!-- Séparateur -->
              <hr class="divider border-0 border-t border-slate-100 my-7" style="border:0; border-top:1px solid #f1f5f9; margin:28px 0;">

              <!-- URL de secours -->
              <p class="muted m-0 mb-2.5 text-xs text-gray-400 leading-relaxed" style="margin:0 0 10px; font-family:'Segoe UI',Arial,sans-serif; font-size:12px; color:#9ca3af; line-height:1.6;">
                Le bouton ne fonctionne pas ? Copiez ce lien dans votre navigateur :
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="url-box bg-slate-50 border border-gray-200 rounded-lg py-3 px-3.5" style="background-color:#f8fafc; border:1px solid #e5e7eb; border-radius:8px; padding:12px 14px;">
                    <a href="{{ $magicUrl }}" class="url break-all font-mono text-xs text-green-600 no-underline" style="word-break:break-all; font-family:'Courier New',monospace; font-size:12px; color:#16a34a; text-decoration:none;">{{ $magicUrl }}</a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Pied de page -->
          <tr>
            <td class="py-7 px-6 text-center" style="padding:28px 24px; text-align:center;">
              <p class="muted m-0 mb-1.5 text-xs text-gray-400 leading-relaxed" style="margin:0 0 6px; font-family:'Segoe UI',Arial,sans-serif; font-size:12px; color:#9ca3af; line-height:1.6;">
                Si vous n'avez pas demandé ce lien, vous pouvez ignorer cet email en toute sécurité.
              </p>
              <p class="muted m-0 text-xs text-slate-300" style="margin:0; font-family:'Segoe UI',Arial,sans-serif; font-size:12px; color:#cbd5e1;">
                © {{ date('Y') }} Groupe 13 · Tous droits réservés
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>
