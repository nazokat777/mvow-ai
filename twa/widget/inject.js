#!/usr/bin/env node
'use strict';
/**
 * FOCUS AI — uy ekrani widgetini TWA loyihasiga ulaydi.
 *
 * Bubblewrap Android loyihasini HAR SAFAR qaytadan yaratadi (`bubblewrap update`),
 * shuning uchun widget fayllari repoda alohida (twa/widget/) turadi va build'dan
 * OLDIN shu skript ularni yaratilgan loyihaga ko'chiradi + AndroidManifest'ga
 * receiver/activity qo'shadi.
 *
 * Ishlatish (twa/ ichidan):  node widget/inject.js
 * Sinov uchun boshqa loyiha papkasini berish mumkin:  node widget/inject.js <papka>
 *
 * Skript IDEMPOTENT: ikki marta ishlatilsa manifest ikki marta o'zgarmaydi.
 * Har qanday kutilmagan holatda XATO bilan tugaydi — build jimgina widgetsiz
 * chiqib ketmasligi uchun.
 */

const fs = require('fs');
const path = require('path');

const WIDGET_DIR = __dirname;                              // twa/widget
const REPO = path.resolve(WIDGET_DIR, '..', '..');         // repo ildizi (doim shu yerda)
// Bubblewrap loyihasi odatda twa/ ichida; sinovda boshqa papka berilishi mumkin.
const TWA_DIR = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(WIDGET_DIR, '..');
const APP_MAIN = path.join(TWA_DIR, 'app', 'src', 'main');
const MANIFEST = path.join(APP_MAIN, 'AndroidManifest.xml');
const MARKER = 'FOCUS AI widget';

function die(msg) {
  console.error('inject.js XATO: ' + msg);
  process.exit(1);
}

// ── 1. Sozlamalar: packageId + host (twa-manifest.json), Supabase (PWA konfigi) ──

function twaManifest() {
  const p = path.join(TWA_DIR, 'twa-manifest.json');
  if (!fs.existsSync(p)) die('twa-manifest.json topilmadi: ' + p);
  const m = JSON.parse(fs.readFileSync(p, 'utf8'));
  if (!m.packageId) die('twa-manifest.json ichida packageId yo’q');
  if (!m.host) die('twa-manifest.json ichida host yo’q');
  return m;
}

/** Supabase URL/kalitini PWA konfigidan oladi — yagona manba, nusxa ko'chirilmaydi. */
function supabase() {
  const p = path.join(REPO, 'docs', 'v2', 'preview', 'supabase-config.js');
  if (!fs.existsSync(p)) die('supabase-config.js topilmadi: ' + p);
  const src = fs.readFileSync(p, 'utf8');
  const url = /window\.SB_URL\s*=\s*['"]([^'"]+)['"]/.exec(src);
  const key = /window\.SB_KEY\s*=\s*['"]([^'"]+)['"]/.exec(src);
  if (!url || !key) die('supabase-config.js dan SB_URL/SB_KEY o’qib bo’lmadi');
  return { url: url[1], key: key[1] };
}

// ── 2. Fayllarni ko'chirish (o'rniga qo'yish bilan) ──

function subst(text, vars) {
  return text
    .split('__PKG__').join(vars.pkg)
    .split('__HOST__').join(vars.host)
    .split('__SB_URL__').join(vars.sbUrl)
    .split('__SB_KEY__').join(vars.sbKey);
}

function copyTemplate(src, dest, vars) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, subst(fs.readFileSync(src, 'utf8'), vars), 'utf8');
}

function copyTree(srcDir, destDir, vars) {
  for (const name of fs.readdirSync(srcDir)) {
    const s = path.join(srcDir, name);
    const d = path.join(destDir, name);
    if (fs.statSync(s).isDirectory()) copyTree(s, d, vars);
    else copyTemplate(s, d, vars);
  }
}

// ── 3. AndroidManifest'ni yamash ──

function widgetXml() {
  return [
    '',
    '        <!-- ' + MARKER + ' (twa/widget/inject.js qo’shadi) -->',
    '        <receiver',
    '            android:name=".widget.FocusWidget"',
    '            android:exported="false">',
    '            <intent-filter>',
    '                <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />',
    '            </intent-filter>',
    '            <meta-data',
    '                android:name="android.appwidget.provider"',
    '                android:resource="@xml/focus_widget_info" />',
    '        </receiver>',
    '        <activity',
    '            android:name=".widget.FocusWidgetConfigActivity"',
    '            android:exported="true"',
    '            android:label="@string/fwc_title"',
    '            android:theme="@android:style/Theme.DeviceDefault.Dialog.NoActionBar">',
    '            <intent-filter>',
    '                <action android:name="android.appwidget.action.APPWIDGET_CONFIGURE" />',
    '            </intent-filter>',
    '        </activity>',
    ''
  ].join('\n');
}

function patchManifest() {
  if (!fs.existsSync(MANIFEST)) {
    die('AndroidManifest.xml topilmadi (' + MANIFEST + ').\n'
      + '  Sabab: bubblewrap loyihani hali yaratmagan. inject.js `bubblewrap update` dan KEYIN ishlashi kerak.');
  }
  let xml = fs.readFileSync(MANIFEST, 'utf8');

  if (xml.indexOf(MARKER) >= 0) {
    console.log('inject.js: manifest allaqachon yamalgan — o’tkazib yuborildi.');
    return;
  }

  const close = xml.lastIndexOf('</application>');
  if (close < 0) die('manifestda </application> topilmadi');
  xml = xml.slice(0, close) + widgetXml() + xml.slice(close);

  // Widget bulutdan o'qiydi — internet ruxsati shart (TWA'da odatda bor).
  if (xml.indexOf('android.permission.INTERNET') < 0) {
    const appOpen = xml.indexOf('<application');
    if (appOpen < 0) die('manifestda <application> topilmadi');
    xml = xml.slice(0, appOpen)
      + '<uses-permission android:name="android.permission.INTERNET" />\n\n    '
      + xml.slice(appOpen);
    console.log('inject.js: INTERNET ruxsati qo’shildi.');
  }

  fs.writeFileSync(MANIFEST, xml, 'utf8');
  console.log('inject.js: manifestga receiver + config activity qo’shildi.');
}

// ── Bajarish ──

function main() {
  const m = twaManifest();
  const sb = supabase();
  const vars = { pkg: m.packageId, host: m.host, sbUrl: sb.url, sbKey: sb.key };

  const javaDir = path.join(APP_MAIN, 'java', ...m.packageId.split('.'), 'widget');
  if (!fs.existsSync(path.join(APP_MAIN, 'java'))) {
    die('app/src/main/java topilmadi. inject.js `bubblewrap update` dan KEYIN ishlashi kerak.');
  }

  fs.mkdirSync(javaDir, { recursive: true });
  for (const f of fs.readdirSync(path.join(WIDGET_DIR, 'java'))) {
    copyTemplate(path.join(WIDGET_DIR, 'java', f), path.join(javaDir, f), vars);
  }
  copyTree(path.join(WIDGET_DIR, 'res'), path.join(APP_MAIN, 'res'), vars);
  patchManifest();

  console.log('inject.js: widget ulandi (paket ' + m.packageId + ', host ' + m.host + ').');
}

main();
