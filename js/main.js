/* ==========================================================================
   JAD BESRI — Conciergerie Bruxelles
   Script principal (vanilla JS, aucune dépendance)

   1. Données : communes / quartiers + modèle du simulateur
   2. WhatsApp : tous les éléments [data-wa] ouvrent une conversation
   3. Header (scroll, menu mobile, lien actif) + animations d'apparition
   4. Cartes services dépliables
   5. Zones couvertes (onglets)
   6. Simulateur
   7. Formulaire rapide (hero) → simulateur
   8. Formulaire de contact → message WhatsApp
   9. Divers
   ========================================================================== */

(function () {
  'use strict';

  /* ---------- 1. DONNÉES ------------------------------------------------- */

  /** Numéro WhatsApp au format international, sans "+" ni espaces */
  const WHATSAPP_NUMBER = '32495825694';

  /**
   * adr = prix moyen / nuit (€) pour un 1 chambre standard · occ = occupation
   * annuelle (0–1) · rent = loyer classique 1 chambre (€) · hot = forte demande
   * ⚠️ Chiffres indicatifs, à ajuster avec vos observations réelles.
   */
  const ZONES = [
    { id: 'ixelles', name: 'Ixelles', postal: '1050',
      desc: 'La commune la plus demandée : cafés du Châtelain, étangs d\'Ixelles, Flagey et l\'avenue Louise.',
      quartiers: [
        { name: 'Châtelain', adr: 118, occ: 0.80, rent: 1050, hot: true },
        { name: 'Flagey', adr: 105, occ: 0.78, rent: 980, hot: true },
        { name: 'Louise', adr: 125, occ: 0.79, rent: 1150, hot: true },
        { name: 'Cimetière d\'Ixelles', adr: 92, occ: 0.74, rent: 900 },
        { name: 'Matongé', adr: 98, occ: 0.76, rent: 920 },
        { name: 'Brugmann', adr: 112, occ: 0.75, rent: 1080 }
      ]},
    { id: 'bruxelles', name: 'Bruxelles-Ville', postal: '1000',
      desc: 'Le cœur historique : Grand-Place, Sablon, Dansaert et le Quartier Européen attirent tourisme et voyages d\'affaires toute l\'année.',
      quartiers: [
        { name: 'Grand-Place / Centre', adr: 135, occ: 0.84, rent: 1000, hot: true },
        { name: 'Sablon', adr: 145, occ: 0.80, rent: 1250, hot: true },
        { name: 'Quartier Européen', adr: 128, occ: 0.82, rent: 1100, hot: true },
        { name: 'Dansaert / Sainte-Catherine', adr: 122, occ: 0.81, rent: 1020 },
        { name: 'Marolles', adr: 108, occ: 0.78, rent: 900 },
        { name: 'Quartier Royal', adr: 132, occ: 0.79, rent: 1150 }
      ]},
    { id: 'saint-gilles', name: 'Saint-Gilles', postal: '1060',
      desc: 'Ambiance bohème et Art nouveau : le Parvis, la Maison Horta et la gare du Midi (Thalys, Eurostar).',
      quartiers: [
        { name: 'Parvis', adr: 98, occ: 0.79, rent: 920, hot: true },
        { name: 'Ma Campagne', adr: 110, occ: 0.77, rent: 1000 },
        { name: 'Gare du Midi', adr: 88, occ: 0.80, rent: 850 },
        { name: 'Bethléem', adr: 82, occ: 0.72, rent: 800 }
      ]},
    { id: 'uccle', name: 'Uccle', postal: '1180',
      desc: 'Résidentiel et vert : maisons de maître, Bois de la Cambre, écoles internationales.',
      quartiers: [
        { name: 'Fort Jaco', adr: 120, occ: 0.68, rent: 1200, hot: true },
        { name: 'Vanderkindere', adr: 108, occ: 0.72, rent: 1100 },
        { name: 'Observatoire', adr: 104, occ: 0.70, rent: 1050 },
        { name: 'Saint-Job', adr: 96, occ: 0.66, rent: 980 }
      ]},
    { id: 'etterbeek', name: 'Etterbeek', postal: '1040',
      desc: 'Aux portes des institutions européennes et du Cinquantenaire : forte demande en semaine.',
      quartiers: [
        { name: 'Jourdan / Européen', adr: 118, occ: 0.81, rent: 1050, hot: true },
        { name: 'Cinquantenaire / Mérode', adr: 108, occ: 0.76, rent: 1000 },
        { name: 'La Chasse', adr: 90, occ: 0.73, rent: 880 }
      ]},
    { id: 'schaerbeek', name: 'Schaerbeek', postal: '1030',
      desc: 'Patrimoine Art nouveau et quartiers en plein essor, près de la gare du Nord.',
      quartiers: [
        { name: 'Diamant / Plasky', adr: 92, occ: 0.74, rent: 900, hot: true },
        { name: 'Dailly / Meiser', adr: 85, occ: 0.71, rent: 850 },
        { name: 'Josaphat', adr: 82, occ: 0.70, rent: 820 }
      ]},
    { id: 'forest', name: 'Forest', postal: '1190',
      desc: 'Entre Saint-Gilles et Uccle : Altitude 100, parc Duden, Forest National et le WIELS.',
      quartiers: [
        { name: 'Altitude 100', adr: 92, occ: 0.71, rent: 920 },
        { name: 'Parc de Forest', adr: 84, occ: 0.70, rent: 850 },
        { name: 'Wiels', adr: 80, occ: 0.69, rent: 800 }
      ]},
    { id: 'woluwe', name: 'Woluwe', postal: '1150 · 1200',
      desc: 'Woluwe-Saint-Pierre et Saint-Lambert : familles, expatriés, proximité de l\'aéroport.',
      quartiers: [
        { name: 'Montgomery / Stockel', adr: 105, occ: 0.70, rent: 1100, hot: true },
        { name: 'Tomberg', adr: 90, occ: 0.68, rent: 950 },
        { name: 'Georges Henri', adr: 95, occ: 0.69, rent: 980 }
      ]},
    { id: 'auderghem', name: 'Auderghem', postal: '1160',
      desc: 'Verdure et accessibilité : forêt de Soignes, boulevard du Souverain, accès direct à l\'E411.',
      quartiers: [
        { name: 'Souverain', adr: 88, occ: 0.67, rent: 950 },
        { name: 'Chant d\'Oiseau', adr: 92, occ: 0.66, rent: 980 }
      ]},
    { id: 'watermael', name: 'Watermael-Boitsfort', postal: '1170',
      desc: 'La commune la plus verte de la Région : cités-jardins et calme à 15 minutes du centre.',
      quartiers: [
        { name: 'Boitsfort centre', adr: 90, occ: 0.64, rent: 1000 },
        { name: 'Le Logis / Floréal', adr: 84, occ: 0.62, rent: 920 }
      ]},
    { id: 'jette', name: 'Jette', postal: '1090',
      desc: 'Près de l\'UZ Brussel et de l\'Atomium : séjours médicaux et familiaux, bon rendement.',
      quartiers: [
        { name: 'Miroir', adr: 78, occ: 0.70, rent: 800 },
        { name: 'Atomium / Laeken', adr: 82, occ: 0.72, rent: 820 }
      ]},
    { id: 'anderlecht', name: 'Anderlecht', postal: '1070',
      desc: 'En pleine transformation, à quelques minutes de la gare du Midi, avec des biens spacieux.',
      quartiers: [
        { name: 'Saint-Guidon', adr: 78, occ: 0.71, rent: 800 },
        { name: 'Cureghem / Midi', adr: 74, occ: 0.73, rent: 760 }
      ]}
  ];

  const MODEL = {
    commission: 0.20,
    daysPerMonth: 30.4,
    roomsAdr:  [0.82, 1.00, 1.42, 1.82, 2.25],   // studio, 1, 2, 3, 4+
    roomsRent: [0.80, 1.00, 1.35, 1.70, 2.10],
    roomsOcc:  [1.02, 1.00, 0.97, 0.93, 0.88],
    type: { apartment: 1.00, house: 1.12, loft: 1.08 },
    standing: {
      standard: { adr: 1.00, occ: 1.00 },
      superior: { adr: 1.18, occ: 1.03 },
      luxury:   { adr: 1.42, occ: 1.05 }
    },
    rangeSpread: 0.12,
    occCalibration: 0.90,     // prudence sur l'occupation annuelle
    rentCalibration: 1.25     // loyers classiques actuels
  };

  const ROOM_LABELS = ['Studio', '1 chambre', '2 chambres', '3 chambres', '4 chambres et +'];
  const euro = new Intl.NumberFormat('fr-BE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

  function findQuartier(key) {
    const [zoneId, qName] = String(key).split('|');
    const zone = ZONES.find(z => z.id === zoneId);
    if (!zone) return null;
    return { zone, q: zone.quartiers.find(x => x.name === qName) || zone.quartiers[0] };
  }

  function fillZoneSelect(select, placeholder) {
    if (!select) return;
    select.innerHTML = '';
    if (placeholder) {
      const o = document.createElement('option');
      o.value = ''; o.textContent = placeholder;
      select.appendChild(o);
    }
    ZONES.forEach(zone => {
      const g = document.createElement('optgroup');
      g.label = `${zone.name} (${zone.postal})`;
      zone.quartiers.forEach(q => {
        const o = document.createElement('option');
        o.value = `${zone.id}|${q.name}`;
        o.textContent = q.name;
        g.appendChild(o);
      });
      select.appendChild(g);
    });
  }


  /* ---------- 2. WHATSAPP -------------------------------------------------- */
  function waLink(text) {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text || '')}`;
  }
  $$('[data-wa]').forEach(el => {
    el.setAttribute('href', waLink(el.dataset.waText || 'Bonjour Jad,'));
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
  });


  /* ---------- 3. HEADER + REVEAL ------------------------------------------- */
  const header = $('#header');
  const nav = $('#nav');
  const burger = $('#burger');

  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function closeNav() {
    nav.classList.remove('is-open');
    burger.classList.remove('is-open');
    header.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  burger.addEventListener('click', () => {
    const open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open);
    burger.classList.toggle('is-open', open);
    header.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });
  $$('.nav a').forEach(a => a.addEventListener('click', closeNav));
  window.addEventListener('resize', () => { if (window.innerWidth >= 1024) closeNav(); });

  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const links = $$('.nav__link');
    const spy = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        links.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === `#${e.target.id}`));
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    $$('main section[id]').forEach(s => spy.observe(s));

    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.12 });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-visible'));
  }


  /* ---------- 4. CARTES SERVICES ------------------------------------------- */
  $$('.service-card').forEach(card => {
    const toggle = () => card.setAttribute('aria-expanded', String(card.classList.toggle('is-open')));
    card.addEventListener('click', e => { if (!e.target.closest('a')) toggle(); });
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
  });


  /* ---------- 5. ZONES COUVERTES ------------------------------------------- */
  const tabsEl = $('#zones-tabs');
  const panelEl = $('#zones-panel');

  tabsEl.innerHTML = ZONES.map((z, i) => `
    <button class="zone-tab" role="tab" id="tab-${z.id}" data-zone="${z.id}"
            aria-selected="${i === 0}" aria-controls="zones-panel" tabindex="${i === 0 ? 0 : -1}">${z.name}</button>`).join('');

  function renderZonePanel(zoneId) {
    const zone = ZONES.find(z => z.id === zoneId) || ZONES[0];
    const avgAdr = Math.round(zone.quartiers.reduce((s, q) => s + q.adr, 0) / zone.quartiers.length);
    const avgOcc = Math.round(zone.quartiers.reduce((s, q) => s + q.occ, 0) / zone.quartiers.length * MODEL.occCalibration * 100);
    const avgMonthly = Math.round(avgAdr * (avgOcc / 100) * MODEL.daysPerMonth / 10) * 10;
    panelEl.innerHTML = `
      <div class="zone-panel__head"><h3>${zone.name}</h3><span class="zone-panel__postal">${zone.postal}</span></div>
      <p class="zone-panel__desc">${zone.desc}</p>
      <ul class="zone-panel__chips" aria-label="Quartiers de ${zone.name}">
        ${zone.quartiers.map(q => `<li class="${q.hot ? 'is-hot' : ''}">${q.name}</li>`).join('')}
      </ul>
      <div class="zone-panel__meta">
        <div><strong>${avgAdr} €</strong><span>prix moyen / nuit</span></div>
        <div><strong>${avgOcc} %</strong><span>occupation moyenne</span></div>
        <div><strong>${euro.format(avgMonthly)}</strong><span>brut / mois (1 ch.)</span></div>
      </div>
      <div class="zone-panel__cta">
        <button type="button" class="btn btn--outline" data-sim-zone="${zone.id}|${zone.quartiers[0].name}">Simuler mes revenus à ${zone.name} →</button>
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
  renderZonePanel(ZONES[0].id);

  tabsEl.addEventListener('click', e => { const t = e.target.closest('.zone-tab'); if (t) selectZone(t.dataset.zone); });
  tabsEl.addEventListener('keydown', e => {
    if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(e.key)) return;
    e.preventDefault();
    const tabs = $$('.zone-tab', tabsEl);
    const i = tabs.findIndex(t => t.getAttribute('aria-selected') === 'true');
    const next = tabs[(i + ((e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : -1) + tabs.length) % tabs.length];
    selectZone(next.dataset.zone);
    next.focus();
  });
  panelEl.addEventListener('click', e => {
    const btn = e.target.closest('[data-sim-zone]');
    if (!btn) return;
    simZone.value = btn.dataset.simZone;
    runSimulation();
    $('#simulateur').scrollIntoView({ behavior: 'smooth' });
  });


  /* ---------- 6. SIMULATEUR ------------------------------------------------ */
  const simForm = $('#sim-form');
  const simZone = $('#sim-zone');
  const simRooms = $('#sim-rooms');
  const simType = $('#sim-type');
  fillZoneSelect(simZone);
  simZone.value = 'ixelles|Châtelain';

  function estimate({ zoneKey, rooms, type, standing }) {
    const { q } = findQuartier(zoneKey) || findQuartier('ixelles|Châtelain');
    const st = MODEL.standing[standing] || MODEL.standing.standard;
    const adr = q.adr * MODEL.roomsAdr[rooms] * (MODEL.type[type] || 1) * st.adr;
    const occ = Math.min(0.95, q.occ * MODEL.occCalibration * MODEL.roomsOcc[rooms] * st.occ);
    const gross = adr * occ * MODEL.daysPerMonth;
    const rent = q.rent * MODEL.rentCalibration * MODEL.roomsRent[rooms]
      * (type === 'house' ? 1.15 : 1) * (standing === 'luxury' ? 1.25 : standing === 'superior' ? 1.1 : 1);
    const r10 = n => Math.round(n / 10) * 10;
    return {
      adr: Math.round(adr), occ: Math.round(occ * 100),
      gross: r10(gross), low: r10(gross * (1 - MODEL.rangeSpread)), high: r10(gross * (1 + MODEL.rangeSpread)),
      net: r10(gross * (1 - MODEL.commission)), rent: r10(rent)
    };
  }

  function runSimulation() {
    const rooms = parseInt(simRooms.value, 10);
    $('#sim-rooms-out').textContent = ROOM_LABELS[rooms];
    const standing = (simForm.querySelector('input[name="standing"]:checked') || {}).value || 'standard';
    const r = estimate({ zoneKey: simZone.value, rooms, type: simType.value, standing });

    const grossEl = $('#res-gross');
    grossEl.classList.add('is-updating');
    requestAnimationFrame(() => { grossEl.textContent = euro.format(r.gross); grossEl.classList.remove('is-updating'); });
    $('#res-range').textContent = `entre ${euro.format(r.low)} et ${euro.format(r.high)} selon la saison`;
    $('#res-adr').textContent = `${r.adr} €`;
    $('#res-occ').textContent = `${r.occ} %`;
    $('#res-net').textContent = euro.format(r.net);

    const diff = r.net - r.rent;
    const vs = $('#res-vs');
    vs.textContent = `${diff >= 0 ? '+' : ''}${Math.round(diff / r.rent * 100)} %`;
    vs.style.color = diff >= 0 ? 'var(--success)' : 'var(--error)';
    const max = Math.max(r.net, r.rent);
    $('#bar-short').style.width = `${r.net / max * 100}%`;
    $('#bar-long').style.width = `${r.rent / max * 100}%`;

    const { zone, q } = findQuartier(simZone.value);
    $('#sim-cta').setAttribute('href', waLink(
      `Bonjour Jad, j'ai fait une simulation sur votre site pour un bien (${ROOM_LABELS[rooms]}) à ${zone.name} – ${q.name} : environ ${euro.format(r.gross)} brut par mois. J'aimerais une estimation détaillée.`
    ));
  }
  simForm.addEventListener('input', runSimulation);
  simForm.addEventListener('change', runSimulation);
  runSimulation();


  /* ---------- 7. FORMULAIRE RAPIDE (HERO) → SIMULATEUR ---------------------- */
  const qZone = $('#q-zone');
  fillZoneSelect(qZone);
  qZone.value = 'ixelles|Châtelain';
  $('#quick-form').addEventListener('submit', e => {
    e.preventDefault();
    simZone.value = qZone.value;
    simRooms.value = $('#q-rooms').value;
    simType.value = $('#q-type').value;
    runSimulation();
    $('#simulateur').scrollIntoView({ behavior: 'smooth' });
  });


  /* ---------- 8. FORMULAIRE DE CONTACT → WHATSAPP -------------------------- */
  const cZone = $('#c-zone');
  fillZoneSelect(cZone, 'Choisir une commune…');
  $('#contact-form').addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#c-name');
    const status = $('#form-status');
    const field = name.closest('.field');
    if (name.value.trim().length < 2) {
      field.classList.add('is-invalid');
      status.textContent = 'Merci d\'indiquer votre nom pour que je sache à qui je réponds.';
      name.focus();
      return;
    }
    field.classList.remove('is-invalid');
    status.textContent = '';
    const zone = cZone.value ? findQuartier(cZone.value) : null;
    const lines = [
      `Bonjour Jad, je m'appelle ${name.value.trim()}.`,
      `Je vous contacte pour ${$('#c-service').value}.`,
      zone ? `Mon bien se situe à ${zone.zone.name} (${zone.q.name}).` : '',
      $('#c-message').value.trim()
    ].filter(Boolean);
    window.open(waLink(lines.join('\n')), '_blank', 'noopener');
  });


  /* ---------- 9. DIVERS ---------------------------------------------------- */
  $('#year').textContent = new Date().getFullYear();
  $('#legal-link').addEventListener('click', e => {
    e.preventDefault();
    alert('Éditeur du site : Jad Besri, Bruxelles — jadbesri9@gmail.com — +32 495 82 56 94.\nLes estimations du simulateur sont indicatives et non contractuelles.');
  });

})();
