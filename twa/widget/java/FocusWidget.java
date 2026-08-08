package __PKG__.widget;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;
import android.view.View;
import android.widget.RemoteViews;

import __PKG__.R;

/**
 * Uy ekrani widgeti — bugungi fokus holati ilovani ochmasdan ko'rinadi:
 * seriya (🔥), fokus daqiqalari va bajarilgan vazifalar + "Boshlash" tugmasi.
 *
 * Ma'lumot {@link FocusStats} orqali Supabase'dan keladi (o'qish uchun kod kerak,
 * u widget qo'yilganda {@link FocusWidgetConfigActivity}'da bir marta kiritiladi).
 * Tizim widgetni ~30 daqiqada bir yangilaydi; ⟳ tugmasi darhol yangilaydi.
 */
public class FocusWidget extends AppWidgetProvider {

    private static final String ACTION_REFRESH = "__PKG__.widget.REFRESH";
    private static final String HOST = "https://__HOST__";

    @Override
    public void onUpdate(Context ctx, AppWidgetManager mgr, int[] ids) {
        // goAsync() faqat broadcast yetkazilayotganda haqiqiy qiymat qaytaradi.
        update(ctx, mgr, ids, goAsync());
    }

    @Override
    public void onReceive(Context ctx, Intent intent) {
        if (intent != null && ACTION_REFRESH.equals(intent.getAction())) {
            AppWidgetManager mgr = AppWidgetManager.getInstance(ctx);
            update(ctx, mgr, mgr.getAppWidgetIds(new ComponentName(ctx, FocusWidget.class)), goAsync());
            return;
        }
        super.onReceive(ctx, intent);
    }

    /**
     * Bitta widgetni darhol chizadi. Sozlash oynasi shuni chaqiradi: config activity
     * ishlatilganda tizim BIRINCHI APPWIDGET_UPDATE'ni yubormaydi — chizish bizning
     * zimmamizda. Bu yerda {@code pending} yo'q (broadcast emas).
     */
    static void updateNow(Context ctx, int widgetId) {
        update(ctx, AppWidgetManager.getInstance(ctx), new int[]{ widgetId }, null);
    }

    /** ⟳ tugmasi va sozlash oynasi — barcha widgetlarni yangilash. */
    static void refreshAll(Context ctx) {
        ctx.sendBroadcast(new Intent(ctx, FocusWidget.class).setAction(ACTION_REFRESH));
    }

    /**
     * Avval keshdan chizadi (widget hech qachon bo'sh turmaydi), so'ng fonda
     * tarmoqdan yangilab qayta chizadi.
     *
     * @param pending broadcast konteksti bo'lsa — tarmoq tugagach yopiladi; aks holda null.
     */
    private static void update(final Context ctx, final AppWidgetManager mgr, final int[] ids,
                               final PendingResult pending) {
        render(ctx, mgr, ids);

        if (ids == null || ids.length == 0 || FocusStats.code(ctx).length() == 0) {
            if (pending != null) pending.finish();
            return;
        }

        new Thread(new Runnable() {
            @Override public void run() {
                try {
                    FocusStats.refresh(ctx);
                    render(ctx, mgr, ids);
                } catch (Throwable ignored) {
                } finally {
                    if (pending != null) pending.finish();
                }
            }
        }).start();
    }

    private static void render(Context ctx, AppWidgetManager mgr, int[] ids) {
        if (ids == null || ids.length == 0) return;
        RemoteViews v = build(ctx);
        for (int id : ids) mgr.updateAppWidget(id, v);
    }

    private static RemoteViews build(Context ctx) {
        RemoteViews v = new RemoteViews(ctx.getPackageName(), R.layout.focus_widget);
        SharedPreferences p = FocusStats.prefs(ctx);

        if (FocusStats.code(ctx).length() == 0) {
            // Kod hali kiritilmagan — kartani bosish sozlash oynasini ochadi.
            v.setTextViewText(R.id.fw_value, ctx.getString(R.string.fw_link_title));
            v.setTextViewText(R.id.fw_sub, ctx.getString(R.string.fw_link_sub));
            v.setViewVisibility(R.id.fw_streak, View.GONE);
            v.setViewVisibility(R.id.fw_start, View.GONE);
            v.setViewVisibility(R.id.fw_refresh, View.GONE);
            v.setOnClickPendingIntent(R.id.fw_root, configIntent(ctx));
            return v;
        }

        int mins = p.getInt(FocusStats.KEY_MINS, 0);
        int tasks = p.getInt(FocusStats.KEY_TASKS, 0);
        int streak = p.getInt(FocusStats.KEY_STREAK, 0);

        v.setTextViewText(R.id.fw_value, duration(ctx, mins));
        v.setTextViewText(R.id.fw_sub, ctx.getString(R.string.fw_tasks, tasks));

        if (streak > 0) {
            v.setTextViewText(R.id.fw_streak, ctx.getString(R.string.fw_streak, streak));
            v.setViewVisibility(R.id.fw_streak, View.VISIBLE);
        } else {
            v.setViewVisibility(R.id.fw_streak, View.GONE);
        }

        v.setViewVisibility(R.id.fw_start, View.VISIBLE);
        v.setViewVisibility(R.id.fw_refresh, View.VISIBLE);
        v.setOnClickPendingIntent(R.id.fw_root, open(ctx, "/home.html", 1));
        v.setOnClickPendingIntent(R.id.fw_start, open(ctx, "/hard-lock.html", 2));
        v.setOnClickPendingIntent(R.id.fw_refresh, refreshIntent(ctx));
        return v;
    }

    /** "45 daq" yoki "2 s 15 daq" — bir soatdan oshsa soat bilan. */
    private static String duration(Context ctx, int mins) {
        if (mins < 60) return ctx.getString(R.string.fw_mins, mins);
        int h = mins / 60, m = mins % 60;
        if (m == 0) return ctx.getString(R.string.fw_hours, h);
        return ctx.getString(R.string.fw_hours_mins, h, m);
    }

    /** Ilovani berilgan sahifada ochadi (TWA LauncherActivity intent data'sini o'qiydi). */
    private static PendingIntent open(Context ctx, String path, int req) {
        Intent i = ctx.getPackageManager().getLaunchIntentForPackage(ctx.getPackageName());
        if (i == null) i = new Intent(Intent.ACTION_VIEW);
        i.setData(Uri.parse(HOST + path));
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        return PendingIntent.getActivity(ctx, req, i, flags());
    }

    private static PendingIntent refreshIntent(Context ctx) {
        Intent i = new Intent(ctx, FocusWidget.class).setAction(ACTION_REFRESH);
        return PendingIntent.getBroadcast(ctx, 3, i, flags());
    }

    private static PendingIntent configIntent(Context ctx) {
        Intent i = new Intent(ctx, FocusWidgetConfigActivity.class);
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        return PendingIntent.getActivity(ctx, 4, i, flags());
    }

    private static int flags() {
        // FLAG_IMMUTABLE Android 12+ da MAJBURIY, lekin u API 23'da paydo bo'lgan —
        // minSdk 21 bo'lgani uchun versiya tekshiruvisiz lint (NewApi) build'ni yiqitadi.
        int f = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) f |= PendingIntent.FLAG_IMMUTABLE;
        return f;
    }
}
