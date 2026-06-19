package uz.mentorai.focus.ui.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import uz.mentorai.focus.data.alarm.AlarmPreferences
import uz.mentorai.focus.data.language.Language
import uz.mentorai.focus.data.language.LanguageRepository
import javax.inject.Inject

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val languageRepository: LanguageRepository,
    private val alarmPreferences: AlarmPreferences
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
}
