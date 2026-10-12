package app.dmith.fondo;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.IBinder;
import android.support.v4.media.MediaMetadataCompat;
import android.support.v4.media.session.MediaSessionCompat;
import android.support.v4.media.session.PlaybackStateCompat;
import androidx.core.app.NotificationCompat;

// Servicio "en primer plano" de reproducción: mientras está activo Android no corta el audio
// con la pantalla apagada. Muestra la notificación con atrás 15 s / play-pausa / adelante 30 s.
public class ServicioAudio extends Service {

    private static final String CANAL = "reproductor";
    private static final int ID = 7101;
    private MediaSessionCompat sesion;

    @Override
    public IBinder onBind(Intent intent) { return null; }

    @Override
    public void onCreate() {
        super.onCreate();
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationChannel c = new NotificationChannel(CANAL, "Reproductor", NotificationManager.IMPORTANCE_LOW);
            c.setShowBadge(false);
            ((NotificationManager) getSystemService(NOTIFICATION_SERVICE)).createNotificationChannel(c);
        }
        sesion = new MediaSessionCompat(this, "Audiolibros");
        sesion.setCallback(new MediaSessionCompat.Callback() {
            @Override public void onPlay() { avisar("play"); }
            @Override public void onPause() { avisar("pause"); }
            @Override public void onRewind() { avisar("atras"); }
            @Override public void onFastForward() { avisar("adelante"); }
            @Override public void onSkipToPrevious() { avisar("atras"); }
            @Override public void onSkipToNext() { avisar("adelante"); }
        });
        sesion.setActive(true);
    }

    private void avisar(String a) {
        FondoPlugin p = FondoPlugin.activo;
        if (p != null) p.avisar(a);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        String accion = intent != null ? intent.getStringExtra("accion") : null;
        if (accion != null) { avisar(accion); return START_NOT_STICKY; }

        String titulo = intent != null ? intent.getStringExtra("titulo") : "";
        String autor = intent != null ? intent.getStringExtra("autor") : "";
        boolean sonando = intent == null || intent.getBooleanExtra("sonando", true);

        sesion.setMetadata(new MediaMetadataCompat.Builder()
            .putString(MediaMetadataCompat.METADATA_KEY_TITLE, titulo)
            .putString(MediaMetadataCompat.METADATA_KEY_ARTIST, autor)
            .build());
        sesion.setPlaybackState(new PlaybackStateCompat.Builder()
            .setActions(PlaybackStateCompat.ACTION_PLAY | PlaybackStateCompat.ACTION_PAUSE | PlaybackStateCompat.ACTION_PLAY_PAUSE
                | PlaybackStateCompat.ACTION_REWIND | PlaybackStateCompat.ACTION_FAST_FORWARD
                | PlaybackStateCompat.ACTION_SKIP_TO_PREVIOUS | PlaybackStateCompat.ACTION_SKIP_TO_NEXT)
            .setState(sonando ? PlaybackStateCompat.STATE_PLAYING : PlaybackStateCompat.STATE_PAUSED, PlaybackStateCompat.PLAYBACK_POSITION_UNKNOWN, 1f)
            .build());

        Notification n = armar(titulo, autor, sonando);
        if (Build.VERSION.SDK_INT >= 29) startForeground(ID, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
        else startForeground(ID, n);
        return START_NOT_STICKY;
    }

    private PendingIntent boton(String accion, int req) {
        Intent i = new Intent(this, ServicioAudio.class).putExtra("accion", accion);
        return PendingIntent.getService(this, req, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    private Notification armar(String titulo, String autor, boolean sonando) {
        Intent abrir = getPackageManager().getLaunchIntentForPackage(getPackageName());
        PendingIntent alTocar = abrir == null ? null
            : PendingIntent.getActivity(this, 0, abrir, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        return new NotificationCompat.Builder(this, CANAL)
            .setSmallIcon(android.R.drawable.ic_media_play)
            .setContentTitle(titulo)
            .setContentText(autor)
            .setContentIntent(alTocar)
            .setOngoing(sonando)
            .setShowWhen(false)
            .setOnlyAlertOnce(true)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .addAction(android.R.drawable.ic_media_rew, "-15", boton("atras", 1))
            .addAction(sonando ? android.R.drawable.ic_media_pause : android.R.drawable.ic_media_play,
                sonando ? "Pausa" : "Play", boton(sonando ? "pause" : "play", 2))
            .addAction(android.R.drawable.ic_media_ff, "+30", boton("adelante", 3))
            .setStyle(new androidx.media.app.NotificationCompat.MediaStyle()
                .setMediaSession(sesion.getSessionToken())
                .setShowActionsInCompactView(0, 1, 2))
            .build();
    }

    @Override
    public void onTaskRemoved(Intent rootIntent) {
        // Si cierran la app deslizándola, se corta el audio y se va la notificación
        stopSelf();
        super.onTaskRemoved(rootIntent);
    }

    @Override
    public void onDestroy() {
        if (sesion != null) { sesion.setActive(false); sesion.release(); }
        super.onDestroy();
    }
}
