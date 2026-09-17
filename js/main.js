/* ==========================================================================
   JB CONCIERGERIE — Bruxelles
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
 * Communes et quartiers — chiffres recalés en septembre 2026 sur :
 *   · Airbtics (fév. 2025 → jan. 2026) : prix/nuit médian Bruxelles €106, Ixelles €106,
 *     Etterbeek €93, Saint-Gilles €91, Sablon €134, Grand-Place €170
 *   · AirDNA 2026 : ~€117/nuit, occupation 62 % · AirROI (août 2025 → juil. 2026) :
 *     occupation 49 % toutes annonces, pic oct./mai/déc., creux jan./fév./juil.
 *   · Federia / Gazette de Bruxelles (sept. 2025) : loyer moyen appartement — Uccle 1 520,
 *     Ixelles 1 495, Woluwe-St-Lambert 1 478, Saint-Gilles 1 267, Schaerbeek 1 245,
 *     Anderlecht 1 042, Jette 1 035, moyenne régionale 1 346 (1 chambre ≈ 15-20 % en dessous)
 *
 * adr  = prix moyen / nuit (€) d'un 1 chambre standard bien présenté
 * occ  = occupation annuelle réaliste d'un bien géré à l'année (0–1)
 * rent = loyer mensuel d'un 1 chambre en location classique (€)
 * hot  = quartier à forte demande
 */
