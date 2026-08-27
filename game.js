const scene=new THREE.Scene();
scene.background=new THREE.Color(0x91c9e8);
scene.fog=new THREE.Fog(0x91c9e8,180,720);
const camera=new THREE.PerspectiveCamera(62,innerWidth/innerHeight,.1,1200);
const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputEncoding=THREE.sRGBEncoding;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;game.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xdff3ff,0x526052,2.0));
const sun=new THREE.DirectionalLight(0xfff0d5,3.0);sun.position.set(-180,260,130);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-420;sun.shadow.camera.right=420;sun.shadow.camera.top=420;sun.shadow.camera.bottom=-420;scene.add(sun);

const coll=[];
const mat=(c,r=.7,m=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});
function box(w,h,d,x,y,z,c,r=.7,m=0){const q=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(c,r,m));q.position.set(x,y,z);q.castShadow=true;q.receiveShadow=true;scene.add(q);return q}
function addColl(x,z,w,d){coll.push({x,z,w:w/2,d:d/2})}
function blocked(x,z,r=.8){for(const a of coll){const dx=Math.max(Math.abs(x-a.x)-a.w-r,0),dz=Math.max(Math.abs(z-a.z)-a.d-r,0);if(dx*dx+dz*dz<.02)return true}return false}

// Ground and city blocks
const ground=new THREE.Mesh(new THREE.PlaneGeometry(1400,1400),mat(0x788b78,.98));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
function road(x,z,w,d){
 box(w,.16,d,x,.08,z,0x30363b,.96);
 if(w>d){box(w,.12,3.2,x,.17,z-d/2+1.6,0x8d9699,.96);box(w,.12,3.2,x,.17,z+d/2-1.6,0x8d9699,.96);for(let i=-15;i<=15;i++)box(6,.018,.18,x+i*18,.17,z,0xf3e7bc,.85)}
 else{box(3.2,.12,d,x-w/2+1.6,.17,z,0x8d9699,.96);box(3.2,.12,d,x+w/2-1.6,.17,z,0x8d9699,.96);for(let i=-15;i<=15;i++)box(.18,.018,6,x,.17,z+i*18,0xf3e7bc,.85)}
}
const streets=[-300,-150,0,150,300];streets.forEach(z=>road(0,z,760,24));streets.forEach(x=>road(x,0,24,760));
// secondary streets
[-225,-75,75,225].forEach(z=>road(0,z,760,13));[-225,-75,75,225].forEach(x=>road(x,0,13,760));

// Sidewalk slabs and curbs
for(const x of streets)for(const z of streets){box(44,.12,44,x, .17,z,0x9da7a6,.92)}
for(let x=-360;x<=360;x+=50){for(const z of [-162,-138, -12,12,138,162]) box(30,.18,2.8,x,.22,z,0xb6bbb7,.94)}
for(let z=-360;z<=360;z+=50){for(const x of [-162,-138,-12,12,138,162]) box(2.8,.18,30,x,.22,z,0xb6bbb7,.94)}

