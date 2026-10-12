package app.dmith.fondo;

import android.content.Intent;
import android.os.Build;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

// mostrar({ titulo, autor, sonando }) -> prende o actualiza la notificación del reproductor
// quitar() -> la saca (cuando se cierra el reproductor o pasa mucho rato en pausa)
// Evento "accion": { accion: "play" | "pause" | "atras" | "adelante" } desde la notificación o los auriculares
@CapacitorPlugin(name = "Fondo")
public class FondoPlugin extends Plugin {

    static FondoPlugin activo;

    @Override
    public void load() { activo = this; }

    void avisar(String accion) {
        JSObject d = new JSObject();
        d.put("accion", accion);
        notifyListeners("accion", d);
    }

    @PluginMethod
    public void mostrar(PluginCall call) {
        Intent i = new Intent(getContext(), ServicioAudio.class);
        i.putExtra("titulo", call.getString("titulo", ""));
        i.putExtra("autor", call.getString("autor", ""));
        i.putExtra("sonando", Boolean.TRUE.equals(call.getBoolean("sonando", true)));
        try {
            if (Build.VERSION.SDK_INT >= 26) getContext().startForegroundService(i);
            else getContext().startService(i);
            call.resolve();
        } catch (Exception e) {
            // Android no deja arrancarlo si la app ya está en segundo plano: no es grave, se intenta en la próxima
            call.reject(e.getMessage());
        }
    }

    @PluginMethod
    public void quitar(PluginCall call) {
        getContext().stopService(new Intent(getContext(), ServicioAudio.class));
        call.resolve();
    }
}
