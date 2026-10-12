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
open(p, "w", encoding="utf-8").write(s)
print("manifest ok")
