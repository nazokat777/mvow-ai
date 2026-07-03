'use strict';
/**
 * MvowUndo — o'chirishdan keyin 5 soniya "Bekor qilish" toast.
 * MvowUndo.show(matn, onUndo) — onUndo() bosilsa yozuvni qaytaradi.
 */
(function (root) {
  var timer = null, el = null;
  function ensure() {
    if (el) return el;
    el = document.createElement('div');
    el.id = 'mvow-undo';
    el.style.cssText = 'position:fixed;left:50%;bottom:26px;transform:translateX(-50%) translateY(160%);background:#16161a;color:#F5F2EC;border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:10px 12px 10px 18px;display:flex;align-items:center;gap:14px;font:600 14px Inter,sans-serif;z-index:2147483000;box-shadow:0 12px 34px rgba(0,0,0,.45);transition:transform .28s cubic-bezier(.16,.84,.32,1);max-width:92%;';
    document.body.appendChild(el);
    return el;
  }
  function hide() { if (el) el.style.transform = 'translateX(-50%) translateY(160%)'; if (timer) { clearTimeout(timer); timer = null; } }
  function show(msg, onUndo) {
    var e = ensure();
    var undoTxt = (root.I18N && root.I18N.t) ? root.I18N.t('common.undo', 'Bekor qilish') : 'Bekor qilish';
    e.textContent = '';
    var span = document.createElement('span'); span.textContent = msg; e.appendChild(span);
    var b = document.createElement('button');
    b.type = 'button'; b.textContent = '↩ ' + undoTxt;
    b.style.cssText = 'background:none;border:none;color:#F5C26B;font:700 14px Inter,sans-serif;cursor:pointer;white-space:nowrap;';
    b.onclick = function () { hide(); if (onUndo) onUndo(); };
    e.appendChild(b);
    requestAnimationFrame(function () { e.style.transform = 'translateX(-50%) translateY(0)'; });
    if (timer) clearTimeout(timer);
    timer = setTimeout(hide, 5000);
  }
  root.MvowUndo = { show: show, hide: hide };
})(typeof window !== 'undefined' ? window : this);
