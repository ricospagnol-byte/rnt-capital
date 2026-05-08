(function () {
  // ──────────────────────────────────────────────────────────────────────
  // RNT Capital — cookie consent + gated TradingView ticker.
  // Stores user choice in localStorage. Banner shown once on first visit.
  // ──────────────────────────────────────────────────────────────────────
  const STORAGE_KEY = 'rnt_consent_v1';

  function getConsent() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function setConsent(c) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...c, v: 1, ts: Date.now() }));
    } catch (e) {}
  }

  // ──────── TradingView ticker ───────────────────────────────────────────
  const TV_CONFIG = {
    symbols: [
      { proName: 'FX:EURUSD', title: 'EUR/USD' },
      { proName: 'FX:GBPUSD', title: 'GBP/USD' },
      { proName: 'BITSTAMP:BTCUSD', title: 'BTC/USD' },
      { proName: 'OANDA:XAUUSD', title: 'Gold' },
      { proName: 'FOREXCOM:SPXUSD', title: 'S&P 500' }
    ],
    showSymbolLogo: false,
    isTransparent: true,
    displayMode: 'adaptive',
    colorTheme: 'dark',
    locale: 'en'
  };

  function loadTickers() {
    document.querySelectorAll('.market-ticker .tradingview-widget-container').forEach(container => {
      if (container.dataset.loaded === '1') return;
      container.dataset.loaded = '1';
      const widget = container.querySelector('.tradingview-widget-container__widget');
      if (widget) widget.innerHTML = '';
      const s = document.createElement('script');
      s.type = 'text/javascript';
      s.async = true;
      s.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
      s.text = JSON.stringify(TV_CONFIG);
      container.appendChild(s);
    });
  }

  function showTickerPlaceholder() {
    document.querySelectorAll('.market-ticker .tradingview-widget-container__widget').forEach(el => {
      if (el.dataset.placeholder === '1') return;
      el.dataset.placeholder = '1';
      el.innerHTML = '<div class="tv-placeholder">Live market data is paused. <button type="button" class="tv-placeholder-link" data-cookie-action="manage">Enable in cookie preferences</button>.</div>';
    });
  }

  function applyConsent(c) {
    if (c && c.functional) loadTickers();
    else showTickerPlaceholder();
  }

  // ──────── Banner ────────────────────────────────────────────────────────
  function makeBanner() {
    if (document.getElementById('rnt-cookie-banner')) return;
    const b = document.createElement('div');
    b.id = 'rnt-cookie-banner';
    b.className = 'cookie-banner';
    b.setAttribute('role', 'dialog');
    b.setAttribute('aria-labelledby', 'rnt-cookie-title');
    b.innerHTML = ''
      + '<div class="cookie-banner-inner">'
      +   '<div class="cookie-banner-text">'
      +     '<h3 id="rnt-cookie-title">Cookies &amp; your privacy</h3>'
      +     '<p>We use a small amount of essential local storage to remember this choice. With your consent, we also load the TradingView market ticker at the top of every page (which may set its own cookies on tradingview.com). No analytics, no trackers. See our <a href="privacy.html">Privacy Policy</a>.</p>'
      +   '</div>'
      +   '<div class="cookie-banner-actions">'
      +     '<button type="button" class="btn btn-ghost cookie-btn" data-cookie-action="manage">Manage</button>'
      +     '<button type="button" class="btn btn-ghost cookie-btn" data-cookie-action="reject">Reject non-essential</button>'
      +     '<button type="button" class="btn btn-accent cookie-btn" data-cookie-action="accept">Accept all</button>'
      +   '</div>'
      + '</div>';
    document.body.appendChild(b);
  }
  function removeBanner() {
    const b = document.getElementById('rnt-cookie-banner');
    if (b) b.remove();
  }

  // ──────── Preferences modal ────────────────────────────────────────────
  function makePrefs() {
    if (document.getElementById('rnt-cookie-prefs')) return;
    const m = document.createElement('div');
    m.id = 'rnt-cookie-prefs';
    m.className = 'cookie-prefs';
    m.hidden = true;
    m.setAttribute('role', 'dialog');
    m.setAttribute('aria-modal', 'true');
    m.setAttribute('aria-labelledby', 'rnt-cookie-prefs-title');
    m.innerHTML = ''
      + '<div class="cookie-prefs-backdrop" data-cookie-action="close-prefs"></div>'
      + '<div class="cookie-prefs-card" role="document">'
      +   '<header class="cookie-prefs-head">'
      +     '<h3 id="rnt-cookie-prefs-title">Cookie preferences</h3>'
      +     '<button type="button" class="cookie-prefs-close" aria-label="Close" data-cookie-action="close-prefs">&times;</button>'
      +   '</header>'
      +   '<p class="cookie-prefs-intro">Choose which categories you allow. Strictly necessary storage is always on. You can change this anytime via the footer link.</p>'
      +   '<div class="cookie-prefs-row">'
      +     '<div class="cookie-prefs-row-text">'
      +       '<strong>Strictly necessary</strong>'
      +       '<p>Required for the site to function — including remembering this preference. Always on.</p>'
      +     '</div>'
      +     '<label class="cookie-toggle disabled" aria-label="Strictly necessary cookies are always on"><input type="checkbox" checked disabled /><span class="cookie-toggle-track"></span></label>'
      +   '</div>'
      +   '<div class="cookie-prefs-row">'
      +     '<div class="cookie-prefs-row-text">'
      +       '<strong>Functional (TradingView widget)</strong>'
      +       '<p>Loads the live market ticker at the top of every page. TradingView may set its own cookies on its domain when this is enabled.</p>'
      +     '</div>'
      +     '<label class="cookie-toggle"><input type="checkbox" id="rnt-cookie-functional" /><span class="cookie-toggle-track"></span></label>'
      +   '</div>'
      +   '<div class="cookie-prefs-actions">'
      +     '<button type="button" class="btn btn-ghost" data-cookie-action="close-prefs">Cancel</button>'
      +     '<button type="button" class="btn btn-primary" data-cookie-action="save-prefs">Save choices</button>'
      +   '</div>'
      + '</div>';
    document.body.appendChild(m);
  }
  function openPrefs() {
    makePrefs();
    const cur = getConsent() || {};
    const cb = document.getElementById('rnt-cookie-functional');
    if (cb) cb.checked = cur.functional === true;
    const m = document.getElementById('rnt-cookie-prefs');
    if (m) m.hidden = false;
  }
  function closePrefs() {
    const m = document.getElementById('rnt-cookie-prefs');
    if (m) m.hidden = true;
  }

  // ──────── Click delegation ──────────────────────────────────────────────
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-cookie-action]');
    if (!el) return;
    const a = el.getAttribute('data-cookie-action');
    if (a === 'accept') {
      const c = { essential: true, functional: true };
      setConsent(c); applyConsent(c); removeBanner(); closePrefs();
    } else if (a === 'reject') {
      const c = { essential: true, functional: false };
      setConsent(c); applyConsent(c); removeBanner(); closePrefs();
    } else if (a === 'manage') {
      openPrefs();
      e.preventDefault();
    } else if (a === 'close-prefs') {
      closePrefs();
    } else if (a === 'save-prefs') {
      const cb = document.getElementById('rnt-cookie-functional');
      const functional = cb ? cb.checked : false;
      const prev = getConsent();
      const c = { essential: true, functional };
      setConsent(c);
      // If functional just got disabled and the ticker is already loaded, reload
      // to fully remove the third-party iframe.
      if (prev && prev.functional === true && !functional) {
        window.location.reload();
        return;
      }
      applyConsent(c);
      removeBanner();
      closePrefs();
    }
  });

  // Esc closes the prefs modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePrefs();
  });

  // ──────── Init ─────────────────────────────────────────────────────────
  function init() {
    const c = getConsent();
    if (c) {
      applyConsent(c);
    } else {
      showTickerPlaceholder();
      makeBanner();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
