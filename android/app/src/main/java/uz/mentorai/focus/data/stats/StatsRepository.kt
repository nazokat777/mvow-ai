package uz.mentorai.focus.data.stats

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.Locale
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class StatsRepository @Inject constructor(
    private val dao: DailyStatsDao
) {
    val recentStats: Flow<List<DailyStatsEntity>> = dao.observeRecent()

    val currentStreak: Flow<Int> = recentStats.map { computeStreak(it) }

    suspend fun ensureToday(): String {
        val today = todayKey()
        if (dao.getByDate(today) == null) {
            dao.upsert(DailyStatsEntity(date = today))
        }
        return today
    }

    suspend fun recordSessionCompleted(durationMinutes: Int) {
        val today = ensureToday()
        dao.incrementCompleted(today, durationMinutes)
    }

    suspend fun recordSessionAbandoned() {
        val today = ensureToday()
        dao.incrementAbandoned(today)
        dao.markStreakBroken(today)
    }

    suspend fun recordIntercept() {
        val today = ensureToday()
        dao.incrementIntercepts(today)
    }

    suspend fun recordOverrideGranted() {
        val today = ensureToday()
        dao.incrementOverrides(today)
    }

    suspend fun recordStreakBroken() {
        val today = ensureToday()
        dao.markStreakBroken(today)
    }

    /**
     * Streak: bugundan boshlab orqaga qarab, har kuni `countsTowardStreak`
     * bo'lsa hisoblaymiz.
     *
     * Muhim: bugun hali yozuv bo'lmasa (foydalanuvchi hali hech narsa qilmagan)
     * streak uzilmaydi — kechagi kunga o'tamiz. O'tgan kunlarda yozuv yo'qligi
     * esa haqiqiy uzilish bo'ladi.
     */
    private fun computeStreak(stats: List<DailyStatsEntity>): Int {
        if (stats.isEmpty()) return 0
        val byDate = stats.associateBy { it.date }
        var streak = 0
        var date = LocalDate.now()
        val today = LocalDate.now()

        while (true) {
            val key = date.format(DATE_FMT)
            val entry = byDate[key]
            val isToday = date == today

            if (entry == null) {
                // Bugun yozuv yo'q — kun hali davom etmoqda, uzmaymiz.
                // O'tgan kunda yozuv yo'q — haqiqiy uzilish.
                if (isToday) { date = date.minusDays(1); continue } else break
            }

            when {
                entry.streakBroken -> break
                entry.countsTowardStreak -> { streak++; date = date.minusDays(1) }
                isToday -> { date = date.minusDays(1) }  // bugun, hali tugallanmagan
                else -> break
            }
        }
        return streak
    }

    private fun todayKey(): String = LocalDate.now().format(DATE_FMT)

    companion object {
        // Locale.ROOT — qurilma tili (masalan, arabcha) raqamlarni o'zgartirmasligi uchun.
        // Saqlash va o'qish bitta formatterdan foydalanadi.
        private val DATE_FMT: DateTimeFormatter =
            DateTimeFormatter.ofPattern("yyyy-MM-dd", Locale.ROOT)
    }
}
