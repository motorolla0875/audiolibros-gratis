# Reglas de R8 para la app (ofuscación pedida por Google Play).
# Se ofuscan las librerías grandes; se dejan intactos los plugins que usan reflexión o el puente con la web.
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod,Exceptions,SourceFile,LineNumberTable
-keepclassmembers class * { @android.webkit.JavascriptInterface <methods>; }
-keep class com.getcapacitor.** { *; }
-keep class com.capacitorjs.** { *; }
-keep class com.tbachir.** { *; }
-keep class app.dmith.** { *; }
-keep class de.kisimedia.** { *; }
-keep class com.revenuecat.** { *; }
-keep class com.unity3d.** { *; }
-keep class com.dmithbuilds.** { *; }
-keep class * implements com.google.android.gms.cast.framework.OptionsProvider { *; }
-dontwarn **
