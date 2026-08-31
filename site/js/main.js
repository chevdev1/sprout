(function () {
  'use strict';

  /* ---------- nav scroll state ---------- */
  var nav = document.getElementById('nav');
  function onScroll() {
    if (window.scrollY > 8) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- marquee categories ---------- */
  var categories = [
    'Groceries', 'Online shopping', 'Dining', 'Fuel', 'Travel',
    'Coffee', 'Subscriptions', 'Rideshare', 'Utilities', 'Pharmacy'
  ];
  var track = document.getElementById('marqueeTrack');
  if (track) {
    var pillsHTML = categories.map(function (c) {
      return '<span class="pill"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/></svg>' + c + '</span>';
    }).join('');
    track.innerHTML = pillsHTML + pillsHTML;
  }

  /* ---------- hero live grow-back ticker ---------- */
  var growAmountEl = document.getElementById('growAmount');
  var growFeedEl = document.getElementById('growFeed');
  var merchants = [
    { name: 'Blue Bottle Coffee', spend: 6.50 },
    { name: 'Whole Foods', spend: 84.20 },
    { name: 'Uber', spend: 18.40 },
    { name: 'Shell Fuel', spend: 41.00 },
    { name: 'Amazon', spend: 62.90 },
    { name: 'Delta Air Lines', spend: 312.00 },
    { name: 'Spotify', spend: 11.99 }
  ];
  var growTotal = 0;
  var GROW_RATE = 0.015;
  var feedItems = [];

  function fmt(n) {
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function tick() {
    var m = merchants[Math.floor(Math.random() * merchants.length)];
    var grown = +(m.spend * GROW_RATE).toFixed(2);
    growTotal += grown;
    if (growAmountEl) growAmountEl.textContent = fmt(growTotal);

    feedItems.unshift({ name: m.name, grown: grown });
    feedItems = feedItems.slice(0, 3);

    if (growFeedEl) {
      growFeedEl.innerHTML = feedItems.map(function (it) {
        return '<div class="item"><span>' + it.name + '</span><b><span class="plus">+' + fmt(it.grown) + '</span></b></div>';
      }).join('');
    }
  }
  tick();
  setInterval(tick, 3200);

  /* ---------- grow-back calculator ---------- */
  var spendSlider = document.getElementById('spendSlider');
  var rateSlider = document.getElementById('rateSlider');
  var spendVal = document.getElementById('spendVal');
  var rateVal = document.getElementById('rateVal');
  var calcResult = document.getElementById('calcResult');
  var calcSpendEcho = document.getElementById('calcSpendEcho');
  var calcRateEcho = document.getElementById('calcRateEcho');
  var calcTickerEcho = document.getElementById('calcTickerEcho');
  var tickerButtons = document.querySelectorAll('.tick-btn');
  var activeTicker = 'AAPL';

  var tickerGrowth = { AAPL: 0.14, ETH: 0.22, SPY: 0.09, NVDA: 0.31 };

  function money(n) {
    return '$' + Math.round(n).toLocaleString('en-US');
  }

  function updateCalc() {
    var spend = +spendSlider.value;
    var rate = +rateSlider.value;
    spendVal.textContent = money(spend);
    rateVal.textContent = rate + '%';
    calcSpendEcho.textContent = money(spend) + '/mo';
    calcRateEcho.textContent = rate + '%';
    calcTickerEcho.textContent = activeTicker;

    var monthlyContribution = spend * (rate / 100);
    var annualGrowth = tickerGrowth[activeTicker] || 0.12;
    var months = 12;
    var value = 0;
    for (var i = 0; i < months; i++) {
      value += monthlyContribution;
      value *= (1 + annualGrowth / 12);
    }
    calcResult.textContent = money(value);
  }

  if (spendSlider && rateSlider) {
    spendSlider.addEventListener('input', updateCalc);
    rateSlider.addEventListener('input', updateCalc);
    tickerButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        tickerButtons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        activeTicker = btn.dataset.ticker;
        updateCalc();
      });
    });
    updateCalc();
  }

  /* ---------- FAQ accordion ---------- */
  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    var q = item.querySelector('.faq-q');
    var a = item.querySelector('.faq-a');
    function setHeight() {
      if (item.classList.contains('open')) {
        a.style.maxHeight = a.scrollHeight + 'px';
      } else {
        a.style.maxHeight = '0px';
      }
    }
    setHeight();
    q.addEventListener('click', function () {
      var wasOpen = item.classList.contains('open');
      faqItems.forEach(function (other) {
        other.classList.remove('open');
        other.querySelector('.faq-a').style.maxHeight = '0px';
      });
      if (!wasOpen) {
        item.classList.add('open');
        setHeight();
      }
    });
    window.addEventListener('resize', function () {
      if (item.classList.contains('open')) setHeight();
    });
  });
})();
