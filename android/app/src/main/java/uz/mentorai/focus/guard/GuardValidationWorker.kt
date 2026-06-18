package uz.mentorai.focus.guard

import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject
import kotlinx.coroutines.flow.first
import uz.mentorai.focus.MainActivity
import uz.mentorai.focus.MentorApplication
import uz.mentorai.focus.R
import uz.mentorai.focus.core.permissions.PermissionChecker
import uz.mentorai.focus.core.permissions.PermissionStep
import uz.mentorai.focus.data.session.SessionEntity
import uz.mentorai.focus.data.session.SessionRepository

/**
 * Har 15 daqiqada AccessibilityService va Overlay ruxsatlari hali ishlayotganini tekshiradi.
 * Agar buzilgan bo'lsa, foydalanuvchini xabardor qiladi va sessiyani penalty bilan tugatadi.
 */
@HiltWorker
class GuardValidationWorker @AssistedInject constructor(
    @Assisted context: Context,
    @Assisted params: WorkerParameters,
    private val sessionRepository: SessionRepository
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        val ctx = applicationContext

        val accessibilityOk = PermissionChecker.isGranted(ctx, PermissionStep.ACCESSIBILITY)
        val overlayOk = PermissionChecker.isGranted(ctx, PermissionStep.OVERLAY)

        if (!accessibilityOk || !overlayOk) {
            // Faqat faol sessiya paytida ruxsat buzilishi muhim — aks holda
            // foydalanuvchini bekorga bezovta qilmaymiz.
            val active = sessionRepository.activeSession.first()
            if (active != null) {
                notifyTamper(!accessibilityOk, !overlayOk)
                // Himoya buzildi — sessiyani penalty bilan tugatamiz (streak uziladi).
                sessionRepository.endActiveSession(SessionEntity.REASON_FORCE_STOP)
            }
        }

        return Result.success()
    }

    private fun notifyTamper(accessibilityOff: Boolean, overlayOff: Boolean) {
        val ctx = applicationContext
        val openIntent = PendingIntent.getActivity(
            ctx, 0,
            Intent(ctx, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            },
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val message = when {
            accessibilityOff && overlayOff ->
                "Mentor o'chirilgan. Maxsus imkoniyatlar va overlay'ni qayta yoq."
            accessibilityOff -> "Mentor o'chirilgan. Maxsus imkoniyatlar ruxsatini qayta yoq."
            else -> "Overlay ruxsati bekor qilindi. Qayta yoq."
        }

        val notification = NotificationCompat.Builder(ctx, MentorApplication.CHANNEL_ALARM)
            .setSmallIcon(android.R.drawable.stat_sys_warning)
            .setContentTitle("Mentor susayyapti")
            .setContentText(message)
            .setStyle(NotificationCompat.BigTextStyle().bigText(message))
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setContentIntent(openIntent)
            .setAutoCancel(true)
            .setColor(0xFF8C2A2A.toInt())
            .setColorized(true)
            .build()

        NotificationManagerCompat.from(ctx).notify(NOTIF_ID_TAMPER, notification)
    }

    companion object {
        const val WORK_NAME = "guard_validation"
        const val NOTIF_ID_TAMPER = 9100
    }
}