const buildingMats=[0xd8d1c5,0xb8c0c4,0xc9b4a5,0x9faeb4,0xe1d7c8,0x8e9aa1,0xc5c7c4,0xa9b7bd];
function windowUnit(w,h,d,x,y,z,c=0x4f7f94){return box(w,h,d,x,y,z,c,.24,.05)}
function building(x,z,w,d,h,type=0){
 const c=buildingMats[(Math.abs(x*3+z)+type)%buildingMats.length];
 box(w,h,d,x,h/2+.28,z,c,.76);addColl(x,z,w+3,d+3);
 // roof parapet
 box(w+.8,.55,d+.8,x,h+.55,z,0x596266,.9);
 // windows on long sides
 const cols=Math.max(2,Math.floor(w/6));const rows=Math.max(2,Math.floor((h-5)/4));
 for(let r=0;r<rows;r++)for(let j=0;j<cols;j++){
  const xx=x-w/2+3+(j*(w-6))/Math.max(1,cols-1);const yy=4+r*4;
  const ww=Math.min(3.2,(w-5)/Math.max(2,cols));
  windowUnit(ww,1.8,.10,xx,yy,z-d/2-.06,(r+j+type)%4===0?0x395f73:0x78a5b5);
  windowUnit(ww,1.8,.10,xx,yy,z+d/2+.06,(r+j+type)%4===0?0x395f73:0x78a5b5);
 }
 // side windows
 const sideRows=Math.max(2,Math.floor(d/6));
 for(let r=0;r<sideRows;r++)for(let j=0;j<Math.max(2,Math.floor(d/6));j++){
  const zz=z-d/2+3+(j*(d-6))/Math.max(1,Math.floor(d/6)-1);const yy=4+r*4;const ww=1.8;
  windowUnit(.10,1.8,ww,x-w/2-.06,yy,zz,0x5d8999);windowUnit(.10,1.8,ww,x+w/2+.06,yy,zz,0x5d8999);
 }
 // entrance and sign band
 box(Math.min(6,w*.3),3.3,.18,x,1.9,z+d/2+.12,0x24333b,.3);
 box(Math.min(8,w*.5),.35,.24,x,4.0,z+d/2+.18,type%2?0xd79a3d:0x4f7f91,.35);
 if(type%3===0){for(let i=-1;i<=1;i++)box(.08,5,.08,x+i*1.8,h/2,z-d/2-.5,0x3e4649,.8)}
}

const lots=[
[-225,-225,70,58,42,0],[-75,-225,64,58,72,1],[75,-225,68,58,54,2],[225,-225,70,58,84,3],
[-225,-75,70,60,58,2],[-75,-75,64,60,96,4],[75,-75,68,60,62,5],[225,-75,70,60,76,1],
[-225,75,70,60,66,4],[-75,75,64,60,50,3],[75,75,68,60,104,0],[225,75,70,60,58,6],
[-225,225,70,58,80,5],[-75,225,64,58,54,6],[75,225,68,58,88,2],[225,225,70,58,64,4]
];lots.forEach(a=>building(...a));

// Distinct low-rise commercial strip
function shop(x,z,w,d,c,nameColor){box(w,10,d,x,5.2,z,c,.65);addColl(x,z,w+2,d+2);box(w+.3,.45,d+.3,x,10.25,z,0x4a5558,.9);for(let i=-1;i<=1;i++){box(9,4.2,.12,x+i*10,3.8,z+d/2+.08,0x1f3037,.22);box(9,.25,.2,x+i*10,6.3,z+d/2+.16,nameColor,.3)}box(Math.min(16,w*.55),2,.18,x,7.8,z+d/2+.1,0x25333a,.35)}
shop(-75,150,48,22,0xb56c4d,0xe1b64e);shop(75,-150,48,22,0x4f8196,0xe1b64e);shop(-225,150,48,22,0xc0a05d,0x477e8c);shop(225,-150,48,22,0x8d6b83,0xe1b64e);

// Parks, lawns, benches and trees
function tree(x,z,s=1){
 box(.9*s,3.2*s,.9*s,x,1.6*s,z,0x765038,.96);
 const crown=new THREE.Mesh(new THREE.SphereGeometry(2.8*s,18,14),mat(0x4d8051,.96));crown.position.set(x,4.7*s,z);crown.castShadow=true;scene.add(crown);
}
function park(x,z,w,d){
 box(w,.18,d,x,.11,z,0x527c50,.98);
 box(w-8,.08,d-8,x,.22,z,0x6f9360,.98);
 for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++)tree(x+i*(w*.32),z+j*(d*.30),.75);
 for(let i=-1;i<=1;i++){box(4,.35,.65,x+i*12,.45,z+7,0x725f4d,.8)}
}
park(-75,75,55,52);park(225,75,55,52);park(-225,-75,55,52);

function streetLamp(x,z){box(.14,7,.14,x,3.5,z,0x22292c,.42);box(2.1,.10,.10,x+(x>0?-.7:.7),6.75,z,0x22292c,.42);const q=new THREE.Mesh(new THREE.SphereGeometry(.28,10,8),new THREE.MeshBasicMaterial({color:0xffe8b0}));q.position.set(x+(x>0?-.7:.7),6.55,z);scene.add(q)}
for(let x=-330;x<=330;x+=30){[-162,162,-12,12].forEach(z=>streetLamp(x,z))}
for(let z=-330;z<=330;z+=30){[-162,162,-12,12].forEach(x=>streetLamp(x,z))}

