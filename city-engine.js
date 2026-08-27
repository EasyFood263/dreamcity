(()=>{
'use strict';

/* DreamCity Pakistan — City-only foundation
   Arrow keys: walk. Shift: run. No missions in this build. */
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x9bc9e3);
scene.fog=new THREE.Fog(0x9bc9e3,260,1050);

const camera=new THREE.PerspectiveCamera(60,innerWidth/innerHeight,.1,1800);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setSize(innerWidth,innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.shadowMap.autoUpdate=true;
renderer.outputEncoding=THREE.sRGBEncoding;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=.92;
document.getElementById('game').appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xeaf7ff,0x40523d,1.05));
const sun=new THREE.DirectionalLight(0xffe7c5,1.55);
sun.position.set(-220,360,180);
sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);
sun.shadow.camera.left=-520;sun.shadow.camera.right=520;
sun.shadow.camera.top=520;sun.shadow.camera.bottom=-520;
sun.shadow.camera.near=1;sun.shadow.camera.far=1000;
sun.shadow.bias=-.00015;sun.shadow.normalBias=.025;
scene.add(sun);

const C={
 grass:0x4f8054,grassDark:0x416d47,road:0x30363b,road2:0x383e43,
 sidewalk:0xc8c0b3,curb:0xaaa59d,white:0xf4f0df,yellow:0xf2c34e,
 concrete:0xb8b4ad,glass:0x75aebd,glassDark:0x3e6d7d,metal:0x454b50,
 cream:0xd7c4a7,sand:0xc79a70,brick:0x9b5145,blue:0x557ca2,blueDark:0x3e5f7e,
 green:0x477b4b,red:0x9e3f38,orange:0xb96d3e,whiteCar:0xe4e0d8,
 black:0x1e252a,skin:0xb87955,hair:0x2b241f,shirt:0x3d6f9c,
 sign:0x193246,light:0xffe9a8,door:0x30373b
};
const M={};for(const k in C)M[k]=new THREE.MeshStandardMaterial({color:C[k],roughness:.72,metalness:k==='metal'?.35:0});

