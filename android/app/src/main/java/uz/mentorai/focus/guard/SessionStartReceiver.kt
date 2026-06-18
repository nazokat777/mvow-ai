package uz.mentorai.focus.guard

import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.PowerManager
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import dagger.hilt.android.AndroidEntryPoint
import uz.mentorai.focus.MentorApplication
import uz.mentorai.focus.R
import uz.mentorai.focus.ui.session.SessionStartActivity

/**
 * AlarmManager tomonidan triggerlanadi.
 *
 * Android 10+ fondan to'g'ridan-to'g'ri Activity ochishni taqiqlaydi, shuning uchun
 * SessionStartActivity'ni qo'lda startActivity() bilan ochmaymiz — uning o'rniga
 * full-screen-intent notifikatsiya post qilamiz. Tizimning o'zi qulflangan ekran
 * ustida full-screen UI'ni ko'taradi (telefon yonadi, sessiya ekrani chiqadi).
 */
@AndroidEntryPoint
class SessionStartReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent?) {
        val sessionId = intent?.getStringExtra(EXTRA_SESSION_ID) ?: return

        // 1. WakeLock — ekranni qisqa muddatga yoqib turamiz (full-screen-intent ko'tarilguncha).
        val pm = context.getSystemService(Context.POWER_SERVICE) as PowerManager
        @Suppress("DEPRECATION")
        val wakeLock = pm.newWakeLock(
            PowerManager.FULL_WAKE_LOCK or
            PowerManager.ACQUIRE_CAUSES_WAKEUP or
            PowerManager.ON_AFTER_RELEASE,
            "Mentor:SessionStart"
        )
        wakeLock.acquire(10_000L)  // Maksimum 10 soniya

        // 2. Full-screen-intent — tizim qulflangan ekran ustida Activity'ni o'zi ko'taradi.
        val activityIntent = Intent(context, SessionStartActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or
                    Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra(SessionStartActivity.EXTRA_SESSION_ID, sessionId)
        }
        val fullScreenPi = PendingIntent.getActivity(
            context,
            sessionId.hashCode(),
            activityIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, MentorApplication.CHANNEL_ALARM)
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setContentTitle(context.getString(R.string.wake_notif_title))
            .setContentText(context.getString(R.string.wake_notif_text))
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setFullScreenIntent(fullScreenPi, true)   // <-- kalit: lock-screen ustida UI ko'taradi
            .setOngoing(true)
            .setAutoCancel(true)
            .build()

        try {
            NotificationManagerCompat.from(context).notify(NOTIF_ID_WAKE, notification)
        } catch (_: SecurityException) {
            // POST_NOTIFICATIONS ruxsati yo'q — bu holatda hech narsa qila olmaymiz.
        }

        // 3. WakeLock'ni release qilamiz — keyingisini tizim/Activity boshqaradi.
        try { wakeLock.release() } catch (_: Exception) {}
    }

    companion object {
        const val EXTRA_SESSION_ID = "session_id"
        const val NOTIF_ID_WAKE = 9200
    }
}