const ZONES = [
  { id: 'ixelles', lat: 50.8275, lng: 4.3690, codes: ['1050'], name: 'Ixelles', postal: '1050',
    desc: 'La commune la plus demandée : cafés du Châtelain, étangs d\'Ixelles, Flagey et l\'avenue Louise.',
    quartiers: [
{ name: 'Châtelain', lat: 50.8258, lng: 4.36, adr: 110, occ: 0.72, rent: 1300, hot: true },
{ name: 'Flagey', lat: 50.8275, lng: 4.372, adr: 100, occ: 0.70, rent: 1200, hot: true },
{ name: 'Louise', lat: 50.832, lng: 4.358, adr: 115, occ: 0.70, rent: 1350, hot: true },
{ name: 'Cimetière d\'Ixelles', lat: 50.819, lng: 4.386, adr: 90, occ: 0.66, rent: 1100 },
{ name: 'Matongé', lat: 50.8375, lng: 4.364, adr: 95, occ: 0.68, rent: 1100 },
{ name: 'Brugmann', lat: 50.8175, lng: 4.36, adr: 105, occ: 0.66, rent: 1250 }
    ]},
  { id: 'bruxelles', lat: 50.8467, lng: 4.3525, codes: ['1000', '1020', '1120', '1130'], name: 'Bruxelles-Ville', postal: '1000',
    desc: 'Le cœur historique : Grand-Place, Sablon, Dansaert et le Quartier Européen attirent tourisme et voyages d\'affaires toute l\'année.',
    quartiers: [
{ name: 'Grand-Place / Centre', lat: 50.8467, lng: 4.3525, adr: 130, occ: 0.74, rent: 1100, hot: true },
{ name: 'Sablon', lat: 50.841, lng: 4.356, adr: 135, occ: 0.72, rent: 1300, hot: true },
{ name: 'Quartier Européen', lat: 50.842, lng: 4.38, adr: 115, occ: 0.72, rent: 1200, hot: true },
{ name: 'Dansaert / Sainte-Catherine', lat: 50.85, lng: 4.345, adr: 115, occ: 0.72, rent: 1150 },
{ name: 'Marolles', lat: 50.8375, lng: 4.347, adr: 100, occ: 0.68, rent: 1000 },
{ name: 'Quartier Royal', lat: 50.843, lng: 4.362, adr: 120, occ: 0.70, rent: 1250 }
    ]},
  { id: 'saint-gilles', lat: 50.8265, lng: 4.3450, codes: ['1060'], name: 'Saint-Gilles', postal: '1060',
    desc: 'Ambiance bohème et Art nouveau : le Parvis, la Maison Horta et la gare du Midi (Thalys, Eurostar).',
    quartiers: [
{ name: 'Parvis', lat: 50.829, lng: 4.345, adr: 92, occ: 0.70, rent: 1050, hot: true },
{ name: 'Ma Campagne', lat: 50.8225, lng: 4.354, adr: 100, occ: 0.68, rent: 1100 },
{ name: 'Gare du Midi', lat: 50.8355, lng: 4.336, adr: 85, occ: 0.70, rent: 950 },
{ name: 'Bethléem', lat: 50.824, lng: 4.339, adr: 80, occ: 0.64, rent: 950 }
    ]},
  { id: 'uccle', lat: 50.8020, lng: 4.3370, codes: ['1180'], name: 'Uccle', postal: '1180',
    desc: 'Résidentiel et vert : maisons de maître, Bois de la Cambre, écoles internationales.',
    quartiers: [
{ name: 'Fort Jaco', lat: 50.792, lng: 4.356, adr: 105, occ: 0.60, rent: 1300, hot: true },
{ name: 'Vanderkindere', lat: 50.811, lng: 4.347, adr: 98, occ: 0.62, rent: 1250 },
{ name: 'Observatoire', lat: 50.7985, lng: 4.358, adr: 95, occ: 0.60, rent: 1200 },
{ name: 'Saint-Job', lat: 50.788, lng: 4.34, adr: 90, occ: 0.56, rent: 1150 }
    ]},
  { id: 'etterbeek', lat: 50.8367, lng: 4.3900, codes: ['1040'], name: 'Etterbeek', postal: '1040',
    desc: 'Aux portes des institutions européennes et du Cinquantenaire : forte demande en semaine.',
    quartiers: [
{ name: 'Jourdan / Européen', lat: 50.8375, lng: 4.381, adr: 100, occ: 0.70, rent: 1150, hot: true },
{ name: 'Cinquantenaire / Mérode', lat: 50.838, lng: 4.398, adr: 95, occ: 0.66, rent: 1100 },
{ name: 'La Chasse', lat: 50.83, lng: 4.39, adr: 85, occ: 0.64, rent: 1000 }
    ]},
  { id: 'schaerbeek', lat: 50.8620, lng: 4.3770, codes: ['1030'], name: 'Schaerbeek', postal: '1030',
    desc: 'Patrimoine Art nouveau et quartiers en plein essor, près de la gare du Nord.',
    quartiers: [
{ name: 'Diamant / Plasky', lat: 50.852, lng: 4.396, adr: 85, occ: 0.64, rent: 1050, hot: true },
{ name: 'Dailly / Meiser', lat: 50.856, lng: 4.392, adr: 80, occ: 0.62, rent: 1000 },
{ name: 'Josaphat', lat: 50.86, lng: 4.38, adr: 78, occ: 0.60, rent: 980 }
    ]},
  { id: 'forest', lat: 50.8100, lng: 4.3170, codes: ['1190'], name: 'Forest', postal: '1190',
    desc: 'Entre Saint-Gilles et Uccle : Altitude 100, parc Duden, Forest National et le WIELS.',
    quartiers: [
{ name: 'Altitude 100', lat: 50.811, lng: 4.333, adr: 85, occ: 0.62, rent: 1050 },
{ name: 'Parc de Forest', lat: 50.8155, lng: 4.3245, adr: 80, occ: 0.60, rent: 950 },
{ name: 'Wiels', lat: 50.8225, lng: 4.33, adr: 75, occ: 0.58, rent: 900 }
    ]},
  { id: 'woluwe', lat: 50.8420, lng: 4.4300, codes: ['1150', '1200'], name: 'Woluwe', postal: '1150 · 1200',
    desc: 'Woluwe-Saint-Pierre et Saint-Lambert : familles, expatriés, proximité de l\'aéroport.',
    quartiers: [
{ name: 'Montgomery / Stockel', lat: 50.838, lng: 4.438, adr: 95, occ: 0.60, rent: 1250, hot: true },
{ name: 'Tomberg', lat: 50.847, lng: 4.42, adr: 85, occ: 0.58, rent: 1150 },
{ name: 'Georges Henri', lat: 50.841, lng: 4.411, adr: 88, occ: 0.58, rent: 1180 }
    ]},
  { id: 'auderghem', lat: 50.8150, lng: 4.4300, codes: ['1160'], name: 'Auderghem', postal: '1160',
    desc: 'Verdure et accessibilité : forêt de Soignes, boulevard du Souverain, accès direct à l\'E411.',
    quartiers: [
{ name: 'Souverain', lat: 50.813, lng: 4.427, adr: 82, occ: 0.57, rent: 1100 },
{ name: 'Chant d\'Oiseau', lat: 50.824, lng: 4.423, adr: 85, occ: 0.56, rent: 1100 }
    ]},
  { id: 'watermael', lat: 50.7950, lng: 4.4150, codes: ['1170'], name: 'Watermael-Boitsfort', postal: '1170',
    desc: 'La commune la plus verte de la Région : cités-jardins et calme à 15 minutes du centre.',
    quartiers: [
{ name: 'Boitsfort centre', lat: 50.798, lng: 4.413, adr: 82, occ: 0.54, rent: 1100 },
{ name: 'Le Logis / Floréal', lat: 50.8, lng: 4.408, adr: 78, occ: 0.52, rent: 1050 }
    ]},
  { id: 'jette', lat: 50.8780, lng: 4.3260, codes: ['1090'], name: 'Jette', postal: '1090',
    desc: 'Près de l\'UZ Brussel et de l\'Atomium : séjours médicaux et familiaux, bon rendement.',
    quartiers: [
{ name: 'Miroir', lat: 50.879, lng: 4.327, adr: 75, occ: 0.60, rent: 850 },
{ name: 'Atomium / Laeken', lat: 50.893, lng: 4.34, adr: 78, occ: 0.62, rent: 870 }
    ]},
  { id: 'anderlecht', lat: 50.8380, lng: 4.3080, codes: ['1070'], name: 'Anderlecht', postal: '1070',
    desc: 'En pleine transformation, à quelques minutes de la gare du Midi, avec des biens spacieux.',
    quartiers: [
{ name: 'Saint-Guidon', lat: 50.835, lng: 4.308, adr: 72, occ: 0.62, rent: 870 },
{ name: 'Cureghem / Midi', lat: 50.839, lng: 4.322, adr: 70, occ: 0.64, rent: 830 }
    ]}
];

  /**
   * BIENS GÉRÉS — pour ajouter un appartement, copiez une ligne du modèle
   * ci-dessous et déposez sa photo dans le dossier images/.
   *
   *   { name: 'Appartement Châtelain', zone: 'Ixelles · Châtelain', rooms: '2 chambres',
   *     desc: 'Lumineux, rénové, à deux pas de la place du Châtelain.',
   *     image: 'images/chatelain.jpg', tag: 'Airbnb', url: 'https://airbnb.com/…' }
   *
   * Tous les champs sauf name sont facultatifs. Tant que la liste est vide ou
   * courte, des emplacements « Bientôt » complètent la grille.
   */
  const PROPERTIES = [
    // { name: 'Appartement Châtelain', zone: 'Ixelles · Châtelain', rooms: '2 chambres', desc: '…', image: 'images/chatelain.jpg', tag: 'Airbnb', url: '' },
  ];
  const PORTFOLIO_MIN_SLOTS = 3;   // nombre de cartes affichées au minimum (vides comprises)

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
    occCalibration: 1.00,     // (les taux d'occupation ci-dessus sont déjà réalistes)
    rentCalibration: 1.00     // (loyers alignés sur Federia, sept. 2025)
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

