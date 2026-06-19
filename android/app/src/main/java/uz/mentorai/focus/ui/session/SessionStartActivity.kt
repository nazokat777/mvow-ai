package uz.mentorai.focus.ui.session

import android.content.Context
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.media.RingtoneManager
import android.os.Build
import android.os.Bundle
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.app.NotificationManagerCompat
import androidx.hilt.navigation.compose.hiltViewModel
import dagger.hilt.android.AndroidEntryPoint
import uz.mentorai.focus.data.alarm.AlarmPreferences
import uz.mentorai.focus.data.scheduled.ScheduledSessionEntity
import uz.mentorai.focus.guard.SessionStartReceiver
import uz.mentorai.focus.ui.components.MentorGhostButton
import uz.mentorai.focus.ui.components.MentorPrimaryButton
import uz.mentorai.focus.ui.components.MentorTextField
import uz.mentorai.focus.ui.theme.MentorColors
import uz.mentorai.focus.ui.theme.MentorTheme
import javax.inject.Inject
import kotlin.random.Random

/**
 * Lock screen ustida ochiladigan Activity.
 * Foydalanuvchi BOSHLAYMAN yoki hozirmas tugmasini bosishi kerak.
 */
@AndroidEntryPoint
class SessionStartActivity : ComponentActivity() {

    @Inject lateinit var alarmPrefs: AlarmPreferences

    private var alarmPlayer: MediaPlayer? = null
    private var vibrator: Vibrator? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true)
            setTurnScreenOn(true)
        } else {
            window.addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
                WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
            )
        }

        val sessionId = intent.getStringExtra(EXTRA_SESSION_ID)
        if (sessionId == null) {
            finish()
            return
        }

        // Sozlamalarni o'qiymiz (ovoz / vibratsiya / misol)
        val soundOn = alarmPrefs.soundEnabled.value
        val vibrationOn = alarmPrefs.vibrationEnabled.value
        val mathOn = alarmPrefs.mathEnabled.value

        // Budilnikni ishga tushiramiz — sozlamaga qarab
        startAlarm(playSound = soundOn, doVibrate = vibrationOn)
        // Ongoing wake-notifikatsiyani olib tashlaymiz (ekran ochildi)
        runCatching {
            NotificationManagerCompat.from(this).cancel(SessionStartReceiver.NOTIF_ID_WAKE)
        }

        setContent {
            MentorTheme {
                SessionStartRoot(
                    sessionId = sessionId,
                    mathEnabled = mathOn,
                    onClose = { finish() }
                )
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        stopAlarm()
    }

    /** Budilnik ovozi (looping, USAGE_ALARM — silent rejimda ham eshitiladi) + vibratsiya. */
    private fun startAlarm(playSound: Boolean, doVibrate: Boolean) {
        if (playSound) try {
            val uri = RingtoneManager.getActualDefaultRingtoneUri(this, RingtoneManager.TYPE_ALARM)
                ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
                ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
            if (uri != null) {
                alarmPlayer = MediaPlayer().apply {
                    setDataSource(this@SessionStartActivity, uri)
                    setAudioAttributes(
                        AudioAttributes.Builder()
                            .setUsage(AudioAttributes.USAGE_ALARM)
                            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                            .build()
                    )
                    isLooping = true
                    prepare()
                    start()
                }
            }
        } catch (_: Exception) {}

        if (doVibrate) try {
            val vib = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                (getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager).defaultVibrator
            } else {
                @Suppress("DEPRECATION")
                getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
            }
            vibrator = vib
            val pattern = longArrayOf(0, 500, 300, 500, 300, 500)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vib.vibrate(VibrationEffect.createWaveform(pattern, 0))  // 0 = boshidan takrorlash
            } else {
                @Suppress("DEPRECATION")
                vib.vibrate(pattern, 0)
            }
        } catch (_: Exception) {}
    }

    private fun stopAlarm() {
        try { alarmPlayer?.stop() } catch (_: Exception) {}
        try { alarmPlayer?.release() } catch (_: Exception) {}
        alarmPlayer = null
        try { vibrator?.cancel() } catch (_: Exception) {}
        vibrator = null
    }

    companion object {
        const val EXTRA_SESSION_ID = "session_id"
    }
}

@Composable
private fun SessionStartRoot(
    sessionId: String,
    mathEnabled: Boolean,
    onClose: () -> Unit,
    viewModel: SessionStartViewModel = hiltViewModel()
) {
    val state by viewModel.state.collectAsState()

    LaunchedEffect(sessionId) { viewModel.load(sessionId) }

    when (val s = state) {
        SessionStartUiState.Loading -> LoadingScreen()
        SessionStartUiState.NotFound -> {
            LaunchedEffect(Unit) { onClose() }
        }
        is SessionStartUiState.Ready -> {
            SessionStartContent(
                state = s,
                mathEnabled = mathEnabled,
                onStart = { viewModel.startNow(sessionId, onClose) },
                onPostpone = { minutes ->
                    viewModel.postpone(sessionId, minutes, onClose)
                }
            )
        }
    }
}

