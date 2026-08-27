// DreamCity Phase 3 — police chase, vehicle traffic events, wanted response, interaction prompts.
(function(){
  const state={police:[],lastSpawn:0,spawnGap:7,damageCooldown:0,nearShop:null};
  const message=t=>{const el=document.getElementById('gameMessage');if(!el)return;el.textContent=t;el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),2200);};
  const wantedEl=document.getElementById('wantedValue');
  function makePolice(x,z){
    const g=new THREE.Group();
    const body=new THREE.Mesh(new THREE.BoxGeometry(1.35,.65,2.7),new THREE.MeshStandardMaterial({color:0x172235,roughness:.5}));body.position.y=.65;g.add(body);
    const roof=new THREE.Mesh(new THREE.BoxGeometry(1.05,.35,1.15),new THREE.MeshStandardMaterial({color:0xdce4ea,roughness:.45}));roof.position.y=1.15;g.add(roof);
    const red=new THREE.Mesh(new THREE.BoxGeometry(.28,.12,.38),new THREE.MeshBasicMaterial({color:0xff2020}));red.position.set(-.28,1.38,0);g.add(red);
    const blue=red.clone();blue.material=red.material.clone();blue.material.color.set(0x2080ff);blue.position.x=.28;g.add(blue);
    g.position.set(x,0,z);g.userData={police:true,speed:0};scene.add(g);state.police.push(g);
  }
  function spawnPolice(){
    if(typeof player==='undefined'||typeof state==='undefined')return;
    if(state.wanted<=0)return;
    if(state.police.length>=Math.min(5,state.wanted+1))return;
    const a=Math.random()*Math.PI*2,d=38+Math.random()*20;makePolice(player.position.x+Math.cos(a)*d,player.position.z+Math.sin(a)*d);
  }
  function updatePolice(dt){
    if(typeof player==='undefined'||typeof state==='undefined')return;
    state.damageCooldown=Math.max(0,state.damageCooldown-dt);
    if(state.wanted>0&&performance.now()-state.lastSpawn>state.spawnGap*1000){spawnPolice();state.lastSpawn=performance.now();}
    state.police.forEach((p,i)=>{
      if(!p.parent)return;
      const target=player.position;const dx=target.x-p.position.x,dz=target.z-p.position.z;const dist=Math.hypot(dx,dz);
      if(dist>.1){const ang=Math.atan2(dx,dz);p.rotation.y=ang;const speed=Math.min(13+state.wanted*2,dist*1.6);p.position.x+=Math.sin(ang)*speed*dt;p.position.z+=Math.cos(ang)*speed*dt;}
      if(dist<4&&state.damageCooldown<=0&&!state.driving){state.health=Math.max(0,state.health-8);state.damageCooldown=1.2;message('POLICE HIT — escape the area!');if(state.health<=0){state.health=100;state.wanted=0;message('BUSTED — you were released at the station.');p.position.set(player.position.x+18,0,player.position.z+18);}}
    });
    for(let i=state.police.length-1;i>=0;i--){const p=state.police[i];if(state.wanted===0||p.position.distanceTo(player.position)>180){scene.remove(p);state.police.splice(i,1);}}
  }
  function addInteractionPrompt(){
    if(document.getElementById('interactPrompt'))return;
    const d=document.createElement('div');d.id='interactPrompt';d.style.cssText='position:absolute;left:50%;bottom:150px;transform:translateX(-50%);padding:9px 14px;border-radius:12px;background:rgba(8,15,22,.78);border:1px solid rgba(255,255,255,.14);color:#fff;font:800 13px system-ui;display:none;pointer-events:none';document.querySelector('.hud').appendChild(d);
  }
  function prompt(){
    const el=document.getElementById('interactPrompt');if(!el||typeof player==='undefined')return;
    let text='';
    if(typeof nearestCar==='function'&&nearestCar())text='E — Enter Vehicle';
    else if(typeof nearestShop==='function'&&nearestShop())text='E — Shop / Interact';
    else if(typeof missionMarker!=='undefined'&&missionMarker&&missionMarker.visible&&player.position.distanceTo(missionMarker.position)<7)text='E — Start Mission';
    el.textContent=text;el.style.display=text?'block':'none';
  }
  function loop(){updatePolice(.016);prompt();requestAnimationFrame(loop);}
  function start(){if(typeof THREE==='undefined'||typeof scene==='undefined'||typeof player==='undefined')return setTimeout(start,200);addInteractionPrompt();loop();message('PHASE 3 LIVE — police response and interaction prompts enabled.');}
  start();
})();
