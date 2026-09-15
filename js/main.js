/* ==========================================================================
   MAISON AMBRE — Conciergerie Bruxelles
   Script principal (vanilla JS, aucune dépendance)

   Modules :
     1. Données : quartiers & paramètres du simulateur
     2. Header (scroll, burger, lien actif)
     3. Reveal au scroll + compteurs animés
     4. Cartes services dépliables
     5. Zones couvertes (onglets)
     6. Simulateur de revenus
     7. Formulaire rapide (hero) → simulateur
     8. Formulaire de contact (validation)
     9. Divers (année footer)
   ========================================================================== */

(function () {
  'use strict';

  /* ---------- 1. DONNÉES ------------------------------------------------- */

  /**
   * Base de données des communes / quartiers bruxellois.
   * adr  = prix moyen par nuit (€) pour un 1 chambre standard (indicatif)
   * occ  = taux d'occupation annuel moyen (0–1)
   * rent = loyer mensuel moyen d'un 1 chambre en location classique (€),
   *        utilisé pour la comparaison
   * hot  = quartiers à forte demande (mis en avant)
   *
   * ⚠️ Chiffres indicatifs à ajuster avec vos données de marché réelles.
   */
  const ZONES = [
    {
      id: 'ixelles',
      name: 'Ixelles',
      postal: '1050',
      desc: 'La commune la plus demandée par les voyageurs : cafés du Châtelain, étangs d\'Ixelles, Flagey et l\'avenue Louise à deux pas.',
      quartiers: [
        { name: 'Châtelain', adr: 118, occ: 0.80, rent: 1050, hot: true },
        { name: 'Flagey', adr: 105, occ: 0.78, rent: 980, hot: true },
        { name: 'Louise', adr: 125, occ: 0.79, rent: 1150, hot: true },
        { name: 'Cimetière d\'Ixelles / ULB', adr: 92, occ: 0.74, rent: 900 },
        { name: 'Matongé / Porte de Namur', adr: 98, occ: 0.76, rent: 920 },
        { name: 'Brugmann', adr: 112, occ: 0.75, rent: 1080 }
      ]
    },
    {
      id: 'bruxelles',
      name: 'Bruxelles-Ville',
      postal: '1000',
      desc: 'Le cœur historique et touristique : Grand-Place, Sablon, Dansaert et le Quartier Européen attirent voyageurs de loisirs et d\'affaires toute l\'année.',
      quartiers: [
        { name: 'Grand-Place / Centre', adr: 135, occ: 0.84, rent: 1000, hot: true },
        { name: 'Sablon', adr: 145, occ: 0.80, rent: 1250, hot: true },
        { name: 'Quartier Européen', adr: 128, occ: 0.82, rent: 1100, hot: true },
        { name: 'Dansaert / Sainte-Catherine', adr: 122, occ: 0.81, rent: 1020 },
        { name: 'Marolles', adr: 108, occ: 0.78, rent: 900 },
        { name: 'Quartier Royal / Mont des Arts', adr: 132, occ: 0.79, rent: 1150 }
      ]
    },
    {
      id: 'saint-gilles',
      name: 'Saint-Gilles',
      postal: '1060',
      desc: 'Ambiance bohème et Art nouveau : le Parvis, la Maison Horta et la gare du Midi (Thalys/Eurostar) en font une valeur sûre.',
      quartiers: [
        { name: 'Parvis de Saint-Gilles', adr: 98, occ: 0.79, rent: 920, hot: true },
        { name: 'Ma Campagne / Louise', adr: 110, occ: 0.77, rent: 1000 },
        { name: 'Gare du Midi', adr: 88, occ: 0.80, rent: 850 },
        { name: 'Bethléem', adr: 82, occ: 0.72, rent: 800 }
      ]
    },
    {
      id: 'uccle',
      name: 'Uccle',
      postal: '1180',
      desc: 'Commune résidentielle verte et haut de gamme : maisons de maître, proximité du Bois de la Cambre et des écoles internationales.',
      quartiers: [
        { name: 'Fort Jaco / Prince d\'Orange', adr: 120, occ: 0.68, rent: 1200, hot: true },
        { name: 'Vanderkindere / Churchill', adr: 108, occ: 0.72, rent: 1100 },
        { name: 'Observatoire', adr: 104, occ: 0.70, rent: 1050 },
        { name: 'Saint-Job', adr: 96, occ: 0.66, rent: 980 }
      ]
    },
    {
      id: 'etterbeek',
      name: 'Etterbeek',
      postal: '1040',
      desc: 'Aux portes des institutions européennes et du Cinquantenaire : forte demande de séjours professionnels en semaine.',
      quartiers: [
        { name: 'Quartier Européen / Jourdan', adr: 118, occ: 0.81, rent: 1050, hot: true },
        { name: 'Cinquantenaire / Mérode', adr: 108, occ: 0.76, rent: 1000 },
        { name: 'La Chasse', adr: 90, occ: 0.73, rent: 880 }
      ]
    },
    {
      id: 'schaerbeek',
      name: 'Schaerbeek',
      postal: '1030',
      desc: 'Patrimoine Art nouveau et quartiers en plein essor, à proximité de la gare du Nord et du Quartier Européen.',
      quartiers: [
        { name: 'Diamant / Plasky', adr: 92, occ: 0.74, rent: 900, hot: true },
        { name: 'Dailly / Meiser', adr: 85, occ: 0.71, rent: 850 },
        { name: 'Josaphat', adr: 82, occ: 0.70, rent: 820 }
      ]
    },
    {
      id: 'forest',
      name: 'Forest',
      postal: '1190',
      desc: 'Entre Saint-Gilles et Uccle : l\'Altitude 100, le parc Duden et une scène culturelle dynamique (Forest National, WIELS).',
      quartiers: [
        { name: 'Altitude 100', adr: 92, occ: 0.71, rent: 920 },
        { name: 'Saint-Denis / Parc de Forest', adr: 84, occ: 0.70, rent: 850 },
        { name: 'Wiel\'s / Van Volxem', adr: 80, occ: 0.69, rent: 800 }
      ]
    },
    {
      id: 'woluwe',
      name: 'Woluwe',
      postal: '1150 · 1200',
      desc: 'Woluwe-Saint-Pierre et Woluwe-Saint-Lambert : familles, expatriés et proximité de l\'OTAN et de l\'aéroport.',
      quartiers: [
        { name: 'Montgomery / Stockel', adr: 105, occ: 0.70, rent: 1100, hot: true },
        { name: 'Tomberg / Roodebeek', adr: 90, occ: 0.68, rent: 950 },
        { name: 'Georges Henri', adr: 95, occ: 0.69, rent: 980 }
      ]
    },
    {
      id: 'auderghem',
      name: 'Auderghem',
      postal: '1160',
      desc: 'Verdure et accessibilité : la forêt de Soignes, le boulevard du Souverain et l\'accès direct à l\'E411.',
      quartiers: [
        { name: 'Souverain / Hermann-Debroux', adr: 88, occ: 0.67, rent: 950 },
        { name: 'Chant d\'Oiseau', adr: 92, occ: 0.66, rent: 980 }
      ]
    },
    {
      id: 'watermael',
      name: 'Watermael-Boitsfort',
      postal: '1170',
      desc: 'La commune la plus verte de la Région : cités-jardins, maisons familiales et calme absolu à 15 min du centre.',
      quartiers: [
        { name: 'Boitsfort centre', adr: 90, occ: 0.64, rent: 1000 },
        { name: 'Le Logis / Floréal', adr: 84, occ: 0.62, rent: 920 }
      ]
    },
    {
      id: 'jette',
      name: 'Jette',
      postal: '1090',
      desc: 'Au nord-ouest, près de l\'UZ Brussel et de l\'Atomium : séjours médicaux et familiaux, bon rapport rendement/prix.',
      quartiers: [
        { name: 'Miroir / Place Reine Astrid', adr: 78, occ: 0.70, rent: 800 },
        { name: 'Atomium / Laeken', adr: 82, occ: 0.72, rent: 820 }
      ]
    },
    {
      id: 'anderlecht',
      name: 'Anderlecht',
      postal: '1070',
      desc: 'Une commune en pleine transformation, à quelques minutes de la gare du Midi, avec des biens spacieux à prix accessibles.',
      quartiers: [
        { name: 'Saint-Guidon / Centre', adr: 78, occ: 0.71, rent: 800 },
        { name: 'Cureghem / Midi', adr: 74, occ: 0.73, rent: 760 }
      ]
    }
  ];

  /** Paramètres du modèle d'estimation */
  const MODEL = {
    commission: 0.20,                                   // 20 % de commission
    daysPerMonth: 30.4,
    /* Multiplicateur du prix / nuit selon le nombre de chambres
       (index = valeur du slider : 0 = studio, 4 = 4 chambres et +) */
    roomsAdr: [0.82, 1.00, 1.42, 1.82, 2.25],
    /* Multiplicateur du loyer classique selon le nombre de chambres */
    roomsRent: [0.80, 1.00, 1.35, 1.70, 2.10],
    /* Légère baisse d'occupation sur les grands logements */
    roomsOcc: [1.02, 1.00, 0.97, 0.93, 0.88],
    type: { apartment: 1.00, house: 1.12, loft: 1.08 },
    standing: {
      standard: { adr: 1.00, occ: 1.00 },
      superior: { adr: 1.18, occ: 1.03 },
      luxury:   { adr: 1.42, occ: 1.05 }
    },
    rangeSpread: 0.12,                                  // ± 12 % pour la fourchette
    /* Facteurs de calibration globaux : ajustez-les pour coller à vos
       données réelles sans retoucher chaque quartier */
    occCalibration: 0.90,                               // prudence sur l'occupation annuelle
    rentCalibration: 1.25                               // loyers classiques 2026 (indexation)
  };

  /** Formatage monétaire (fr-BE) */
  const euro = new Intl.NumberFormat('fr-BE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

  /** Sélecteur raccourci */
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  /** Retourne l'objet quartier depuis une clé "communeId|Nom du quartier" */
  function findQuartier(key) {
    const [zoneId, qName] = String(key).split('|');
    const zone = ZONES.find(z => z.id === zoneId);
    if (!zone) return null;
    const q = zone.quartiers.find(x => x.name === qName) || zone.quartiers[0];
    return { zone, q };
  }

  /** Remplit un <select> avec les quartiers groupés par commune */
  function fillZoneSelect(select, withPlaceholder) {
    if (!select) return;
    select.innerHTML = '';
    if (withPlaceholder) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'Choisir une commune…';
      select.appendChild(opt);
    }
    ZONES.forEach(zone => {
      const group = document.createElement('optgroup');
      group.label = `${zone.name} (${zone.postal})`;
      zone.quartiers.forEach(q => {
        const opt = document.createElement('option');
        opt.value = `${zone.id}|${q.name}`;
        opt.textContent = q.name;
        group.appendChild(opt);
      });
      select.appendChild(group);
    });
  }


  /* ---------- 2. HEADER ---------------------------------------------------- */
  const header = $('#header');
  const nav = $('#nav');
  const burger = $('#burger');

  function onScrollHeader() {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  }
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  // Menu mobile
  function closeNav() {
    nav.classList.remove('is-open');
    burger.classList.remove('is-open');
    header.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Ouvrir le menu');
    document.body.style.overflow = '';
  }
  burger.addEventListener('click', () => {
    const open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open);
    burger.classList.toggle('is-open', open);
    header.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    document.body.style.overflow = open ? 'hidden' : '';
  });
  $$('.nav a').forEach(a => a.addEventListener('click', closeNav));
  window.addEventListener('resize', () => { if (window.innerWidth >= 1024) closeNav(); });

  // Lien actif selon la section visible
  const sections = $$('main section[id]');
  const navLinks = $$('.nav__link');
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        navLinks.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === `#${e.target.id}`));
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(s => spy.observe(s));
  }


  /* ---------- 3. REVEAL AU SCROLL + COMPTEURS ------------------------------ */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-visible');
        // Lance les compteurs contenus dans l'élément révélé
        $$('.counter', e.target).forEach(animateCounter);
        obs.unobserve(e.target);
      });
    }, { threshold: 0.15 });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-visible'));
    $$('.counter').forEach(c => { c.textContent = c.dataset.target; });
  }

  /** Anime un compteur de 0 jusqu'à data-target */
  function animateCounter(el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    const target = parseFloat(el.dataset.target);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const duration = 1400;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);           // ease-out cubic
      el.textContent = (target * eased).toFixed(decimals).replace('.', ',');
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }


  /* ---------- 4. CARTES SERVICES DÉPLIABLES -------------------------------- */
  $$('.service-card').forEach(card => {
    const toggle = () => {
      const open = card.classList.toggle('is-open');
      card.setAttribute('aria-expanded', String(open));
    };
    card.addEventListener('click', e => {
      if (e.target.closest('a')) return;               // laisse passer les liens internes
      toggle();
    });
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  });


  /* ---------- 5. ZONES COUVERTES (ONGLETS) --------------------------------- */
  const tabsEl = $('#zones-tabs');
  const panelEl = $('#zones-panel');

  function renderZoneTabs() {
    tabsEl.innerHTML = ZONES.map((z, i) => `
      <button class="zone-tab" role="tab" id="tab-${z.id}" data-zone="${z.id}"
              aria-selected="${i === 0}" aria-controls="zones-panel" tabindex="${i === 0 ? 0 : -1}">
        ${z.name}
      </button>`).join('');
  }

  function renderZonePanel(zoneId) {
    const zone = ZONES.find(z => z.id === zoneId) || ZONES[0];
    const avgAdr = Math.round(zone.quartiers.reduce((s, q) => s + q.adr, 0) / zone.quartiers.length);
    const avgOcc = Math.round(zone.quartiers.reduce((s, q) => s + q.occ, 0) / zone.quartiers.length * MODEL.occCalibration * 100);
    // Revenu brut moyen pour un 1 chambre standard dans la commune
    const avgMonthly = Math.round(avgAdr * (avgOcc / 100) * MODEL.daysPerMonth / 10) * 10;

    panelEl.innerHTML = `
      <div class="zone-panel__head">
        <h3>${zone.name}</h3>
        <span class="zone-panel__postal">${zone.postal}</span>
      </div>
      <p class="zone-panel__desc">${zone.desc}</p>
      <ul class="zone-panel__chips" aria-label="Quartiers gérés à ${zone.name}">
        ${zone.quartiers.map(q => `<li class="${q.hot ? 'is-hot' : ''}">${q.name}${q.hot ? ' ★' : ''}</li>`).join('')}
      </ul>
      <div class="zone-panel__meta">
        <div><strong>${avgAdr} €</strong><span>prix moyen / nuit</span></div>
        <div><strong>${avgOcc} %</strong><span>occupation moyenne</span></div>
        <div><strong>${euro.format(avgMonthly)}</strong><span>brut / mois (1 ch.)</span></div>
      </div>
      <div class="zone-panel__cta">
        <button type="button" class="btn btn--outline" data-sim-zone="${zone.id}|${zone.quartiers[0].name}">
          Simuler mes revenus à ${zone.name} →
        </button>
      </div>`;
    panelEl.setAttribute('aria-labelledby', `tab-${zone.id}`);
  }

  function selectZone(zoneId) {
    $$('.zone-tab', tabsEl).forEach(t => {
      const on = t.dataset.zone === zoneId;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    renderZonePanel(zoneId);
  }

  renderZoneTabs();
  renderZonePanel(ZONES[0].id);

  tabsEl.addEventListener('click', e => {
    const tab = e.target.closest('.zone-tab');
    if (tab) selectZone(tab.dataset.zone);
  });
  // Navigation clavier entre onglets (flèches)
  tabsEl.addEventListener('keydown', e => {
    if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(e.key)) return;
    e.preventDefault();
    const tabs = $$('.zone-tab', tabsEl);
    const i = tabs.findIndex(t => t.getAttribute('aria-selected') === 'true');
    const dir = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : -1;
    const next = tabs[(i + dir + tabs.length) % tabs.length];
    selectZone(next.dataset.zone);
    next.focus();
  });
  // Bouton "Simuler mes revenus à …" → pré-remplit le simulateur
  panelEl.addEventListener('click', e => {
    const btn = e.target.closest('[data-sim-zone]');
    if (!btn) return;
    simZone.value = btn.dataset.simZone;
    runSimulation();
    $('#simulateur').scrollIntoView({ behavior: 'smooth' });
  });


  /* ---------- 6. SIMULATEUR DE REVENUS ------------------------------------- */
  const simForm = $('#sim-form');
  const simZone = $('#sim-zone');
  const simRooms = $('#sim-rooms');
  const simRoomsOut = $('#sim-rooms-out');
  const simType = $('#sim-type');

  fillZoneSelect(simZone);
  simZone.value = 'ixelles|Châtelain';

  const ROOM_LABELS = ['Studio', '1 chambre', '2 chambres', '3 chambres', '4 chambres et +'];

  /**
   * Calcule l'estimation à partir des paramètres.
   * @returns {{adr:number, occ:number, gross:number, low:number, high:number, net:number, rent:number}}
   */
  function estimate({ zoneKey, rooms, type, standing }) {
    const found = findQuartier(zoneKey) || findQuartier('ixelles|Châtelain');
    const q = found.q;
    const st = MODEL.standing[standing] || MODEL.standing.standard;

    const adr = q.adr * MODEL.roomsAdr[rooms] * (MODEL.type[type] || 1) * st.adr;
    const occ = Math.min(0.95, q.occ * MODEL.occCalibration * MODEL.roomsOcc[rooms] * st.occ);
    const gross = adr * occ * MODEL.daysPerMonth;
    const net = gross * (1 - MODEL.commission);
    const rent = q.rent * MODEL.rentCalibration * MODEL.roomsRent[rooms] * (type === 'house' ? 1.15 : 1) * (standing === 'luxury' ? 1.25 : standing === 'superior' ? 1.1 : 1);

    return {
      adr: Math.round(adr),
      occ: Math.round(occ * 100),
      gross: Math.round(gross / 10) * 10,
      low: Math.round(gross * (1 - MODEL.rangeSpread) / 10) * 10,
      high: Math.round(gross * (1 + MODEL.rangeSpread) / 10) * 10,
      net: Math.round(net / 10) * 10,
      rent: Math.round(rent / 10) * 10
    };
  }

  /** Lit le formulaire, calcule et affiche le résultat */
  function runSimulation() {
    const rooms = parseInt(simRooms.value, 10);
    simRoomsOut.textContent = ROOM_LABELS[rooms];

    const r = estimate({
      zoneKey: simZone.value,
      rooms,
      type: simType.value,
      standing: (simForm.querySelector('input[name="standing"]:checked') || {}).value || 'standard'
    });

    const grossEl = $('#res-gross');
    grossEl.classList.add('is-updating');
    requestAnimationFrame(() => {
      grossEl.textContent = euro.format(r.gross);
      grossEl.classList.remove('is-updating');
    });

    $('#res-range').textContent = `fourchette ${euro.format(r.low)} – ${euro.format(r.high)}`;
    $('#res-adr').textContent = `${r.adr} € / nuit`;
    $('#res-occ').textContent = `${r.occ} %`;
    $('#res-net').textContent = euro.format(r.net);

    const diff = r.net - r.rent;
    const pct = Math.round(diff / r.rent * 100);
    $('#res-vs').textContent = `${diff >= 0 ? '+' : ''}${pct} %`;
    $('#res-vs').style.color = diff >= 0 ? 'var(--success)' : 'var(--error)';

    // Barres de comparaison (échelle relative au max des deux)
    const max = Math.max(r.net, r.rent);
    $('#bar-short').style.width = `${r.net / max * 100}%`;
    $('#bar-long').style.width = `${r.rent / max * 100}%`;

    // Mémorise le contexte pour le formulaire de contact
    const { zone, q } = findQuartier(simZone.value);
    simContext = { zone: zone.name, quartier: q.name, rooms: ROOM_LABELS[rooms], gross: r.gross };
  }

  let simContext = null;
  simForm.addEventListener('input', runSimulation);
  simForm.addEventListener('change', runSimulation);
  runSimulation();

  // Le CTA du simulateur pré-remplit le message de contact
  $('#sim-cta').addEventListener('click', () => {
    if (!simContext) return;
    const msg = $('#c-message');
    if (msg.value.trim()) return;
    msg.value = `Bonjour, je souhaite une étude détaillée pour mon bien (${simContext.rooms}) situé à ${simContext.zone} – ${simContext.quartier}. Estimation simulateur : ${euro.format(simContext.gross)} brut / mois.`;
    const zoneSel = $('#c-zone');
    if (zoneSel) zoneSel.value = simZone.value;
  });


  /* ---------- 7. FORMULAIRE RAPIDE (HERO) → SIMULATEUR ---------------------- */
  const quickForm = $('#quick-form');
  const qZone = $('#q-zone');
  fillZoneSelect(qZone);
  qZone.value = 'ixelles|Châtelain';

  quickForm.addEventListener('submit', e => {
    e.preventDefault();
    simZone.value = qZone.value;
    simRooms.value = $('#q-rooms').value;
    simType.value = $('#q-type').value;
    runSimulation();
    $('#simulateur').scrollIntoView({ behavior: 'smooth' });
  });


  /* ---------- 8. FORMULAIRE DE CONTACT ------------------------------------- */
  const contactForm = $('#contact-form');
  const formStatus = $('#form-status');
  fillZoneSelect($('#c-zone'), true);

  /** Affiche / retire un message d'erreur sous un champ */
  function setFieldError(input, message) {
    const field = input.closest('.field') || input.closest('.checkbox');
    if (!field) return;
    field.classList.toggle('is-invalid', Boolean(message));
    let err = field.querySelector('.field__error');
    if (message) {
      if (!err) { err = document.createElement('span'); err.className = 'field__error'; field.appendChild(err); }
      err.textContent = message;
      input.setAttribute('aria-invalid', 'true');
    } else if (err) {
      err.remove();
      input.removeAttribute('aria-invalid');
    }
  }

  function validateContact() {
    let ok = true;
    const name = $('#c-name'), email = $('#c-email'), consent = $('#c-consent'), phone = $('#c-phone');

    if (name.value.trim().length < 2) { setFieldError(name, 'Merci d\'indiquer votre nom.'); ok = false; } else setFieldError(name, '');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) { setFieldError(email, 'Adresse e-mail invalide.'); ok = false; } else setFieldError(email, '');
    if (phone.value && !/^[+\d][\d\s().-]{6,}$/.test(phone.value.trim())) { setFieldError(phone, 'Numéro de téléphone invalide.'); ok = false; } else setFieldError(phone, '');
    if (!consent.checked) { setFieldError(consent, 'Votre consentement est requis.'); ok = false; } else setFieldError(consent, '');
    return ok;
  }

  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    formStatus.className = 'form__status';
    formStatus.textContent = '';

    if (!validateContact()) {
      formStatus.classList.add('is-error');
      formStatus.textContent = 'Merci de corriger les champs indiqués.';
      contactForm.querySelector('.is-invalid input, .is-invalid select')?.focus();
      return;
    }

    /* ---------------------------------------------------------------
       ENVOI : remplacez ce bloc par votre backend (Formspree, Netlify
       Forms, API maison…). Exemple avec fetch :

       const data = Object.fromEntries(new FormData(contactForm));
       fetch('https://formspree.io/f/VOTRE_ID', {
         method: 'POST', headers: { 'Accept': 'application/json' },
         body: JSON.stringify(data)
       }).then(...)
       --------------------------------------------------------------- */
    const btn = contactForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Envoi en cours…';

    setTimeout(() => {                                  // simulation d'envoi
      btn.disabled = false;
      btn.textContent = 'Envoyer ma demande';
      contactForm.reset();
      formStatus.classList.add('is-success');
      formStatus.textContent = 'Merci ! Votre demande a bien été envoyée. Nous vous recontactons sous 24 h ouvrées.';
    }, 900);
  });

  // Validation "live" après une première tentative
  contactForm.addEventListener('input', e => {
    if (contactForm.querySelector('.is-invalid')) validateContact();
  });


  /* ---------- 9. DIVERS ---------------------------------------------------- */
  $('#year').textContent = new Date().getFullYear();

})();
