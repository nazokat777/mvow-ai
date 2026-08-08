package __PKG__.widget;

import android.app.Activity;
import android.appwidget.AppWidgetManager;
import android.content.Intent;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;

import java.util.Locale;
import java.util.regex.Pattern;

import __PKG__.R;

/**
 * Widget qo'yilganda ochiladigan sozlash oynasi: foydalanuvchi o'z kodini kiritadi.
 *
 * Kod — ilovadagi qurilma identifikatori (mas. ABC123), Menyu → Do'stlar bo'limida
 * ko'rinadi. Widget shu kod bo'yicha bulutdan bugungi statistikani o'qiydi.
 */
public class FocusWidgetConfigActivity extends Activity {

    private static final Pattern CODE = Pattern.compile("^[A-Z]{3}[0-9]{3}$");

    private int widgetId = AppWidgetManager.INVALID_APPWIDGET_ID;
    private EditText input;
    private Button save;
    private TextView error;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);

        // Foydalanuvchi sozlashni bekor qilsa (Orqaga) — widget qo'yilmaydi.
        setResult(RESULT_CANCELED);

        Intent intent = getIntent();
        Bundle extras = intent != null ? intent.getExtras() : null;
        if (extras != null) {
            widgetId = extras.getInt(AppWidgetManager.EXTRA_APPWIDGET_ID,
                    AppWidgetManager.INVALID_APPWIDGET_ID);
        }

        setContentView(R.layout.focus_widget_config);
        input = (EditText) findViewById(R.id.fwc_code);
        save = (Button) findViewById(R.id.fwc_save);
        error = (TextView) findViewById(R.id.fwc_error);

        input.setText(FocusStats.code(this));
        input.setSelection(input.getText().length());
        input.addTextChangedListener(new TextWatcher() {
            @Override public void beforeTextChanged(CharSequence s, int a, int b, int c) {}
            @Override public void onTextChanged(CharSequence s, int a, int b, int c) {
                error.setVisibility(View.GONE);
            }
            @Override public void afterTextChanged(Editable s) {}
        });

        save.setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View v) { commit(); }
        });
    }

    private void commit() {
        String code = input.getText().toString().trim().toUpperCase(Locale.US);
        if (!CODE.matcher(code).matches()) {
            error.setVisibility(View.VISIBLE);
            return;
        }

        FocusStats.setCode(this, code);
        FocusWidget.refreshAll(this);   // avval qo'yilgan widgetlar ham yangi kodga o'tsin

        // Yangi qo'yilayotgan widgetni O'ZIMIZ chizamiz: config activity ishlatilganda
        // tizim birinchi APPWIDGET_UPDATE'ni yubormaydi.
        if (widgetId != AppWidgetManager.INVALID_APPWIDGET_ID) {
            FocusWidget.updateNow(this, widgetId);
        }

        Intent result = new Intent().putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, widgetId);
        setResult(RESULT_OK, result);
        finish();
    }
}