@Composable
private fun LoadingScreen() {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MentorColors.SurfaceVoid)
    )
}

@Composable
private fun SessionStartContent(
    state: SessionStartUiState.Ready,
    mathEnabled: Boolean,
    onStart: () -> Unit,
    onPostpone: (Int) -> Unit
) {
    val scheduled = state.scheduled
    val challenge = remember { generateMathChallenge() }
    var answer by remember { mutableStateOf("") }
    val solved = !mathEnabled || answer.trim().toIntOrNull() == challenge.answer

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MentorColors.SurfaceVoid)
            .verticalScroll(rememberScrollState())
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(Modifier.height(48.dp))
        Text(
            text = severityLabel(scheduled.severity),
            color = MentorColors.AccentBrass,
            fontSize = 11.sp,
            letterSpacing = 4.sp,
            fontWeight = FontWeight.Bold
        )
        Spacer(Modifier.height(28.dp))
        Text(
            text = "VAQT KELDI",
            color = MentorColors.TextPrimary,
            fontSize = 32.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 4.sp
        )
        Spacer(Modifier.height(20.dp))
        Text(
            text = scheduled.title,
            color = MentorColors.TextBody,
            fontSize = 22.sp,
            fontWeight = FontWeight.Medium,
            textAlign = TextAlign.Center
        )
        Spacer(Modifier.height(12.dp))
        Text(
            text = "\"${scheduled.goal}\"",
            color = MentorColors.TextMuted,
            fontSize = 14.sp,
            lineHeight = 22.sp,
            textAlign = TextAlign.Center,
            modifier = Modifier.fillMaxWidth().padding(horizontal = 24.dp)
        )

        if (scheduled.postponementsToday > 0) {
            Spacer(Modifier.height(16.dp))
            Text(
                text = "Bugun ${scheduled.postponementsToday} marta orqaga surding",
                color = MentorColors.SignalFail,
                fontSize = 12.sp
            )
        }

        // --- Budilnik o'chishi uchun misol yechish (sozlamada yoqilgan bo'lsa) ---
        if (mathEnabled) {
            Spacer(Modifier.height(36.dp))
            Text(
                text = "Uyg'oning. Budilnik o'chishi uchun misolni yeching:",
                color = MentorColors.TextMuted,
                fontSize = 13.sp,
                textAlign = TextAlign.Center
            )
            Spacer(Modifier.height(14.dp))
            Text(
                text = "${challenge.text} = ?",
                color = MentorColors.TextPrimary,
                fontSize = 30.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 3.sp
            )
            Spacer(Modifier.height(14.dp))
            MentorTextField(
                value = answer,
                onValueChange = { input -> answer = input.filter { it.isDigit() }.take(4) },
                placeholder = "javob",
                isError = answer.isNotBlank() && !solved,
                modifier = Modifier.fillMaxWidth(0.55f)
            )
        }

        Spacer(Modifier.height(32.dp))
        MentorPrimaryButton(
            text = "Boshlayman",
            onClick = onStart,
            enabled = solved
        )
        Spacer(Modifier.height(8.dp))
        if (!solved) {
            Text(
                text = "Avval misolni to'g'ri yeching",
                color = MentorColors.TextMuted,
                fontSize = 12.sp,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth()
            )
        } else if (state.canPostpone) {
            MentorGhostButton(
                text = "5 daq orqaga surish",
                onClick = { onPostpone(5) }
            )
        } else {
            Text(
                text = "Bugun limit tugadi. Faqat boshlash mumkin.",
                color = MentorColors.TextMuted,
                fontSize = 12.sp,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth()
            )
        }
        Spacer(Modifier.height(24.dp))
    }
}

private data class MathChallenge(val text: String, val answer: Int)

/** Tasodifiy oddiy misol — qo'shish yoki ayirish (javob har doim musbat). */
private fun generateMathChallenge(): MathChallenge {
    val a = Random.nextInt(3, 19)
    val b = Random.nextInt(2, a)  // b < a — ayirishda manfiy chiqmasligi uchun
    return if (Random.nextBoolean()) {
        MathChallenge("$a + $b", a + b)
    } else {
        MathChallenge("$a - $b", a - b)
    }
}

private fun severityLabel(severity: String): String = when (severity) {
    ScheduledSessionEntity.SEVERITY_MAX -> "MUQADDAS VAQT"
    ScheduledSessionEntity.SEVERITY_HIGH -> "YUQORI USTUVORLIK"
    ScheduledSessionEntity.SEVERITY_MEDIUM -> "REJADAGI"
    ScheduledSessionEntity.SEVERITY_LOW -> "OPTSIYONAL"
    else -> "REJADAGI"
}
