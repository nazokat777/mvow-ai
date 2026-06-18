package uz.mentorai.focus.ui.home

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import android.content.Intent
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import kotlinx.coroutines.delay
import uz.mentorai.focus.BuildConfig
import uz.mentorai.focus.core.permissions.PermissionChecker
import uz.mentorai.focus.core.permissions.PermissionStep
import uz.mentorai.focus.ui.components.MentorPrimaryButton
import uz.mentorai.focus.ui.components.MentorSecondaryButton
import uz.mentorai.focus.ui.components.MentorSectionLabel
import uz.mentorai.focus.ui.preview.AddSessionPreviewActivity
import uz.mentorai.focus.ui.demo.DailyFlowDemoActivity
import uz.mentorai.focus.ui.preview.CelebratePreviewActivity
import uz.mentorai.focus.ui.preview.ChatPreviewActivity
import uz.mentorai.focus.ui.preview.DailyBriefPreviewActivity
import uz.mentorai.focus.ui.preview.DayFlowPreviewActivity
import uz.mentorai.focus.ui.preview.HardLockPreviewActivity
import uz.mentorai.focus.ui.preview.MorningConfirmPreviewActivity
import uz.mentorai.focus.ui.preview.NotificationsPreviewActivity
import uz.mentorai.focus.ui.preview.OnlineClassPreviewActivity
import uz.mentorai.focus.ui.preview.PomodoroPreviewActivity
import uz.mentorai.focus.ui.preview.ProfilePreviewActivity
import uz.mentorai.focus.ui.preview.RestModePreviewActivity
import uz.mentorai.focus.ui.preview.RoutinePreviewActivity
import uz.mentorai.focus.ui.preview.SessionReflectionPreviewActivity
import uz.mentorai.focus.ui.preview.StuckPreviewActivity
import uz.mentorai.focus.ui.preview.TomorrowPlanPreviewActivity
import uz.mentorai.focus.ui.preview.UrgentTimePreviewActivity
import uz.mentorai.focus.ui.preview.WeeklyReviewPreviewActivity
import uz.mentorai.focus.ui.theme.MentorColors

@Composable
fun HomeScreen(viewModel: HomeViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsState()
    val context = LocalContext.current

    val accessibilityOk = remember {
        PermissionChecker.isGranted(context, PermissionStep.ACCESSIBILITY)
    }
    val overlayOk = remember {
        PermissionChecker.isGranted(context, PermissionStep.OVERLAY)
    }
    val canStart = accessibilityOk && overlayOk && state.blockedPackages.isNotEmpty()

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MentorColors.SurfaceVoid)
            .padding(24.dp)
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            Spacer(Modifier.height(48.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                MentorSectionLabel(text = "MENTOR")
                StreakBadge(days = state.streakDays)
            }
            Spacer(Modifier.height(8.dp))
            Text(
                text = "Sening so'zing:",
                color = MentorColors.TextMuted,
                fontSize = 12.sp
            )
            Spacer(Modifier.height(8.dp))
            Text(
                text = "\"${state.statedGoal}\"",
                color = MentorColors.TextPrimary,
                fontSize = 18.sp,
                lineHeight = 26.sp
            )
        }

        if (state.isSessionActive) {
            ActiveSessionCard(
                session = state.activeSession!!,
                onEnd = { viewModel.endSession() }
            )
        } else {
            StartSessionCard(
                blockedCount = state.blockedPackages.size,
                canStart = canStart,
                accessibilityOk = accessibilityOk,
                overlayOk = overlayOk,
                onStart = { minutes -> viewModel.startSession(minutes) }
            )
        }
    }
}

@Composable
private fun StreakBadge(days: Int) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .clip(RoundedCornerShape(4.dp))
            .background(MentorColors.SurfaceSteel)
            .border(1.dp, MentorColors.AccentBrass, RoundedCornerShape(4.dp))
            .padding(horizontal = 12.dp, vertical = 6.dp)
    ) {
        Text(
            text = "STREAK",
            color = MentorColors.TextMuted,
            fontSize = 10.sp,
            letterSpacing = 2.sp,
            fontWeight = FontWeight.Bold
        )
        Spacer(Modifier.width(6.dp))
        Text(
            text = "$days",
            color = MentorColors.AccentBrass,
            fontSize = 16.sp,
            fontWeight = FontWeight.Bold
        )
    }
}