// Traffic lights at the central intersections
function traffic(x,z,rot=0){const g=new THREE.Group();const p=new THREE.Mesh(new THREE.BoxGeometry(.18,6,.18),mat(0x22282b,.45));p.position.y=3;g.add(p);const head=new THREE.Mesh(new THREE.BoxGeometry(.75,2.2,.45),mat(0x161b1e,.4));head.position.y=5.6;g.add(head);[0x55d66f,0xffcf45,0xff4b3e].forEach((c,i)=>{const q=new THREE.Mesh(new THREE.SphereGeometry(.16,10,8),new THREE.MeshBasicMaterial({color:c}));q.position.set(0,5.0+i*.55,.25);g.add(q)});g.position.set(x,0,z);g.rotation.y=rot;scene.add(g)}
traffic(13,13,0);traffic(-13,-13,Math.PI);

// Cars with proper bodies, glass and wheels
const cars=[];
function car(x,z,c,axis,dir,speed){
 const g=new THREE.Group();
 const body=new THREE.Mesh(new THREE.BoxGeometry(4.4,1.0,7.4),mat(c,.48));body.position.y=1.0;body.castShadow=true;g.add(body);
 const cabin=new THREE.Mesh(new THREE.BoxGeometry(3.45,1.15,3.35),mat(0x263b45,.18,.05));cabin.position.set(0,1.85,-.25);cabin.castShadow=true;g.add(cabin);
 const windshield=new THREE.Mesh(new THREE.BoxGeometry(3.05,.68,.10),mat(0x6c9caf,.12,.08));windshield.position.set(0,2.0,1.45);g.add(windshield);
 for(const a of[-1,1])for(const b of[-1,1]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.62,.62,.48,18),mat(0x15191b,.6));w.rotation.z=Math.PI/2;w.position.set(a*2.05,.62,b*2.35);w.castShadow=true;g.add(w)}
 g.position.set(x,0,z);g.rotation.y=axis==='x'?(dir>0?0:Math.PI):(dir>0?Math.PI/2:-Math.PI/2);scene.add(g);cars.push({g,axis,dir,speed});
}
car(-350,7,0xb83d3d,'x',1,10);car(350,-7,0x315f9b,'x',-1,8);car(7,-350,0xd7a42e,'z',1,9);car(-7,350,0x3d8254,'z',-1,7);car(-350,-150,0x6d6f75,'x',1,6);car(350,150,0xf0f0ed,'x',-1,7);

// Pedestrians with better proportions
function person(x,z,c,scale=1){const g=new THREE.Group();const skin=mat(0xc98f69,.82),cloth=mat(c,.72),dark=mat(0x273039,.8);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.58*scale,18,14),skin);head.position.y=2.65*scale;g.add(head);
 const hair=new THREE.Mesh(new THREE.SphereGeometry(.60*scale,18,8,0,Math.PI*2,0,Math.PI*.42),mat(0x2b241f,.9));hair.position.y=2.9*scale;g.add(hair);
 const torso=new THREE.Mesh(new THREE.BoxGeometry(1.05*scale,1.45*scale,.62*scale),cloth);torso.position.y=1.55*scale;g.add(torso);
 for(const s of[-.38,.38]){const arm=new THREE.Mesh(new THREE.BoxGeometry(.25*scale,1.25*scale,.25*scale),skin);arm.position.set(s*scale,1.58*scale,0);g.add(arm)}
 for(const s of[-.22,.22]){const leg=new THREE.Mesh(new THREE.BoxGeometry(.32*scale,1.25*scale,.36*scale),dark);leg.position.set(s*scale,.35*scale,0);g.add(leg)}
 g.position.set(x,0,z);g.traverse(o=>{if(o.isMesh)o.castShadow=true});scene.add(g);return g}
