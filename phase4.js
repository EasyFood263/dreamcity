// DreamCity Phase 4 — mission chain, minimap, vehicle dashboard, police siren and gameplay polish.
(function(){
  const el=id=>document.getElementById(id);
  function addStyle(){
    const s=document.createElement('style');s.textContent=`#phase4Mini{position:absolute;right:18px;top:105px;width:150px;height:150px;border-radius:50%;background:rgba(8,15,22,.72);border:2px solid rgba(255,255,255,.2);overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.25)}#phase4Mini canvas{width:100%;height:100%}.vehicleHud{position:absolute;right:18px;bottom:82px;padding:10px 14px;font:800 13px system-ui;display:none}.vehicleHud b{color:#ffd65a}.wantedPulse{animation:wp .65s infinite alternate}@keyframes wp{from{filter:drop-shadow(0 0 0 transparent)}to{filter:drop-shadow(0 0 8px #ff304f)}}@media(max-width:700px){#phase4Mini{width:105px;height:105px;right:8px;top:75px}.vehicleHud{right:8px;bottom:72px;font-size:11px}}`;document.head.appendChild(s);
    const mini=document.createElement('div');mini.id='phase4Mini';mini.innerHTML='<canvas width="300" height="300"></canvas>';document.querySelector('.hud').appendChild(mini);
    const vh=document.createElement('div');vh.className='panel vehicleHud';vh.id='vehicleHud';vh.innerHTML='🚗 <b>VEHICLE</b> &nbsp; Speed <span id="vehicleSpeed">0</span> km/h';document.querySelector('.hud').appendChild(vh);
  }
  function setupMissionChain(){
    if(!el('missionText'))return;
    let stage=Number(localStorage.getItem('dreamcity_mission_stage')||0);
    const original=el('missionText');
    function refresh(){
      if(stage===0) original.textContent='Go to the yellow marker and press E — First Job';
      else if(stage===1) original.textContent='Mission 2: reach the Garage and service the getaway car';
      else if(stage===2) original.textContent='Mission 3: lose the police and return to the safe house';
      else original.textContent='Story Complete — Free Roam unlocked';
    }
    refresh();
    window.addEventListener('keydown',e=>{
      if(e.key.toLowerCase()!=='e')return;
      setTimeout(()=>{
        const t=original.textContent||'';
        if(stage===0 && t.includes('Street Job: 3/3')){stage=1;localStorage.setItem('dreamcity_mission_stage',stage);refresh();}
        else if(stage===1 && t.includes('Garage')){stage=2;localStorage.setItem('dreamcity_mission_stage',stage);refresh();}
      },250);
    });
  }
  function drawMini(){
    const c=document.querySelector('#phase4Mini canvas');if(!c||typeof player==='undefined')return;
    const ctx=c.getContext('2d'),w=c.width,h=c.height;ctx.clearRect(0,0,w,h);ctx.save();ctx.translate(w/2,h/2);
    ctx.strokeStyle='rgba(255,255,255,.12)';ctx.lineWidth=2;
    for(let i=-120;i<=120;i+=40){ctx.beginPath();ctx.moveTo(i,-150);ctx.lineTo(i,150);ctx.stroke();ctx.beginPath();ctx.moveTo(-150,i);ctx.lineTo(150,i);ctx.stroke();}
    function dot(x,z,r,fill){ctx.fillStyle=fill;ctx.beginPath();ctx.arc(x,z,r,0,Math.PI*2);ctx.fill();}
    const scale=.28; if(typeof missionMarker!=='undefined'&&missionMarker&&missionMarker.visible){dot((missionMarker.position.x-player.position.x)*scale,(missionMarker.position.z-player.position.z)*scale,7,'#ffd54f');}
    if(typeof shopMarkers!=='undefined')shopMarkers.forEach(s=>dot((s.position.x-player.position.x)*scale,(s.position.z-player.position.z)*scale,4,'#53d8ff'));
    if(typeof state!=='undefined'&&state.police){};
    dot(0,0,7,'#fff');ctx.strokeStyle='#fff';ctx.beginPath();ctx.moveTo(0,-12);ctx.lineTo(0,12);ctx.stroke();ctx.restore();
  }
  function vehicleHud(){const box=el('vehicleHud');if(!box||typeof state==='undefined')return;box.style.display=state.driving?'block':'none';if(state.driving&&state.car){const speed=Math.round(Math.abs(state.car.g.userData.speed||0)*3.6);el('vehicleSpeed').textContent=speed;}}
  function wantedVisual(){const w=el('wantedValue');if(!w)return;w.classList.toggle('wantedPulse',w.textContent.includes('★')&&w.textContent.includes('★'));}
  function start(){if(typeof THREE==='undefined'||typeof player==='undefined')return setTimeout(start,200);addStyle();setupMissionChain();setInterval(drawMini,120);setInterval(vehicleHud,100);setInterval(wantedVisual,200);}
  start();
})();
