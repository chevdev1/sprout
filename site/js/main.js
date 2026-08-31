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
    track.innerHTML = pillsHTML + pillsHTML.replace(/<span class="pill"/g, '<span aria-hidden="true" class="pill"');
  }

  /* ---------- product showcase carousel ---------- */
  var showcaseStage = document.getElementById('showcaseStage');
  var showcaseScreens = document.querySelectorAll('[data-screen]');
  var showcaseDots = document.querySelectorAll('.showcase-dot');
  var showcasePrev = document.getElementById('showcasePrev');
  var showcaseNext = document.getElementById('showcaseNext');
  var showcaseZonePrev = document.getElementById('showcaseZonePrev');
  var showcaseZoneNext = document.getElementById('showcaseZoneNext');
  var showcaseKicker = document.getElementById('showcaseKicker');
  var showcaseTitle = document.getElementById('showcaseTitle');
  var showcaseDescription = document.getElementById('showcaseDescription');
  var showcaseCaption = document.getElementById('showcaseCaption');
  var showcaseToast = document.getElementById('showcaseToast');
  var showcaseActionButtons = document.querySelectorAll('[data-demo-action]');
  var navToggle = document.getElementById('navToggle');
  var activeShowcaseSlide = 0;
  var showcaseTransitionLocked = false;
  var showcaseTouchStart = null;
  var showcaseTouchPointerId = null;
  var showcaseContent = [
    {
      kicker: '01 / WALLET',
      title: 'Know what you can spend — and what keeps growing.',
      description: 'One clear view for your spendable balance, chosen grow-back asset and recent progress.',
      caption: 'Demo data · illustrative'
    },
    {
      kicker: '02 / CARD DETAILS',
      title: 'Pay normally. Keep your assets working.',
      description: 'Choose a card, set your limits and pay from your funded balance without losing sight of your portfolio.',
      caption: 'Card controls · illustrative'
    },
    {
      kicker: '03 / GROW-BACK',
      title: 'Your spending leaves a trail of growth.',
      description: 'Each eligible purchase sends a small percentage to the stock, ETF or RWA token you choose — automatically.',
      caption: 'Automatic investing · illustrative'
    }
  ];

  function showShowcaseSlide(index, direction) {
    if (!showcaseScreens.length) return;
    if (direction !== 0 && showcaseTransitionLocked) return;
    var previousSlide = activeShowcaseSlide;
    var nextSlide = (index + showcaseScreens.length) % showcaseScreens.length;
    if (nextSlide === previousSlide && direction !== 0) return;
    if (direction !== 0) {
      showcaseTransitionLocked = true;
      window.setTimeout(function () {
        showcaseTransitionLocked = false;
      }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 720);
    }
    var wrapsForward = direction > 0 && previousSlide === showcaseScreens.length - 1 && nextSlide === 0;
    var wrapsBackward = direction < 0 && previousSlide === 0 && nextSlide === showcaseScreens.length - 1;
    activeShowcaseSlide = nextSlide;

    showcaseScreens.forEach(function (screen, screenIndex) {
      var isActive = screenIndex === activeShowcaseSlide;
      var isPrevious = screenIndex === (activeShowcaseSlide - 1 + showcaseScreens.length) % showcaseScreens.length;
      var isNext = screenIndex === (activeShowcaseSlide + 1) % showcaseScreens.length;
      screen.classList.toggle('active', isActive);
      screen.classList.toggle('is-prev', isPrevious);
      screen.classList.toggle('is-next', isNext);
      screen.setAttribute('aria-hidden', String(!isActive));
      screen.inert = !isActive;
      if (isActive && wrapsForward) screen.classList.add('is-entering-next');
      if (isActive && wrapsBackward) screen.classList.add('is-entering-prev');
    });
    showcaseDots.forEach(function (dot, dotIndex) {
      var isActive = dotIndex === activeShowcaseSlide;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-current', String(isActive));
    });
    var content = showcaseContent[activeShowcaseSlide];
    showcaseKicker.textContent = content.kicker;
    showcaseTitle.textContent = content.title;
    showcaseDescription.textContent = content.description;
    showcaseCaption.textContent = content.caption;

    if ((wrapsForward || wrapsBackward) && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      var enteringClass = wrapsForward ? 'is-entering-next' : 'is-entering-prev';
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          showcaseScreens[activeShowcaseSlide].classList.remove(enteringClass);
        });
      });
    } else if (wrapsForward || wrapsBackward) {
      showcaseScreens[activeShowcaseSlide].classList.remove('is-entering-next', 'is-entering-prev');
    }
  }

  if (showcaseStage && showcaseScreens.length) {
    showShowcaseSlide(0, 0);
    showcasePrev.addEventListener('click', function () {
      showShowcaseSlide(activeShowcaseSlide - 1, -1);
    });
    showcaseNext.addEventListener('click', function () {
      showShowcaseSlide(activeShowcaseSlide + 1, 1);
    });
    showcaseZonePrev.addEventListener('click', function () {
      showShowcaseSlide(activeShowcaseSlide - 1, -1);
    });
    showcaseZoneNext.addEventListener('click', function () {
      showShowcaseSlide(activeShowcaseSlide + 1, 1);
    });
    showcaseDots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showShowcaseSlide(+dot.dataset.slide, +dot.dataset.slide - activeShowcaseSlide);
      });
    });
    showcaseStage.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        showShowcaseSlide(activeShowcaseSlide - 1, -1);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        showShowcaseSlide(activeShowcaseSlide + 1, 1);
      }
    });
    showcaseStage.addEventListener('pointerdown', function (event) {
      if (event.pointerType === 'touch' || event.pointerType === 'pen') {
        showcaseTouchStart = event.clientX;
        showcaseTouchPointerId = event.pointerId;
        showcaseStage.setPointerCapture(event.pointerId);
      }
    });
    showcaseStage.addEventListener('pointerup', function (event) {
      if (showcaseTouchStart === null || event.pointerId !== showcaseTouchPointerId) return;
      var distance = event.clientX - showcaseTouchStart;
      if (Math.abs(distance) > 48) showShowcaseSlide(activeShowcaseSlide + (distance < 0 ? 1 : -1), distance < 0 ? 1 : -1);
      showcaseTouchStart = null;
      showcaseTouchPointerId = null;
      if (showcaseStage.hasPointerCapture(event.pointerId)) showcaseStage.releasePointerCapture(event.pointerId);
    });
    showcaseStage.addEventListener('pointercancel', function () {
      showcaseTouchStart = null;
      showcaseTouchPointerId = null;
    });
  }

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('menu-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    });
    document.querySelectorAll('.nav-links a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('menu-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open navigation');
      });
    });
  }

  /* ---------- how-it-works card sequence ---------- */
  var howVisual = document.getElementById('howVisual');
  var howStageLabel = document.getElementById('howStageLabel');
  var howSteps = document.querySelectorAll('[data-how-step]');
  var howStepsContainer = document.getElementById('howSteps');
  var howStageNames = ['01 / FUND', '02 / SPEND', '03 / GROW-BACK', '04 / TRACK'];
  var howCurrentStage = 0;

  function setHowStage(index) {
    if (!howVisual || !howSteps.length || index === howCurrentStage) return;
    howVisual.dataset.stage = index;
    howCurrentStage = index;
    if (howStageLabel) howStageLabel.textContent = howStageNames[index];
    howSteps.forEach(function (step, stepIndex) {
      step.classList.toggle('is-active', stepIndex === index);
    });
    if (howStepsContainer) {
      var progress = index / (howSteps.length - 1);
      howStepsContainer.style.setProperty('--how-progress', progress);
    }
  }

  howSteps.forEach(function (step) {
    function selectHowStep() {
      setHowStage(+step.dataset.howStep);
    }
    step.addEventListener('click', selectHowStep);
    step.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectHowStep();
      }
    });
  });

  if (howVisual && howSteps.length && 'IntersectionObserver' in window) {
    var howObserver = new IntersectionObserver(function (entries) {
      var visibleSteps = entries.filter(function (entry) { return entry.isIntersecting; });
      if (!visibleSteps.length) return;
      visibleSteps.sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; });
      setHowStage(+visibleSteps[0].target.dataset.howStep);
    }, { threshold: [0.2, 0.6], rootMargin: '-28% 0px -42% 0px' });
    howSteps.forEach(function (step) { howObserver.observe(step); });
  }

  setHowStage(0);

  showcaseActionButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      if (!showcaseToast) return;
      showcaseToast.textContent = button.dataset.demoAction;
      showcaseToast.classList.add('visible');
      window.clearTimeout(button.demoToastTimeout);
      button.demoToastTimeout = window.setTimeout(function () {
        showcaseToast.classList.remove('visible');
      }, 1800);
    });
  });

  /* ---------- hero purchase demo ---------- */
  var growAmountEl = document.getElementById('growAmount');
  var growFeedEl = document.getElementById('growFeed');
  var heroDemo = document.getElementById('heroDemo');
  var miniCard = document.querySelector('.mini-card');
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
  var demoIndex = 0;

  function fmt(n) {
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function tick(merchant) {
    var m = merchant || merchants[Math.floor(Math.random() * merchants.length)];
    var grown = +(m.spend * GROW_RATE).toFixed(2);
    growTotal += grown;
    if (growAmountEl) {
      growAmountEl.textContent = fmt(growTotal);
      growAmountEl.classList.remove('is-updated');
      void growAmountEl.offsetWidth;
      growAmountEl.classList.add('is-updated');
    }
    if (miniCard) {
      miniCard.classList.remove('is-tapped');
      void miniCard.offsetWidth;
      miniCard.classList.add('is-tapped');
    }

    feedItems.unshift({ name: m.name, grown: grown });
    feedItems = feedItems.slice(0, 3);

    if (growFeedEl) {
      growFeedEl.innerHTML = feedItems.map(function (it) {
        return '<div class="item"><span>' + it.name + '</span><b><span class="plus">+' + fmt(it.grown) + '</span></b></div>';
      }).join('');
    }
  }
  if (heroDemo) {
    heroDemo.addEventListener('click', function () {
      var merchant = merchants[demoIndex % merchants.length];
      demoIndex += 1;
      tick(merchant);
      heroDemo.querySelector('span:nth-child(2)').textContent = merchant.name + ' added · +' + fmt(merchant.spend * GROW_RATE);
      window.clearTimeout(heroDemo.demoReset);
      heroDemo.demoReset = window.setTimeout(function () {
        heroDemo.querySelector('span:nth-child(2)').textContent = 'Simulate a purchase';
      }, 2200);
    });
  }

  /* ---------- grow-back calculator ---------- */
  var spendSlider = document.getElementById('spendSlider');
  var rateSlider = document.getElementById('rateSlider');
  var spendVal = document.getElementById('spendVal');
  var rateVal = document.getElementById('rateVal');
  var calcResult = document.getElementById('calcResult');
  var calcSpendEcho = document.getElementById('calcSpendEcho');
  var calcRateEcho = document.getElementById('calcRateEcho');
  var calcTickerEcho = document.getElementById('calcTickerEcho');
  var calcResultSheet = document.getElementById('calcResultSheet');
  var calcCardSpend = document.getElementById('calcCardSpend');
  var calcCardTicker = document.getElementById('calcCardTicker');
  var calcCardRate = document.getElementById('calcCardRate');
  var tickerButtons = document.querySelectorAll('.tick-btn');
  var activeTicker = 'AAPL';
  var calcRevealTimeout;

  function money(n) {
    return '$' + Math.round(n).toLocaleString('en-US');
  }

  function updateCalc() {
    var spend = +spendSlider.value;
    var rate = +rateSlider.value;
    spendVal.textContent = money(spend);
    rateVal.textContent = rate + '%';
    calcSpendEcho.textContent = money(spend);
    calcRateEcho.textContent = rate + '%';
    calcTickerEcho.textContent = activeTicker;

    var monthlyContribution = spend * (rate / 100);
    var months = 12;
    var contribution = monthlyContribution * months;
    calcResult.textContent = money(contribution);
    calcCardSpend.textContent = money(spend);
    calcCardTicker.textContent = activeTicker;
    calcCardRate.textContent = rate + '%';
  }

  function animateCalcReveal() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (calcCardSpend) {
      calcCardSpend.classList.remove('is-updating');
      window.requestAnimationFrame(function () {
        calcCardSpend.classList.add('is-updating');
      });
    }
    if (calcResultSheet) {
      calcResultSheet.classList.remove('is-revealing');
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          calcResultSheet.classList.add('is-revealing');
        });
      });
    }
  }

  function scheduleCalcReveal() {
    window.clearTimeout(calcRevealTimeout);
    calcRevealTimeout = window.setTimeout(animateCalcReveal, 180);
  }

  if (spendSlider && rateSlider) {
    spendSlider.addEventListener('input', function () {
      updateCalc();
      scheduleCalcReveal();
    });
    rateSlider.addEventListener('input', function () {
      updateCalc();
      scheduleCalcReveal();
    });
    spendSlider.addEventListener('change', function () {
      window.clearTimeout(calcRevealTimeout);
      animateCalcReveal();
    });
    rateSlider.addEventListener('change', function () {
      window.clearTimeout(calcRevealTimeout);
      animateCalcReveal();
    });
    tickerButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        tickerButtons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        activeTicker = btn.dataset.ticker;
        updateCalc();
        animateCalcReveal();
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
        other.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        item.classList.add('open');
        q.setAttribute('aria-expanded', 'true');
        setHeight();
      }
    });
    window.addEventListener('resize', function () {
      if (item.classList.contains('open')) setHeight();
    });
  });
})();
