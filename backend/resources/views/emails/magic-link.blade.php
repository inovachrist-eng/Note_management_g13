<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Votre lien de connexion</title>
  <style>
    body { margin: 0; padding: 0; background: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .wrapper { max-width: 520px; margin: 40px auto; padding: 0 20px; }
    .card { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 40px; }
    .logo { display: flex; align-items: center; gap: 10px; margin-bottom: 32px; }
    .logo-icon { width: 36px; height: 36px; background: #16a34a; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 16px; line-height: 36px; text-align: center; }
    .logo-text { font-size: 16px; font-weight: 600; color: #111827; }
    h1 { font-size: 20px; font-weight: 600; color: #111827; margin: 0 0 8px; }
    p { font-size: 14px; color: #6b7280; line-height: 1.6; margin: 0 0 24px; }
    .btn { display: inline-block; background: #16a34a; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 8px; }
    .hint { font-size: 12px; color: #9ca3af; margin-top: 28px; padding-top: 20px; border-top: 1px solid #f3f4f6; }
    .url { word-break: break-all; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="logo">
        <div class="logo-icon">L</div>
        <span class="logo-text">LMD Académie</span>
      </div>

      <h1>Bonjour {{ $userName }},</h1>
      <p>Vous avez demandé un lien de connexion sans mot de passe. Cliquez sur le bouton ci-dessous pour vous connecter. Ce lien est valable <strong>15 minutes</strong>.</p>

      <a href="{{ $magicUrl }}" class="btn">Se connecter →</a>

      <p class="hint">
        Si vous n'avez pas demandé ce lien, ignorez cet email.<br><br>
        Ou copiez cette URL dans votre navigateur :<br>
        <span class="url">{{ $magicUrl }}</span>
      </p>
    </div>
  </div>
</body>
</html>
