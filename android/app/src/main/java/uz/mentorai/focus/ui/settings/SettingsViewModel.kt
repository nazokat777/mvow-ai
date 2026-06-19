package uz.mentorai.focus.ui.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import uz.mentorai.focus.data.alarm.AlarmPreferences
import uz.mentorai.focus.data.language.Language
import uz.mentorai.focus.data.language.LanguageRepository
import uz.mentorai.focus.data.scheduled.ScheduledSessionRepository
import uz.mentorai.focus.guard.scheduler.SessionScheduler
import javax.inject.Inject

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val languageRepository: LanguageRepository,
    private val alarmPreferences: AlarmPreferences,
    private val scheduledSessionRepository: ScheduledSessionRepository,
    private val sessionScheduler: SessionScheduler
) : ViewModel() {

    val currentLanguage: StateFlow<Language> = languageRepository.current

    // Budilnik sozlamalari
    val alarmSound: StateFlow<Boolean> = alarmPreferences.soundEnabled
    val alarmVibration: StateFlow<Boolean> = alarmPreferences.vibrationEnabled
    val alarmMath: StateFlow<Boolean> = alarmPreferences.mathEnabled

    fun setLanguage(language: Language) {
        viewModelScope.launch { languageRepository.setLanguage(language) }
    }

    fun setAlarmSound(on: Boolean) {
        viewModelScope.launch { alarmPreferences.setSoundEnabled(on) }
    }

    fun setAlarmVibration(on: Boolean) {
        viewModelScope.launch { alarmPreferences.setVibrationEnabled(on) }
    }

    fun setAlarmMath(on: Boolean) {
        viewModelScope.launch { alarmPreferences.setMathEnabled(on) }
    }

    /** Sinov budilnigi — `secondsFromNow` soniyadan keyin jiringlaydi (budilnik ishlashini tekshirish). */
    fun scheduleTestAlarm(secondsFromNow: Int = 10) {
        viewModelScope.launch {
            val entity = scheduledSessionRepository.create(
                title = "Sinov budilnigi",
                goal = "Budilnik ishlayaptimi — tekshiruv",
                startAtMillis = System.currentTimeMillis() + secondsFromNow * 1000L,
                durationMinutes = 1,
                recurrenceRule = null
            )
            sessionScheduler.schedule(entity)
        }
    }
}
