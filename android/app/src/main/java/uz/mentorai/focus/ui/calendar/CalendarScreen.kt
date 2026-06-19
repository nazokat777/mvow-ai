package uz.mentorai.focus.ui.calendar

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import uz.mentorai.focus.data.scheduled.ScheduledSessionEntity
import uz.mentorai.focus.ui.components.MentorSectionLabel
import uz.mentorai.focus.ui.theme.MentorColors
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun CalendarScreen(viewModel: CalendarViewModel = hiltViewModel()) {
    val sessions by viewModel.sessions.collectAsState()
    var showAddDialog by remember { mutableStateOf(false) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MentorColors.SurfaceVoid)
    ) {
        Column(modifier = Modifier.fillMaxSize().padding(horizontal = 24.dp)) {
            Spacer(Modifier.height(48.dp))
            MentorSectionLabel(text = "REJALAR")
            Spacer(Modifier.height(8.dp))
            Text(
                text = "Bugun va kelgusi",
                color = MentorColors.TextPrimary,
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold
            )
            Spacer(Modifier.height(24.dp))

            if (sessions.isEmpty()) {
                EmptyState()
            } else {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                    contentPadding = androidx.compose.foundation.layout.PaddingValues(bottom = 96.dp)
                ) {
                    items(sessions, key = { it.id }) { session ->
                        ScheduledSessionRow(
                            session = session,
                            onDelete = { viewModel.deactivate(session.id) }
                        )
                    }
                }
            }
        }

        FloatingActionButton(
            onClick = { showAddDialog = true },
            containerColor = MentorColors.AccentIron,
            contentColor = MentorColors.SurfaceVoid,
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(24.dp)
        ) {
            Icon(Icons.Default.Add, contentDescription = "Reja qo'shish")
        }

        if (showAddDialog) {
            AddScheduleDialog(
                onDismiss = { showAddDialog = false },
                onConfirm = { title, goal, startMs, mins ->
                    viewModel.create(title, goal, startMs, mins)
                    showAddDialog = false
                }
            )
        }
    }
}

@Composable
private fun BoxScope.EmptyState() {
    Column(
        modifier = Modifier.align(Alignment.Center),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "REJANG YO'Q.",
            color = MentorColors.TextMuted,
            fontSize = 13.sp,
            letterSpacing = 4.sp,
            fontWeight = FontWeight.Bold
        )
        Spacer(Modifier.height(8.dp))
        Text(
            text = "Pastdagi tugma orqali qo'sh.",
            color = MentorColors.TextGhost,
            fontSize = 13.sp
        )
    }
}

@Composable
private fun ScheduledSessionRow(
    session: ScheduledSessionEntity,
    onDelete: () -> Unit
) {
    val timeFormat = remember { SimpleDateFormat("HH:mm", Locale.getDefault()) }
    val dateFormat = remember { SimpleDateFormat("dd MMM, EEE", Locale.getDefault()) }

    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(4.dp))
            .background(MentorColors.SurfaceSteel)
            .border(1.dp, MentorColors.TextGhost, RoundedCornerShape(4.dp))
            .padding(horizontal = 16.dp, vertical = 14.dp)
    ) {
        // Severity rangli nuqta
        Box(
            modifier = Modifier
                .size(8.dp)
                .clip(CircleShape)
                .background(severityColor(session.severity))
        )
        Spacer(Modifier.size(12.dp))

        Column(Modifier.weight(1f)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = timeFormat.format(Date(session.startAtMillis)),
                    color = MentorColors.TextPrimary,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
                Spacer(Modifier.size(8.dp))
                Text(
                    text = "${session.durationMinutes} daq",
                    color = MentorColors.TextMuted,
                    fontSize = 12.sp
                )
            }
            Spacer(Modifier.size(2.dp))
            Text(
                text = session.title,
                color = MentorColors.TextBody,
                fontSize = 15.sp,
                fontWeight = FontWeight.Medium
            )
            Spacer(Modifier.size(2.dp))
            Text(
                text = dateFormat.format(Date(session.startAtMillis)),
                color = MentorColors.TextGhost,
                fontSize = 11.sp
            )
        }

        IconButton(onClick = onDelete) {
            Icon(
                Icons.Default.Delete,
                contentDescription = null,
                tint = MentorColors.TextMuted,
                modifier = Modifier.size(18.dp)
            )
        }
    }
}

@Composable
private fun severityColor(severity: String): androidx.compose.ui.graphics.Color = when (severity) {
    ScheduledSessionEntity.SEVERITY_MAX -> MentorColors.SignalFail
    ScheduledSessionEntity.SEVERITY_HIGH -> MentorColors.AccentBrass
    ScheduledSessionEntity.SEVERITY_MEDIUM -> MentorColors.AccentIron
    else -> MentorColors.TextMuted
}
