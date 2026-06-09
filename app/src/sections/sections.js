// ============================================================
// OTONOM — Sections marketing sous le hero.
// Contenu orienté "flotte d'abord". HTML injecté dans #sections.
// ============================================================

const html = /* html */ `
<section class="sec" id="orchestration">
  <div class="wrap">
    <p class="eyebrow">L'orchestration</p>
    <h2 class="display sec__title">Quatre briques, <em>un seul cerveau</em>.</h2>
    <p class="sec__lead">L'EMS arbitre en continu entre ce que vous produisez, ce que vous stockez,
      ce que le réseau vous vend et ce que votre flotte consomme. Chaque kWh va là où il a le plus de valeur.</p>
    <div class="grid4">
      <div class="card"><span class="card__n">01</span><h3>Produire</h3><p>Toiture &amp; ombrières solaires. L'énergie la moins chère est celle que vous produisez.</p></div>
      <div class="card"><span class="card__n">02</span><h3>Stocker</h3><p>Le BESS lisse les pics et garde le surplus pour la recharge du soir.</p></div>
      <div class="card"><span class="card__n">03</span><h3>Recharger</h3><p>Flotte et véhicules pilotés au kW près, sans dépasser l'abonnement.</p></div>
      <div class="card"><span class="card__n">04</span><h3>Arbitrer</h3><p>L'EMS décide en temps réel. Vous, vous regardez le tableau de bord.</p></div>
    </div>
  </div>
</section>

<section class="sec sec--feature" id="flotte">
  <div class="wrap wrap--split">
    <div>
      <p class="eyebrow">Le cœur du système</p>
      <h2 class="display sec__title">Votre flotte ne subit plus<br />l'énergie. Elle la <em>pilote</em>.</h2>
      <p class="sec__lead">Recharger 20 véhicules à 18 h, c'est un pic qui fait exploser la facture.
        OTONOM étale, priorise et puise dans le solaire et la batterie d'abord —
        vos véhicules sont prêts au départ, votre puissance souscrite ne bouge pas.</p>
      <ul class="checks">
        <li>Recharge intelligente : départ garanti, pointe maîtrisée</li>
        <li>Autoconsommation solaire dirigée vers la flotte en priorité</li>
        <li>Supervision unifiée sites &amp; véhicules, un seul écran</li>
      </ul>
      <a class="btn btn--primary" href="#contact">Évaluer ma flotte</a>
    </div>
    <div class="stat-stack">
      <div class="stat"><span class="stat__v">−32%</span><span class="stat__k">sur la facture énergie flotte</span></div>
      <div class="stat"><span class="stat__v">0</span><span class="stat__k">dépassement de puissance souscrite</span></div>
      <div class="stat"><span class="stat__v">100%</span><span class="stat__k">des départs assurés à l'heure</span></div>
    </div>
  </div>
</section>

<section class="sec" id="methode">
  <div class="wrap">
    <p class="eyebrow">La méthode</p>
    <h2 class="display sec__title">Du diagnostic au <em>pilotage continu</em>.</h2>
    <div class="steps">
      <div class="step"><span class="step__n">1</span><h3>Diagnostic</h3><p>On lit vos courbes de charge, vos usages flotte et votre potentiel solaire.</p></div>
      <div class="step"><span class="step__n">2</span><h3>Dimensionnement</h3><p>PV, stockage et bornes calibrés sur votre réalité — ni trop, ni trop peu.</p></div>
      <div class="step"><span class="step__n">3</span><h3>Déploiement</h3><p>Installation et raccordement, sans interrompre votre exploitation.</p></div>
      <div class="step"><span class="step__n">4</span><h3>Pilotage</h3><p>L'EMS optimise jour après jour. Vous gardez la main, on garde l'œil.</p></div>
    </div>
  </div>
</section>

<section class="sec sec--cta" id="contact">
  <div class="wrap wrap--center">
    <h2 class="display sec__title">Et si votre site<br />se mettait à <em>penser</em> ?</h2>
    <p class="sec__lead">Vingt minutes suffisent pour estimer ce qu'OTONOM ferait gagner à vos sites et à votre flotte.</p>
    <a class="btn btn--primary btn--lg" href="mailto:marketing@mc-groupe.com">Parler à un expert</a>
  </div>
</section>

<footer class="foot">
  <div class="wrap wrap--split">
    <span class="nav__logo">OTONOM</span>
    <span class="foot__c">L'énergie qui pilote vos sites &amp; vos flottes · © 2026</span>
  </div>
</footer>
`;

export function mountSections(el) {
  if (el) el.innerHTML = html;
}
