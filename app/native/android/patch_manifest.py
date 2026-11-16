"""Ajustes del AndroidManifest después de 'npx cap add android'."""
import re, sys
p = sys.argv[1]
s = open(p, encoding="utf-8").read()
# Solo vertical, igual que en iPhone
if 'android:screenOrientation' not in s:
    s = s.replace('<activity', '<activity\n            android:screenOrientation="portrait"', 1)
# Compras de Google Play (RevenueCat)
if 'com.android.vending.BILLING' not in s:
    s = s.replace('<application', '<uses-permission android:name="com.android.vending.BILLING" />\n\n    <application', 1)
# Android 15: Play marca error si hay un receptor de BOOT_COMPLETED (el de recordatorios lo trae
# @capacitor/local-notifications). Lo sacamos: los recordatorios se vuelven a programar al abrir la app.
if 'xmlns:tools' not in s:
    s = s.replace('<manifest xmlns:android="http://schemas.android.com/apk/res/android"', '<manifest xmlns:android="http://schemas.android.com/apk/res/android"\n    xmlns:tools="http://schemas.android.com/tools"', 1)
if 'LocalNotificationRestoreReceiver' not in s:
    s = s.replace('</application>', '    <receiver android:name="com.capacitorjs.plugins.localnotifications.LocalNotificationRestoreReceiver" tools:node="remove" />\n    </application>', 1)
    s = s.replace('<application', '<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" tools:node="remove" />\n\n    <application', 1)
if 'MediaNotificationService' not in s:
    s = s.replace('</application>', '    <service android:name="com.google.android.gms.cast.framework.media.MediaNotificationService" tools:node="remove" />\n    </application>', 1)
open(p, "w", encoding="utf-8").write(s)
print("manifest ok")
