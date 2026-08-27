// DreamCity Phase 2 — vehicles, shops, day/night, animation polish and expanded gameplay.
(function(){
  const state={health:100,ammo:12,maxAmmo:12,cash:Number(localStorage.getItem('dreamcity_cash')||25000),wanted:0,missionActive:false,missionKills:0,missionGoal:3,missionReward:2500,lastShot:0,fireDelay:180,flashUntil:0,messageUntil:0,time:8*60,driving:false,car:null,night:false};
  const hud={health:document.getElementById('healthValue'),healthBar:document.getElementById('healthBar'),ammo:document.getElementById('ammoValue'),cash:document.getElementById('cashValue'),wanted:document.getElementById('wantedValue'),mission:document.getElementById('missionText'),missionPanel:document.getElementById('missionPanel'),message:document.getElementById('gameMessage'),time:document.getElementById('time')};
  const enemies=[],missionTargets=[]; let missionMarker=null,gun=null,flash=null,walkingTime=0,lastFrame=performance.now();
  let keys={},policeTimer=0,shopMarkers=[];

  function message(text,ms=2600){if(!hud.message)return;hud.message.textContent=text;hud.message.classList.add('show');state.messageUntil=performance.now()+ms;}
  function updateHud(){
    if(hud.health){hud.health.textContent=Math.ceil(state.health);hud.healthBar.style.width=Math.max(0,state.health)+'%';}
    if(hud.ammo)hud.ammo.textContent=state.ammo+' / '+state.maxAmmo;
    if(hud.cash)hud.cash.textContent=state.cash.toLocaleString();
    if(hud.wanted)hud.wanted.textContent=state.wanted?'★'.repeat(state.wanted)+'☆'.repeat(5-state.wanted):'☆☆☆☆☆';
    if(hud.time){const h=Math.floor(state.time/60)%24,m=Math.floor(state.time%60);hud.time.textContent=String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');}
    if(hud.mission)hud.mission.textContent=state.driving?'DRIVING — W/S accelerate/brake • A/D steer • E exit':state.missionActive?`Street Job: ${state.missionKills}/${state.missionGoal} targets`:'Go to the yellow marker and press E';
    if(hud.missionPanel)hud.missionPanel.classList.toggle('active',state.missionActive||state.driving);
  }
  function makeMat(color,roughness=.65,metalness=0){return new THREE.MeshStandardMaterial({color,roughness,metalness});}

  function createGun(){
    gun=new THREE.Group();
    const body=new THREE.Mesh(new THREE.BoxGeometry(.24,.22,.9),makeMat(0x20252a,.35,.25));body.position.set(.46,1.78,.48);gun.add(body);
    const grip=new THREE.Mesh(new THREE.BoxGeometry(.16,.34,.2),makeMat(0x171b1e,.7));grip.position.set(.46,1.56,.30);grip.rotation.x=-.18;gun.add(grip);
    const barrel=new THREE.Mesh(new THREE.CylinderGeometry(.055,.055,.62,10),makeMat(0x0c0f11,.25,.45));barrel.rotation.x=Math.PI/2;barrel.position.set(.46,1.78,.98);gun.add(barrel);
    const muzzle=new THREE.Object3D();muzzle.position.set(.46,1.78,1.30);gun.add(muzzle);
    flash=new THREE.Mesh(new THREE.SphereGeometry(.13,8,8),new THREE.MeshBasicMaterial({color:0xffd36a}));flash.visible=false;muzzle.add(flash);player.add(gun);
  }

  function createEnemy(x,z,index){
    const g=new THREE.Group(),skin=makeMat(0xb97b5c,.8),shirt=makeMat([0x8d3131,0x333f79,0x6d4a31][index%3],.72),dark=makeMat(0x20252b,.75);
    const head=new THREE.Mesh(new THREE.SphereGeometry(.56,14,10),skin);head.position.y=2.55;g.add(head);
    const torso=new THREE.Mesh(new THREE.BoxGeometry(1.05,1.45,.62),shirt);torso.position.y=1.45;g.add(torso);
    const leg1=new THREE.Mesh(new THREE.BoxGeometry(.3,1.25,.34),dark);leg1.position.set(-.22,.35,0);g.add(leg1);const leg2=leg1.clone();leg2.position.x=.22;g.add(leg2);
    const arm1=new THREE.Mesh(new THREE.BoxGeometry(.25,1.15,.25),skin);arm1.position.set(-.68,1.5,0);g.add(arm1);const arm2=arm1.clone();arm2.position.x=.68;g.add(arm2);
    g.position.set(x,0,z);g.userData={health:50,alive:true,home:new THREE.Vector3(x,0,z),phase:index*.8};g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});scene.add(g);enemies.push(g);missionTargets.push(g);
  }
  function createEnemies(){[[55,42],[-58,42],[42,-55],[-42,-58],[180,18],[-180,-18],[18,180],[-18,-180]].forEach((p,i)=>createEnemy(p[0],p[1],i));}
  function createMissionMarker(){
    missionMarker=new THREE.Group();
    const ring=new THREE.Mesh(new THREE.RingGeometry(2.8,3.5,32),new THREE.MeshBasicMaterial({color:0xffd54f,transparent:true,opacity:.9,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=.25;missionMarker.add(ring);
    const beam=new THREE.Mesh(new THREE.CylinderGeometry(.12,.5,5,12),new THREE.MeshBasicMaterial({color:0xffd54f,transparent:true,opacity:.3}));beam.position.y=2.5;missionMarker.add(beam);missionMarker.position.set(-40,0,38);scene.add(missionMarker);
  }

  function createShopMarkers(){
    const shops=[{x:-75,z:150,name:'General Store',color:0x4fc3f7},{x:75,z:-150,name:'Gun Shop',color:0xff8a65},{x:-225,z:150,name:'Clothing',color:0xce93d8},{x:225,z:-150,name:'Garage',color:0x81c784}];
    shops.forEach(s=>{
      const g=new THREE.Group();const ring=new THREE.Mesh(new THREE.RingGeometry(2,2.5,24),new THREE.MeshBasicMaterial({color:s.color,transparent:true,opacity:.85,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;g.add(ring);
      const icon=new THREE.Mesh(new THREE.BoxGeometry(.55,2.4,.55),new THREE.MeshBasicMaterial({color:s.color}));icon.position.y=1.2;g.add(icon);g.position.set(s.x,0,s.z);g.userData={name:s.name};scene.add(g);shopMarkers.push(g);
    });
  }
  function nearestShop(){let best=null,dist=8;shopMarkers.forEach(s=>{const d=player.position.distanceTo(s.position);if(d<dist){dist=d;best=s;}});return best;}
  function interactShop(){const s=nearestShop();if(!s){message('Walk to a shop marker first.');return;}const n=s.userData.name;
    if(n==='General Store'){if(state.cash>=100){state.cash-=100;state.health=Math.min(100,state.health+35);message('First-aid purchased — health restored.');}else message('You need $100.');}
    else if(n==='Gun Shop'){state.maxAmmo=24;state.ammo=state.maxAmmo;message('Gun Shop: extended magazine equipped.');}
    else if(n==='Clothing'){state.cash=Math.max(0,state.cash-250);message('New outfit purchased — $250.');}
    else if(n==='Garage'){state.cash=Math.max(0,state.cash-500);message('Garage service complete — vehicle ready.');}
    localStorage.setItem('dreamcity_cash',String(state.cash));updateHud();
  }

  function acceptMission(){if(state.missionActive||state.driving)return;if(player.position.distanceTo(missionMarker.position)>7){message('Walk to the yellow mission marker first.');return;}state.missionActive=true;state.missionKills=0;missionTargets.length=0;enemies.forEach(e=>{if(e.userData.alive)missionTargets.push(e);});missionMarker.visible=false;state.wanted=1;updateHud();message('MISSION STARTED — take down 3 targets.');}
  function aimHit(){const ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2(0,0),camera);const objects=[];enemies.forEach(e=>{if(e.userData.alive)e.traverse(o=>{if(o.isMesh)objects.push(o);});});const hits=ray.intersectObjects(objects,false);return hits.length?hits[0].object:null;}
  function findEnemy(object){let o=object;while(o&&o.userData&&o.userData.health===undefined)o=o.parent;return o&&o.userData&&o.userData.health!==undefined?o:null;}
  function shoot(){
    const now=performance.now();if(state.driving)return;if(now-state.lastShot<state.fireDelay)return;
    if(state.ammo<=0){message('Out of ammo — press R to reload.');return;}state.lastShot=now;state.ammo--;state.wanted=Math.min(5,Math.max(state.wanted,1));if(flash){flash.visible=true;state.flashUntil=now+55;}
    const hit=aimHit(),target=hit?findEnemy(hit):null;if(target&&target.userData.alive){target.userData.health-=25;if(target.userData.health<=0)killEnemy(target);else message('HIT — 25 damage',700);}updateHud();
  }
  function killEnemy(enemy){
    if(!enemy.userData.alive)return;enemy.userData.alive=false;const pos=enemy.position.clone();enemy.visible=false;state.wanted=Math.min(5,state.wanted+1);
    if(state.missionActive&&missionTargets.includes(enemy)){state.missionKills++;if(state.missionKills>=state.missionGoal){state.missionActive=false;state.cash+=state.missionReward;state.wanted=0;missionMarker.visible=true;localStorage.setItem('dreamcity_cash',String(state.cash));message('MISSION COMPLETE — +$2,500',4200);}}
    const puff=new THREE.Mesh(new THREE.SphereGeometry(.35,10,8),new THREE.MeshBasicMaterial({color:0x8c98a0,transparent:true,opacity:.65}));puff.position.copy(pos);scene.add(puff);let t=0;const fade=()=>{t+=.05;puff.scale.multiplyScalar(1.08);puff.material.opacity*=.9;if(t<1)requestAnimationFrame(fade);else scene.remove(puff);};fade();updateHud();
  }
  function reload(){if(state.ammo===state.maxAmmo){message('Magazine already full.',1000);return;}message('RELOADING...',900);setTimeout(()=>{state.ammo=state.maxAmmo;updateHud();message('RELOADED',1000);},900);}

  function nearestCar(){if(typeof cars==='undefined')return null;let best=null,dist=7;cars.forEach(c=>{if(!c.g||c.g.userData.driven) return;const d=player.position.distanceTo(c.g.position);if(d<dist){dist=d;best=c;}});return best;}
  function enterCar(){const c=nearestCar();if(!c){message('Move closer to a vehicle and press E.');return;}state.driving=true;state.car=c;c.g.userData.driven=true;c.g.userData.speed=0;player.visible=false;gun.visible=false;message('VEHICLE ENTERED — W/S drive • A/D steer • E exit',2500);updateHud();}
  function exitCar(){if(!state.car)return;const c=state.car;const side=new THREE.Vector3(3,0,0).applyQuaternion(c.g.quaternion);player.position.copy(c.g.position).add(side);player.visible=true;gun.visible=true;state.driving=false;c.g.userData.driven=false;c.g.userData.speed=0;message('Vehicle exited.');state.car=null;updateHud();}
  function drive(dt){const c=state.car;if(!c)return;const g=c.g;let speed=g.userData.speed||0;const accel=keys.w?18:keys.s?-22:0;speed+=accel*dt;speed*=Math.pow(.12,dt);speed=Math.max(-12,Math.min(28,speed));g.userData.speed=speed;g.rotation.y+=(keys.a?1:keys.d?-1:0)*dt*(Math.abs(speed)*.055);g.position.x+=Math.sin(g.rotation.y)*speed*dt;g.position.z+=Math.cos(g.rotation.y)*speed*dt;g.position.x=Math.max(-370,Math.min(370,g.position.x));g.position.z=Math.max(-370,Math.min(370,g.position.z));
    // Keep player as the camera target while driving.
    player.position.copy(g.position);player.position.y=0;
  }

  function updateLighting(dt){
    state.time+=dt*2.2;if(state.time>=1440)state.time-=1440;const daylight=Math.max(0,Math.sin((state.time/1440)*Math.PI*2-Math.PI/2)*.5+.5);
    if(typeof sun!=='undefined'){sun.intensity=.55+daylight*2.65;sun.position.set(-180,80+daylight*220,130);}
    scene.background.setHSL(.56,.5,.18+daylight*.35);scene.fog.color.copy(scene.background);state.night=daylight<.23;
  }

  function animateWorld(now){
    const dt=Math.min((now-lastFrame)/1000,.05);lastFrame=now;updateLighting(dt);if(state.driving)drive(dt);
    const moving=keys.w||keys.a||keys.s||keys.d||keys.arrowup||keys.arrowdown||keys.arrowleft||keys.arrowright;
    if(!state.driving&&moving)walkingTime+=dt*(keys.shift?13:8);
    if(!state.driving)player.position.y=moving?Math.sin(walkingTime)*.035:Math.sin(now*.001)*.008;
    if(gun)gun.rotation.x=moving?Math.sin(walkingTime)*.025:0;
    enemies.forEach(e=>{if(!e.userData.alive)return;const h=e.userData.home,p=e.userData.phase;e.position.x=h.x+Math.sin(now*.00035+p)*3.2;e.position.z=h.z+Math.cos(now*.00028+p)*2.6;e.rotation.y=Math.sin(now*.00035+p);const swing=Math.sin(now*.006+p)*.35;if(e.children[2])e.children[2].rotation.x=swing;if(e.children[3])e.children[3].rotation.x=-swing;});
    if(missionMarker&&missionMarker.visible){missionMarker.rotation.y+=dt*.8;missionMarker.position.y=Math.sin(now*.002)*.08;}
    shopMarkers.forEach((s,i)=>{s.rotation.y+=dt*(.5+i*.05);s.position.y=Math.sin(now*.0015+i)*.06;});
    if(flash&&now>state.flashUntil)flash.visible=false;if(hud.message&&now>state.messageUntil)hud.message.classList.remove('show');
    if(state.wanted>0&&!state.missionActive&&!state.driving){policeTimer+=dt;if(policeTimer>20){state.wanted=Math.max(0,state.wanted-1);policeTimer=0;updateHud();}}
    updateHud();requestAnimationFrame(animateWorld);
  }

  function bind(){
    if(!window.THREE||typeof player==='undefined')return setTimeout(bind,100);
    createGun();createEnemies();createMissionMarker();createShopMarkers();updateHud();
    window.addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;const k=e.key.toLowerCase();if(k==='r'&&!state.driving)reload();if(k==='e'){if(state.driving)exitCar();else if(nearestShop())interactShop();else if(nearestCar())enterCar();else acceptMission();}});
    window.addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false;});
    renderer.domElement.addEventListener('pointerdown',e=>{if(e.button===0)shoot();});renderer.domElement.addEventListener('contextmenu',e=>e.preventDefault());
    message('PHASE 2 LIVE — vehicles, shops, day/night and missions added.',4200);requestAnimationFrame(animateWorld);
  }
  bind();
})();
