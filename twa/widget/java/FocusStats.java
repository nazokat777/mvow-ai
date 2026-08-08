package __PKG__.widget;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;

/**
 * Widget uchun statistika qatlami.
 *
 * Ma'lumot manbai — Supabase `daily_stats` jadvali (ilova uni har bir vazifadan keyin
 * yangilaydi, {@code social.js} → syncStats). Widget faqat O'QIYDI, hech narsa yozmaydi.
 * Foydalanuvchi kodi (mas. ABC123) widget qo'yilganda bir marta kiritiladi.
 *
 * Barcha qiymatlar SharedPreferences'da keshlanadi — internet yo'q bo'lsa widget
 * bo'sh emas, oxirgi ma'lum holatni ko'rsatadi.
 */
final class FocusStats {

    static final String PREFS = "focus_widget";
    static final String KEY_CODE = "code";
    static final String KEY_MINS = "mins";
    static final String KEY_TASKS = "tasks";
    static final String KEY_STREAK = "streak";
    static final String KEY_SYNCED = "synced_at";

    /** Supabase publishable (anon) kaliti — klientda ochiq bo'lishi mo'ljallangan. */
    private static final String SB_URL = "__SB_URL__";
    private static final String SB_KEY = "__SB_KEY__";

    /** Seriyani hisoblashda necha kun orqaga qaraymiz. */
    private static final int LOOKBACK_DAYS = 60;

    private FocusStats() {}

    static SharedPreferences prefs(Context ctx) {
        return ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    static String code(Context ctx) {
        return prefs(ctx).getString(KEY_CODE, "");
    }

    static void setCode(Context ctx, String code) {
        prefs(ctx).edit().putString(KEY_CODE, code)
                .remove(KEY_MINS).remove(KEY_TASKS).remove(KEY_STREAK).remove(KEY_SYNCED)
                .apply();
    }

    static String todayIso() {
        return new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
    }

    /**
     * Tarmoqdan yangilaydi va keshga yozadi. Faqat fon oqimidan chaqiriladi.
     * Xato bo'lsa kesh tegilmaydi (eski ko'rsatkich qoladi).
     */
    static void refresh(Context ctx) {
        String code = code(ctx);
        if (code.length() == 0) return;

        String body = get(SB_URL + "/rest/v1/daily_stats"
                + "?select=d,focus_mins,habits"
                + "&code=eq." + enc(code)
                + "&order=d.desc"
                + "&limit=" + LOOKBACK_DAYS);
        if (body == null) return;

        int mins = 0, tasks = 0;
        Set<String> activeDays = new HashSet<String>();
        String today = todayIso();

        try {
            JSONArray rows = new JSONArray(body);
            for (int i = 0; i < rows.length(); i++) {
                JSONObject r = rows.optJSONObject(i);
                if (r == null) continue;
                String d = r.optString("d", "");
                // null (bekitilgan) qiymatlar 0 bo'lib keladi — bu to'g'ri xatti-harakat.
                int m = r.isNull("focus_mins") ? 0 : r.optInt("focus_mins", 0);
                int h = r.isNull("habits") ? 0 : r.optInt("habits", 0);
                if (m > 0 || h > 0) activeDays.add(d);
                if (today.equals(d)) { mins = m; tasks = h; }
            }
        } catch (Exception e) {
            return;   // buzuq javob — keshni buzmaymiz
        }

        prefs(ctx).edit()
                .putInt(KEY_MINS, mins)
                .putInt(KEY_TASKS, tasks)
                .putInt(KEY_STREAK, streak(activeDays))
                .putLong(KEY_SYNCED, System.currentTimeMillis())
                .apply();
    }

    /**
     * Ketma-ket faol kunlar soni. Bugun hali bo'sh bo'lsa kechadan boshlab sanaydi —
     * ya'ni ertalab seriya "nolga tushib" foydalanuvchini cho'chitmaydi.
     */
    static int streak(Set<String> activeDays) {
        SimpleDateFormat fmt = new SimpleDateFormat("yyyy-MM-dd", Locale.US);
        Calendar cal = Calendar.getInstance();
        if (!activeDays.contains(fmt.format(cal.getTime()))) {
            cal.add(Calendar.DAY_OF_YEAR, -1);          // bugun hali boshlanmagan
        }
        int n = 0;
        while (n < LOOKBACK_DAYS && activeDays.contains(fmt.format(cal.getTime()))) {
            n++;
            cal.add(Calendar.DAY_OF_YEAR, -1);
        }
        return n;
    }

    private static String enc(String s) {
        try { return URLEncoder.encode(s, "UTF-8"); } catch (Exception e) { return s; }
    }

    /** Oddiy GET. Xatoda null. */
    private static String get(String url) {
        HttpURLConnection c = null;
        try {
            c = (HttpURLConnection) new URL(url).openConnection();
            c.setConnectTimeout(8000);
            c.setReadTimeout(8000);
            c.setRequestProperty("apikey", SB_KEY);
            c.setRequestProperty("Authorization", "Bearer " + SB_KEY);
            c.setRequestProperty("Accept", "application/json");
            if (c.getResponseCode() != 200) return null;
            InputStream in = c.getInputStream();
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            byte[] buf = new byte[4096];
            int n;
            while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
            in.close();
            return out.toString("UTF-8");
        } catch (Exception e) {
            return null;
        } finally {
            if (c != null) c.disconnect();
        }
    }
}
