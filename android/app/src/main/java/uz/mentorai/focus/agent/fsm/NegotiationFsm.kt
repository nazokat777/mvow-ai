package uz.mentorai.focus.agent.fsm

import uz.mentorai.focus.data.session.SessionEntity
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Negotiation FSM — qarorni LLM emas, qoidalar qabul qiladi.
 *
 * MVP: clientda. Sprint 4'da serverga ko'chiriladi (signed token bilan)
 * chunki client tarafida bypass mumkin (foydalanuvchi APK'ni patch qilishi mumkin).
 */
@Singleton
class NegotiationFsm @Inject constructor() {

    /** LLM dan oldingi pre-check'lar */
    fun preCheck(context: NegotiationContext): PreCheckResult {
        // 1. Quota
        if (context.requestsToday >= MAX_REQUESTS_PER_DAY) {
            return PreCheckResult.HardDeny(
                reason = "Bugun 3 marta so'raganingiz bor. Javob: yo'q.",
                skipLlm = true
            )
        }

        // 2. Sessiya juda yangi
        if (context.minutesElapsed < MIN_MINUTES_BEFORE_NEGOTIATION) {
            return PreCheckResult.SoftDeny(
                reason = "Hozir ${context.minutesElapsed} daqiqa o'tdi. " +
                         "Avval kamida ${MIN_MINUTES_BEFORE_NEGOTIATION} daqiqa fokus qil.",
                skipLlm = true
            )
        }

        // 3. Yuqori xavfli kategoriya — vocal commitment talab
        if (context.appCategory in HIGH_RISK_CATEGORIES) {
            return PreCheckResult.RequireVocalCommitment(
                phrase = "Men o'zimga bergan va'damni buzyapman.",
                onSuccessGrantMinutes = 5,
                streakPenalty = true
            )
        }

        return PreCheckResult.AllowLlmConsultation
    }

    /** LLM tavsiyasidan keyin yakuniy qaror */
    fun finalDecide(
        context: NegotiationContext,
        recommendation: LlmRecommendation
    ): Decision {
        if (recommendation.isGenuineEmergency) {
            return Decision.Grant(
                minutes = 15,
                streakPenalty = false,
                logForReview = true
            )
        }

        if (recommendation.isRationalization && recommendation.confidence > 0.7) {
            return Decision.HardDeny
        }

        // O'rtacha — kichik grant
        return Decision.Grant(
            minutes = 2,
            streakPenalty = true,
            logForReview = false
        )
    }

    companion object {
        const val MAX_REQUESTS_PER_DAY = 3
        const val MIN_MINUTES_BEFORE_NEGOTIATION = 25
        // Ibodat (worship) ataylab chiqarib tashlandi — uni "yuqori xavfli chalg'ituvchi"
        // deb belgilash qadriyatlarga zid. Ibodat focus kategoriyasi sifatida qoladi.
        val HIGH_RISK_CATEGORIES = setOf("social_media", "short_video")
    }
}

data class NegotiationContext(
    val session: SessionEntity,
    val minutesElapsed: Int,
    val minutesRemaining: Int,
    val requestsToday: Int,
    val streakDays: Int,
    val appCategory: String,
    val interceptsToday: Int
)

data class LlmRecommendation(
    val isGenuineEmergency: Boolean,
    val isRationalization: Boolean,
    val category: String,
    val confidence: Double,
    val spokenResponse: String
)

sealed interface PreCheckResult {
    data object AllowLlmConsultation : PreCheckResult
    data class HardDeny(val reason: String, val skipLlm: Boolean) : PreCheckResult
    data class SoftDeny(val reason: String, val skipLlm: Boolean) : PreCheckResult
    data class RequireVocalCommitment(
        val phrase: String,
        val onSuccessGrantMinutes: Int,
        val streakPenalty: Boolean
    ) : PreCheckResult
}

sealed interface Decision {
    data class Grant(
        val minutes: Int,
        val streakPenalty: Boolean,
        val logForReview: Boolean
    ) : Decision
    data object HardDeny : Decision
    data class SoftDeny(val reason: String) : Decision
}
