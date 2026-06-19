package uz.mentorai.focus.data.alarm

import android.content.Context
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.preferencesDataStore
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject
import javax.inject.Singleton

private val Context.alarmDataStore by preferencesDataStore(name = "alarm_settings")

/**
 * Budilnik sozlamalari: ovoz, vibratsiya, misol yechish (javobsiz o'chmaslik).
 *
 * `*.value` synchronous o'qish uchun — DataStore'dan eventually consistent yangilanadi.
 * Standart: hammasi YONIQ (true).
 */
@Singleton
class AlarmPreferences @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val ds get() = context.alarmDataStore
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    private val _soundEnabled = MutableStateFlow(true)
    val soundEnabled: StateFlow<Boolean> = _soundEnabled.asStateFlow()

    private val _vibrationEnabled = MutableStateFlow(true)
    val vibrationEnabled: StateFlow<Boolean> = _vibrationEnabled.asStateFlow()

    private val _mathEnabled = MutableStateFlow(true)
    val mathEnabled: StateFlow<Boolean> = _mathEnabled.asStateFlow()

    init {
        scope.launch {
            ds.data.collect { prefs ->
                _soundEnabled.value = prefs[KEY_SOUND] ?: true
                _vibrationEnabled.value = prefs[KEY_VIBRATION] ?: true
                _mathEnabled.value = prefs[KEY_MATH] ?: true
            }
        }
    }

    suspend fun setSoundEnabled(enabled: Boolean) {
        ds.edit { it[KEY_SOUND] = enabled }
        _soundEnabled.value = enabled
    }

    suspend fun setVibrationEnabled(enabled: Boolean) {
        ds.edit { it[KEY_VIBRATION] = enabled }
        _vibrationEnabled.value = enabled
    }

    suspend fun setMathEnabled(enabled: Boolean) {
        ds.edit { it[KEY_MATH] = enabled }
        _mathEnabled.value = enabled
    }

    private companion object {
        val KEY_SOUND = booleanPreferencesKey("sound_enabled")
        val KEY_VIBRATION = booleanPreferencesKey("vibration_enabled")
        val KEY_MATH = booleanPreferencesKey("math_enabled")
    }
}