function box(parent,w,h,d,mat,x,y,z,cast=true){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);o.position.set(x,y,z);o.castShadow=cast;o.receiveShadow=true;parent.add(o);return o}
function cyl(parent,r,h,mat,x,y,z,segments=20){const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,segments),mat);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
function sphere(parent,r,mat,x,y,z){const o=new THREE.Mesh(new THREE.SphereGeometry(r,18,12),mat);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
function ground(w,d,mat){const o=new THREE.Mesh(new THREE.PlaneGeometry(w,d),mat);o.rotation.x=-Math.PI/2;o.receiveShadow=true;scene.add(o);return o}

// City terrain
const terrain=ground(1500,1500,M.grass);

function road(x,z,w,d){
  box(scene,w,.14,d,M.road,x,.03,z,false);
  box(scene,w+.8,.05,d+.8,M.curb,x,-.045,z,false);
  const horizontal=w>d;
  const limit=(horizontal?w:d)/2-9;
  for(let a=-limit;a<=limit;a+=16){
    if(horizontal)box(scene,5,.025,.11,M.yellow,x+a,.115,z,false);
    else box(scene,.11,.025,5,M.yellow,x,.115,z+a,false);
  }
}
function sidewalk(x,z,w,d){box(scene,w,.20,d,M.sidewalk,x,.10,z,false)}

// Main boulevard grid
road(0,0,48,1160);road(0,0,1160,48);
road(-220,0,30,1160);road(220,0,30,1160);
road(0,-220,1160,30);road(0,220,1160,30);
road(-110,0,28,1160);road(110,0,28,1160);
road(0,-110,1160,28);road(0,110,1160,28);

sidewalk(-32,0,12,1160);sidewalk(32,0,12,1160);sidewalk(0,-32,1160,12);sidewalk(0,32,1160,12);
sidewalk(-202,0,7,1160);sidewalk(202,0,7,1160);sidewalk(0,-202,1160,7);sidewalk(0,202,1160,7);
sidewalk(-96,0,7,1160);sidewalk(96,0,7,1160);sidewalk(0,-96,1160,7);sidewalk(0,96,1160,7);

function crosswalk(x,z,vertical){for(let i=-13;i<=13;i+=3.4){if(vertical)box(scene,1.2,.035,2.4,M.white,x+i,.15,z,false);else box(scene,2.4,.035,1.2,M.white,x,.15,z+i,false)}}
[-110,0,110].forEach(p=>{crosswalk(p,27,false);crosswalk(p,-27,false);crosswalk(27,p,true);crosswalk(-27,p,true)});

// Street furniture
function tree(x,z,s=.7){const g=new THREE.Group();g.position.set(x,0,z);cyl(g,.28*s,2.8*s,M.sand,0,1.4*s,0,16);sphere(g,1.55*s,M.green,0,3.25*s,0);sphere(g,1.05*s,M.green,-.65*s,3.05*s,.15*s);scene.add(g);return g}
function lamp(x,z,rot=0){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;cyl(g,.065,6,M.metal,0,3,0,12);box(g,1.1,.08,.08,M.metal,.55,5.75,0);cyl(g,.20,.15,M.light,1.03,5.67,0,16);scene.add(g)}
for(let i=-500;i<=500;i+=38){tree(i,-42,.55);tree(i,42,.55);tree(-42,i,.55);tree(42,i,.55);lamp(i,-34);lamp(i,34);lamp(-34,i,Math.PI/2);lamp(34,i,Math.PI/2)}

function park(x,z,w,d){const g=new THREE.Group();g.position.set(x,0,z);box(g,w,.13,d,M.grassDark,0,.02,0,false);box(g,w-16,.10,d-16,M.grass,0,.10,0,false);for(let i=-w/2+10;i<w/2-6;i+=18){tree(x+i,z-d/2+8,.62);tree(x+i,z+d/2-8,.62)}for(let i=-d/2+12;i<d/2-8;i+=20){tree(x-w/2+8,z+i,.58);tree(x+w/2-8,z+i,.58)}box(g,w-18,.08,2.1,M.sidewalk,0,.17,-d/2+7,false);box(g,w-18,.08,2.1,M.sidewalk,0,.17,d/2-7,false);scene.add(g)}
park(-165,-165,86,78);park(165,-165,92,78);park(-165,165,92,78);park(165,165,86,78);

function windowUnit(g,x,y,z,w=2.7,h=1.65,rot=0){
  const frame=new THREE.Group();frame.position.set(x,y,z);frame.rotation.y=rot;
  box(frame,w,h,.13,M.glass,0,0,0,false);
  box(frame,.08,h+.16,.15,M.concrete,-w/2,0,0,false);box(frame,.08,h+.16,.15,M.concrete,w/2,0,0,false);
  box(frame,w+.12,.08,.15,M.concrete,0,h/2,0,false);box(frame,w+.12,.08,.15,M.concrete,0,-h/2,0,false);
  box(frame,.06,h,.16,M.concrete,0,0,.02,false);
  g.add(frame);
}
function balcony(g,x,y,z,w,rot=0){const b=new THREE.Group();b.position.set(x,y,z);b.rotation.y=rot;box(b,w,.10,1.45,M.concrete,0,0,0,false);box(b,w,.75,.08,M.metal,0,.40,.67,false);for(let i=-w/2+.3;i<=w/2-.3;i+=.8)box(b,.045,.72,.045,M.metal,i,.38,.67,false);g.add(b)}
function signPanel(g,textColor,x,y,z,w,h){box(g,w,h,.12,M.sign,x,y,z,false);}
function building(x,z,w,d,floors,matKey,balconies=true){
  const g=new THREE.Group();g.position.set(x,0,z);const h=floors*4.1;
  box(g,w,h,d,M[matKey],0,h/2,0);
  // roof parapet and rooftop utility
  box(g,w+.7,.30,d+.7,M.metal,0,h+.15,0);
  box(g,5,1.2,4,M.concrete,0,h+.72,0);
  box(g,2.2,.8,1.8,M.metal,0,h+1.7,0);
  // facade windows
  for(let f=0;f<floors;f++){
    const y=2.05+f*4.1;
    for(let px=-w/2+4;px<=w/2-4;px+=5.3){windowUnit(g,px,y,d/2+.08,2.55,1.58);windowUnit(g,px,y,-d/2-.08,2.55,1.58)}
    for(let pz=-d/2+4;pz<=d/2-4;pz+=5.3){windowUnit(g,w/2+.08,y,pz,1.58,2.55,Math.PI/2);windowUnit(g,-w/2-.08,y,pz,1.58,2.55,Math.PI/2)}
    if(balconies && f>0 && f%2===1){for(let px=-w/2+6;px<w/2-4;px+=12)balcony(g,px,y-1.0,d/2+.75,7)}
  }
  // proper entrance canopy, doors and lobby glass
  box(g,12,.28,4.5,M.concrete,0,.16,d/2+2.35,false);
  box(g,4,3.45,.18,M.door,-2.1,1.72,d/2+.12,false);
  box(g,4,3.45,.18,M.glass,2.1,1.72,d/2+.13,false);
  box(g,.08,3.2,.20,M.metal,0,1.72,d/2+.22,false);
  box(g,9,.25,.18,M.sign,0,3.75,d/2+.16,false);
  // ground-floor side storefront bays
  for(let px=-w/2+7;px<w/2-5;px+=12)box(g,7,3.1,.14,M.glassDark,px,1.65,d/2+.11,false);
  scene.add(g);return g;
}

const lots=[
 [-165,-78,42,50,8,'cream'],[-70,-165,48,38,6,'concrete'],[70,-165,42,50,9,'blue'],[165,-78,50,38,7,'sand'],
 [-165,78,50,38,7,'brick'],[-70,165,42,50,8,'concrete'],[70,165,48,38,6,'cream'],[165,78,42,50,9,'blue'],
 [-315,-115,52,42,7,'cream'],[315,-115,52,42,8,'concrete'],[-315,115,52,42,7,'blue'],[315,115,52,42,7,'brick'],
 [-315,-300,46,38,5,'sand'],[315,-300,46,38,6,'cream'],[-315,300,46,38,6,'brick'],[315,300,46,38,5,'blue']
];
lots.forEach(a=>building(...a,true));

function shop(x,z,matKey,accent){
 const g=new THREE.Group();g.position.set(x,0,z);const w=42,d=30,h=7;
 box(g,w,h,d,M[matKey],0,h/2,0);box(g,w+.7,.3,d+.7,M.metal,0,h+.15,0);
 box(g,w*.88,3.4,.16,M.glass,0,2.25,d/2+.12,false);
 box(g,w*.9,.72,.2,M[accent],0,4.65,d/2+.18,false);
 for(let i=-w*.36;i<=w*.36;i+=8)box(g,.10,3.25,.15,M.concrete,i,2.25,d/2+.21,false);
 box(g,6.5,3.4,.2,M.door,0,2.25,d/2+.22,false);
 box(g,20,.22,.12,M.sign,0,5.35,d/2+.22,false);
 scene.add(g);
}
shop(-70,-70,'brick','red');shop(70,-70,'blue','yellow');shop(-70,70,'cream','red');shop(70,70,'concrete','blueDark');

// Central civic plaza
const plaza=new THREE.Group();plaza.position.set(0,0,0);box(plaza,38,.20,38,M.sidewalk,0,.05,0,false);box(plaza,25,.10,25,M.grass,0,.17,0,false);box(plaza,12,1.0,12,M.blueDark,0,.65,0);box(plaza,10,.18,10,M.glass,0,1.25,0,false);for(let a=0;a<Math.PI*2;a+=Math.PI/2)tree(Math.cos(a)*12,Math.sin(a)*12,.55);scene.add(plaza);

function car(x,z,rot,matKey){
 const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;
 box(g,4.3,.75,7.2,M[matKey],0,.82,0);
 box(g,3.25,.95,3.3,M[matKey],0,1.5,-.25);
 box(g,2.8,.68,2.9,M.glassDark,0,1.55,-.25,false);
 for(const xx of[-1.72,1.72])for(const zz of[-2.35,2.35]){const w=cyl(g,.43,.28,M.black,xx,.48,zz,18);w.rotation.z=Math.PI/2}
 box(g,1.0,.14,.12,M.light,-1.05,.98,3.62,false);box(g,1.0,.14,.12,M.red,1.05,.98,-3.62,false);
 scene.add(g);return g;
}
const traffic=[car(-11,-150,0,'blue'),car(15,150,Math.PI,'red'),car(-150,12,Math.PI/2,'whiteCar'),car(150,-15,-Math.PI/2,'black'),car(280,18,Math.PI/2,'whiteCar'),car(-280,-18,-Math.PI/2,'red'),car(-120,220,Math.PI,'cream')];

function person(x,z,s,shirt,hair=0){
 const g=new THREE.Group();g.position.set(x,0,z);
 cyl(g,.42*s,1.05*s,M.skin,0,2.30*s,0,18);
 cyl(g,.45*s,.28,hair?M.black:M.hair,0,2.88*s,0,18);
 box(g,.86*s,1.25*s,.48*s,M[shirt]||M.shirt,0,1.45*s,0);
 box(g,.19*s,1.20*s,.19*s,M.skin,-.60*s,1.48*s,0);box(g,.19*s,1.20*s,.19*s,M.skin,.60*s,1.48*s,0);
 box(g,.28*s,1.22*s,.28*s,M.black,-.22*s,.46*s,0);box(g,.28*s,1.22*s,.28*s,M.black,.22*s,.46*s,0);
 scene.add(g);return g;
}
const people=[person(-18,-18,.95,'shirt'),person(18,18,.92,'red',1),person(-18,18,.9,'cream'),person(18,-18,.96,'blue',1),person(-46,46,.88,'red'),person(46,-46,.92,'cream')];

// Decorative roadside planters and benches
function bench(x,z,rot=0){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;box(g,3.2,.18,.55,M.wood,0,1.0,0);box(g,.16,1,.55,M.metal,-1.15,.5,0);box(g,.16,1,.55,M.metal,1.15,.5,0);box(g,3.2,.65,.12,M.wood,0,1.35,-.22);scene.add(g)}
bench(-150,-130);bench(150,-130,Math.PI);bench(-150,130);bench(150,130,Math.PI);

// Player
const player=person(0,55,.95,'shirt');
let heading=Math.PI;
const keys={};
addEventListener('keydown',e=>{const k=e.key.toLowerCase();keys[k]=true;if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault()},{passive:false});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);

