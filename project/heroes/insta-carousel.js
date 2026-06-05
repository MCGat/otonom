/* ============================================================
   OTONOM — IG carousel · static exploded building + scaling
   ============================================================ */
(function(){
  function el(t,c,css){ var n=document.createElement('div'); if(c)n.className=c; if(css)for(var k in css)n.style[k]=css[k]; return n; }
  function px(v){ return v+'px'; }

  // extruded box: top + south + east faces, top at z=h, centered
  function box(w,d,h,topBg,sBg,eBg){
    var u=el('div','bunit');
    var t=el('div','ut',{ width:px(w),height:px(d),margin:px(-d/2)+' 0 0 '+px(-w/2),transform:'translateZ('+h+'px)',background:topBg,border:'1px solid rgba(255,255,255,0.07)' });
    var s=el('div','us',{ width:px(w),height:px(h),left:px(-w/2),top:px(d/2),transformOrigin:'top',transform:'rotateX(-90deg)',background:sBg });
    var e=el('div','ue',{ width:px(h),height:px(d),left:px(w/2),top:px(-d/2),transformOrigin:'left',transform:'rotateY(90deg)',background:eBg });
    u.appendChild(s); u.appendChild(e); u.appendChild(t);
    return u;
  }

  // LAYERS (bottom→top). z = exploded gap.
  var LAYERS=[
    { id:'parking',  w:560, d:360, t:14, z:0,   top:'linear-gradient(160deg,#141518,#0d0e10)', surf:'asphalt' },
    { id:'rdc',      w:380, d:250, t:22, z:150, top:'linear-gradient(150deg,#4a4e57,#34373e)', surf:'floor' },
    { id:'bureaux',  w:380, d:250, t:22, z:296, top:'linear-gradient(150deg,#4a4e57,#34373e)', surf:'floor' },
    { id:'technique',w:380, d:250, t:22, z:442, top:'linear-gradient(150deg,#36383f,#26282e)', surf:'tech' },
    { id:'toiture',  w:380, d:250, t:16, z:588, top:'linear-gradient(150deg,#1b1c20,#121317)', surf:'roof' }
  ];

  function buildBuilding(mount, opts){
    opts=opts||{};
    var world=el('div','bworld'); if(opts.s) world.style.setProperty('--s',opts.s);
    if(opts.left) world.style.left=opts.left; if(opts.top) world.style.top=opts.top;

    LAYERS.forEach(function(L){
      var layer=el('div','blayer',{}); layer.style.setProperty('--z', L.z+'px');
      // slab
      var slab=el('div','bslab');
      var topCss={ width:px(L.w),height:px(L.d),margin:px(-L.d/2)+' 0 0 '+px(-L.w/2) };
      var top=el('div','bface top',topCss); top.style.background=L.top;
      var sS=el('div','bface side',{ width:px(L.w),height:px(L.t),left:px(-L.w/2),top:px(L.d/2),transformOrigin:'top',transform:'rotateX(-90deg)',background:'#1a1c20',boxShadow:'inset 0 1px 0 rgba(255,255,255,0.05)' });
      var sE=el('div','bface side',{ width:px(L.t),height:px(L.d),left:px(L.w/2),top:px(-L.d/2),transformOrigin:'left',transform:'rotateY(90deg)',background:'#101116' });
      slab.appendChild(sS); slab.appendChild(sE); slab.appendChild(top);
      layer.appendChild(slab);

      // deck
      var deck=el('div','bdeck',{ width:px(L.w),height:px(L.d),margin:px(-L.d/2)+' 0 0 '+px(-L.w/2) });
      decorate(L, deck);
      layer.appendChild(deck);
      world.appendChild(layer);
    });

    mount.appendChild(world);
    return world;
  }

  function decorate(L, dk){
    if(L.surf==='asphalt'){
      // faint lane lines
      for(var i=0;i<4;i++) dk.appendChild(el('div',null,{ position:'absolute',left:(90+i*100)+'px',top:'250px',width:'2px',height:'70px',background:'rgba(243,244,246,0.08)' }));
      // a couple of cars
      [[120,300],[200,300],[300,290]].forEach(function(p){
        var b=box(20,40,10,'linear-gradient(150deg,#4a4d54,#34373d)','#2a2c31','#1f2126'); b.style.transform='translate('+(p[0]-L.w/2)+'px,'+(p[1]-L.d/2)+'px)'; dk.appendChild(b);
      });
      // ombrière canopy (right)
      var posts=[[430,70],[520,70],[430,170],[520,170]];
      posts.forEach(function(p){ var pb=box(7,7,52,'#3a3d44','#2a2c31','#202228'); pb.style.transform='translate('+(p[0]-L.w/2)+'px,'+(p[1]-L.d/2)+'px)'; dk.appendChild(pb); });
      var can=el('div',null,{ position:'absolute',left:px(430-L.w/2-10),top:px(70-L.d/2-10),width:'120px',height:'120px',transform:'translateZ(52px) rotateY(-6deg)',
        background:"repeating-linear-gradient(0deg,#0b0d15 0 7px,#171c28 7px 8px),repeating-linear-gradient(90deg,#0b0d15 0 9px,#1a2030 9px 10px)",backgroundBlendMode:'lighten',border:'1px solid #23262e',boxShadow:'0 8px 18px -8px rgba(0,0,0,0.8)' });
      dk.appendChild(can);
    }
    if(L.surf==='floor'){
      // interior grid
      dk.appendChild(el('div',null,{ position:'absolute',inset:'0',
        backgroundImage:'linear-gradient(rgba(255,255,255,0.045) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.045) 1px,transparent 1px)',backgroundSize:'28px 28px' }));
      dk.appendChild(el('div',null,{ position:'absolute',inset:'8px',border:'2px solid rgba(150,180,220,0.14)',boxShadow:'inset 0 0 24px rgba(120,150,200,0.08)' }));
    }
    if(L.surf==='floor' && L.id==='bureaux'){
      // LED strips (bright)
      [70,120,170].forEach(function(y){ dk.appendChild(el('div',null,{ position:'absolute',left:'200px',top:y+'px',width:'150px',height:'3px',background:'rgba(226,232,242,0.85)',boxShadow:'0 0 10px rgba(210,222,244,0.7)',transform:'translateZ(28px)' })); });
      // desks
      [[80,170],[120,170],[180,180],[220,180]].forEach(function(p){ var b=box(22,14,6,'linear-gradient(150deg,#4a4d55,#3a3d44)','#2d2f35','#222428'); b.style.transform='translate('+(p[0]-L.w/2)+'px,'+(p[1]-L.d/2)+'px)'; dk.appendChild(b); });
    }
    if(L.surf==='tech'){
      dk.appendChild(el('div',null,{ position:'absolute',inset:'0',backgroundImage:'radial-gradient(rgba(255,255,255,0.05) 1px,transparent 1.4px)',backgroundSize:'24px 24px' }));
      // PAC units (lit)
      [[80,90],[80,130]].forEach(function(p){ var b=box(50,30,26,'linear-gradient(150deg,#eef1f6,#d2d7e0)','#5a5e66','#44474e'); b.querySelector('.ut').style.boxShadow='0 0 18px rgba(220,228,242,0.5)'; b.style.transform='translate('+(p[0]-L.w/2)+'px,'+(p[1]-L.d/2)+'px)'; dk.appendChild(b); });
      // batterie + GTB
      var bat=box(44,56,34,'linear-gradient(150deg,#3e424a,#2c2f35)','#26282d','#1c1e22'); bat.style.transform='translate('+(220-L.w/2)+'px,'+(95-L.d/2)+'px)'; dk.appendChild(bat);
      var gtb=box(28,38,34,'linear-gradient(150deg,#cfd6e2,#aab2c0)','#4a4d54','#383b41'); gtb.querySelector('.ut').style.boxShadow='0 0 14px rgba(190,205,230,0.5)'; gtb.style.transform='translate('+(310-L.w/2)+'px,'+(170-L.d/2)+'px)'; dk.appendChild(gtb);
    }
    if(L.surf==='roof'){
      // solar field
      dk.appendChild(el('div',null,{ position:'absolute',left:'26px',top:'22px',width:'328px',height:'206px',transform:'translateZ(7px)',
        background:"repeating-linear-gradient(0deg,#0b0d15 0 8px,#171c28 8px 9px),repeating-linear-gradient(90deg,#0b0d15 0 10px,#1a2030 10px 11px)",border:'1px solid #23262e' }));
      [80,138,196].forEach(function(y){ dk.appendChild(el('div',null,{ position:'absolute',left:'26px',top:y+'px',width:'328px',height:'3px',background:'#0b0c10',transform:'translateZ(8px)' })); });
    }
  }

  // tag helper (a pin + label that face camera), placed on a deck
  function addTag(world, layerIdx, cx, cy, lift, label, pct){
    var layer=world.children[layerIdx];
    var deck=layer.querySelector('.bdeck');
    var L=LAYERS[layerIdx];
    var t=el('div','btag',{ left:'0',top:'0',transform:'translate('+(cx-L.w/2)+'px,'+(cy-L.d/2)+'px) translateZ('+lift+'px)' });
    var pin=el('div','pin');
    var ti=el('div','ti',{ left:'24px',top:'-12px' });
    var lab=el('div','lab'); lab.innerHTML=label+' <span class="pc">'+pct+'</span>';
    ti.appendChild(lab); t.appendChild(pin); t.appendChild(ti);
    deck.appendChild(t);
  }

  /* ---- Scene 1: building as atmospheric teaser (no tags, pushed up-right) ---- */
  var s1=document.getElementById('scene1');
  if(s1){ buildBuilding(s1, { s:0.9, left:'60%', top:'40%' }); }

  /* ---- Scene 2: building with equipment tags ---- */
  var s2=document.getElementById('scene2');
  if(s2){
    var w2=buildBuilding(s2, { s:0.62, left:'64%', top:'55%' });
    addTag(w2, 4, 200, 105, 30, 'Solaire', '−34%');   // toiture
    addTag(w2, 3, 70,  150, 40, 'PAC', '−40%');        // technique
  }

  /* ============================================================
     SCALE the rail to fit viewport (review only)
     ============================================================ */
  function fit(){
    if(document.body.classList.contains('exporting')) return;
    var vw=window.innerWidth, vh=window.innerHeight;
    var reviewPad=Math.min(72, vw*0.04)*2, gap=28, headRoom=140;
    // pick the largest perRow that lets a whole slide be tall enough
    var best=1, bestScale=0;
    [3,2,1].forEach(function(n){
      var availW=(vw - reviewPad - gap*(n-1))/n;
      var s=Math.min(1, availW/1080, (vh-headRoom)/1350);
      if(s>bestScale){ bestScale=s; best=n; }
    });
    document.querySelectorAll('.slot').forEach(function(slot){
      var frame=slot.querySelector('.frame');
      var post=slot.querySelector('.post');
      post.style.transform='scale('+bestScale+')';
      frame.style.width=(1080*bestScale)+'px';
      frame.style.height=(1350*bestScale)+'px';
      slot.style.width=(1080*bestScale)+'px';
    });
  }
  fit(); window.addEventListener('resize', fit);

  /* ============================================================
     EXPORT — isolate one slide at native 1080×1350
     window.__showSlide(n)  /  window.__endExport()
     ============================================================ */
  window.__showSlide=function(n){
    document.body.classList.add('exporting');
    document.querySelectorAll('.slot').forEach(function(s){
      s.classList.toggle('exp', s.dataset.slide===String(n));
    });
    window.scrollTo(0,0);
  };
  window.__endExport=function(){
    document.body.classList.remove('exporting');
    document.querySelectorAll('.slot').forEach(function(s){ s.classList.remove('exp'); });
    fit();
  };

})();
