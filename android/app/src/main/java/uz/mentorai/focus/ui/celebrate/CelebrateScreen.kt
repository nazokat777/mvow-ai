package uz.mentorai.focus.ui.celebrate

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import uz.mentorai.focus.ui.components.MentorPrimaryButton
import uz.mentorai.focus.ui.theme.MentorColors
import kotlin.math.cos
import kotlin.math.sin

enum class CelebrateVariant(
    val label: String,
    val pre: String,
    val title: String,
    val accent: Color,
    val deep: Color,
    val letter: String,
    val signature: String,
    val statsLine: String,
    val nextLabel: String
) {
    MOUNTAIN(
        "CHO'QQI", "CHO'QQIGA YETDING",
        "birinchi cho'qqi · senga aytaman",
        Color(0xFFE8C77E), Color(0xFF1A1410),
        "Bir hafta. 7 kun sen tepaga qarading va qadam tashladding. Ko'pchilik birinchi yon bag'irda to'xtaydi. Sen — yo'lda. Yuqorida yana cho'qqilar bor — lekin bugun bu seniki.",
        "— men sen bilan birgaman",
        "47 SOAT · 38 SESSIYA · +12%",
        "Yangi hafta"
    ),
    STARS(
        "YULDUZLAR", "YULDUZLARING YONDI",
        "7 yulduz · har biri sening",
        Color(0xFFC5DBED), Color(0xFF0A0E20),
        "Har bajarilgan kun — bir yulduz. Bu hafta sen 7 ta yondirding. Bir-biriga ulansa — yo'l ko'rinadi. Bu yo'l sennikiga aylanmoqda.",
        "— sening osmonda izing bor",
        "7/7 KUN · 95% BAJARILDI",
        "Yangi yulduz tutamiz"
    ),
    GARDEN(
        "BOG'", "BOG'ING GULLADI",
        "har gul · bir g'alaba",
        Color(0xFFC28B8B), Color(0xFF1F1416),
        "Bu hafta ekkanlaring gulladi. Birorta urug' shu kun gullashini bilmasdi. Sen sabr qilding — bog' ochildi.",
        "— bog'ingda bahor bor",
        "5 GUL · 2 KURTAK",
        "Yangi urug'lar"
    ),
    TREE(
        "DARAXT", "DARAXTING O'SDI",
        "yana bir halqa · ichkarida",
        Color(0xFF6BAF7C), Color(0xFF0F1F12),
        "Daraxt halqasi har yili bir bor o'sadi. Sening ichingda — har hafta bir bor. Bu hafta yana bir halqa qo'shildi. Ildizlaring chuqurroq.",
        "— ichingda o'rmon bor",
        "12 HAFTA · ILDIZ CHUQUR",
        "Yangi halqa"
    ),
    RIVER(
        "DARYO", "DARYODAN O'TDING",
        "ikkinchi qirg'oq · seni kutardi",
        Color(0xFF7CA8C9), Color(0xFF0C1620),
        "Suv yengilmi? Yo'q. Lekin sen kechib o'tding. Boshqa qirg'oq endi seniki. Orqaga qaragin — eski sen u yerda qoldi.",
        "— oqim seni olib o'tdi",
        "DARYO YENGILDI",
        "Yangi qirg'oqqa"
    ),
    DAWN(
        "TONG", "TONGING OTDI",
        "qorong'idan keyin · yorug'lik",
        Color(0xFFFFD4A3), Color(0xFF1A1006),
        "Eng qorong'i payt — tongdan oldin. Sen sabrlik bilan kutding. Quyosh chiqdi. Endi yana 7 kun yorug'lik bor.",
        "— tongning birinchi nuri",
        "QORONG'I YENGILDI",
        "Yangi tong"
    ),
    PHOENIX(
        "QAYTA TUG'ILDIM", "QAYTA TUG'ILDING",
        "kuldan · yana ko'tarilding",
        Color(0xFFE63946), Color(0xFF1F0606),
        "Eski sen kuyib ketdi. Yangi sen ko'tarildi — kuchliroq, ravshanroq. Bu o'zgarish og'ir edi, lekin sen omon qolding.",
        "— olovingda noyob hayot bor",
        "QAYTA TUG'ILISH · YANGI YOSH",
        "Yangi qanot"
    ),
    KEY(
        "KALIT", "KALIT QO'LIDA",
        "ichkari eshik · ochildi",
        Color(0xFFC7A36B), Color(0xFF14100A),
        "Yopiq eshik — kun sayin kichikroq edi. Bir hafta sen bir kalit yasading: intizom. Endi eshik ochildi. Ichkarida — kuchli sen.",
        "— kalit doim qo'lingda edi",
        "ESHIK OCHILDI",
        "Yangi xona"
    );
}

