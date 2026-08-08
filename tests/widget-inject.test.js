'use strict';
/**
 * twa/widget/inject.js testlari.
 *
 * Widget Bubblewrap yaratgan Android loyihasiga build paytida ulanadi. Android
 * kodini bu yerda kompilyatsiya qilib bo'lmaydi, ammo ULASH bosqichi — eng ko'p
 * jimgina buziladigan joy (paket nomi, manifest, kalitlar) — to'liq tekshiriladi.
 *
 * Har bir test soxta bubblewrap loyihasini vaqtinchalik papkada yaratadi.
 */
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const INJECT = path.join(__dirname, '..', 'twa', 'widget', 'inject.js');
const PKG = 'com.justaiit.daywarden.twa';
const HOST = 'daywarden.vercel.app';

const MANIFEST_XML = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${PKG}">
    <uses-permission android:name="android.permission.INTERNET" />
    <application android:label="FOCUS AI">
        <activity android:name=".LauncherActivity" android:exported="true" />
    </application>
</manifest>
`;

/** Bubblewrap chiqishiga o'xshash minimal loyiha yasaydi. */
function fakeProject(opts) {
  opts = opts || {};
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'twa-widget-'));
  const main = path.join(dir, 'app', 'src', 'main');
  fs.mkdirSync(path.join(main, 'java', ...PKG.split('.')), { recursive: true });
  fs.mkdirSync(path.join(main, 'res', 'values'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'twa-manifest.json'),
    JSON.stringify({ packageId: PKG, host: HOST }));
  fs.writeFileSync(path.join(main, 'AndroidManifest.xml'),
    opts.manifest !== undefined ? opts.manifest : MANIFEST_XML);
  return dir;
}

function inject(dir) {
  return execFileSync(process.execPath, [INJECT, dir], { encoding: 'utf8' });
}

function read(dir, ...parts) {
  return fs.readFileSync(path.join(dir, 'app', 'src', 'main', ...parts), 'utf8');
}

function manifestOf(dir) { return read(dir, 'AndroidManifest.xml'); }

function javaOf(dir, name) {
  return read(dir, 'java', ...PKG.split('.'), 'widget', name);
}

test('inject: Java fayllar to\'g\'ri paketga ko\'chadi', () => {
  const dir = fakeProject();
  inject(dir);
  for (const f of ['FocusWidget.java', 'FocusWidgetConfigActivity.java', 'FocusStats.java']) {
    assert.ok(javaOf(dir, f).length > 0, f + ' ko\'chirilmagan');
  }
});

test('inject: __PKG__ o\'rnini haqiqiy paket egallaydi (shablon qoldig\'i qolmaydi)', () => {
  const dir = fakeProject();
  inject(dir);
  const src = javaOf(dir, 'FocusWidget.java');
  assert.ok(src.includes('package ' + PKG + '.widget;'));
  assert.ok(src.includes('import ' + PKG + '.R;'));
  assert.ok(!src.includes('__PKG__'), 'shablon belgisi qolib ketgan');
});

test('inject: host twa-manifest.json dan olinadi', () => {
  const dir = fakeProject();
  inject(dir);
  const src = javaOf(dir, 'FocusWidget.java');
  assert.ok(src.includes('https://' + HOST));
  assert.ok(!src.includes('__HOST__'));
});

test('inject: Supabase URL/kalit PWA konfigidan olinadi (nusxa emas)', () => {
  const cfg = fs.readFileSync(
    path.join(__dirname, '..', 'docs', 'v2', 'preview', 'supabase-config.js'), 'utf8');
  const url = /window\.SB_URL\s*=\s*['"]([^'"]+)['"]/.exec(cfg)[1];
  const key = /window\.SB_KEY\s*=\s*['"]([^'"]+)['"]/.exec(cfg)[1];

  const dir = fakeProject();
  inject(dir);
  const src = javaOf(dir, 'FocusStats.java');
  assert.ok(src.includes(url), 'SB_URL mos emas');
  assert.ok(src.includes(key), 'SB_KEY mos emas');
  assert.ok(!src.includes('__SB_'), 'shablon belgisi qolib ketgan');
});

test('inject: res fayllari (layout/drawable/xml/values) ko\'chadi', () => {
  const dir = fakeProject();
  inject(dir);
  for (const p of [
    ['res', 'layout', 'focus_widget.xml'],
    ['res', 'layout', 'focus_widget_config.xml'],
    ['res', 'drawable', 'focus_widget_bg.xml'],
    ['res', 'xml', 'focus_widget_info.xml'],
    ['res', 'values', 'focus_widget_strings.xml'],
    ['res', 'values-ru', 'focus_widget_strings.xml'],
    ['res', 'values-en', 'focus_widget_strings.xml'],
  ]) {
    assert.ok(read(dir, ...p).length > 0, p.join('/') + ' yo\'q');
  }
});

test('inject: mavjud res fayllari o\'chib ketmaydi', () => {
  const dir = fakeProject();
  const strings = path.join(dir, 'app', 'src', 'main', 'res', 'values', 'strings.xml');
  fs.writeFileSync(strings, '<resources><string name="app_name">FOCUS AI</string></resources>');
  inject(dir);
  assert.ok(fs.readFileSync(strings, 'utf8').includes('app_name'));
});

test('inject: widget_info ichida configure to\'liq paket nomi bilan', () => {
  const dir = fakeProject();
  inject(dir);
  const xml = read(dir, 'res', 'xml', 'focus_widget_info.xml');
  assert.ok(xml.includes('android:configure="' + PKG + '.widget.FocusWidgetConfigActivity"'));
  assert.ok(!xml.includes('__PKG__'));
});

test('inject: manifestga receiver + config activity qo\'shiladi', () => {
  const dir = fakeProject();
  inject(dir);
  const xml = manifestOf(dir);
  assert.ok(xml.includes('android:name=".widget.FocusWidget"'));
  assert.ok(xml.includes('android.appwidget.action.APPWIDGET_UPDATE'));
  assert.ok(xml.includes('@xml/focus_widget_info'));
  assert.ok(xml.includes('android:name=".widget.FocusWidgetConfigActivity"'));
  assert.ok(xml.includes('android.appwidget.action.APPWIDGET_CONFIGURE'));
  // Sozlash oynasini ishga tushiruvchi — boshqa jarayon (launcher), demak eksport shart.
  assert.match(xml, /FocusWidgetConfigActivity"[\s\S]{0,120}android:exported="true"/);
});

test('inject: qo\'shimchalar </application> ICHIDA qoladi', () => {
  const dir = fakeProject();
  inject(dir);
  const xml = manifestOf(dir);
  assert.ok(xml.indexOf('.widget.FocusWidget"') < xml.lastIndexOf('</application>'));
  assert.ok(xml.indexOf('.widget.FocusWidgetConfigActivity"') < xml.lastIndexOf('</application>'));
});

test('inject: mavjud LauncherActivity manifestda qoladi', () => {
  const dir = fakeProject();
  inject(dir);
  assert.ok(manifestOf(dir).includes('.LauncherActivity'));
});

test('inject: IDEMPOTENT — ikki marta ishlatilsa manifest bir marta o\'zgaradi', () => {
  const dir = fakeProject();
  inject(dir);
  const once = manifestOf(dir);
  inject(dir);
  assert.equal(manifestOf(dir), once, 'ikkinchi ishga tushirish manifestni o\'zgartirdi');
});

test('inject: INTERNET ruxsati yo\'q bo\'lsa qo\'shiladi', () => {
  const dir = fakeProject({
    manifest: MANIFEST_XML.replace(/\s*<uses-permission[^>]*\/>/, '')
  });
  assert.ok(!manifestOf(dir).includes('INTERNET'));
  inject(dir);
  assert.ok(manifestOf(dir).includes('android.permission.INTERNET'));
});

test('inject: INTERNET ruxsati bor bo\'lsa takrorlanmaydi', () => {
  const dir = fakeProject();
  inject(dir);
  const hits = manifestOf(dir).split('android.permission.INTERNET').length - 1;
  assert.equal(hits, 1);
});

test('inject: loyiha yaratilmagan bo\'lsa XATO bilan to\'xtaydi (jim o\'tmaydi)', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'twa-empty-'));
  fs.writeFileSync(path.join(dir, 'twa-manifest.json'),
    JSON.stringify({ packageId: PKG, host: HOST }));
  assert.throws(() => inject(dir), /XATO|Command failed/);
});

test('inject: buzuq manifest (</application> yo\'q) XATO beradi', () => {
  const dir = fakeProject({ manifest: '<?xml version="1.0"?>\n<manifest />\n' });
  assert.throws(() => inject(dir), /XATO|Command failed/);
});
