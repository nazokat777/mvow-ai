'use strict';
/**
 * Focus AI — harakat sensori yordamchisi (telefon yuztuban aniqlash).
 * z = DeviceMotionEvent.accelerationIncludingGravity.z (m/s^2).
 * Ekran pastga qaraganda (yuztuban) z ~ -9.8 → fokus rejimi.
 * UMD: Node (test) + brauzer (window.FocusMotion).
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) module.exports = factory();
  else root.FocusMotion = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  function isFaceDown(z, thresh) {
    if (z == null || typeof z !== 'number' || isNaN(z)) return false;
    return z < (thresh == null ? -7 : thresh);
  }
  return { isFaceDown: isFaceDown };
});
