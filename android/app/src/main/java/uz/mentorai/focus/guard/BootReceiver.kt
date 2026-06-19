package uz.mentorai.focus.guard

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import uz.mentorai.focus.data.scheduled.ScheduledSessionRepository
import uz.mentorai.focus.data.session.SessionRepository
import uz.mentorai.focus.guard.scheduler.SessionScheduler
import javax.inject.Inject

/**
 * Reboot'dan keyin guard service, faol sessiya VA rejalashtirilgan
 * budilnik/eslatmalarni tiklaydi.
 *
 * Muhim: Android reboot'da barcha AlarmManager alarmlari o'chadi. Shuning uchun
 * faol scheduled sessiyalarni qayta rejalashtiramiz — aks holda foydalanuvchining
 * vaqtli eslatmalari telefon o'chib-yongandan keyin yo'qoladi.
 */
@AndroidEntryPoint
class BootReceiver : BroadcastReceiver() {

    @Inject lateinit var sessionRepository: SessionRepository
    @Inject lateinit var scheduledSessionRepository: ScheduledSessionRepository
    @Inject lateinit var sessionScheduler: SessionScheduler

    override fun onReceive(context: Context, intent: Intent?) {
        when (intent?.action) {
            Intent.ACTION_BOOT_COMPLETED,
            Intent.ACTION_LOCKED_BOOT_COMPLETED -> {
                val pendingResult = goAsync()
                CoroutineScope(SupervisorJob() + Dispatchers.IO).launch {
                    try {
                        // 1) Faol sessiyani tiklash
                        sessionRepository.loadActiveIntoEngine()
                        FocusGuardService.start(context)

                        // 2) Rejalashtirilgan eslatmalarni qayta o'rnatish
                        //    (reboot'da AlarmManager alarmlari o'chgani uchun shart).
                        //    schedule() o'tib ketgan vaqtlarni o'zi tashlab ketadi.
                        val scheduled = scheduledSessionRepository.activeSessions.first()
                        sessionScheduler.rescheduleAll(scheduled)
                    } catch (_: Exception) {
                        // Tiklash imkonsiz bo'lsa — ilova baribir ishlayveradi
                    } finally {
                        pendingResult.finish()
                    }
                }
            }
        }
    }
}
