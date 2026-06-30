package uz.mentorai.focus.guard

import android.app.PendingIntent
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import androidx.core.app.ServiceCompat
import androidx.lifecycle.LifecycleService
import androidx.lifecycle.lifecycleScope
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import uz.mentorai.focus.MainActivity
import uz.mentorai.focus.MentorApplication
import uz.mentorai.focus.R
import uz.mentorai.focus.data.session.SessionEntity
import uz.mentorai.focus.data.session.SessionRepository
import uz.mentorai.focus.guard.policy.PolicyEngine
import javax.inject.Inject

/**
 * Sessiya davomida hayotda qoluvchi foreground service.
 * - Lock screen'da live timer notification
 * - Timer tugaganda sessiyani avtomatik COMPLETED qiladi (streak'ga sanaladi)
 * - AccessibilityService bilan PolicyEngine orqali maʼlumot almashadi
 */
@AndroidEntryPoint
class FocusGuardService : LifecycleService() {

    @Inject lateinit var sessionRepository: SessionRepository
    @Inject lateinit var policyEngine: PolicyEngine

    private var autoEndJob: Job? = null

    override fun onCreate() {
        super.onCreate()
        startInForeground(initialNotification())

        lifecycleScope.launch {
            sessionRepository.activeSession.collectLatest { session ->
                if (session == null) {
                    autoEndJob?.cancel()
                    uz.mentorai.focus.widget.FocusWidgetProvider.clear(this@FocusGuardService)
                    stopSelf()
                } else {
                    uz.mentorai.focus.widget.FocusWidgetProvider.setActive(
                        this@FocusGuardService, session.plannedEndAtMillis, session.title
                    )
                    updateNotification(session)
                    scheduleAutoEnd(session)
                }
            }
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        super.onStartCommand(intent, flags, startId)

        if (intent?.action == ACTION_END_SESSION) {
            lifecycleScope.launch {
                sessionRepository.endActiveSession(SessionEntity.REASON_USER)
            }
        }
        return START_NOT_STICKY
    }

    override fun onBind(intent: Intent): IBinder? {
        super.onBind(intent)
        return null
    }

    private fun scheduleAutoEnd(session: SessionEntity) {
        autoEndJob?.cancel()
        val now = System.currentTimeMillis()
        val remaining = (session.plannedEndAtMillis - now).coerceAtLeast(0L)

        autoEndJob = lifecycleScope.launch {
            delay(remaining)
            // Vaqt tugadi — completed sifatida tugatamiz
            sessionRepository.endActiveSession(SessionEntity.REASON_TIMER)
        }
    }

    private fun startInForeground(notification: android.app.Notification) {
        val type = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE
        } else {
            0
        }
        ServiceCompat.startForeground(this, NOTIF_ID, notification, type)
    }

    private fun updateNotification(session: SessionEntity) {
        val nm = androidx.core.app.NotificationManagerCompat.from(this)
        nm.notify(NOTIF_ID, buildTimerNotification(session))
    }

    private fun initialNotification(): android.app.Notification =
        NotificationCompat.Builder(this, MentorApplication.CHANNEL_GUARD)
            .setSmallIcon(android.R.drawable.ic_lock_idle_lock)
            .setContentTitle(getString(R.string.app_name))
            .setContentText("Mentor faol")
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .build()

    private fun buildTimerNotification(session: SessionEntity): android.app.Notification {
        val openAppPi = PendingIntent.getActivity(
            this, 0,
            Intent(this, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_SINGLE_TOP
            },
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, MentorApplication.CHANNEL_GUARD)
            .setSmallIcon(android.R.drawable.ic_lock_idle_lock)
            .setContentTitle(session.title.ifBlank { "Sessiya faol" })
            .setContentText(session.goal.take(60))
            .setSubText("Mentor")
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setCategory(NotificationCompat.CATEGORY_PROGRESS)
            .setUsesChronometer(true)
            .setChronometerCountDown(true)
            .setWhen(session.plannedEndAtMillis)
            .setContentIntent(openAppPi)
            .setColor(0xFF8C2A2A.toInt())
            .setColorized(true)
            .build()
    }

    companion object {
        const val NOTIF_ID = 9001
        const val ACTION_END_SESSION = "uz.mentorai.focus.action.END_SESSION"

        fun start(context: android.content.Context) {
            val intent = Intent(context, FocusGuardService::class.java)
            context.startForegroundService(intent)
        }

        fun endSession(context: android.content.Context) {
            val intent = Intent(context, FocusGuardService::class.java).apply {
                action = ACTION_END_SESSION
            }
            context.startService(intent)
        }
    }
}
