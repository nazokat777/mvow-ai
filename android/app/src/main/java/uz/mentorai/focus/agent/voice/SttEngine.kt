package uz.mentorai.focus.agent.voice

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import uz.mentorai.focus.data.language.LanguageRepository
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Android SpeechRecognizer wrapper. Foydalanuvchi tilida tinglaydi.
 */
@Singleton
class SttEngine @Inject constructor(
    @ApplicationContext private val context: Context,
    private val languageRepository: LanguageRepository
) {
    private var recognizer: SpeechRecognizer? = null

    private val _state = MutableStateFlow<SttState>(SttState.Idle)
    val state: StateFlow<SttState> = _state.asStateFlow()

    val isAvailable: Boolean
        get() = SpeechRecognizer.isRecognitionAvailable(context)

    fun start(language: String = languageRepository.current.value.sttLocaleTag) {
        if (!isAvailable) {
            _state.value = SttState.Error("Tilni aniqlash xizmati mavjud emas")
            return
        }
        stop()  // Avvalgi sessiyani yopib qo'yamiz

        recognizer = SpeechRecognizer.createSpeechRecognizer(context).apply {
            setRecognitionListener(buildListener())
        }

        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, language)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, language)
            putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
            putExtra(RecognizerIntent.EXTRA_PREFER_OFFLINE, false)
            putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS, 2000L)
            putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS, 1500L)
        }

        _state.value = SttState.Listening
        recognizer?.startListening(intent)
    }

    fun stop() {
        recognizer?.stopListening()
        recognizer?.cancel()
        recognizer?.destroy()
        recognizer = null
    }

    fun release() {
        stop()
        _state.value = SttState.Idle
    }

    private fun buildListener() = object : RecognitionListener {
        override fun onReadyForSpeech(params: Bundle?) {
            _state.value = SttState.Listening
        }

        override fun onBeginningOfSpeech() {
            _state.value = SttState.Speaking()
        }

        override fun onRmsChanged(rmsdB: Float) {
            (_state.value as? SttState.Speaking)?.let {
                _state.value = SttState.Speaking(rmsdB)
            }
        }

        override fun onBufferReceived(buffer: ByteArray?) = Unit

        override fun onEndOfSpeech() {
            _state.value = SttState.Processing
        }

        override fun onError(error: Int) {
            val msg = when (error) {
                SpeechRecognizer.ERROR_NETWORK -> "Tarmoq xatosi"
                SpeechRecognizer.ERROR_NETWORK_TIMEOUT -> "Tarmoq vaqti tugadi"
                SpeechRecognizer.ERROR_AUDIO -> "Mikrofon xatosi"
                SpeechRecognizer.ERROR_NO_MATCH -> "Eshitilmadi. Yana urinib ko'r."
                SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> "Sukunat juda uzun"
                SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS -> "Mikrofon ruxsati yo'q"
                else -> "STT xatosi #$error"
            }
            _state.value = SttState.Error(msg)
        }

        override fun onResults(results: Bundle?) {
            val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
            val text = matches?.firstOrNull().orEmpty()
            _state.value = if (text.isBlank()) {
                SttState.Error("Eshitilmadi")
            } else {
                SttState.Final(text)
            }
        }

        override fun onPartialResults(partialResults: Bundle?) {
            val matches = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
            val text = matches?.firstOrNull().orEmpty()
            if (text.isNotBlank()) {
                _state.value = SttState.Partial(text)
            }
        }

        override fun onEvent(eventType: Int, params: Bundle?) = Unit
    }
}

sealed interface SttState {
    data object Idle : SttState
    data object Listening : SttState
    data class Speaking(val rmsdB: Float = 0f) : SttState
    data object Processing : SttState
    data class Partial(val text: String) : SttState
    data class Final(val text: String) : SttState
    data class Error(val message: String) : SttState
}