/** Normalise un libellé pour la comparaison (minuscules, sans accents) */
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/**
 * Trouve le quartier d'une adresse dans une commune :
 * 1) un nom de quartier renvoyé par OpenStreetMap correspond à l'un des nôtres,
 * 2) sinon le quartier dont le centre est le plus proche du point géocodé.
 */
function detectQuartier(zone, lat, lng, osmAddress) {
  // 1) Nom de quartier renvoyé par OpenStreetMap (dans la commune détectée)
  const labels = [osmAddress.neighbourhood, osmAddress.quarter, osmAddress.suburb, osmAddress.city_district]
    .filter(Boolean).map(norm).join(' | ');
  const byName = zone.quartiers.find(q => q.name.split('/').some(part => labels.includes(norm(part.trim()))));
  if (byName) return { zone, q: byName };

  // 2) Quartier le plus proche, toutes communes couvertes confondues : les limites
  //    communales bruxelloises sont parfois contre-intuitives (ex. rue du Bailli =
  //    Bruxelles-Ville mais à 200 m du Châtelain), et c'est la proximité qui
  //    détermine le marché locatif.
  let best = { zone, q: zone.quartiers[0] }, bestD = Infinity;
  const cosLat = Math.cos(lat * Math.PI / 180);
  ZONES.forEach(z => z.quartiers.forEach(q => {
    if (q.lat == null) return;
    const d = (q.lat - lat) ** 2 + ((q.lng - lng) * cosLat) ** 2;
    if (d < bestD) { bestD = d; best = { zone: z, q }; }
  }));
  return best;
}

