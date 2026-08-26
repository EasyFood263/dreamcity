(()=>{
'use strict';
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x8fc8e8);
scene.fog=new THREE.Fog(0x8fc8e8,180,850);
const camera=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,.1,1400);
const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
document.getElementById('game').appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xdff5ff,0x38513d,1.55));
const sun=new THREE.DirectionalLight(0xffe8c2,2.25);sun.position.set(-180,260,150);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-420;sun.shadow.camera.right=420;sun.shadow.camera.top=420;sun.shadow.camera.bottom=-420;scene.add(sun);
const C={road:0x343a3e,edge:0x242a2e,side:0xc8c2b7,grass:0x4e8053,grass2:0x5d9160,white:0xf5f0df,yellow:0xf2c84b,cream:0xe6d5b8,brick:0xa95e50,stone:0x9ca5a8,blue:0x527eaa,blue2:0x385f84,glass:0x3e7486,glassLight:0x7fb5c2,frame:0xd7d1c7,dark:0x22282c,green:0x39764b,wood:0x704b34,skin:0xb97955,hair:0x29231f,black:0x202427,red:0xb8423b,light:0xffe8a6,whiteCar:0xe7e2d8};
const M={};Object.keys(C).forEach(k=>M[k]=new THREE.MeshStandardMaterial({color:C[k],roughness:.72}));
function box(parent,w,h,d,mat,x,y,z,cast=true){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);o.position.set(x,y,z);o.castShadow=cast;o.receiveShadow=true;parent.add(o);return o}
function cyl(parent,r,h,mat,x,y,z,segments=18){const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,segments),mat);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
function ground(w,d,mat){const o=new THREE.Mesh(new THREE.PlaneGeometry(w,d),mat);o.rotation.x=-Math.PI/2;o.receiveShadow=true;scene.add(o)}
ground(1100,1100,M.grass);
function road(x,z,w,d){box(scene,w,.16,d,M.road,x,.02,z);box(scene,w+.5,.04,d+.5,M.edge,x,-.02,z,false);if(w>d){for(let a=-w/2+7;a<w/2;a+=14)box(scene,5,.035,.12,M.yellow,x+a,.11,z,false)}else{for(let a=-d/2+7;a<d/2;a+=14)box(scene,.12,.035,5,M.yellow,x,.11,z+a,false)}}
function sidewalk(x,z,w,d){box(scene,w,.24,d,M.side,x,.10,z)}
road(0,0,44,1050);road(0,0,1050,44);road(-210,0,28,1050);road(210,0,28,1050);road(0,-210,1050,28);road(0,210,1050,28);road(-105,0,26,1050);road(105,0,26,1050);road(0,-105,1050,26);road(0,105,1050,26);
sidewalk(-30,0,10,1050);sidewalk(30,0,10,1050);sidewalk(0,-30,1050,10);sidewalk(0,30,1050,10);sidewalk(-201,0,6,1050);sidewalk(201,0,6,1050);sidewalk(0,-201,1050,6);sidewalk(0,201,1050,6);sidewalk(-98,0,6,1050);sidewalk(98,0,6,1050);sidewalk(0,-98,1050,6);sidewalk(0,98,1050,6);
function crosswalk(x,z,vertical){for(let i=-12;i<=12;i+=3.4){if(vertical)box(scene,1.15,.035,2.2,M.white,x+i,.14,z,false);else box(scene,2.2,.035,1.15,M.white,x,.14,z+i,false)}}
[-105,0,105].forEach(p=>{crosswalk(p,23,false);crosswalk(p,-23,false);crosswalk(23,p,true);crosswalk(-23,p,true)});
function tree(x,z,s=.6){const g=new THREE.Group();g.position.set(x,0,z);cyl(g,.26*s,2.9*s,M.wood,0,1.45*s,0,16);const crown=new THREE.Mesh(new THREE.SphereGeometry(1.45*s,14,10),M.green);crown.position.y=3.25*s;crown.scale.y=.92;crown.castShadow=true;g.add(crown);scene.add(g)}
function lamp(x,z,rot=0){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;cyl(g,.065,5.8,M.dark,0,2.9,0,12);box(g,1,.08,.08,M.dark,.5,5.62,0);cyl(g,.19,.16,M.light,.9,5.54,0,16);scene.add(g)}
for(let i=-480;i<=480;i+=36){tree(i,-39,.62);tree(i,39,.62);tree(-39,i,.62);tree(39,i,.62);lamp(i,-32);lamp(i,32);lamp(-32,i,Math.PI/2);lamp(32,i,Math.PI/2)}
function park(x,z,w,d){const g=new THREE.Group();g.position.set(x,0,z);box(g,w,.14,d,M.grass2,0,.02,0);for(let i=-w/2+10;i<w/2-5;i+=19){tree(x+i,z-d/2+8,.58);tree(x+i,z+d/2-8,.58)}for(let i=-d/2+12;i<d/2-8;i+=21){tree(x-w/2+8,z+i,.55);tree(x+w/2-8,z+i,.55)}box(g,w-18,.06,2.2,M.side,0,.12,-d/2+6);box(g,w-18,.06,2.2,M.side,0,.12,d/2-6);scene.add(g)}
park(-155,-155,78,72);park(155,-155,84,72);park(-155,155,84,72);park(155,155,78,72);
function win(parent,x,y,z,w=2.7,h=1.7,rot=0){const o=box(parent,w,h,.12,M.glass,x,y,z);o.rotation.y=rot;box(parent,.08,h+.15,.13,M.frame,x-Math.cos(rot)*w/2,y,z-Math.sin(rot)*w/2);box(parent,.08,h+.15,.13,M.frame,x+Math.cos(rot)*w/2,y,z+Math.sin(rot)*w/2)}
function building(x,z,w,d,floors,color,balcony){const g=new THREE.Group();g.position.set(x,0,z);const h=floors*4;box(g,w,h,d,M[color],0,h/2,0);box(g,w+.8,.32,d+.8,M.dark,0,h+.16,0);for(let f=0;f<floors;f++){const y=2.05+f*4;for(let px=-w/2+4;px<=w/2-4;px+=5.4){win(g,px,y,d/2+.08,2.65,1.62);win(g,px,y,-d/2-.08,2.65,1.62)}for(let pz=-d/2+4;pz<=d/2-4;pz+=5.4){win(g,w/2+.08,y,pz,1.62,2.65,Math.PI/2);win(g,-w/2-.08,y,pz,1.62,2.65,Math.PI/2)}}box(g,10,.3,5,M.side,0,.16,d/2+2.5);box(g,3,3.3,.18,M.dark,-1.6,1.72,d/2+.11);box(g,3,3.3,.18,M.glassLight,1.6,1.72,d/2+.12);box(g,9,.18,2.8,M.side,0,.3,d/2+1.2);if(balcony){for(let f=1;f<floors;f+=2){const y=f*4+.85;for(let px=-w/2+6;px<w/2-4;px+=12){box(g,7,.12,1.25,M.side,px,y,d/2+1);box(g,7,.7,.08,M.dark,px,y+.42,d/2+1.56)}}}scene.add(g)}
const lots=[[-155,-70,34,48,8,'cream'],[-65,-155,44,34,6,'stone'],[65,-155,38,48,9,'blue'],[155,-70,46,34,7,'cream'],[-155,70,46,34,7,'brick'],[-70,155,38,48,8,'stone'],[70,155,44,34,6,'cream'],[155,70,34,48,9,'blue'],[-300,-105,48,38,6,'cream'],[300,-105,48,38,8,'stone'],[-300,105,48,38,7,'blue'],[300,105,48,38,7,'brick']];
lots.forEach(a=>building(a[0],a[1],a[2],a[3],a[4],a[5],a[4]>7));
function shop(x,z,color){const g=new THREE.Group();g.position.set(x,0,z);const w=38,d=28,h=7;box(g,w,h,d,M[color],0,h/2,0);box(g,w+.6,.3,d+.6,M.dark,0,h+.15,0);box(g,w*.82,3.5,.16,M.glassLight,0,2.25,d/2+.12);box(g,w*.84,.7,.18,M.red,0,4.55,d/2+.18);for(let i=-w*.3;i<=w*.3;i+=8)box(g,.09,3.3,.12,M.frame,i,2.25,d/2+.22);box(g,7,3.5,.2,M.dark,0,2.25,d/2+.2);scene.add(g)}
shop(-65,-65,'brick');shop(65,-65,'blue');shop(-65,65,'cream');shop(65,65,'stone');
function car(x,z,rot,color){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;box(g,4,.75,7,M[color],0,.82,0);box(g,2.9,.95,3.1,M[color],0,1.5,-.2);box(g,2.55,.68,2.75,M.glassLight,0,1.55,-.2);for(const xx of[-1.65,1.65])for(const zz of[-2.25,2.25]){const w=cyl(g,.42,.28,M.black,xx,.48,zz,18);w.rotation.z=Math.PI/2}box(g,1,.16,.12,M.light,-1,.93,3.52);box(g,1,.16,.12,M.red,1,.93,-3.52);scene.add(g);return g}
const traffic=[car(-10,-140,0,'blue'),car(16,140,Math.PI,'red'),car(-140,12,Math.PI/2,'whiteCar'),car(140,-16,-Math.PI/2,'black'),car(265,18,Math.PI/2,'whiteCar'),car(-265,-18,-Math.PI/2,'red')];
function person(x,z,s,shirt){const g=new THREE.Group();g.position.set(x,0,z);cyl(g,.42*s,1.05*s,M.skin,0,2.35*s,0,18);cyl(g,.45*s,.28,M.hair,0,2.93*s,0,18);box(g,.86*s,1.25*s,.48*s,M[shirt]||M.blue,0,1.45*s,0);box(g,.2*s,1.25*s,.2*s,M.skin,-.62*s,1.48*s,0);box(g,.2*s,1.25*s,.2*s,M.skin,.62*s,1.48*s,0);box(g,.28*s,1.25*s,.28*s,M.dark,-.22*s,.45*s,0);box(g,.28*s,1.25*s,.28*s,M.dark,.22*s,.45*s,0);scene.add(g);return g}
const people=[person(-18,-18,.95,'blue'),person(18,18,.92,'red'),person(-18,18,.9,'cream'),person(18,-18,.96,'stone')];
const plaza=new THREE.Group();plaza.position.set(0,0,0);box(plaza,34,.18,34,M.side,0,.05,0);box(plaza,18,.08,18,M.grass2,0,.17,0);for(let a=0;a<Math.PI*2;a+=Math.PI/2)tree(Math.cos(a)*10,Math.sin(a)*10,.55);box(plaza,8,1.1,8,M.blue2,0,.65,0);box(plaza,6,.25,6,M.glassLight,0,1.35,0);scene.add(plaza);
for(let x=-420;x<=420;x+=42){tree(x,-70,.48);tree(x,70,.48);tree(-70,x,.48);tree(70,x,.48)}
const player=person(0,55,.92,'blue');player.position.set(0,0,55);
const keys={};addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(e.key.toLowerCase()))e.preventDefault()},{passive:false});addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
let heading=Math.PI;
function move(){let dx=0,dz=0;if(keys.arrowup)dz-=1;if(keys.arrowdown)dz+=1;if(keys.arrowleft)dx-=1;if(keys.arrowright)dx+=1;if(dx||dz){const len=Math.hypot(dx,dz);dx/=len;dz/=len;const speed=keys.shift?0.42:.22;player.position.x+=dx*speed;player.position.z+=dz*speed;heading=Math.atan2(dx,dz);player.rotation.y=heading}}
function follow(){const distance=11,height=6.6;const target=new THREE.Vector3(player.position.x,2.2,player.position.z);const desired=new THREE.Vector3(player.position.x-Math.sin(heading)*distance,height,player.position.z-Math.cos(heading)*distance);camera.position.lerp(desired,.09);camera.lookAt(target)}
function clock(){const t=new Date();const e=document.getElementById('clock');if(e)e.textContent=t.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',hour12:false})}setInterval(clock,1000);clock();
const modal=document.getElementById('modal');document.getElementById('helpBtn').onclick=()=>modal.style.display='block';document.getElementById('close').onclick=()=>modal.style.display='none';
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
function animate(){requestAnimationFrame(animate);move();follow();renderer.render(scene,camera)}animate();
})();