@Composable
private fun BoxScope.StartSessionCard(
    blockedCount: Int,
    canStart: Boolean,
    accessibilityOk: Boolean,
    overlayOk: Boolean,
    onStart: (Int) -> Unit
) {
    var selectedMinutes by remember { mutableIntStateOf(45) }
    val choices = listOf(25, 45, 90, 120)

    Column(
        modifier = Modifier
            .align(Alignment.BottomCenter)
            .fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        if (!accessibilityOk || !overlayOk) {
            Text(
                text = buildString {
                    append("Sessiyani boshlash uchun ")
                    if (!accessibilityOk) append("Maxsus imkoniyatlar")
                    if (!accessibilityOk && !overlayOk) append(" va ")
                    if (!overlayOk) append("Overlay")
                    append(" ruxsati kerak.")
                },
                color = MentorColors.SignalWarn,
                fontSize = 13.sp,
                lineHeight = 20.sp
            )
        }

        MentorSectionLabel(text = "Davomiyligi")

        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            choices.forEach { mins ->
                DurationChip(
                    minutes = mins,
                    selected = mins == selectedMinutes,
                    onClick = { selectedMinutes = mins },
                    modifier = Modifier.weight(1f)
                )
            }
        }

        Text(
            text = "$blockedCount ta ilova bloklanadi",
            color = MentorColors.TextMuted,
            fontSize = 12.sp
        )

        MentorPrimaryButton(
            text = "Sessiyani boshlash",
            onClick = { onStart(selectedMinutes) },
            enabled = canStart
        )

        // DEV preview gallereyasi — FAQAT debug build'da ko'rinadi.
        // Release APK'da bu tugmalar yo'q va tegishli activity'lar manifestda
        // e'lon qilinmagan (app/src/debug/AndroidManifest.xml ga ko'chirilgan).
        val previewContext = LocalContext.current

        if (BuildConfig.DEBUG) {
        // ASOSIY OQIM — to'liq demo kun zanjiri (eng muhim tugma)
        MentorPrimaryButton(
            text = "✦  TO'LIQ KUN ZANJIRINI KO'R",
            onClick = {
                previewContext.startActivity(
                    Intent(previewContext, DailyFlowDemoActivity::class.java)
                )
            }
        )

        MentorSecondaryButton(
            text = "Hard Lock dizaynini ko'rish",
            onClick = {
                previewContext.startActivity(
                    Intent(previewContext, HardLockPreviewActivity::class.java)
                )
            }
        )
        MentorSecondaryButton(
            text = "Tonggi tasdiq (preview)",
            onClick = {
                previewContext.startActivity(
                    Intent(previewContext, MorningConfirmPreviewActivity::class.java)
                )
            }
        )
        MentorSecondaryButton(
            text = "Ertangi reja (preview)",
            onClick = {
                previewContext.startActivity(
                    Intent(previewContext, TomorrowPlanPreviewActivity::class.java)
                )
            }
        )
        MentorSecondaryButton(
            text = "Kunlik oqim (preview)",
            onClick = {
                previewContext.startActivity(
                    Intent(previewContext, DayFlowPreviewActivity::class.java)
                )
            }
        )
        MentorSecondaryButton(
            text = "Routine — AI reja (preview)",
            onClick = {
                previewContext.startActivity(
                    Intent(previewContext, RoutinePreviewActivity::class.java)
                )
            }
        )
        MentorSecondaryButton(
            text = "Haftalik bayram (preview)",
            onClick = {
                previewContext.startActivity(
                    Intent(previewContext, CelebratePreviewActivity::class.java)
                )
            }
        )
        MentorSecondaryButton(
            text = "Pomodoro 25/5 (preview)",
            onClick = {
                previewContext.startActivity(
                    Intent(previewContext, PomodoroPreviewActivity::class.java)
                )
            }
        )
        MentorSecondaryButton(
            text = "Tonggi brifing — 3 savol (preview)",
            onClick = {
                previewContext.startActivity(
                    Intent(previewContext, DailyBriefPreviewActivity::class.java)
                )
            }
        )
        MentorSecondaryButton(
            text = "Sessiya bahosi (preview)",
            onClick = {
                previewContext.startActivity(
                    Intent(previewContext, SessionReflectionPreviewActivity::class.java)
                )
            }
        )
        MentorSecondaryButton(
            text = "Turg'unlik — qisilib qoldim (preview)",
            onClick = {
                previewContext.startActivity(
                    Intent(previewContext, StuckPreviewActivity::class.java)
                )
            }
        )
        MentorSecondaryButton(
            text = "Mentor bilan suhbat (preview)",
            onClick = {
                previewContext.startActivity(
                    Intent(previewContext, ChatPreviewActivity::class.java)
                )
            }
        )
        MentorSecondaryButton(
            text = "Shoshilinch vaqt (preview)",
            onClick = {
                previewContext.startActivity(
                    Intent(previewContext, UrgentTimePreviewActivity::class.java)
                )
            }
        )
        MentorSecondaryButton(
            text = "Dam rejimi (preview)",
            onClick = {
                previewContext.startActivity(
                    Intent(previewContext, RestModePreviewActivity::class.java)
                )
            }
        )
        MentorSecondaryButton(
            text = "Haftalik tahlil (preview)",
            onClick = {
                previewContext.startActivity(
                    Intent(previewContext, WeeklyReviewPreviewActivity::class.java)
                )
            }
        )
        MentorSecondaryButton(
            text = "Bildirishnomalar (preview)",
            onClick = {
                previewContext.startActivity(
                    Intent(previewContext, NotificationsPreviewActivity::class.java)
                )
            }
        )
        MentorSecondaryButton(
            text = "Onlayn dars (preview)",
            onClick = {
                previewContext.startActivity(
                    Intent(previewContext, OnlineClassPreviewActivity::class.java)
                )
            }
        )
        MentorSecondaryButton(
            text = "Sessiya qo'sh (preview)",
            onClick = {
                previewContext.startActivity(
                    Intent(previewContext, AddSessionPreviewActivity::class.java)
                )
            }
        )
        MentorSecondaryButton(
            text = "Profil — sen (preview)",
            onClick = {
                previewContext.startActivity(
                    Intent(previewContext, ProfilePreviewActivity::class.java)
                )
            }
        )
        }  // if (BuildConfig.DEBUG) — DEV preview gallereyasi tugadi
    }
}

