'use strict';
/**
 * SMOKE / LINT testlar — har ekran (HTML) ning inline JS sintaksisi toza
 * va shared JS fayllar buzilmaganini tekshiradi. (analyze/lint o'rnida.)
 */
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const cp = require('child_process');

const DIR = path.join(__dirname, '..', 'docs', 'v2', 'preview');
const TMP = path.join(os.tmpdir(), 'daywarden-smoke');
fs.mkdirSync(TMP, { recursive: true });

function nodeCheck(file) {
  cp.execSync(`node --check "${file}"`, { stdio: 'pipe' });
}

// Har HTML faylning inline <script> bloklari sintaksis jihatdan toza
const htmlFiles = fs.readdirSync(DIR).filter((f) => f.endsWith('.html'));
for (const file of htmlFiles) {
  test(`smoke: ${file} — inline JS sintaksisi toza`, () => {
    const html = fs.readFileSync(path.join(DIR, file), 'utf8');
    const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
    let m;
    let i = 0;
    while ((m = re.exec(html))) {
      const code = m[1].trim();
      if (!code || /type=["']application\/(ld\+json|json)["']/i.test(m[0])) continue;
      i++;
      const tmp = path.join(TMP, `${file}.${i}.js`);
      fs.writeFileSync(tmp, code);
      assert.doesNotThrow(() => nodeCheck(tmp), `${file} inline script #${i} sintaksis xato`);
    }
  });
}

// Shared JS fayllar sintaksisi toza
const sharedJs = [
  'data.js', 'i18n.js', 'lang-switcher.js', 'nav-overlay.js',
  'back-btn.js', 'motion.js', 'service-worker.js'
];
for (const js of sharedJs) {
  const full = path.join(DIR, js);
  if (!fs.existsSync(full)) continue;
  test(`smoke: ${js} — sintaksisi toza`, () => {
    assert.doesNotThrow(() => nodeCheck(full));
  });
}

// Har HTML <style> bloklarida { va } balansda (ochilmagan/yopilmagan qavs yo'q)
for (const file of htmlFiles) {
  test(`smoke: ${file} — CSS qavslari balansda`, () => {
    const html = fs.readFileSync(path.join(DIR, file), 'utf8');
    const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((x) => x[1]).join('\n');
    const open = (styles.match(/\{/g) || []).length;
    const close = (styles.match(/\}/g) || []).length;
    assert.equal(open, close, `${file}: { (${open}) ≠ } (${close})`);
  });
}
