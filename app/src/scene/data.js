// ============================================================
// OTONOM — Contenu des pôles (hotspots du hero)
// Ordre = priorité narrative. La FLOTTE est mise en avant (n°1).
// `anchor` = nom logique d'un point 3D fourni par Forecourt/Building.
// ============================================================

export const ZONES = [
  {
    id: 'flotte',
    key: 'Cœur du système',
    title: 'Recharge de flotte',
    desc: 'Bornes rapides pilotées : vos véhicules se chargent au meilleur moment, sans jamais dépasser la puissance souscrite.',
    anchor: 'fleetChargers',
  },
  {
    id: 'solaire',
    key: 'Production',
    title: 'Toiture solaire',
    desc: 'Le toit du bâtiment produit l’énergie consommée sur place — autoconsommée en priorité par la flotte et les bureaux.',
    anchor: 'roofSolar',
  },
  {
    id: 'ombrieres',
    key: 'Production + abri',
    title: 'Ombrières photovoltaïques',
    desc: 'Le parvis abrite et recharge les véhicules légers tout en produisant. Double usage du moindre m².',
    anchor: 'carport',
  },
  {
    id: 'stockage',
    key: 'Tampon',
    title: 'Stockage (BESS)',
    desc: 'La batterie lisse les pics, stocke le surplus solaire et sécurise la recharge même quand le réseau est tendu.',
    anchor: 'bess',
  },
  {
    id: 'ems',
    key: 'Le cerveau',
    title: 'Pilotage EMS',
    desc: 'Au rez-de-chaussée, l’EMS arbitre en temps réel entre solaire, batterie, réseau et flotte. C’est lui qui pense.',
    anchor: 'emsCore',
  },
  {
    id: 'reseau',
    key: 'Raccordement',
    title: 'Poste de livraison',
    desc: 'Le point d’échange avec le réseau. OTONOM en limite l’usage : moins d’abonnement, moins de pénalités de pointe.',
    anchor: 'gridBox',
  },
];

// Étages du bâtiment, du bas vers le haut — utilisés par l'éclatement vertical.
export const FLOORS = [
  { id: 'rdc', label: 'RDC — Accueil & EMS' },
  { id: 'r1',  label: 'R+1 — Comptabilité énergie' },
  { id: 'r2',  label: 'R+2 — Ressources humaines' },
];
