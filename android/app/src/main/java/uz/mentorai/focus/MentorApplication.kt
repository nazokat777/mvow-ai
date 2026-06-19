package uz.mentorai.focus

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.media.AudioAttributes
import android.media.RingtoneManager
import androidx.hilt.work.HiltWorkerFactory
import androidx.work.Configuration
import dagger.hilt.android.HiltAndroidApp
import javax.inject.Inject

@HiltAndroidApp
class MentorApplication : Application(), Configuration.Provider {

    @Inject lateinit var workerFactory: HiltWorkerFactory
    @Inject lateinit var guardValidationScheduler: uz.mentorai.focus.guard.GuardValidationScheduler

    override val workManagerConfiguration: Configuration
        get() = Configuration.Builder()
            .setWorkerFactory(workerFactory)
            .setMinimumLoggingLevel(android.util.Log.INFO)
            .build()

    override fun onCreate() {
        super.onCreate()
        ensureNotificationChannels()
        guardValidationScheduler.ensureScheduled()
    }

    private fun ensureNotificationChannels() {
        val nm = getSystemService(NotificationManager::class.java)

        nm.createNotificationChannel(
            NotificationChannel(
                CHANNEL_GUARD,
                getString(R.string.notif_channel_guard),
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = getString(R.string.notif_channel_guard_desc)
                setShowBadge(false)
                setSound(null, null)
                enableVibration(false)
                lockscreenVisibility = android.app.Notification.VISIBILITY_PUBLIC
            }
        )

        // Eski (ovozsiz) budilnik kanalini o'chiramiz — yangi sozlamalar (ovoz/vibratsiya)
        // faqat yangi ID bilan kuchga kiradi (Android kanal sozlamasini keshlab qo'yadi).
        runCatching { nm.deleteNotificationChannel("mentor_alarm") }

        val alarmSound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
            ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
        val alarmAudioAttrs = AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_ALARM)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .build()

        nm.createNotificationChannel(
            NotificationChannel(
                CHANNEL_ALARM,
                getString(R.string.notif_channel_alarm),
                NotificationManager.IMPORTANCE_MAX
            ).apply {
                description = getString(R.string.notif_channel_alarm_desc)
                lockscreenVisibility = android.app.Notification.VISIBILITY_PUBLIC
                setSound(alarmSound, alarmAudioAttrs)
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 500, 300, 500, 300, 500)
                enableLights(true)
                setBypassDnd(true)
            }
        )
    }

    companion object {
        const val CHANNEL_GUARD = "mentor_guard"
        // v2 — budilnik ovozi/vibratsiyasi qo'shilgani uchun ID yangilandi
        const val CHANNEL_ALARM = "mentor_alarm_v2"
    }
}