@Composable
fun CelebrateScreen(
    initial: CelebrateVariant = CelebrateVariant.MOUNTAIN,
    onNextWeek: (CelebrateVariant) -> Unit = {}
) {
    var variant by remember { mutableStateOf(initial) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(variant.deep)
    ) {
        Box(modifier = Modifier.weight(1f)) {
            VariantArt(variant = variant)
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 24.dp, vertical = 28.dp),
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                Headline(variant = variant)
                MentorLetter(variant = variant)
            }
        }
        VariantTabs(current = variant, onPick = { variant = it })
        Spacer(Modifier.height(8.dp))
        BottomBar(variant = variant, onNext = { onNextWeek(variant) })
    }
}

@Composable
private fun Headline(variant: CelebrateVariant) {
    Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
        Text(variant.pre, color = variant.accent, fontSize = 10.sp, letterSpacing = 5.sp, fontWeight = FontWeight.SemiBold)
        Spacer(Modifier.height(10.dp))
        Text(
            "TABRIKLAYMAN",
            color = MentorColors.TextPrimary,
            fontSize = 32.sp,
            letterSpacing = 6.sp,
            fontWeight = FontWeight.Bold,
            textAlign = TextAlign.Center
        )
        Spacer(Modifier.height(6.dp))
        Text(
            variant.title,
            color = variant.accent,
            fontSize = 13.sp,
            fontStyle = FontStyle.Italic,
            textAlign = TextAlign.Center
        )
    }
}

@Composable
private fun MentorLetter(variant: CelebrateVariant) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(8.dp))
            .background(variant.accent.copy(alpha = 0.06f))
            .border(1.dp, variant.accent.copy(alpha = 0.3f), RoundedCornerShape(8.dp))
            .padding(16.dp)
    ) {
        Text(
            variant.letter,
            color = MentorColors.TextBody,
            fontSize = 14.sp,
            fontStyle = FontStyle.Italic,
            lineHeight = 22.sp
        )
        Spacer(Modifier.height(10.dp))
        Text(
            variant.signature,
            color = variant.accent,
            fontSize = 12.sp,
            fontStyle = FontStyle.Italic,
            textAlign = TextAlign.End,
            modifier = Modifier.fillMaxWidth()
        )
    }
}

@Composable
private fun VariantArt(variant: CelebrateVariant) {
    val transition = rememberInfiniteTransition(label = "art")
    val phase by transition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(tween(6000, easing = LinearEasing), RepeatMode.Reverse),
        label = "phase"
    )

    Canvas(modifier = Modifier.fillMaxSize()) {
        when (variant) {
            CelebrateVariant.MOUNTAIN -> drawMountain(variant.accent, phase)
            CelebrateVariant.STARS -> drawStars(variant.accent, phase)
            CelebrateVariant.GARDEN -> drawGarden(variant.accent, phase)
            CelebrateVariant.TREE -> drawTree(variant.accent, phase)
            CelebrateVariant.RIVER -> drawRiver(variant.accent, phase)
            CelebrateVariant.DAWN -> drawDawn(variant.accent, phase)
            CelebrateVariant.PHOENIX -> drawPhoenix(variant.accent, phase)
            CelebrateVariant.KEY -> drawKey(variant.accent, phase)
        }
    }
}

