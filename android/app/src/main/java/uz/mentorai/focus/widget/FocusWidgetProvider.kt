package uz.mentorai.focus.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.SystemClock
import android.view.View
import android.widget.RemoteViews
import uz.mentorai.focus.MainActivity
import uz.mentorai.focus.R

/**
 * Uy ekrani widgeti (TZ §6 bonus) — faol fokus sessiyasining qolgan vaqtini
 * JONLI (Chronometer, tizim o'zi yangilaydi) ilovani ochmasdan ko'rsatadi.
 * Sessiya yo'q bo'lsa — "Fokusni boshlang" + bosilsa ilova ochiladi.
 *
 * Holat SharedPreferences orqali keladi: FocusGuardService sessiya boshlanganда
 * setActive(...), tugaganda clear(...) chaqiradi.
 */
class FocusWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(context: Context, mgr: AppWidgetManager, ids: IntArray) {
        val views = buildViews(context)
        for (id in ids) mgr.updateAppWidget(id, views)
    }

    companion object {
        private const val PREFS = "mvow_widget"
        private const val KEY_END = "focus_end_at"
        private const val KEY_LABEL = "focus_label"

        /** Sessiya boshlanganda — widgetда jonli countdown ko'rsatish. */
        fun setActive(context: Context, endAtMillis: Long, label: String) {
            context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
                .putLong(KEY_END, endAtMillis)
                .putString(KEY_LABEL, label)
                .apply()
            refresh(context)
        }

        /** Sessiya tugaganda — widgetni "boshlash" holatiga qaytarish. */
        fun clear(context: Context) {
            context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
                .remove(KEY_END)
                .remove(KEY_LABEL)
                .apply()
            refresh(context)
        }

        private fun refresh(context: Context) {
            val mgr = AppWidgetManager.getInstance(context)
            val ids = mgr.getAppWidgetIds(ComponentName(context, FocusWidgetProvider::class.java))
            val views = buildViews(context)
            for (id in ids) mgr.updateAppWidget(id, views)
        }

        private fun buildViews(context: Context): RemoteViews {
            val v = RemoteViews(context.packageName, R.layout.widget_focus)
            val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            val endAt = prefs.getLong(KEY_END, 0L)
            val now = System.currentTimeMillis()

            if (endAt > now) {
                // Faol fokus — qolgan vaqt jonli sanaydi
                val base = SystemClock.elapsedRealtime() + (endAt - now)
                v.setChronometer(R.id.widgetChrono, base, null, true)
                v.setChronometerCountDown(R.id.widgetChrono, true)
                v.setViewVisibility(R.id.widgetChrono, View.VISIBLE)
                v.setViewVisibility(R.id.widgetHint, View.GONE)
                v.setTextViewText(R.id.widgetLabel, prefs.getString(KEY_LABEL, "Fokus"))
            } else {
                v.setViewVisibility(R.id.widgetChrono, View.GONE)
                v.setViewVisibility(R.id.widgetHint, View.VISIBLE)
                v.setTextViewText(R.id.widgetLabel, "Fokus AI")
            }

            // Bosilsa — ilova ochiladi
            val intent = Intent(context, MainActivity::class.java)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
            val flags = PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            val pi = PendingIntent.getActivity(context, 0, intent, flags)
            v.setOnClickPendingIntent(R.id.widgetRoot, pi)
            return v
        }
    }
}
