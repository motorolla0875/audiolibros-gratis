package app.dmith.unityads;

import android.app.Activity;
import android.content.pm.ApplicationInfo;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.unity3d.ads.IUnityAdsInitializationListener;
import com.unity3d.ads.IUnityAdsLoadListener;
import com.unity3d.ads.IUnityAdsShowListener;
import com.unity3d.ads.UnityAds;
import com.unity3d.ads.UnityAdsShowOptions;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

// Anuncios de Unity Ads (misma interfaz que en iPhone).
// initialize({ gameId, testMode? }), preload({ placementId }), show({ placementId, rewarded }) -> { shown, completed, rewarded }
@CapacitorPlugin(name = "UnityAds")
public class UnityAdsPlugin extends Plugin {

    private boolean iniciado = false;
    private boolean prueba = false;
    private final List<PluginCall> iniciando = new ArrayList<>();
    private final Set<String> cargados = new HashSet<>();

    private boolean esDebug() {
        return (getContext().getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0;
    }

    // En Android, "de prueba" = compilación debug (las de Play Store no lo son).
    @PluginMethod
    public void entorno(PluginCall call) {
        JSObject r = new JSObject(); r.put("testFlight", esDebug()); call.resolve(r);
    }

    @PluginMethod
    public void initialize(PluginCall call) {
        String gameId = call.getString("gameId");
        if (gameId == null || gameId.isEmpty()) { call.reject("Falta gameId"); return; }
        prueba = Boolean.TRUE.equals(call.getBoolean("testMode", false)) || esDebug();
        if (iniciado) { JSObject r = new JSObject(); r.put("testMode", prueba); call.resolve(r); return; }
        call.setKeepAlive(true);
        iniciando.add(call);
        if (iniciando.size() > 1) return;
        UnityAds.initialize(getContext().getApplicationContext(), gameId, prueba, new IUnityAdsInitializationListener() {
            @Override public void onInitializationComplete() {
                iniciado = true;
                JSObject r = new JSObject(); r.put("testMode", prueba);
                for (PluginCall c : iniciando) { c.setKeepAlive(false); c.resolve(r); }
                iniciando.clear();
            }
            @Override public void onInitializationFailed(UnityAds.UnityAdsInitializationError error, String message) {
                for (PluginCall c : iniciando) { c.setKeepAlive(false); c.reject(message); }
                iniciando.clear();
            }
        });
    }

    private interface Listo { void fin(boolean ok, String msg); }

    private void cargar(String id, Listo listo) {
        if (cargados.contains(id)) { listo.fin(true, null); return; }
        if (!iniciado) { listo.fin(false, "Unity Ads no está iniciado"); return; }
        UnityAds.load(id, new IUnityAdsLoadListener() {
            @Override public void onUnityAdsAdLoaded(String placementId) { cargados.add(placementId); listo.fin(true, null); }
            @Override public void onUnityAdsFailedToLoad(String placementId, UnityAds.UnityAdsLoadError error, String message) { listo.fin(false, message); }
        });
    }

    @PluginMethod
    public void preload(PluginCall call) {
        String id = call.getString("placementId");
        if (id == null) { call.reject("Falta placementId"); return; }
        cargar(id, (ok, msg) -> { if (ok) call.resolve(); else call.reject(msg != null ? msg : "No se pudo cargar"); });
    }

    private static JSObject res(boolean shown, boolean completed, boolean rewarded) {
        JSObject r = new JSObject();
        r.put("shown", shown); r.put("completed", completed); r.put("rewarded", rewarded);
        return r;
    }

    @PluginMethod
    public void show(PluginCall call) {
        String id = call.getString("placementId");
        boolean premio = Boolean.TRUE.equals(call.getBoolean("rewarded", false));
        if (id == null) { call.reject("Falta placementId"); return; }
        cargar(id, (ok, msg) -> {
            Activity act = getActivity();
            if (!ok || act == null) { call.resolve(res(false, false, false)); return; }
            cargados.remove(id);
            act.runOnUiThread(() -> UnityAds.show(act, id, new UnityAdsShowOptions(), new IUnityAdsShowListener() {
                private boolean listo = false, empezo = false;
                private void terminar(JSObject r) {
                    if (listo) return; listo = true;
                    call.resolve(r);
                    cargar(id, (a, b) -> {});   // deja el siguiente listo
                }
                @Override public void onUnityAdsShowFailure(String placementId, UnityAds.UnityAdsShowError error, String message) { terminar(res(empezo, false, false)); }
                @Override public void onUnityAdsShowStart(String placementId) { empezo = true; }
                @Override public void onUnityAdsShowClick(String placementId) {}
                @Override public void onUnityAdsShowComplete(String placementId, UnityAds.UnityAdsShowCompletionState state) {
                    boolean completo = state == UnityAds.UnityAdsShowCompletionState.COMPLETED;
                    terminar(res(true, completo, premio && completo));
                }
            }));
        });
    }
}