/** Quartier « moyen » d'une commune : moyenne des prix, occupations et loyers */
function zoneAverage(zone) {
  const n = zone.quartiers.length;
  const sum = k => zone.quartiers.reduce((s, q) => s + q[k], 0) / n;
  return { name: zone.name, adr: sum('adr'), occ: sum('occ'), rent: sum('rent') };
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
    el.setAttribute('href', waLink(el.dataset.waText || 'Bonjour,'));
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
    window.observeReveals = root => $$('.reveal', root).forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-visible'));
    window.observeReveals = root => $$('.reveal', root).forEach(el => el.classList.add('is-visible'));
  }


  /* ---------- 4. CARTES SERVICES ------------------------------------------- */
  $$('.service-card').forEach(card => {
    const toggle = () => card.setAttribute('aria-expanded', String(card.classList.toggle('is-open')));
    card.addEventListener('click', e => { if (!e.target.closest('a')) toggle(); });
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
  });


  /* ---------- 4b. BIENS GÉRÉS ---------------------------------------------- */
  (function renderPortfolio() {
    const grid = $('#portfolio-grid');
    if (!grid) return;
    const esc = s => String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

    const cards = PROPERTIES.map(p => `
      <article class="property reveal">
        <div class="property__media">
          ${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">` : ''}
          ${p.tag ? `<span class="property__tag">${esc(p.tag)}</span>` : ''}
        </div>
        <div class="property__body">
          <h3>${esc(p.name)}</h3>
          <span class="property__meta">${[p.zone, p.rooms].filter(Boolean).map(esc).join(' · ')}</span>
          ${p.desc ? `<p class="property__desc">${esc(p.desc)}</p>` : ''}
          ${p.url ? `<a class="property__link" href="${esc(p.url)}" target="_blank" rel="noopener">Voir l'annonce →</a>` : ''}
        </div>
      </article>`);

    const emptySlots = Math.max(0, PORTFOLIO_MIN_SLOTS - PROPERTIES.length);
    for (let i = 0; i < emptySlots; i++) {
      cards.push(`
      <article class="property property--empty reveal" aria-label="Emplacement disponible">
        <div class="property__media" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M3 12l9-8 9 8M5 10v10h14V10"/><path d="M12 13v4M10 15h4"/></svg>
        </div>
        <div class="property__body">
          <h3>Bientôt</h3>
          <span class="property__meta">Prochain bien confié</span>
        </div>
      </article>`);
    }
    grid.innerHTML = cards.join('');
    window.observeReveals(grid);   // les cartes générées bénéficient aussi de l'animation d'apparition
  })();


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
    if (window.highlightZonePin) window.highlightZonePin(zoneId);
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


/* ---------- 5b. CARTE INTERACTIVE ---------------------------------------- */
(function initMap() {
  const mapEl = $('#map');
  if (!mapEl || typeof L === 'undefined') return;

  const map = L.map(mapEl, { scrollWheelZoom: false }).setView([50.8380, 4.3720], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  // Un repère par commune ; clic = sélection de l'onglet correspondant
  const pins = {};
  ZONES.forEach(z => {
    const icon = L.divIcon({ className: '', html: '<div class="map-pin" data-zone="' + z.id + '"></div>', iconSize: [16, 16], iconAnchor: [8, 8] });
    const m = L.marker([z.lat, z.lng], { icon, title: z.name }).addTo(map);
    m.bindPopup('<strong>' + z.name + '</strong>' + z.quartiers.map(q => q.name).join(' · ') +
                '<br><span class="popup-link" data-zone-link="' + z.id + '">Voir les quartiers →</span>');
    m.on('click', () => selectZone(z.id));
    pins[z.id] = m;
  });
  map.on('popupopen', e => {
    const link = e.popup.getElement().querySelector('[data-zone-link]');
    if (link) link.addEventListener('click', () => {
      selectZone(link.dataset.zoneLink);
      map.closePopup();
      $('#zones').scrollIntoView({ behavior: 'smooth' });
    });
  });
  window.highlightZonePin = zoneId => {
    $$('.map-pin').forEach(p => p.classList.toggle('is-active', p.dataset.zone === zoneId));
  };
  window.highlightZonePin(ZONES[0].id);

  // Recherche d'adresse (géocodage OpenStreetMap / Nominatim, limité à la Région bruxelloise)
  const form = $('#map-search');
  const status = $('#map-status');
  let homeMarker = null;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const q = $('#map-address').value.trim();
    if (q.length < 4) { status.className = 'map-status is-warn'; status.textContent = 'Entrez une adresse (rue + numéro, ou rue + code postal).'; return; }
    status.className = 'map-status';
    status.textContent = 'Recherche en cours…';
    try {
      const url = 'https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=1&countrycodes=be' +
                  '&viewbox=4.24,50.93,4.49,50.76&bounded=1&q=' + encodeURIComponent(q);
      const res = await fetch(url, { headers: { 'Accept-Language': 'fr' } });
      const data = await res.json();
      if (!data.length) { status.className = 'map-status is-warn'; status.textContent = 'Adresse introuvable dans la Région de Bruxelles-Capitale. Essayez avec le code postal.'; return; }

      const r = data[0];
      const lat = parseFloat(r.lat), lng = parseFloat(r.lon);
      const homeIcon = L.divIcon({ className: '', html: '<div class="map-home"></div>', iconSize: [20, 20], iconAnchor: [10, 10] });
      if (homeMarker) map.removeLayer(homeMarker);
      homeMarker = L.marker([lat, lng], { icon: homeIcon, title: 'Votre logement' }).addTo(map);
      // Animation si la carte est visible ; sinon (onglet en arrière-plan) recentrage direct
      map.invalidateSize();
      try { map.flyTo([lat, lng], 14, { duration: .8 }); } catch (_) { map.setView([lat, lng], 14, { animate: false }); }

      // Commune reconnue via le code postal, sinon via le nom renvoyé
      const a = r.address || {};
      const postcode = String(a.postcode || '').trim();
      const label = [a.city_district, a.suburb, a.municipality, a.town, a.city].filter(Boolean).join(' / ');
      const zone = ZONES.find(z => z.codes.includes(postcode)) ||
                   ZONES.find(z => label.toLowerCase().includes(z.name.toLowerCase().split('-')[0]));
      const short = r.display_name.split(',').slice(0, 2).join(',');
      if (zone) {
        const found = detectQuartier(zone, lat, lng, a);
        selectZone(found.zone.id);
        status.className = 'map-status is-ok';
        status.innerHTML = short + ' — bonne nouvelle, <strong>' + found.zone.name + ' – ' + found.q.name + '</strong> fait partie de nos zones couvertes. Voici une première estimation :';
        window.showMapEstimate(found.zone, short, found.q);
      } else {
        status.className = 'map-status is-warn';
        status.textContent = short + ' — cette commune n’est pas encore listée, mais nous étudions chaque demande : écrivez-nous sur WhatsApp.';
        $('#map-result').hidden = true;
      }
    } catch (err) {
      console.error('Recherche d’adresse :', err);
      status.className = 'map-status is-warn';
      status.textContent = 'La recherche d’adresse est momentanément indisponible. Choisissez votre commune ci-dessous.';
    }
  });
})();


  /* ---------- 6. SIMULATEUR ------------------------------------------------ */
  const simForm = $('#sim-form');
  const simZone = $('#sim-zone');
  const simRooms = $('#sim-rooms');
  const simType = $('#sim-type');
  fillZoneSelect(simZone);
  simZone.value = 'ixelles|Châtelain';

  function estimate({ zoneKey, q: qOverride, rooms, type, standing }) {
    const q = qOverride || (findQuartier(zoneKey) || findQuartier('ixelles|Châtelain')).q;
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
      `Bonjour, j'ai fait une simulation sur votre site pour un bien (${ROOM_LABELS[rooms]}) à ${zone.name} – ${q.name} : environ ${euro.format(r.gross)} brut par mois. J'aimerais une estimation détaillée.`
    ));
  }
  simForm.addEventListener('input', runSimulation);
  simForm.addEventListener('change', runSimulation);
  runSimulation();


/* ---------- 6b. ESTIMATION IMMÉDIATE SOUS LA CARTE ----------------------- */
  let mapCtx = null;   // { zone, address, quartier }

function renderMapEstimate() {
  if (!mapCtx) return;
  const rooms = parseInt($('#mr-rooms').value, 10);
  const type = $('#mr-type').value;
  const standing = $('#mr-standing').value;
    const qSel = $('#mr-quartier');
    const quartier = mapCtx.zone.quartiers.find(q => q.name === qSel.value) || mapCtx.quartier;
    const r = estimate({ q: quartier, rooms, type, standing });

  $('#mr-gross').textContent = euro.format(r.gross);
  $('#mr-range').textContent = `entre ${euro.format(r.low)} et ${euro.format(r.high)} selon la saison`;
  $('#mr-net').textContent = euro.format(r.net);
  $('#mr-rent').textContent = euro.format(r.rent);
  $('#mr-adr').textContent = `${r.adr} € · ${r.occ} %`;

  $('#mr-wa').setAttribute('href', waLink(
      `Bonjour, j'ai fait une estimation sur votre site pour mon bien situé ${mapCtx.address} (${mapCtx.zone.name} – ${quartier.name}, ${ROOM_LABELS[rooms]}) : environ ${euro.format(r.gross)} brut par mois. J'aimerais une estimation détaillée.`
  ));

    // Le simulateur principal reprend les mêmes réglages (même quartier)
    simZone.value = `${mapCtx.zone.id}|${quartier.name}`;
  simRooms.value = String(rooms);
  simType.value = type;
  const radio = simForm.querySelector(`input[name="standing"][value="${standing}"]`);
  if (radio) radio.checked = true;
  runSimulation();
}

window.showMapEstimate = (zone, address, quartier) => {
  mapCtx = { zone, address, quartier };
  $('#mr-title').textContent = address;
  $('#mr-sub').textContent = `${zone.name} (${zone.postal})`;
  // Menu « quartier détecté », pré-réglé sur le quartier trouvé, modifiable
  const qSel = $('#mr-quartier');
  qSel.innerHTML = zone.quartiers.map(q => `<option value="${q.name}">${q.name}</option>`).join('');
  qSel.value = quartier.name;
  renderMapEstimate();
  const box = $('#map-result');
  box.hidden = false;
  box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};
$('#mr-form').addEventListener('change', renderMapEstimate);


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
      `Bonjour, je m'appelle ${name.value.trim()}.`,
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
    alert('Éditeur du site : JB Conciergerie, Bruxelles — jadbesri9@gmail.com — +32 495 82 56 94.\nLes estimations du simulateur sont indicatives et non contractuelles.');
  });

})();
