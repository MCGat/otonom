// ============================================================
// OTONOM — Contenu des pôles (hotspots + cards riches).
// Ordre = priorité narrative ; la FLOTTE est en n°1.
// Chiffres = exemples réalistes illustratifs (ratios), pas des
// engagements — à remplacer par les vrais chiffres client.
// ============================================================

export const ZONES = [
  {
    id: 'flotte', anchor: 'fleetChargers', key: 'Cœur du système',
    title: 'Recharge de flotte',
    metric: '−23%', metricLabel: 'sur le contrat d’électricité de la flotte',
    example: 'Flotte de 15 VUL : la recharge lissée évite le pic de 18 h et puise le solaire en priorité — départs garantis à l’heure.',
    badge: 'Loi LOM', badgeKind: 'law',
    note: 'Verdissement des flottes désormais imposé : anticipez les quotas avec une infra pilotée plutôt que subie.',
    cta: 'Évaluer ma flotte', href: '#flotte',
  },
  {
    id: 'recharge-pl', anchor: 'plCharge', key: 'Logistique lourde',
    title: 'Recharge poids-lourds',
    metric: 'jusqu’à 1 MW', metricLabel: 'par point de charge haute puissance (MCS)',
    example: 'Un porteur 19 t refait son autonomie pendant la pause réglementaire — la batterie encaisse l’appel de puissance, pas le réseau.',
    badge: 'Loi LOM', badgeKind: 'law',
    note: 'La recharge PL pilotée évite de surdimensionner la puissance souscrite : le BESS lisse la pointe.',
    cta: 'Étudier ma logistique', href: '#contact',
  },
  {
    id: 'solaire', anchor: 'roofSolar', key: 'Production',
    title: 'Toiture solaire',
    metric: 'jusqu’à 100%', metricLabel: 'd’autoconsommation sur l’énergie de la flotte',
    example: '≈1 200 m² de toiture → ~180 MWh/an, consommés sur place avant le moindre achat au réseau.',
    badge: 'Décret tertiaire', badgeKind: 'law',
    note: '−40% de conso d’ici 2030 (plateforme OPERAT) : chaque kWh solaire autoconsommé compte double.',
    cta: 'Étudier mon potentiel', href: '#contact',
  },
  {
    id: 'ombrieres', anchor: 'carport', key: 'Production + abri',
    title: 'Ombrières photovoltaïques',
    metric: '×2', metricLabel: 'le même m² produit ET abrite les véhicules',
    example: 'Un parking de 40 places ombrièré couvre la recharge des VP salariés en pleine journée.',
    badge: 'Loi APER', badgeKind: 'law',
    note: 'Parkings extérieurs >1 500 m² : ombrières PV désormais obligatoires. On transforme la contrainte en actif.',
    cta: 'Vérifier mon obligation', href: '#contact',
  },
  {
    id: 'stockage', anchor: 'bess', key: 'Tampon',
    title: 'Stockage (BESS)',
    metric: '−30%', metricLabel: 'sur les pointes de puissance facturées',
    example: 'La batterie écrête les appels de puissance et stocke le surplus solaire du midi pour la recharge du soir.',
    badge: 'Optimisation TURPE', badgeKind: 'opt',
    note: 'Moins de puissance souscrite, zéro pénalité de dépassement.',
    cta: 'Dimensionner un BESS', href: '#contact',
  },
  {
    id: 'local-technique', anchor: 'localTech', key: 'Cœur électrique',
    title: 'Onduleurs & local technique',
    metric: '99%+', metricLabel: 'de rendement de conversion sur la chaîne onduleurs',
    example: 'Onduleurs, TGBT et comptage regroupés au plus court : le solaire est converti et distribué avec des pertes minimales, chaque poste sous-compté.',
    badge: 'Optimisation TURPE', badgeKind: 'opt',
    note: 'Sous-comptage par poste : refacturation et reporting OPERAT incontestables.',
    cta: 'Voir l’architecture', href: '#methode',
  },
  {
    id: 'ems', anchor: 'emsCore', key: 'Le cerveau',
    title: 'Supervision & pilotage EMS',
    metric: '24/7', metricLabel: 'd’arbitrage automatique solaire · batterie · réseau · flotte',
    example: 'Depuis la salle de pilotage, l’EMS décide chaque minute où va le kWh le moins cher. Le reporting réglementaire est généré tout seul.',
    badge: 'Conformité OPERAT', badgeKind: 'law',
    note: 'Déclaration du décret tertiaire automatisée : fini le reporting manuel et les oublis.',
    cta: 'Voir la supervision', href: '#methode',
  },
  {
    id: 'reseau', anchor: 'gridBox', key: 'Raccordement',
    title: 'Poste de livraison',
    metric: '−18%', metricLabel: 'sur l’abonnement réseau souscrit',
    example: 'En limitant la puissance de pointe, on réduit la puissance souscrite TURPE — l’abonnement baisse mécaniquement.',
    badge: 'Optimisation TURPE', badgeKind: 'opt',
    note: 'Le point d’échange avec le réseau, piloté pour coûter le moins cher possible.',
    cta: 'Auditer mon raccordement', href: '#contact',
  },
];

export const FLOORS = [
  { id: 'rdc', label: 'RDC — Accueil & EMS' },
  { id: 'r1',  label: 'R+1 — Comptabilité énergie' },
  { id: 'r2',  label: 'R+2 — Ressources humaines' },
];

// Shared rich-card markup (used by desktop popovers AND the mobile sheet).
export function cardHTML(z) {
  return `
    <div class="zcard">
      <p class="zcard__k">${z.key}</p>
      <h3 class="zcard__t">${z.title}</h3>
      <div class="zcard__metric">
        <span class="zcard__v">${z.metric}</span>
        <span class="zcard__vl">${z.metricLabel}</span>
      </div>
      <p class="zcard__ex"><span class="zcard__ex-tag">Exemple</span>${z.example}</p>
      <div class="zcard__note">
        <span class="badge badge--${z.badgeKind}">${z.badge}</span>
        <span class="zcard__note-t">${z.note}</span>
      </div>
      <a class="btn btn--primary btn--sm zcard__cta" href="${z.href}">${z.cta} →</a>
    </div>`;
}
