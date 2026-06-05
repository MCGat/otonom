/* ============================================================
   OTONOM — Hero Site v2 · exploded axonometric (CSS 3D)
   Builds the whole scene + interactions from one data model.
   ============================================================ */
(function(){
  var world   = document.getElementById('world');
  var stage   = document.getElementById('stage');
  var legendEl= document.getElementById('legend');
  var mlistEl = document.getElementById('mlist');
  var detail  = document.getElementById('detail');
  var scrim   = document.getElementById('scrim');

  /* ---------- tiny DOM helper ---------- */
  function el(tag, cls, css){
    var n=document.createElement(tag);
    if(cls) n.className=cls;
    if(css) for(var k in css) n.style[k]=css[k];
    return n;
  }
  function px(v){ return v+'px'; }

  /* ============================================================
     LAYER CONFIG (bottom → top). z in world units (CSS px).
     ============================================================ */
  var LAYERS=[
    { id:'parking',  label:'Parvis & parking',  w:720, d:440, t:14, zc:0,   ze:0,   surf:'surf-asphalt' },
    { id:'rdc',      label:'Accueil & R.D.C.',  w:480, d:300, t:26, zc:32,  ze:150, surf:'surf-floor', glass:true },
    { id:'bureaux',  label:'Plateau bureaux',   w:480, d:300, t:26, zc:80,  ze:300, surf:'surf-floor' },
    { id:'technique',label:'Niveau technique',  w:480, d:300, t:26, zc:128, ze:450, surf:'surf-tech' },
    { id:'toiture',  label:'Toiture',           w:480, d:300, t:18, zc:176, ze:600, surf:'surf-roof' }
  ];
  var LZ={}; LAYERS.forEach(function(l){ LZ[l.id]=l; });

  /* ============================================================
     POSTES (equipment hotspots + detail content)
     coords are top-left based on each layer's deck (w×d)
     ============================================================ */
  var POSTES=[
    { id:'solaire', layer:'toiture', cx:240, cy:150, lift:34, zone:'Toiture',
      title:'Solaire en toiture', tag:'Solaire', pct:'−34%', saving:48000,
      big:'48 000', bigunit:'€/an', bigsub:'Autoconsommation + revente du surplus',
      desc:'≈ 1 100 m² de toiture plate exploitable. Panneaux posés, raccordés et financés sans apport — on pilote l’installateur et le raccordement Enedis.',
      metrics:[['Production','180 MWh/an',1],['Couverture','−34% facture',0],['Financement','Tiers-investisseur',0],['CO₂ évité','92 t/an',0]],
      bars:[['Autoconsommée',62],['Revendue (surplus)',38]] },

    { id:'pac', layer:'technique', cx:96, cy:120, lift:42, zone:'Niveau technique',
      title:'PAC & CVC double-flux', tag:'PAC / CVC', pct:'−40%', saving:31000,
      big:'31 000', bigunit:'€/an', bigsub:'Sortie gaz/fioul + récupération de chaleur',
      desc:'Pompe à chaleur et centrale de traitement d’air double-flux pilotées. On récupère la chaleur extraite et on cale les régimes sur l’occupation réelle.',
      metrics:[['Conso chauffage','−40%',1],['Financement','CEE + reste à charge',0],['Confort','19 → 23 °C',0],['CO₂ évité','56 t/an',0]],
      bars:[['Chaleur récupérée',48],['Pilotage horaire',22]] },

    { id:'batterie', layer:'technique', cx:258, cy:96, lift:46, zone:'Niveau technique',
      title:'Batterie de stockage', tag:'Stockage', pct:'Pointes', saving:18000,
      big:'18 000', bigunit:'€/an', bigsub:'Effacement des pointes de puissance',
      desc:'215 kWh de stockage : on efface les pointes de puissance facturées et on consomme le solaire produit en journée le soir venu.',
      metrics:[['Capacité','215 kWh',1],['Écrêtage','−180 kVA',0],['Cycles','6 000',0],['Payback','7 ans',0]],
      bars:[['Effacement pointes',55],['Solaire décalé',30]] },

    { id:'gtb', layer:'technique', cx:404, cy:214, lift:44, zone:'Niveau technique',
      title:'GTB & pilotage intelligent', tag:'GTB', pct:'−15%', saving:12000,
      big:'12 000', bigunit:'€/an', bigsub:'Supervision temps réel de tous les postes',
      desc:'Chaque kWh est mesuré, arbitré et optimisé automatiquement. La GTB orchestre PAC, éclairage, solaire et batterie sans intervention.',
      metrics:[['Conso globale','−15%',1],['Points mesurés','240',0],['Mise en service','3 sem.',0],['Payback','3 ans',0]],
      bars:[['Optimisation horaire',40],['Détection de dérives',35]] },

    { id:'led', layer:'bureaux', cx:330, cy:96, lift:36, zone:'Plateau bureaux',
      title:'Éclairage LED piloté', tag:'Éclairage', pct:'−68%', saving:9500,
      big:'9 500', bigunit:'€/an', bigsub:'Relamping complet + détection de présence',
      desc:'Relamping LED complet, détection de présence par zone et gradation automatique sur la lumière du jour. Le poste éclairage devient quasi nul.',
      metrics:[['Conso éclairage','−68%',1],['Financement','Prime CEE',0],['Durée de vie','50 000 h',0],['Payback','2 ans',0]],
      bars:[['Détection présence',44],['Gradation lumière jour',38]] },

    { id:'isolation', layer:'bureaux', cx:116, cy:228, lift:26, zone:'Plateau bureaux',
      title:'Isolation & enveloppe', tag:'Enveloppe', pct:'−28%', saving:14000,
      big:'14 000', bigunit:'€/an', bigsub:'Toiture, façade et étanchéité reprises',
      desc:'Isolation de la toiture et de la façade, reprise des points d’étanchéité. Moins de déperditions l’hiver, surchauffe maîtrisée l’été.',
      metrics:[['Déperditions','−28%',1],['Financement','CEE + aides',0],['Confort été','−4 °C',0],['Payback','8 ans',0]],
      bars:[['Toiture',52],['Façade',33]] },

    { id:'ombrieres', layer:'parking', cx:560, cy:330, lift:72, zone:'Parvis & parking',
      title:'Ombrières & recharge', tag:'Ombrières', pct:'ADVENIR', saving:22000,
      big:'22 000', bigunit:'€/an', bigsub:'Ombrières PV + 26 bornes pilotées',
      desc:'Ombrières photovoltaïques au-dessus du parking et 26 bornes de recharge pilotées. Production locale + service collaborateurs, éligible ADVENIR.',
      metrics:[['Bornes','×26',1],['Aides captées','960 €/pt',0],['Production','95 MWh/an',0],['Payback','Tiers-inv.',0]],
      bars:[['Solaire ombrières',58],['Recharge pilotée',26]] },

    { id:'flotte', layer:'parking', cx:200, cy:344, lift:26, zone:'Parvis & parking',
      title:'Flotte électrique & TCO', tag:'Flotte', pct:'−22%', saving:38000,
      big:'−22%', bigunit:'TCO / véh.', bigsub:'Sur 42 véhicules électrifiés par vagues',
      desc:'Électrification de la flotte par vagues. Leasing, fiscalité et recharge de nuit arbitrés pour le coût total de détention le plus bas.',
      metrics:[['Véhicules','42',1],['TCO','−22% / véh.',0],['Recharge','Pilotée nuit',0],['Fiscalité','TVS −100%',0]],
      bars:[['Leasing optimisé',46],['Recharge de nuit',34]] }
  ];

  /* ============================================================
     BUILDERS
     ============================================================ */
  // extruded box (top + 2 visible sides), centered at (0,0), top at z=h.
  function box(w,d,h,cls){
    var u=el('div','unit'+(cls?' '+cls:''));
    var top=el('div','u-top',{ width:px(w), height:px(d), margin:px(-d/2)+' 0 0 '+px(-w/2), transform:'translateZ('+h+'px)' });
    // south face (+y), origin its top edge, swung down to fill z 0..h
    var s=el('div','u-s',{ width:px(w), height:px(h), left:px(-w/2), top:px(d/2), transformOrigin:'top', transform:'rotateX(-90deg) translateZ(0)' });
    // east face (+x)
    var e=el('div','u-e',{ width:px(h), height:px(d), left:px(w/2), top:px(-d/2), transformOrigin:'left', transform:'rotateY(90deg)' });
    u.appendChild(s); u.appendChild(e); u.appendChild(top);
    return u;
  }
  function place(node, cx, cy, z){ node.style.left='0'; node.style.top='0';
    node.style.transform='translate('+cx+'px,'+cy+'px)'+(z?' translateZ('+z+'px)':''); return node; }

  // car: body box + cabin box
  function car(cx,cy,tint){
    var g=el('div','car'); g.style.left='0'; g.style.top='0'; g.style.transform='translate('+cx+'px,'+cy+'px)';
    var bw=24,bd=48,bh=12;
    var body=box(bw,bd,bh); body.querySelector('.u-top').style.background='linear-gradient(150deg,'+tint[0]+','+tint[1]+')';
    body.querySelector('.u-s').style.background=tint[2]; body.querySelector('.u-e').style.background=tint[3];
    var cab=box(bw-7,bd-22,10); cab.style.transform='translate(0,2px) translateZ('+bh+'px)';
    var ct=cab.querySelector('.u-top'); ct.style.background='linear-gradient(150deg,#0e1014,#070809)'; ct.style.borderRadius='3px';
    cab.querySelector('.u-s').style.background='#0a0b0e'; cab.querySelector('.u-e').style.background='#060709';
    g.appendChild(body); g.appendChild(cab);
    return g;
  }

  /* ---------- build layers ---------- */
  var decks={};
  LAYERS.forEach(function(L,i){
    var layer=el('div','layer'); layer.dataset.layer=L.id;
    layer.style.setProperty('--zc', L.zc+'px'); layer.style.setProperty('--ze', L.ze+'px');

    // slab (top + 2 sides), centered
    var slab=el('div','slab');
    slab.style.animationDelay=(i*0.11)+'s';
    var top=el('div','face top '+L.surf,{ width:px(L.w), height:px(L.d), margin:px(-L.d/2)+' 0 0 '+px(-L.w/2) });
    var sS =el('div','face side s',{ width:px(L.w), height:px(L.t), left:px(-L.w/2), top:px(L.d/2), transformOrigin:'top', transform:'rotateX(-90deg)' });
    var sE =el('div','face side e',{ width:px(L.t), height:px(L.d), left:px(L.w/2), top:px(-L.d/2), transformOrigin:'left', transform:'rotateY(90deg)' });
    slab.appendChild(sS); slab.appendChild(sE); slab.appendChild(top);
    layer.appendChild(slab);

    // deck (coordinate space, top-left origin, centered under slab)
    var deck=el('div','deck',{ width:px(L.w), height:px(L.d), left:'50%', top:'50%', margin:px(-L.d/2)+' 0 0 '+px(-L.w/2) });
    deck.style.animationDelay=(i*0.11+0.04)+'s';
    layer.appendChild(deck);
    decks[L.id]=deck;
    world.appendChild(layer);
  });

  /* ---------- decorate each layer ---------- */
  // PARKING
  (function(){
    var dk=decks.parking;
    // ground shadow under tower
    dk.appendChild(el('div',null,{ position:'absolute', left:'150px', top:'70px', width:'420px', height:'300px',
      background:'radial-gradient(closest-side, rgba(0,0,0,0.6), transparent)', filter:'blur(7px)' }));
    // lane marking across the front
    dk.appendChild(el('div',null,{ position:'absolute', left:'40px', right:'40px', top:'300px', height:'2px', background:'rgba(243,244,246,0.10)' }));
    var tints=[['#5a5e66','#3b3e45','#34373d','#26282d'],['#3a3c42','#26282d','#212329','#17181c'],['#6a6e76','#4a4d54','#3c3f45','#2c2e33']];
    // FLOTTE — front-left cluster of EVs
    [120,180,240].forEach(function(x,i){ dk.appendChild(el('div',null,{ position:'absolute', left:(x-3)+'px', top:'306px', width:'2px', height:'74px', background:'rgba(243,244,246,0.09)' }));
      dk.appendChild(car(x,344,tints[i%tints.length])); });
    dk.appendChild(car(300,344,tints[1]));
    // EV bornes near the flotte
    [150,210].forEach(function(x){ var b=box(6,10,22); b.style.transform='translate('+x+'px,308px)';
      b.querySelector('.u-top').style.background='#cfd4dc'; b.querySelector('.u-s').style.background='#41444b'; b.querySelector('.u-e').style.background='#303338'; dk.appendChild(b); });
    // OMBRIÈRES — front-right: 4 posts + raised PV canopy + cars beneath
    var postH=66, cxo=560, cyo=330, cw=210, cd=130;
    [[cxo-cw/2+12,cyo-cd/2+10],[cxo+cw/2-12,cyo-cd/2+10],[cxo-cw/2+12,cyo+cd/2-10],[cxo+cw/2-12,cyo+cd/2-10]].forEach(function(p){
      var post=box(8,8,postH); post.style.transform='translate('+p[0]+'px,'+p[1]+'px)';
      post.querySelector('.u-top').style.background='#3a3d44'; post.querySelector('.u-s').style.background='#2a2c31'; post.querySelector('.u-e').style.background='#202228';
      dk.appendChild(post);
    });
    dk.appendChild(car(525,335,tints[2])); dk.appendChild(car(595,335,tints[0]));
    var canopy=el('div','solar',{ width:px(cw), height:px(cd), left:'0', top:'0',
      transform:'translate('+(cxo-cw/2)+'px,'+(cyo-cd/2)+'px) translateZ('+postH+'px) rotateY(-6deg)' });
    canopy.appendChild(el('div','panel',{ position:'absolute', inset:'0' }));
    dk.appendChild(canopy);
  })();

  // RDC — reception + glazed entrance
  (function(){
    var dk=decks.rdc;
    // glazed entrance band on south edge
    dk.appendChild(el('div','glass',{ left:'150px', top:'250px', width:'180px', height:'42px' }));
    // reception desk
    var desk=box(120,26,16); desk.style.transform='translate(240px,150px)';
    desk.querySelector('.u-top').style.background='linear-gradient(150deg,#50535b,#3c3f46)';
    dk.appendChild(desk);
    // lit ceiling cells
    for(var i=0;i<4;i++){ dk.appendChild(el('div','litcell',{ left:(90+i*80)+'px', top:'80px', width:'52px', height:'4px' })); }
    // interior partitions
    dk.appendChild(el('div','wall',{ left:'360px', top:'40px', width:'4px', height:'120px' }));
  })();

  // BUREAUX — open space, LED strips, isolation perimeter
  (function(){
    var dk=decks.bureaux;
    // perimeter isolation glow
    dk.appendChild(el('div',null,{ position:'absolute', left:'6px', top:'6px', right:'6px', bottom:'6px',
      border:'2px solid rgba(150,180,220,0.16)', boxShadow:'inset 0 0 26px rgba(120,150,200,0.10)', borderRadius:'2px' }));
    // partitions → a couple of meeting rooms
    dk.appendChild(el('div','wall',{ left:'150px', top:'30px', width:'4px', height:'110px' }));
    dk.appendChild(el('div','wall',{ left:'150px', top:'30px', width:'120px', height:'4px' }));
    dk.appendChild(el('div','wall',{ left:'300px', top:'180px', width:'4px', height:'90px' }));
    // desks (low tiles)
    var positions=[[70,200],[110,200],[200,210],[240,210],[380,90],[420,90],[380,140],[420,140]];
    positions.forEach(function(p){ var t=box(26,16,6); t.style.transform='translate('+p[0]+'px,'+p[1]+'px)';
      t.querySelector('.u-top').style.background='linear-gradient(150deg,#4a4d55,#3a3d44)'; dk.appendChild(t); });
    // LED ceiling strips (bright lines)
    [70,130,190].forEach(function(y){ dk.appendChild(el('div',null,{ position:'absolute', left:'250px', top:y+'px', width:'170px', height:'3px',
      background:'rgba(226,232,242,0.85)', boxShadow:'0 0 10px rgba(210,222,244,0.7)', transform:'translateZ(34px)' })); });
  })();

  // TECHNIQUE — PAC, batterie, GTB, ducts
  (function(){
    var dk=decks.technique;
    // CTA / duct run
    var duct=box(300,18,16); duct.style.transform='translate(240px,60px)';
    duct.querySelector('.u-top').style.background='linear-gradient(150deg,#5c5f67,#474a51)'; dk.appendChild(duct);
    // PAC units (2)
    [[96,100],[96,150]].forEach(function(p){ var u=box(62,38,30,'lit'); u.style.transform='translate('+p[0]+'px,'+p[1]+'px)'; dk.appendChild(u); });
    // batterie cabinet
    var bat=box(56,72,42,'dark'); bat.style.transform='translate(258px,96px)';
    bat.querySelector('.u-top').style.background='linear-gradient(150deg,#3e424a,#2c2f35)'; dk.appendChild(bat);
    // GTB armoire (lit screen)
    var gtb=box(34,46,42); gtb.style.transform='translate(404px,214px)';
    gtb.querySelector('.u-top').style.background='linear-gradient(150deg,#cfd6e2,#aab2c0)'; gtb.querySelector('.u-top').style.boxShadow='0 0 14px rgba(190,205,230,0.5)';
    dk.appendChild(gtb);
  })();

  // TOITURE — solar field + HVAC curbs + skylights
  (function(){
    var dk=decks.toiture;
    var field=el('div','solar',{ width:'420px', height:'250px', left:'30px', top:'25px', transform:'translateZ(8px)' });
    field.appendChild(el('div','panel',{ position:'absolute', inset:'0' }));
    dk.appendChild(field);
    // seam gaps between panel rows for realism
    [88,151,214].forEach(function(y){ dk.appendChild(el('div',null,{ position:'absolute', left:'30px', top:y+'px', width:'420px', height:'4px', background:'#0b0c10', transform:'translateZ(9px)' })); });
    // skylight + curbs
    var sky=box(40,40,6); sky.style.transform='translate(380px,70px)'; sky.querySelector('.u-top').style.background='rgba(180,200,230,0.3)'; dk.appendChild(sky);
  })();

  /* ============================================================
     HOTSPOTS
     ============================================================ */
  var hots={};
  POSTES.forEach(function(P){
    var dk=decks[P.layer];
    var hot=el('div','hot'+(P.layer!=='parking'?' interior':''));
    hot.dataset.id=P.id;
    place(hot, P.cx, P.cy, P.lift);
    var ring=el('div','ring'); var dot=el('div','dot');
    var tag=el('div','tag'); tag.innerHTML=P.tag+' <span class="pct">'+P.pct+'</span>';
    hot.appendChild(ring); hot.appendChild(dot); hot.appendChild(tag);
    dk.appendChild(hot);
    hots[P.id]=hot;
    function activate(e){ e.preventDefault(); e.stopPropagation(); openDetail(P.id); }
    dot.addEventListener('click', activate);
    tag.addEventListener('click', activate);
    dot.addEventListener('mouseenter', function(){ if(window.innerWidth>860 && !activeId) focusLayer(P.layer,true); });
    dot.addEventListener('mouseleave', function(){ if(window.innerWidth>860 && !activeId) focusLayer(null,false); });
  });

  /* ============================================================
     DETAIL PANEL
     ============================================================ */
  var activeId=null;
  function fillDetail(P){
    document.getElementById('d-poste').textContent=P.zone;
    document.getElementById('d-title').textContent=P.title;
    document.getElementById('d-desc').textContent=P.desc;
    document.getElementById('d-big').textContent=P.big;
    document.getElementById('d-bigunit').textContent=P.bigunit;
    document.getElementById('d-bigsub').textContent=P.bigsub;
    var mg=document.getElementById('d-mgrid'); mg.innerHTML='';
    P.metrics.forEach(function(m){
      var c=el('div','m');
      c.innerHTML='<div class="k">'+m[0]+'</div><div class="v'+(m[2]?' lum':'')+'">'+m[1]+'</div>';
      mg.appendChild(c);
    });
    var bw=document.getElementById('d-bars'); bw.innerHTML='';
    P.bars.forEach(function(b){
      var r=el('div','bar');
      r.innerHTML='<div class="bl"><span>'+b[0]+'</span><b>'+b[1]+'%</b></div><div class="track"><div class="fill"></div></div>';
      bw.appendChild(r);
      setTimeout(function(){ r.querySelector('.fill').style.width=b[1]+'%'; }, 60);
    });
  }
  function openDetail(id){
    var P=POSTES.find(function(p){return p.id===id;}); if(!P) return;
    activeId=id; fillDetail(P);
    detail.classList.add('show'); scrim.classList.add('show');
    Object.keys(hots).forEach(function(k){ hots[k].classList.toggle('active', k===id); });
    // dim other layers, focus the poste's layer
    if(window.innerWidth>860){
      Array.prototype.forEach.call(world.querySelectorAll('.layer'), function(l){
        l.classList.toggle('dim', l.dataset.layer!==P.layer);
      });
      setActiveLegend(P.layer);
    }
  }
  function preview(){}
  function closeDetail(){
    activeId=null; detail.classList.remove('show'); scrim.classList.remove('show');
    Object.keys(hots).forEach(function(k){ hots[k].classList.remove('active'); });
    Array.prototype.forEach.call(world.querySelectorAll('.layer'), function(l){ l.classList.remove('dim'); });
    setActiveLegend(null);
  }
  document.getElementById('dclose').addEventListener('click', closeDetail);
  scrim.addEventListener('click', closeDetail);
  document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeDetail(); });

  /* ============================================================
     LAYER FOCUS (hover aperçu)
     ============================================================ */
  function setActiveLegend(id){ if(!legendEl) return; Array.prototype.forEach.call(legendEl.children,function(li){ li.classList.toggle('active', li.dataset.layer===id); }); }
  function focusLayer(id,on){
    if(window.innerWidth<=860) return;
    Array.prototype.forEach.call(world.querySelectorAll('.layer'), function(l){
      l.classList.toggle('dim', on && id && l.dataset.layer!==id);
    });
    setActiveLegend(on?id:(activeId?POSTES.find(function(p){return p.id===activeId;}).layer:null));
  }

  /* ============================================================
     MOBILE LIST
     ============================================================ */
  (function(){
    LAYERS.slice().reverse().forEach(function(L){
      var group=POSTES.filter(function(p){return p.layer===L.id;});
      if(!group.length) return;
      var h=el('div','mhead'); h.innerHTML='<span>'+L.label+'</span><span class="ln"></span>'; mlistEl.appendChild(h);
      group.forEach(function(P){
        var c=el('button','mcard');
        c.innerHTML='<div class="mnum">'+P.pct+'<span class="mu">'+(P.bigunit==='€/an'?'éco/an':P.bigunit)+'</span></div>'+
          '<div class="mmid"><div class="mt">'+P.title+'</div><div class="mp">'+P.tag+'</div></div><div class="marr">→</div>';
        c.addEventListener('click', function(){ openDetail(P.id); });
        mlistEl.appendChild(c);
      });
    });
  })();

  /* ============================================================
     CONTROLS — explode + auto-rotate + drag
     ============================================================ */
  var explodeBtn=document.getElementById('explodeBtn');
  var rotateBtn=document.getElementById('rotateBtn');
  var exploded=true, autoRotate=false;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setExplode(on){
    exploded=on; world.classList.toggle('exploded', on); explodeBtn.classList.toggle('on', on);
    if(!on && activeId) closeDetail();
  }
  explodeBtn.addEventListener('click', function(){ setExplode(!exploded); });
  rotateBtn.addEventListener('click', function(){ autoRotate=!autoRotate; rotateBtn.classList.toggle('on', autoRotate); });

  // default: exploded reveal handled by CSS part-entrance
  world.classList.add('exploded'); exploded=true; explodeBtn.classList.add('on');

  /* drag to rotate */
  var rz=-40, baseRz=-40, dragging=false, lastX=0, moved=0;
  function setRz(v){ rz=v; world.style.setProperty('--rz', rz+'deg'); }
  setRz(rz);
  stage.addEventListener('pointerdown', function(e){
    if(e.target.closest('.dot')||e.target.closest('.tag')) return;
    dragging=true; moved=0; lastX=e.clientX; autoRotate=false; rotateBtn.classList.remove('on');
    stage.classList.add('dragging'); try{ stage.setPointerCapture(e.pointerId); }catch(_){}
  });
  stage.addEventListener('pointermove', function(e){
    if(!dragging) return; var dx=e.clientX-lastX; lastX=e.clientX; moved+=Math.abs(dx);
    setRz(rz + dx*0.28);
  });
  window.addEventListener('pointerup', function(){ dragging=false; stage.classList.remove('dragging'); });

  /* auto-rotate sway */
  var sway=0;
  function loop(){
    if(autoRotate && !dragging){ sway+=0.004; setRz(baseRz + Math.sin(sway)*26); }
    requestAnimationFrame(loop);
  }
  loop();

  /* ============================================================
     TICKER — total identified savings
     ============================================================ */
  (function(){
    var total=POSTES.reduce(function(s,p){return s+(p.saving||0);},0);
    var elv=document.getElementById('tickVal');
    function fmt(n){ return Math.round(n).toLocaleString('fr-FR')+' €'; }
    var steps=46, i=0;
    setTimeout(function(){
      var iv=setInterval(function(){ i++; var k=i/steps, e=1-Math.pow(1-k,3);
        elv.textContent='≈ '+fmt(total*e); if(i>=steps){ elv.textContent='≈ '+fmt(total); clearInterval(iv); } }, 32);
    }, 650);
  })();

  /* burger (mobile) — scroll to list */
  var burger=document.querySelector('.burger');
  if(burger) burger.addEventListener('click', function(){ mlistEl.scrollIntoView({behavior:'smooth'}); });

})();
