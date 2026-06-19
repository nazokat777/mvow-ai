package uz.mentorai.focus.ui.settings

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.Icon
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import android.Manifest
import android.app.AlarmManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.provider.Settings
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.ui.platform.LocalContext
import androidx.core.content.ContextCompat
import androidx.hilt.navigation.compose.hiltViewModel
import uz.mentorai.focus.data.language.Language
import uz.mentorai.focus.i18n.UiStrings
import uz.mentorai.focus.ui.LocalLanguage
import uz.mentorai.focus.ui.components.MentorSectionLabel
import uz.mentorai.focus.ui.theme.MentorColors

@Composable
fun SettingsScreen(viewModel: SettingsViewModel = hiltViewModel()) {
    val current by viewModel.currentLanguage.collectAsState()
    val soundOn by viewModel.alarmSound.collectAsState()
    val vibrationOn by viewModel.alarmVibration.collectAsState()
    val mathOn by viewModel.alarmMath.collectAsState()
    val lang = LocalLanguage.current

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MentorColors.SurfaceVoid)
            .padding(horizontal = 24.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
        ) {
            Spacer(Modifier.height(48.dp))
            MentorSectionLabel(text = UiStrings.settingsLabel(lang).uppercase())
            Spacer(Modifier.height(8.dp))
            Text(
                text = UiStrings.settingsLabel(lang),
                color = MentorColors.TextPrimary,
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold
            )
            Spacer(Modifier.height(32.dp))

            // Til seksiyasi
            MentorSectionLabel(text = UiStrings.languageLabel(lang).uppercase())
            Spacer(Modifier.height(12.dp))

            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Language.entries.forEach { language ->
                    LanguageRow(
                        language = language,
                        isSelected = language == current,
                        onClick = { viewModel.setLanguage(language) }
                    )
                }
            }

            // Budilnik seksiyasi
            Spacer(Modifier.height(32.dp))
            MentorSectionLabel(text = "BUDILNIK")
            Spacer(Modifier.height(8.dp))
            Text(
                text = "Vaqt kelganda budilnik jiringlaydi va ekranda misol chiqadi. " +
                    "Misolni yechmaguncha o'chmaydi — bu sizni chinakam uyg'otadi.",
                color = MentorColors.TextMuted,
                fontSize = 13.sp,
                lineHeight = 20.sp
            )
            Spacer(Modifier.height(12.dp))

            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                ToggleRow("Ovoz", soundOn) { viewModel.setAlarmSound(it) }
                ToggleRow("Vibratsiya", vibrationOn) { viewModel.setAlarmVibration(it) }
                ToggleRow("Misol yechish (javobsiz o'chmasin)", mathOn) { viewModel.setAlarmMath(it) }
            }

            Spacer(Modifier.height(20.dp))
            TestAlarmButton(onFire = { viewModel.scheduleTestAlarm(10) })
            Spacer(Modifier.height(10.dp))
            Text(
                text = "Bosing → ruxsatlarni bering → telefonni qulflang. 10 soniyadan keyin budilnik jiringlashi kerak.",
                color = MentorColors.TextMuted,
                fontSize = 12.sp,
                lineHeight = 18.sp
            )

            Spacer(Modifier.height(48.dp))
        }
    }
}

@Composable
private fun TestAlarmButton(onFire: () -> Unit) {
    val context = LocalContext.current

    fun fireWithChecks() {
        // Aniq budilnik ruxsati (Android 12+) — bo'lmasa sozlamani ochamiz
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val am = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
            if (!am.canScheduleExactAlarms()) {
                runCatching {
                    context.startActivity(
                        Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM)
                            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    )
                }
                Toast.makeText(
                    context,
                    "\"Aniq budilnik / Alarms & reminders\"ga ruxsat bering, keyin qaytadan bosing",
                    Toast.LENGTH_LONG
                ).show()
                return
            }
        }
        onFire()
        Toast.makeText(
            context,
            "10 soniyadan keyin jiringlaydi — telefonni qulflang yoki kuting",
            Toast.LENGTH_LONG
        ).show()
    }

    val notifLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted ->
        if (granted) fireWithChecks()
        else Toast.makeText(
            context,
            "Bildirishnoma ruxsati kerak — busiz budilnik ko'rinmaydi/eshitilmaydi",
            Toast.LENGTH_LONG
        ).show()
    }

    fun onClick() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
            ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS)
            != PackageManager.PERMISSION_GRANTED
        ) {
            notifLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
        } else {
            fireWithChecks()
        }
    }

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(8.dp))
            .background(MentorColors.AccentIron)
            .clickable { onClick() }
            .padding(vertical = 16.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = "🔔  Budilnikni hozir sinash (10 soniya)",
            color = MentorColors.SurfaceVoid,
            fontSize = 15.sp,
            fontWeight = FontWeight.Bold
        )
    }
}

@Composable
private fun ToggleRow(
    label: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(4.dp))
            .background(MentorColors.SurfaceSteel)
            .border(1.dp, MentorColors.TextGhost, RoundedCornerShape(4.dp))
            .padding(start = 20.dp, end = 12.dp, top = 6.dp, bottom = 6.dp)
    ) {
        Text(
            text = label,
            color = MentorColors.TextPrimary,
            fontSize = 16.sp,
            fontWeight = FontWeight.Medium,
            modifier = Modifier.weight(1f)
        )
        Switch(
            checked = checked,
            onCheckedChange = onCheckedChange,
            colors = SwitchDefaults.colors(
                checkedThumbColor = MentorColors.SurfaceVoid,
                checkedTrackColor = MentorColors.AccentIron,
                uncheckedThumbColor = MentorColors.TextMuted,
                uncheckedTrackColor = MentorColors.SurfaceSteel
            )
        )
    }
}

@Composable
private fun LanguageRow(
    language: Language,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(4.dp))
            .background(MentorColors.SurfaceSteel)
            .border(
                1.dp,
                if (isSelected) MentorColors.AccentIron else MentorColors.TextGhost,
                RoundedCornerShape(4.dp)
            )
            .clickable { onClick() }
            .padding(horizontal = 20.dp, vertical = 16.dp)
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = language.displayName,
                color = MentorColors.TextPrimary,
                fontSize = 18.sp,
                fontWeight = FontWeight.Medium
            )
            Spacer(Modifier.height(2.dp))
            Text(
                text = language.englishName,
                color = MentorColors.TextMuted,
                fontSize = 12.sp
            )
        }
        if (isSelected) {
            Box(
                modifier = Modifier
                    .size(20.dp)
                    .clip(CircleShape)
                    .background(MentorColors.AccentIron),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    Icons.Default.Check,
                    contentDescription = null,
                    tint = MentorColors.SurfaceVoid,
                    modifier = Modifier.size(14.dp)
                )
            }
        }
    }
}