private fun DrawScope.drawMountain(accent: Color, phase: Float) {
    val w = size.width
    val h = size.height
    val backRange = listOf(0f to h, 0.29f to h * 0.32f, 0.58f to h * 0.64f, 0.74f to h * 0.14f, 1f to h)
    val frontRange = listOf(0f to h, 0.21f to h * 0.6f, 0.5f to h * 0.28f, 0.74f to h * 0.71f, 1f to h)

    val backPath = Path().apply {
        moveTo(0f, h)
        backRange.forEach { (xR, y) -> lineTo(xR * w, y) }
    }
    drawPath(backPath, color = Color(0xFF0A0E16))
    drawPath(backPath, color = accent.copy(alpha = 0.4f), style = Stroke(width = 1.dp.toPx()))

    val frontPath = Path().apply {
        moveTo(0f, h)
        frontRange.forEach { (xR, y) -> lineTo(xR * w, y) }
    }
    drawPath(frontPath, brush = Brush.verticalGradient(listOf(Color(0xFF1A1410), Color(0xFF04060B))))
    drawPath(frontPath, color = accent, style = Stroke(width = 1.5.dp.toPx()))

    drawCircle(
        color = accent,
        radius = (3 + 2 * phase) * 4f,
        center = Offset(w * 0.5f, h * 0.28f)
    )
}

private fun DrawScope.drawStars(accent: Color, phase: Float) {
    val stars = listOf(
        Offset(0.13f, 0.21f), Offset(0.37f, 0.38f), Offset(0.30f, 0.67f),
        Offset(0.60f, 0.54f), Offset(0.77f, 0.25f), Offset(0.87f, 0.75f),
        Offset(0.50f, 0.83f)
    )
    val path = Path().apply {
        stars.forEachIndexed { i, p ->
            if (i == 0) moveTo(p.x * size.width, p.y * size.height)
            else lineTo(p.x * size.width, p.y * size.height)
        }
    }
    drawPath(path, color = accent.copy(alpha = 0.35f + 0.25f * phase), style = Stroke(width = 1.2.dp.toPx()))
    stars.forEach { p ->
        drawCircle(color = accent, radius = (3 + phase * 2) * 1.2f * size.minDimension / 100f, center = Offset(p.x * size.width, p.y * size.height))
        drawCircle(color = accent.copy(alpha = 0.3f), radius = (8 + phase * 4) * 1.2f * size.minDimension / 100f, center = Offset(p.x * size.width, p.y * size.height))
    }
}

private fun DrawScope.drawGarden(accent: Color, phase: Float) {
    val flowers = listOf(
        Triple(0.18f, 0.78f, accent),
        Triple(0.42f, 0.86f, Color(0xFFE8C77E)),
        Triple(0.65f, 0.74f, accent),
        Triple(0.83f, 0.82f, Color(0xFFFFE9B5))
    )
    flowers.forEachIndexed { i, (xR, yR, c) ->
        val cx = xR * size.width
        val cy = yR * size.height
        val r = (10 + 4 * phase) * size.minDimension / 100f
        for (k in 0 until 5) {
            val angle = (k * 72f + i * 17f) * (3.14159f / 180f)
            val px = cx + cos(angle) * r * 1.8f
            val py = cy + sin(angle) * r * 1.2f
            drawCircle(color = c.copy(alpha = 0.85f), radius = r, center = Offset(px, py))
        }
        drawCircle(color = Color(0xFFFFE9B5), radius = r * 0.6f, center = Offset(cx, cy))
    }
}

private fun DrawScope.drawTree(accent: Color, phase: Float) {
    val cx = size.width / 2
    val cy = size.height * 0.55f
    val maxR = size.minDimension * 0.42f
    for (i in 1..8) {
        val ringR = maxR * (i / 8f)
        drawCircle(
            color = accent.copy(alpha = 0.10f + 0.06f * (i / 8f) + 0.05f * phase),
            radius = ringR,
            center = Offset(cx, cy),
            style = Stroke(width = 1.4.dp.toPx())
        )
    }
    drawCircle(color = accent.copy(alpha = 0.7f), radius = maxR * 0.08f, center = Offset(cx, cy))
}

private fun DrawScope.drawRiver(accent: Color, phase: Float) {
    val w = size.width
    val h = size.height
    val path = Path().apply {
        moveTo(0f, h * 0.55f)
        cubicTo(w * 0.25f, h * (0.45f + 0.1f * phase), w * 0.5f, h * (0.7f - 0.1f * phase), w * 0.75f, h * (0.5f + 0.05f * phase))
        lineTo(w, h * 0.6f)
        lineTo(w, h)
        lineTo(0f, h)
        close()
    }
    drawPath(path, brush = Brush.verticalGradient(listOf(accent.copy(alpha = 0.25f), accent.copy(alpha = 0.05f))))
    drawPath(path, color = accent, style = Stroke(width = 1.5.dp.toPx()))
}

