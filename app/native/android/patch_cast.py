"""Chromecast: sin la notificación propia de Cast (MediaNotificationService).
Google Play marca error en Android 15 porque ese servicio en primer plano puede arrancar desde el encendido.
Los controles de reproducción ya los da la notificación de la app (plugin fondo)."""
import sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
if "CastMediaOptions" not in s:
    s = s.replace("import com.google.android.gms.cast.framework.CastOptions;",
                  "import com.google.android.gms.cast.framework.CastOptions;\nimport com.google.android.gms.cast.framework.media.CastMediaOptions;", 1)
    s = s.replace(".build();\n        return castOptions;",
                  ".setCastMediaOptions(new CastMediaOptions.Builder().setNotificationOptions(null).setMediaSessionEnabled(false).build())\n            .build();\n        return castOptions;", 1)
assert "setNotificationOptions(null)" in s, "no se pudo parchear CastOptionsProvider"
open(p, "w", encoding="utf-8").write(s)
print("cast ok")