function move(){
 let dx=0,dz=0;if(keys.arrowup)dz-=1;if(keys.arrowdown)dz+=1;if(keys.arrowleft)dx-=1;if(keys.arrowright)dx+=1;
 if(!(dx||dz))return;
 const len=Math.hypot(dx,dz);dx/=len;dz/=len;const speed=keys.shift?.52:.27;
 const nx=player.position.x+dx*speed,nz=player.position.z+dz*speed;
 // Keep the player on the playable city map.
 if(Math.abs(nx)<555)player.position.x=nx;if(Math.abs(nz)<555)player.position.z=nz;
 heading=Math.atan2(dx,dz);player.rotation.y=heading;
}
function follow(){
 const distance=12.5,height=6.7;
 const target=new THREE.Vector3(player.position.x,2.2,player.position.z);
 const desired=new THREE.Vector3(player.position.x-Math.sin(heading)*distance,height,player.position.z-Math.cos(heading)*distance);
 camera.position.lerp(desired,.10);camera.lookAt(target);
}

function updateClock(){const e=document.getElementById('clock');if(e)e.textContent=new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',hour12:false})}
setInterval(updateClock,1000);updateClock();
const modal=document.getElementById('modal');
if(modal){document.getElementById('helpBtn').onclick=()=>modal.style.display='block';document.getElementById('close').onclick=()=>modal.style.display='none'}
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});

camera.position.set(0,6.7,67.5);
camera.lookAt(new THREE.Vector3(0,2.2,55));
function animate(){requestAnimationFrame(animate);move();follow();renderer.render(scene,camera)}
animate();
})();