private fun DrawScope.drawDawn(accent: Color, phase: Float) {
    val cx = size.width / 2
    val cy = size.height * 0.85f
    val maxR = size.minDimension * 0.6f
    drawCircle(
        brush = Brush.radialGradient(
            colors = listOf(accent.copy(alpha = 0.7f), accent.copy(alpha = 0.1f), Color.Transparent),
            center = Offset(cx, cy),
            radius = maxR
        ),
        radius = maxR,
        center = Offset(cx, cy)
    )
    drawCircle(color = accent.copy(alpha = 0.6f + 0.2f * phase), radius = size.minDimension * 0.15f, center = Offset(cx, cy))
}

private fun DrawScope.drawPhoenix(accent: Color, phase: Float) {
    val cx = size.width / 2
    val cy = size.height * 0.5f
    for (i in 0..14) {
        val angle = (i * 24f + 90f * phase) * (3.14159f / 180f)
        val r = size.minDimension * (0.15f + 0.18f * (i % 3) / 3f)
        val x = cx + cos(angle) * r
        val y = cy + sin(angle) * r * 0.7f
        drawCircle(
            color = accent.copy(alpha = 0.5f + 0.3f * phase),
            radius = (4 + 3 * phase) * size.minDimension / 200f,
            center = Offset(x, y)
        )
    }
    drawCircle(color = accent, radius = size.minDimension * 0.06f, center = Offset(cx, cy))
}

private fun DrawScope.drawKey(accent: Color, phase: Float) {
    val cx = size.width / 2
    val cy = size.height * 0.5f
    val rot = phase * 30f * (3.14159f / 180f)
    drawCircle(color = accent.copy(alpha = 0.8f), radius = size.minDimension * 0.10f, center = Offset(cx, cy), style = Stroke(width = 3.dp.toPx()))
    val len = size.minDimension * 0.32f
    val ex = cx + cos(rot) * len
    val ey = cy + sin(rot) * len
    drawLine(color = accent, start = Offset(cx, cy), end = Offset(ex, ey), strokeWidth = 4.dp.toPx())
    drawLine(color = accent, start = Offset(ex, ey), end = Offset(ex + cos(rot + 1.57f) * 16f, ey + sin(rot + 1.57f) * 16f), strokeWidth = 4.dp.toPx())
    drawLine(color = accent, start = Offset(ex * 0.92f + cx * 0.08f, ey * 0.92f + cy * 0.08f), end = Offset(ex * 0.92f + cx * 0.08f + cos(rot + 1.57f) * 12f, ey * 0.92f + cy * 0.08f + sin(rot + 1.57f) * 12f), strokeWidth = 4.dp.toPx())
}

@Composable
private fun VariantTabs(current: CelebrateVariant, onPick: (CelebrateVariant) -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 12.dp),
        horizontalArrangement = Arrangement.SpaceEvenly
    ) {
        CelebrateVariant.entries.forEach { v ->
            VariantDot(
                label = v.label,
                color = v.accent,
                selected = current == v,
                onClick = { onPick(v) }
            )
        }
    }
}

@Composable
private fun VariantDot(label: String, color: Color, selected: Boolean, onClick: () -> Unit) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.clickable { onClick() }.padding(vertical = 4.dp, horizontal = 2.dp)
    ) {
        Box(
            modifier = Modifier
                .height(6.dp)
                .padding(horizontal = 4.dp)
                .clip(RoundedCornerShape(2.dp))
                .background(if (selected) color else MentorColors.TextGhost)
        ) { Spacer(Modifier.height(6.dp).background(color)) }
        Spacer(Modifier.height(4.dp))
        Text(
            label,
            color = if (selected) color else MentorColors.TextMuted,
            fontSize = 7.5.sp,
            letterSpacing = 1.sp,
            fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal
        )
    }
}

@Composable
private fun BottomBar(variant: CelebrateVariant, onNext: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp, vertical = 14.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        MentorPrimaryButton(text = variant.nextLabel, onClick = onNext)
        Spacer(Modifier.height(8.dp))
        Text(variant.statsLine, color = variant.accent, fontSize = 10.sp, letterSpacing = 2.sp)
    }
}