const peds=[[-18,42,0x356ea2,1], [24,42,0x9c4d3d,.95], [42,-18,0x5e854a,1],[-42,-18,0xd19a3e,.9],[30,160,0x7951a0,.95],[-30,-160,0x397f7e,1],[-162,32,0x6f5c48,.9],[162,-32,0xb34f55,1]];const pedestrians=peds.map(a=>person(...a));

// Player
const player=new THREE.Group();
const skin=mat(0xc98f69,.82),shirt=mat(0x1f6fae,.7),pants=mat(0x202831,.75);
let head=new THREE.Mesh(new THREE.SphereGeometry(.72,20,16),skin);head.position.y=3.0;player.add(head);
let hair=new THREE.Mesh(new THREE.SphereGeometry(.75,20,10,0,Math.PI*2,0,Math.PI*.45),mat(0x29221e,.9));hair.position.y=3.32;player.add(hair);
let torso=new THREE.Mesh(new THREE.BoxGeometry(1.35,1.7,.72),shirt);torso.position.y=1.68;player.add(torso);
for(const s of[-.76,.76]){let a=new THREE.Mesh(new THREE.BoxGeometry(.30,1.45,.34),skin);a.position.set(s,1.72,0);player.add(a)}
for(const s of[-.34,.34]){let l=new THREE.Mesh(new THREE.BoxGeometry(.43,1.55,.43),pants);l.position.set(s,.45,0);player.add(l)}
player.position.set(0,0,38);player.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});scene.add(player);

const keys={};let yaw=0,pitch=.20;addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if(e.key.startsWith('Arrow')||e.key===' ')e.preventDefault()});addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
let dragging=false,lastX=0,lastY=0;renderer.domElement.addEventListener('mousedown',e=>{dragging=true;lastX=e.clientX;lastY=e.clientY});addEventListener('mouseup',()=>dragging=false);addEventListener('mousemove',e=>{if(!dragging)return;yaw-=(e.clientX-lastX)*.005;pitch=THREE.MathUtils.clamp(pitch-(e.clientY-lastY)*.003,-.15,.65);lastX=e.clientX;lastY=e.clientY});
function move(dt){let x=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0);let z=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);if(!x&&!z)return;const n=Math.hypot(x,z);x/=n;z/=n;const sp=keys.shift?12:6.2;const sy=Math.sin(yaw),cy=Math.cos(yaw);const wx=x*cy+z*sy,wz=-x*sy+z*cy;const nx=player.position.x+wx*sp*dt,nz=player.position.z+wz*sp*dt;if(!blocked(nx,player.position.z,.75))player.position.x=THREE.MathUtils.clamp(nx,-365,365);if(!blocked(player.position.x,nz,.75))player.position.z=THREE.MathUtils.clamp(nz,-365,365);player.rotation.y=Math.atan2(wx,wz)}
function updateCars(dt){for(const a of cars){if(a.axis==='x')a.g.position.x+=a.dir*a.speed*dt;else a.g.position.z+=a.dir*a.speed*dt;if(a.g.position.x>390)a.g.position.x=-390;if(a.g.position.x<-390)a.g.position.x=390;if(a.g.position.z>390)a.g.position.z=-390;if(a.g.position.z<-390)a.g.position.z=390}}
let minutes=8*60;const clock=new THREE.Clock();function loop(){requestAnimationFrame(loop);const dt=Math.min(clock.getDelta(),.033);move(dt);updateCars(dt);minutes=(minutes+dt*.7)%1440;time.textContent=String(Math.floor(minutes/60)).padStart(2,'0')+':'+String(Math.floor(minutes%60)).padStart(2,'0');const dist=10;const target=new THREE.Vector3(player.position.x+Math.sin(yaw)*dist,5.4+pitch*3,player.position.z+Math.cos(yaw)*dist);camera.position.lerp(target,1-Math.pow(.0008,dt));camera.lookAt(player.position.x,1.7,player.position.z);renderer.render(scene,camera)}loop();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
help.onclick=()=>modal.style.display='block';close.onclick=()=>modal.style.display='none';