@Composable
private fun DurationChip(
    minutes: Int,
    selected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .height(56.dp)
            .clip(RoundedCornerShape(4.dp))
            .background(if (selected) MentorColors.AccentIron else MentorColors.SurfaceSteel)
            .border(
                1.dp,
                if (selected) MentorColors.AccentIron else MentorColors.TextGhost,
                RoundedCornerShape(4.dp)
            )
            .clickable { onClick() },
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = "$minutes\nmin",
            color = if (selected) MentorColors.SurfaceVoid else MentorColors.TextBody,
            fontSize = 14.sp,
            fontWeight = FontWeight.Medium,
            textAlign = androidx.compose.ui.text.style.TextAlign.Center,
            lineHeight = 16.sp
        )
    }
}

@Composable
private fun BoxScope.ActiveSessionCard(
    session: uz.mentorai.focus.data.session.SessionEntity,
    onEnd: () -> Unit
) {
    var nowMs by remember { mutableLongStateOf(System.currentTimeMillis()) }
    LaunchedEffect(session.id) {
        while (true) {
            delay(1000)
            nowMs = System.currentTimeMillis()
        }
    }
    val remainingMs = (session.plannedEndAtMillis - nowMs).coerceAtLeast(0L)
    val mm = (remainingMs / 60_000L).toString().padStart(2, '0')
    val ss = ((remainingMs / 1000L) % 60L).toString().padStart(2, '0')

    Column(
        modifier = Modifier.align(Alignment.Center),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        MentorSectionLabel(text = "Faol sessiya")
        Spacer(Modifier.height(16.dp))
        Text(
            text = "$mm : $ss",
            color = MentorColors.TextPrimary,
            fontSize = 96.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 4.sp
        )
        Spacer(Modifier.height(24.dp))
        Text(
            text = "${session.interceptCount} marta to'sildi",
            color = MentorColors.AccentBrass,
            fontSize = 13.sp,
            letterSpacing = 1.sp
        )
    }

    Column(
        modifier = Modifier
            .align(Alignment.BottomCenter)
            .fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Text(
            text = "Sessiyani erta tugatish — streak'ga zarar.",
            color = MentorColors.TextMuted,
            fontSize = 12.sp,
            modifier = Modifier.fillMaxWidth(),
            textAlign = androidx.compose.ui.text.style.TextAlign.Center
        )
        MentorPrimaryButton(
            text = if (remainingMs == 0L) "Sessiyani yakunlash" else "Erta tugatish",
            onClick = onEnd
        )
    }
}
