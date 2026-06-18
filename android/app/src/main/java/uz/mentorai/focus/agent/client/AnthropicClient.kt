package uz.mentorai.focus.agent.client

import com.squareup.moshi.JsonAdapter
import com.squareup.moshi.Moshi
import com.squareup.moshi.Types
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.flow.flowOn
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.sse.EventSource
import okhttp3.sse.EventSourceListener
import okhttp3.sse.EventSources
import javax.inject.Inject
import javax.inject.Named
import javax.inject.Singleton

/**
 * Anthropic Messages API client (SSE streaming).
 *
 * Production'da bu qatlam server proxy bilan almashtirilishi kerak —
 * API kaliti clientda saqlanishi xavfli (bypass uchun ekstrakt qilinishi mumkin).
 */
@Singleton
class AnthropicClient @Inject constructor(
    private val httpClient: OkHttpClient,
    private val moshi: Moshi,
    @Named("anthropic_api_key") private val apiKey: String
) {
    private val requestAdapter: JsonAdapter<MessagesRequest> =
        moshi.adapter(MessagesRequest::class.java)

    private val mapAdapter: JsonAdapter<Map<String, Any>> =
        moshi.adapter(Types.newParameterizedType(Map::class.java, String::class.java, Any::class.java))

    val isConfigured: Boolean get() = apiKey.isNotBlank()

    fun streamMessage(request: MessagesRequest): Flow<StreamEvent> = callbackFlow {
        if (!isConfigured) {
            trySend(StreamEvent.Error("API key sozlanmagan. local.properties da ANTHROPIC_API_KEY qo'shing."))
            close()
            return@callbackFlow
        }

        val body = requestAdapter.toJson(request)
            .toRequestBody("application/json".toMediaType())

        val httpRequest = Request.Builder()
            .url(BASE_URL)
            .addHeader("x-api-key", apiKey)
            .addHeader("anthropic-version", "2023-06-01")
            .addHeader("content-type", "application/json")
            .post(body)
            .build()

        // Anthropic `stop_reason`ni `message_delta` event'ida yuboradi (`message_stop`da emas).
        // Uni shu yerda ushlab, oqim tugaganda MessageStop bilan emit qilamiz.
        var capturedStopReason: String? = null

        val factory = EventSources.createFactory(httpClient)
        val source: EventSource = factory.newEventSource(httpRequest, object : EventSourceListener() {
            override fun onEvent(
                eventSource: EventSource,
                id: String?,
                type: String?,
                data: String
            ) {
                if (data.isBlank() || data == "[DONE]") return
                try {
                    val parsed = mapAdapter.fromJson(data) ?: return
                    when (parsed["type"] as? String) {
                        "content_block_start" -> {
                            val contentBlock = parsed["content_block"] as? Map<*, *>
                            if (contentBlock?.get("type") == "tool_use") {
                                trySend(
                                    StreamEvent.ToolUseStart(
                                        toolName = contentBlock["name"] as? String ?: "",
                                        toolUseId = contentBlock["id"] as? String ?: ""
                                    )
                                )
                            }
                        }
                        "content_block_delta" -> {
                            val delta = parsed["delta"] as? Map<*, *> ?: return
                            when (delta["type"]) {
                                "text_delta" -> {
                                    val text = delta["text"] as? String ?: return
                                    trySend(StreamEvent.TextDelta(text))
                                }
                                "input_json_delta" -> {
                                    val partial = delta["partial_json"] as? String ?: return
                                    trySend(StreamEvent.ToolUseInputJson(partial))
                                }
                            }
                        }
                        "message_delta" -> {
                            val delta = parsed["delta"] as? Map<*, *>
                            (delta?.get("stop_reason") as? String)?.let { capturedStopReason = it }
                        }
                        "message_stop" -> {
                            trySend(StreamEvent.MessageStop(capturedStopReason))
                        }
                    }
                } catch (e: Exception) {
                    trySend(StreamEvent.Error("Parse error: ${e.message}"))
                }
            }

            override fun onFailure(eventSource: EventSource, t: Throwable?, response: okhttp3.Response?) {
                val errorBody = response?.body?.string().orEmpty()
                val msg = t?.message ?: response?.message ?: "unknown"
                trySend(StreamEvent.Error("HTTP error: $msg ${errorBody.take(200)}"))
                close()
            }

            override fun onClosed(eventSource: EventSource) { close() }
        })

        awaitClose { source.cancel() }
    }.flowOn(Dispatchers.IO)

    companion object {
        const val BASE_URL = "https://api.anthropic.com/v1/messages"
    }
}
