/* ============================================================
   OTONOM — Hero 3D scene (Three.js r128)
   Typologie : siège PME monobloc — bardage nervuré clair,
   socle sombre, entrée vitrée centrale + bandeau logo,
   toiture plate (solaire), parking + ombrières + flotte.
   Monochrome, lumière du soleil, ombres douces.
   ============================================================ */
(function(){
  var stage=document.getElementById('stage');
  var loading=document.getElementById('loading');
  if(typeof THREE==='undefined'){ if(loading) loading.textContent='3D indisponible'; return; }

  var W=stage.clientWidth||1440, H=stage.clientHeight||746;

  var renderer=new THREE.WebGLRenderer({antialias:true, alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  renderer.setSize(W,H);
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputEncoding=THREE.sRGBEncoding;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=0.92;
  stage.appendChild(renderer.domElement);
  if(loading) loading.remove();

  var scene=new THREE.Scene();
  scene.fog=new THREE.Fog(0x0a0a0d, 52, 165);

  var cam=new THREE.PerspectiveCamera(40, W/H, 0.1, 1000);

  /* ---------- lighting ---------- */
  scene.add(new THREE.HemisphereLight(0xa9b3c4, 0x090a0c, 0.34));
  var sun=new THREE.DirectionalLight(0xfff0db, 2.35);
  sun.position.set(-58,76,46); sun.castShadow=true;
  sun.shadow.mapSize.set(2048,2048);
  var sc=sun.shadow.camera; sc.left=-95; sc.right=95; sc.top=95; sc.bottom=-95; sc.near=1; sc.far=260;
  sun.shadow.bias=-0.0004; sun.shadow.normalBias=0.02;
  scene.add(sun);
  var fill=new THREE.DirectionalLight(0x8a98bc, 0.35); fill.position.set(54,38,-34); scene.add(fill);

  /* ---------- environment (reflections) ---------- */
  var pmrem=new THREE.PMREMGenerator(renderer);
  (function(){
    var c=document.createElement('canvas'); c.width=16; c.height=128; var g=c.getContext('2d');
    var grd=g.createLinearGradient(0,0,0,128);
    grd.addColorStop(0,'#7b8394'); grd.addColorStop(0.48,'#2c2f37'); grd.addColorStop(1,'#0b0b0e');
    g.fillStyle=grd; g.fillRect(0,0,16,128);
    var tex=new THREE.CanvasTexture(c); tex.mapping=THREE.EquirectangularReflectionMapping;
    scene.environment=pmrem.fromEquirectangular(tex).texture; tex.dispose();
  })();

  /* ---------- texture helpers ---------- */
  function canvasTex(w,h,draw,rx,ry){
    var c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h);
    var t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping;
    if(rx||ry) t.repeat.set(rx||1, ry||1); t.anisotropy=4; return t;
  }
  // ribbed metal cladding (horizontal ribs)
  function ribbed(base, hi, lo){
    return canvasTex(8,48,function(g,w,h){
      g.fillStyle=base; g.fillRect(0,0,w,h);
      for(var y=0;y<h;y+=6){
        g.fillStyle=hi; g.fillRect(0,y,w,1.2);
        g.fillStyle=lo; g.fillRect(0,y+3,w,1.4);
      }
    });
  }
  // vertical wood-look battens (kept neutral grey)
  function battens(base, line){
    return canvasTex(48,8,function(g,w,h){
      g.fillStyle=base; g.fillRect(0,0,w,h);
      for(var x=0;x<w;x+=4){ g.fillStyle=line; g.fillRect(x,0,1.3,h); }
    });
  }

  /* ---------- materials ---------- */
  var matClad=new THREE.MeshStandardMaterial({ color:0xcdd0d4, roughness:0.62, metalness:0.18 });
  matClad.map=ribbed('#c9ccd1','#dfe2e6','#a9adb4'); matClad.map.repeat.set(1,1);
  var matCladSide=matClad.clone();
  var matBase=new THREE.MeshStandardMaterial({ color:0x3a3b40, roughness:0.78, metalness:0.05 });
  var matBatten=new THREE.MeshStandardMaterial({ color:0x6f6a61, roughness:0.7, metalness:0.04 });
  matBatten.map=battens('#6d6860','#54504a');
  var matParapet=new THREE.MeshStandardMaterial({ color:0xe9ebee, roughness:0.5, metalness:0.1 });
  var matRoof=new THREE.MeshStandardMaterial({ color:0x202227, roughness:0.92, metalness:0.02 });
  var matGlass=new THREE.MeshStandardMaterial({ color:0x14171e, roughness:0.07, metalness:0.0, envMapIntensity:1.4 });
  var matMull=new THREE.MeshStandardMaterial({ color:0x0d0e11, roughness:0.5, metalness:0.3 });
  var matFrame=new THREE.MeshStandardMaterial({ color:0x191a1d, roughness:0.5, metalness:0.3 });
  var matPanel=new THREE.MeshStandardMaterial({ color:0x0c0e16, roughness:0.22, metalness:0.45, envMapIntensity:1.1 });
  var matPanelFrame=new THREE.MeshStandardMaterial({ color:0x2a2d33, roughness:0.5, metalness:0.6 });
  var matAsphalt=new THREE.MeshStandardMaterial({ color:0x0e0f11, roughness:0.98 });
  var matSteel=new THREE.MeshStandardMaterial({ color:0x303338, roughness:0.45, metalness:0.7 });

  function box(w,h,d,mat,mats){ var m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mats||mat); m.castShadow=true; m.receiveShadow=true; return m; }

  var root=new THREE.Group(); scene.add(root);

  /* ---------- ground + asphalt ---------- */
  var ground=new THREE.Mesh(new THREE.PlaneGeometry(600,600), matAsphalt);
  ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);

  // grass strips behind building
  var matGrass=new THREE.MeshStandardMaterial({ color:0x1b2018, roughness:1 });
  var grass=new THREE.Mesh(new THREE.PlaneGeometry(120,40), matGrass);
  grass.rotation.x=-Math.PI/2; grass.position.set(0,0.02,-34); grass.receiveShadow=true; scene.add(grass);

  /* ---------- parking markings (in front) ---------- */
  var markTex=canvasTex(1024,512,function(g,w,h){
    g.clearRect(0,0,w,h);
    g.strokeStyle='rgba(225,228,232,0.55)'; g.lineWidth=3;
    var bays=10, bw=w/bays;
    for(var i=0;i<=bays;i++){ g.beginPath(); g.moveTo(i*bw,h*0.5); g.lineTo(i*bw,h); g.stroke(); }
    g.beginPath(); g.moveTo(0,h*0.5); g.lineTo(w,h*0.5); g.stroke();
  });
  var markMat=new THREE.MeshBasicMaterial({ map:markTex, transparent:true, opacity:0.6 });
  var marks=new THREE.Mesh(new THREE.PlaneGeometry(70,34), markMat);
  marks.rotation.x=-Math.PI/2; marks.position.set(-2,0.03,30); scene.add(marks);

  /* ============================================================
     BUILDING — single storey, wide monobloc
     footprint ~ 52 (x) × 24 (z), body height 7, center entry 9
     ============================================================ */
  var bldg=new THREE.Group(); root.add(bldg);
  var BW=52, BD=24, BH=7, CX=0, CZ=0;

  // dark plinth
  var plinth=box(BW+0.6, 1.3, BD+0.6, matBase); plinth.position.set(CX,0.65,CZ); bldg.add(plinth);

  // left & right clad wings (leave center open for entrance)
  var entryW=17;
  var wingW=(BW-entryW)/2;
  function wing(sign){
    var x=sign*(entryW/2 + wingW/2);
    var w=box(wingW, BH, BD, [matCladSide,matCladSide,matParapet,matBase,matClad,matClad]);
    // material order: +x,-x,+y,-y,+z(front),-z(back)
    w.position.set(x, 1.3+BH/2, CZ);
    // fix per-face: front (+z) ribbed clad, top parapet cap handled separately
    w.material=[matCladSide,matCladSide,matRoof,matBase,matClad,matCladSide];
    bldg.add(w);
    // batten accent strip on front of each wing (near entrance)
    var bat=box(3.2, BH-1.4, 0.25, matBatten);
    bat.position.set(sign*(entryW/2+1.8), 1.3+(BH-1.4)/2, CZ+BD/2+0.02);
    bldg.add(bat);
    return w;
  }
  wing(-1); wing(1);

  // central entrance volume (taller), recessed glazing
  var CEH=9.2;
  var entryShell=new THREE.Group(); bldg.add(entryShell);
  // side jambs of entrance
  var jambW=1.1;
  [-1,1].forEach(function(s){
    var j=box(jambW, CEH, 3, matClad); j.position.set(s*(entryW/2-jambW/2), 1.3+CEH/2, CZ+BD/2-1.5); entryShell.add(j);
  });
  // top header + parapet band carrying logo
  var header=box(entryW, 1.0, 3.2, matClad); header.position.set(CX, 1.3+CEH-0.5, CZ+BD/2-1.4); entryShell.add(header);
  var band=box(entryW-2, 1.5, 0.4, matParapet); band.position.set(CX, 1.3+CEH-2.0, CZ+BD/2+0.2); entryShell.add(band);

  // recessed glazing (set back from front face)
  var glassZ=CZ+BD/2-2.6, glassH=CEH-1.6, glassW=entryW-2.4;
  var glazing=box(glassW, glassH, 0.18, matGlass); glazing.position.set(CX, 1.3+glassH/2, glassZ); glazing.castShadow=false; entryShell.add(glazing);
  // interior backdrop (so glass isn't see-through to nothing)
  var interior=box(glassW-0.2, glassH-0.2, 0.1, new THREE.MeshStandardMaterial({color:0x202329, roughness:0.9, emissive:0x14161b, emissiveIntensity:0.6}));
  interior.position.set(CX,1.3+glassH/2, glassZ-1.6); interior.castShadow=false; entryShell.add(interior);
  // a few warm-lit interior cells
  for(var i=0;i<5;i++){
    var lit=box(2.2,1.0,0.05,new THREE.MeshStandardMaterial({color:0xdfe3ea, emissive:0xb9c2d4, emissiveIntensity:0.9}));
    lit.position.set(CX-6+i*3, 1.3+glassH-1.6, glassZ-1.5); lit.castShadow=false; entryShell.add(lit);
  }
  // vertical mullions
  var mn=7;
  for(var m=0;m<=mn;m++){
    var mx=CX-glassW/2 + (glassW/mn)*m;
    var bar=box(0.16, glassH, 0.26, matMull); bar.position.set(mx, 1.3+glassH/2, glassZ+0.16); bar.castShadow=false; entryShell.add(bar);
  }
  // horizontal transom
  var tr=box(glassW,0.16,0.26,matMull); tr.position.set(CX,1.3+glassH*0.62,glassZ+0.16); tr.castShadow=false; entryShell.add(tr);
  // door frame at base
  var door=box(5,3.2,0.12,new THREE.MeshStandardMaterial({color:0x0a0b0d, roughness:0.1, metalness:0.1, envMapIntensity:1.2}));
  door.position.set(CX,1.3+1.6,glassZ+0.2); door.castShadow=false; entryShell.add(door);

  // logo text on band
  var logoTex=canvasTex(1024,256,function(g,w,h){
    g.clearRect(0,0,w,h);
    g.fillStyle='#15161a'; g.font='800 150px "Saira Condensed", Arial Narrow, sans-serif';
    g.textAlign='center'; g.textBaseline='middle';
    g.letterSpacing='14px';
    g.fillText('OTONOM', w/2, h/2+6);
  });
  var logo=new THREE.Mesh(new THREE.PlaneGeometry(entryW-3,2.0), new THREE.MeshBasicMaterial({map:logoTex, transparent:true}));
  logo.position.set(CX, 1.3+CEH-2.0, CZ+BD/2+0.42); bldg.add(logo);

  /* ---------- roof group (parapet + solar) for exploded view ---------- */
  var roofGrp=new THREE.Group(); bldg.add(roofGrp);
  // roof slab
  var roofSlab=box(BW, 0.5, BD, matRoof); roofSlab.position.set(CX, 1.3+BH+0.25, CZ); roofGrp.add(roofSlab);
  // parapet lip
  function lip(w,d,x,z){ var l=box(w,0.7,d,matParapet); l.position.set(x,1.3+BH+0.6,z); roofGrp.add(l); }
  lip(BW,0.5, CX, CZ-BD/2+0.25); lip(BW,0.5, CX, CZ+BD/2-0.25);
  lip(0.5,BD, CX-BW/2+0.25, CZ); lip(0.5,BD, CX+BW/2-0.25, CZ);
  // rooftop HVAC units (realism)
  [[16,-5],[20,4],[-18,2]].forEach(function(p){ var u=box(3,1.4,2.4,matSteel); u.position.set(p[0],1.3+BH+0.95,p[1]); roofGrp.add(u); });

  // solar array (tilted panels, in rows) on roof
  var solarGrp=new THREE.Group(); roofGrp.add(solarGrp);
  var pW=2.2, pD=1.25, tilt=-0.28;
  function panel(x,z){
    var grp=new THREE.Group();
    var p=box(pW,0.08,pD,matPanel); p.castShadow=true; grp.add(p);
    var fr=box(pW+0.06,0.12,pD+0.06,matPanelFrame); fr.position.y=-0.04; fr.castShadow=false; grp.add(fr);
    var legB=box(0.06,0.34,0.06,matPanelFrame); legB.position.set(0,-0.2,-pD/2+0.1); grp.add(legB);
    grp.rotation.x=tilt; grp.position.set(x,1.3+BH+0.75,z);
    solarGrp.add(grp);
  }
  for(var rz=0; rz<4; rz++){
    for(var rx=0; rx<11; rx++){
      var x=-BW/2+4 + rx*(pW+0.5);
      if(Math.abs(x)<entryW/2+1) continue; // keep clear above entrance
      var z=-BD/2+4 + rz*(pD+1.4);
      panel(x,z);
    }
  }

  /* ---------- interior floor (revealed in exploded view) ---------- */
  var floorPlate=box(BW-2, 0.3, BD-2, new THREE.MeshStandardMaterial({color:0x33363d, roughness:0.85}));
  floorPlate.position.set(CX,1.3+0.15,CZ); floorPlate.visible=true; bldg.add(floorPlate);
  // simple interior partitions to read as offices in exploded view
  var partsGrp=new THREE.Group(); bldg.add(partsGrp);
  [[-14,'z',16],[2,'z',14],[14,'x',10]].forEach(function(p){
    var wpart = p[1]==='z' ? box(0.3,3,p[2],matBase) : box(p[2],3,0.3,matBase);
    wpart.position.set(p[0],1.3+1.5,CZ-2); partsGrp.add(wpart);
  });
  partsGrp.visible=false;

  /* ---------- ombrières (parking canopy w/ PV) ---------- */
  var canopy=new THREE.Group(); root.add(canopy);
  var canX=-2, canZ=33, canW=40, canD=15, canH=5.4;
  // posts
  [[-canW/2+2,canZ-canD/2+1],[canW/2-2,canZ-canD/2+1],[-canW/2+2,canZ+canD/2-1],[canW/2-2,canZ+canD/2-1],[0,canZ-canD/2+1],[0,canZ+canD/2-1]].forEach(function(p){
    var post=box(0.5,canH,0.5,matSteel); post.position.set(p[0],canH/2,p[1]); canopy.add(post);
  });
  // canopy deck (slight tilt)
  var deck=new THREE.Group(); deck.position.set(canX,canH,canZ); deck.rotation.x=-0.12; canopy.add(deck);
  var slab=box(canW,0.3,canD,matSteel); deck.add(slab);
  // PV on canopy
  for(var cz2=0; cz2<3; cz2++) for(var cx2=0; cx2<14; cx2++){
    var p2=box(2.4,0.06,1.3,matPanel); p2.castShadow=true;
    p2.position.set(-canW/2+2.4+cx2*2.7, 0.22, -canD/2+2+cz2*4.6); deck.add(p2);
  }

  /* ---------- cars ---------- */
  function car(color){
    var g=new THREE.Group();
    var body=box(2.0,0.95,4.4,new THREE.MeshStandardMaterial({color:color, roughness:0.35, metalness:0.5, envMapIntensity:1.0}));
    body.position.y=0.85; g.add(body);
    var cab=box(1.8,0.8,2.3,new THREE.MeshStandardMaterial({color:0x0c0d10, roughness:0.1, metalness:0.2, envMapIntensity:1.3}));
    cab.position.set(0,1.55,-0.1); cab.castShadow=true; g.add(cab);
    var wheelGeo=new THREE.CylinderGeometry(0.42,0.42,0.3,16);
    var wm=new THREE.MeshStandardMaterial({color:0x0a0a0c, roughness:0.8});
    [[-1.0,-1.4],[1.0,-1.4],[-1.0,1.4],[1.0,1.4]].forEach(function(w){
      var wh=new THREE.Mesh(wheelGeo,wm); wh.rotation.z=Math.PI/2; wh.position.set(w[0],0.42,w[1]); wh.castShadow=true; g.add(wh);
    });
    g.traverse(function(o){ if(o.isMesh){o.castShadow=true;o.receiveShadow=true;} });
    return g;
  }
  var carColors=[0x44474d,0x2a2c31,0x595d63,0x35383d,0x6b6f76];
  // cars in front parking bays
  var frontBays=[-20,-13.5,-7,7,13.5,20];
  frontBays.forEach(function(x,i){
    if(i===2||i===3) return; // leave entrance lane clear
    var c=car(carColors[i%carColors.length]); c.position.set(x,0,22.5); c.rotation.y=Math.PI; root.add(c);
  });
  // cars under ombrières
  [-12,-5,3,11].forEach(function(x,i){ var c=car(carColors[(i+1)%carColors.length]); c.position.set(x+canX,0,canZ); c.rotation.y=Math.PI; root.add(c); });

  /* ---------- trees / hedges (dark, desaturated) ---------- */
  function tree(x,z,s){
    var g=new THREE.Group();
    var trunk=new THREE.Mesh(new THREE.CylinderGeometry(0.22*s,0.3*s,2.2*s,8), new THREE.MeshStandardMaterial({color:0x2a241d, roughness:1}));
    trunk.position.y=1.1*s; trunk.castShadow=true; g.add(trunk);
    var fol=new THREE.Mesh(new THREE.IcosahedronGeometry(1.7*s,1), new THREE.MeshStandardMaterial({color:0x222a1d, roughness:1, flatShading:true}));
    fol.position.y=3.2*s; fol.castShadow=true; g.add(fol);
    g.position.set(x,0,z); root.add(g);
  }
  [[-30,-30,1.2],[-22,-32,1],[24,-30,1.3],[31,-28,1],[33,12,1.1],[-34,10,1]].forEach(function(t){ tree(t[0],t[1],t[2]); });
  // hedges along front edge
  var hedge=new THREE.MeshStandardMaterial({color:0x1f261b, roughness:1});
  [[-34,16],[34,16]].forEach(function(p){ var h=box(10,1.4,1.6,hedge); h.position.set(p[0],0.7,p[1]); root.add(h); });

  /* ============================================================
     HOTSPOTS
     ============================================================ */
  var anchors={
    toiture:  new THREE.Vector3(-12, 1.3+BH+2.4, -2),
    parking:  new THREE.Vector3(canX, canH+1.6, canZ),
    flotte:   new THREE.Vector3(18, 2.2, 22.5),
    batiment: new THREE.Vector3(CX, 1.3+CEH-2.0, CZ+BD/2+0.6)
  };
  var DATA={
    toiture:{ poste:'Toiture', title:'Solaire en toiture', desc:'≈ 1 100 m² de toiture plate exploitables. Autoconsommation + revente, financées sans apport. On pilote l\u2019installateur et le raccordement Enedis.', k1:'Production',v1:'180 MWh/an', k2:'Coût énergie', v2:'jusqu\u2019à −30%' },
    parking:{ poste:'Parking', title:'Ombrières & recharge', desc:'Ombrières photovoltaïques + bornes pilotées sur le parking visiteurs et collaborateurs. Éligible aux aides ADVENIR.', k1:'Bornes',v1:'×26', k2:'Aides captées', v2:'jusqu\u2019à 960 €/pt' },
    flotte:{ poste:'Flotte', title:'Mobilité & TCO', desc:'Électrification de la flotte par vagues. Leasing, fiscalité et recharge arbitrés pour le TCO le plus bas.', k1:'Véhicules',v1:'42', k2:'TCO', v2:'−22% / véh.' },
    batiment:{ poste:'Bâtiment', title:'Efficacité énergétique', desc:'Isolation, CVC et pilotage du bardage existant. Travaux financés par les CEE, reste à charge chiffré à l\u2019avance.', k1:'Conso',v1:'−40%', k2:'Financement', v2:'CEE + tiers' }
  };

  var pinlayer=document.getElementById('pinlayer'), pins={};
  Object.keys(anchors).forEach(function(k){
    var pin=document.createElement('div'); pin.className='pin'; pin.dataset.k=k;
    pin.innerHTML='<div class="tag">'+DATA[k].poste+'</div><div class="dot"></div><div class="stalk"></div>';
    pinlayer.appendChild(pin); pins[k]=pin;
  });

  /* ---------- card ---------- */
  var card=document.getElementById('card'), activeKey=null;
  function fill(k){ var d=DATA[k];
    document.getElementById('c-poste').textContent=d.poste;
    document.getElementById('c-title').textContent=d.title;
    document.getElementById('c-desc').textContent=d.desc;
    document.getElementById('c-k1').textContent=d.k1; document.getElementById('c-v1').textContent=d.v1;
    document.getElementById('c-k2').textContent=d.k2; document.getElementById('c-v2').textContent=d.v2;
  }
  function positionCard(){
    if(!activeKey) return; var pin=pins[activeKey];
    var px=parseFloat(pin.style.left), py=parseFloat(pin.style.top);
    if(isNaN(px)) return;
    var cw=300, ch=card.offsetHeight||230, pad=16, x=px+24, y=py-ch-26;
    if(x+cw>1440-pad) x=px-cw-24; if(x<pad) x=pad; if(y<pad) y=py+26;
    card.style.left=x+'px'; card.style.top=y+'px';
  }
  function open(k){ activeKey=k; fill(k); card.classList.add('show'); positionCard();
    Object.keys(pins).forEach(function(j){ pins[j].classList.toggle('active', j===k); }); }
  function close(){ activeKey=null; card.classList.remove('show'); Object.keys(pins).forEach(function(j){pins[j].classList.remove('active');}); }
  Object.keys(pins).forEach(function(k){
    pins[k].addEventListener('mouseenter',function(){ open(k); });
    pins[k].addEventListener('click',function(e){ e.stopPropagation(); open(k); });
  });
  card.addEventListener('mouseleave',close);

  /* ============================================================
     CAMERA ORBIT
     ============================================================ */
  var target=new THREE.Vector3(0,4.5,7);
  var baseAz=-0.92, basePol=1.0;
  var az=baseAz, pol=basePol, radius=68, autoOrbit=true, dragging=false, lastX=0,lastY=0, swayT=0;
  function updateCam(){
    var sp=Math.sin(pol);
    cam.position.set(
      target.x + radius*sp*Math.sin(az),
      target.y + radius*Math.cos(pol),
      target.z + radius*sp*Math.cos(az)
    );
    cam.lookAt(target);
  }
  updateCam();

  stage.addEventListener('pointerdown',function(e){ dragging=true; autoOrbit=false; setOrbit(); lastX=e.clientX; lastY=e.clientY; try{stage.setPointerCapture(e.pointerId);}catch(_){} close(); });
  stage.addEventListener('pointermove',function(e){ if(!dragging)return; var dx=e.clientX-lastX, dy=e.clientY-lastY; lastX=e.clientX; lastY=e.clientY;
    az-=dx*0.005; pol=Math.max(0.62,Math.min(1.2, pol-dy*0.004)); updateCam(); });
  window.addEventListener('pointerup',function(){ dragging=false; });
  // zoom
  stage.addEventListener('wheel',function(e){ e.preventDefault(); radius=Math.max(55,Math.min(140, radius+e.deltaY*0.05)); updateCam(); },{passive:false});

  /* ---------- project pins ---------- */
  var v=new THREE.Vector3();
  function projectPins(){
    Object.keys(anchors).forEach(function(k){
      v.copy(anchors[k]).project(cam);
      var behind = v.z>1;
      var x=(v.x*0.5+0.5)*W, y=(-v.y*0.5+0.5)*H;
      var pin=pins[k];
      // hide if behind camera or far off-screen left (under copy panel)
      var hidden = behind || x<300 || x>W-10 || y<10 || y>H-10;
      pin.style.opacity = hidden? '0':'1';
      pin.style.pointerEvents = hidden? 'none':'auto';
      pin.style.left=x+'px'; pin.style.top=y+'px';
    });
    positionCard();
  }

  /* ---------- exploded view ---------- */
  var hero=document.getElementById('hero');
  var orbitBtn=document.getElementById('orbitBtn'), cutBtn=document.getElementById('cutBtn');
  function setOrbit(){ orbitBtn.classList.toggle('on',autoOrbit); }
  orbitBtn.addEventListener('click',function(){ autoOrbit=!autoOrbit; setOrbit(); });
  var exploded=false, explodeT=0;
  cutBtn.addEventListener('click',function(){ exploded=!exploded; cutBtn.classList.toggle('on',exploded); partsGrp.visible=true; });

  /* ---------- resize ---------- */
  function onResize(){ W=stage.clientWidth||1440; H=stage.clientHeight||746; cam.aspect=W/H; cam.updateProjectionMatrix(); renderer.setSize(W,H); }
  window.addEventListener('resize',onResize);

  /* ---------- render loop ---------- */
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce){ autoOrbit=false; setOrbit(); }
  function animate(){
    if(autoOrbit && !dragging){ swayT+=0.0045; az=baseAz+Math.sin(swayT)*0.34; pol=basePol+Math.sin(swayT*0.7)*0.045; updateCam(); }
    // exploded animation
    var tgt=exploded?1:0; explodeT+=(tgt-explodeT)*0.08;
    roofGrp.position.y = explodeT*16;
    roofGrp.traverse(function(o){ if(o.isMesh && o.material && o.material.transparent!==undefined){} });
    partsGrp.visible = explodeT>0.05;
    partsGrp.traverse(function(o){ if(o.isMesh){ o.material.opacity=1; } });
    projectPins();
    renderer.render(scene,cam);
    requestAnimationFrame(animate);
  }
  animate();
})();
