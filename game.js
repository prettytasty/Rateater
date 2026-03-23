'use strict';

// ============================================================
// RAT MODEL
// ============================================================
let ratGltfScene=null;
let ratModelReady=false;
const gltfLoader=new THREE.GLTFLoader();
gltfLoader.load('model/thickrat.glb',function(gltf){ratGltfScene=gltf.scene;ratGltfScene.scale.set(0.18,0.18,0.18);ratGltfScene.traverse(c=>{if(c.isMesh){c.castShadow=true;c.receiveShadow=true;c.userData.origMat=c.material.clone();}});ratModelReady=true;document.getElementById('loadscreen').classList.add('hidden');document.getElementById('tut').style.display='flex';console.log('Rat model loaded!');},function(xhr){const pct=xhr.total>0?(xhr.loaded/xhr.total*100):50;document.getElementById('loadfill').style.width=pct+'%';},function(err){console.warn('GLB load failed,using fallback procedural rat:',err);ratModelReady=false;document.getElementById('loadscreen').classList.add('hidden');document.getElementById('tut').style.display='flex';});



// ============================================================
// SHOTGUN MODEL
// ============================================================
let shotgunGltfScene=null;
let shotgunModelReady=false;

// RayGun loader
let rayGunGltfScene=null, rayGunModelReady=false;
const rayGunLoader=new THREE.GLTFLoader();
rayGunLoader.load('model/RayGun.glb',function(gltf){
  rayGunGltfScene=gltf.scene;
  rayGunGltfScene.traverse(c=>{if(c.isMesh){c.castShadow=true;}});
  rayGunModelReady=true;
  console.log('RayGun.glb loaded!');
  // Rebuild vmRayGun only after it has been declared
  if(vmRayGun){
    const wasVisible=vmRayGun.visible;
    gunScene.remove(vmRayGun);
    vmRayGun=mkVmRayGun();
    vmRayGun.visible=wasVisible;
    vmRayGun.position.set(0.22,-0.18,-0.35);
    vmRayGun.rotation.set(0, Math.PI, 0);
    vmRayGun.scale.set(1,1,1);
    gunScene.add(vmRayGun);
  }
},undefined,function(e){console.warn('RayGun.glb failed:',e);});

// Declare all "built" flags up front so async loaders can reference them safely
let vmShotgunBuilt=false;
let vmRayGunBuilt=false;
let vmPanBuilt=false;
let vmRatBuilt=false;
const shotgunGltfLoader=new THREE.GLTFLoader();
shotgunGltfLoader.load('model/shotgun.glb',function(gltf){
  shotgunGltfScene=gltf.scene;
  shotgunGltfScene.traverse(c=>{if(c.isMesh){c.castShadow=true;c.receiveShadow=true;}});
  shotgunModelReady=true;
  console.log('Shotgun model loaded!');
  if(typeof rebuildVmShotgun === 'function') rebuildVmShotgun();
},function(xhr){},function(err){
  console.warn('shotgun.glb load failed, using procedural fallback:',err);
  shotgunModelReady=false;
});

function mkRat(){if(ratModelReady&&ratGltfScene){const clone=ratGltfScene.clone(true);clone.traverse(c=>{if(c.isMesh){c.material=c.material.clone();c.castShadow=true;c.receiveShadow=true;}});return clone;}return mkRatProcedural();}
function mkRatProcedural(){const g=new THREE.Group();const body=new THREE.Mesh(new THREE.SphereGeometry(0.22,14,10),lm(0x5C4033));body.scale.set(1.52,0.85,1.06);body.castShadow=true;g.add(body);const head=sp(0.155,lm(0x5C4033));head.position.set(0.3,0.05,0);g.add(head);const snout=new THREE.Mesh(new THREE.SphereGeometry(0.08,10,7),lm(0x6B4E3D));snout.scale.set(1.4,0.9,1.1);snout.position.set(0.42,0.02,0);g.add(snout);[0.1,-0.1].forEach(z=>{const ear=new THREE.Mesh(new THREE.SphereGeometry(0.068,10,7),lm(0x7A5C52));ear.position.set(0.24,0.2,z);g.add(ear);const earI=new THREE.Mesh(new THREE.SphereGeometry(0.042,8,6),lm(0xFF7070));earI.position.set(0.245,0.2,z);g.add(earI);});[0.09,-0.09].forEach(z=>{const eye=sp(0.034,lm(0xFF2222,0x880000,1.4));eye.position.set(0.43,0.1,z);g.add(eye);const shine=sp(0.015,lm(0xFFFFFF,0xFFFFFF,1));shine.position.set(0.445,0.115,z+0.025);g.add(shine);});const nose=new THREE.Mesh(new THREE.SphereGeometry(0.03,8,6),lm(0xFF6666));nose.position.set(0.49,0.04,0);g.add(nose);[-0.03,0.03].forEach(z=>{const w=bx(0.12,0.005,0.005,lm(0xDDD8C8));w.position.set(0.49,0.04,z);g.add(w);});const tailPts=[];for(let i=0;i<=12;i++){const t=i/12;tailPts.push(new THREE.Vector3(-0.3-t*0.55,Math.sin(t*Math.PI*1.5)*0.18,Math.cos(t*Math.PI)*0.06));}g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(tailPts),new THREE.LineBasicMaterial({color:0xC08080})));return g;}

function applyRatCookColor(ratMesh,cookColor){ratMesh.traverse(c=>{if(c.isMesh&&c.material&&c.material.color){c.material.color.copy(cookColor);}});}

const canvas=document.getElementById('main');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,logarithmicDepthBuffer:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=false;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));});
const scene=new THREE.Scene();scene.background=new THREE.Color(0x888888);scene.fog=new THREE.FogExp2(0xAAAAAA,0.016);
const camera=new THREE.PerspectiveCamera(72,innerWidth/innerHeight,0.05,200);
const keys={}; window.keys=keys;
let gameRunning=false; window.gameRunning=false;
let playerName='RAT';
let playerColor = 0x1A6FD4;
// Chat stubs — overwritten by the chat IIFE at the bottom of the file
window._chatOpen = ()=> false;
window._openChat = ()=> {};
function onKeyDown(e){
  if(e.code==='KeyY' && gameRunning && !window._chatOpen()){e.preventDefault();e.stopPropagation();window._openChat();return;}
  if(window._chatOpen()){e.stopPropagation();return;}
  if(!gameRunning)return;const gk=['KeyW','KeyA','KeyS','KeyD','KeyE','KeyF','KeyG','KeyR','Space','ShiftLeft','ShiftRight','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyV'];if(gk.includes(e.code)){e.preventDefault();e.stopPropagation();}keys[e.code]=true;if(e.code==='KeyE')tryInteract();if(e.code==='KeyF')tryGrill();if(e.code==='KeyR'){reloadGun();reloadShotgun();}if(e.code==='KeyQ'){
  if(carriedItem){placeCarried();}
  else{
    if(heldItem==='rat'){dropRat();}
    else if(heldItem==='kebab'||heldItem==='fkebab'){dropKebab();}
    else if(heldItem==='bread'||heldItem==='grilledbread'){dropBread();}
    else{dropExtinguisher();dropGun();dropShotgun();dropRayGun();dropPan();}
  }
}
if(e.code==='KeyV'){freeCam=!freeCam;if(freeCam){fcPos.copy(camera.position);fcYaw=yaw;fcPitch=pitch;}showMsg(freeCam?'FREECAM ON — WASD+Space/Shift to fly':'FREECAM OFF',1500);}}
function onKeyUp(e){keys[e.code]=false;}
window.addEventListener('keydown',onKeyDown,{capture:true});window.addEventListener('keyup',onKeyUp);
const _startbtn=document.getElementById('startbtn');if(_startbtn)_startbtn.addEventListener('click',()=>{
  const el=document.getElementById('nameinput');const n=el?el.value.trim().toUpperCase():'';playerName=n||'RAT';
  startGame();
});
// creditsmodal removed (credits now in title screen panel)
document.getElementById('replaybtn').addEventListener('click',resetGame);

// ── PAUSE SCREEN BUTTONS ─────────────────────────────────────────────
document.getElementById('pauseResumeBtn').addEventListener('click',()=>{
  document.getElementById('pauseScreen').style.display='none';
  canvas.requestPointerLock();
});
document.getElementById('pauseMenuBtn').addEventListener('click',()=>{
  document.getElementById('pauseScreen').style.display='none';
  gameRunning=false;
  // Stop MP connection
  if(window.mpSocket&&window.mpConnected){ window.mpSocket.disconnect(); }
  // Reset to main menu
  document.getElementById('hud').classList.remove('on');
  document.getElementById('go').classList.remove('on');
  document.getElementById('tut').style.display='flex';
  if(document.pointerLockElement===canvas) document.exitPointerLock();
});
document.getElementById('dropext').addEventListener('click',dropExtinguisher);
let yaw=Math.PI,pitch=0;const SENS=0.002;let pointerLocked=false;
window.__game=window.__game||{};
function requestLock(){canvas.requestPointerLock();}
canvas.addEventListener('click',e=>{if(!pointerLocked){requestLock();return;}if(!gameRunning)return;if(heldItem==='gun')shootGun();else if(heldItem==='shotgun')shootShotgun();else if(heldItem==='raygun')shootRayGun();else if(heldItem==='pan')swingPan();else if(heldItem==='ext')sprayExtinguisher();else tryShootCustomer();});
canvas.addEventListener('contextmenu',e=>e.preventDefault());
canvas.addEventListener('mousedown',e=>{if(e.button===2){e.preventDefault();if(!pointerLocked||!gameRunning)return;tryGrabCrate();}});
canvas.addEventListener('wheel',e=>{if(!draggedCrate||!pointerLocked)return;e.preventDefault();dragDist=Math.max(1.5,Math.min(10,dragDist-e.deltaY*0.005));},{passive:false});
document.addEventListener('pointerlockchange',()=>{
  pointerLocked=document.pointerLockElement===canvas;
  document.body.classList.toggle('locked',pointerLocked);
  if(pointerLocked){
    document.getElementById('lookhint').style.opacity='0';
    // Hide pause if we re-locked
    document.getElementById('pauseScreen').style.display='none';
  } else {
    document.getElementById('lookhint').style.opacity='1';
    document.getElementById('lookhint').textContent='CLICK to re-lock mouse';
    // Show pause screen when pointer unlocked during gameplay
    if(gameRunning && !window._chatOpen()){
      const ps=document.getElementById('pauseScreen');
      ps.style.display='flex';
      // Show room code if in MP
      const codeEl=document.getElementById('pauseRoomCode');
      if(window.mpRoomCode){
        codeEl.style.display='block';
        document.getElementById('pauseCodeVal').textContent=window.mpRoomCode;
      } else {
        codeEl.style.display='none';
      }
    }
  }
});
document.addEventListener('mousemove',e=>{if(!pointerLocked||!gameRunning)return;if(freeCam){fcYaw-=e.movementX*SENS;fcPitch-=e.movementY*SENS;fcPitch=Math.max(-1.5,Math.min(1.5,fcPitch));}else{yaw-=e.movementX*SENS;pitch-=e.movementY*SENS;pitch=Math.max(-1.05,Math.min(1.05,pitch));}});

scene.add(new THREE.AmbientLight(0xFFEED8,0.55));
const sun=new THREE.DirectionalLight(0xFFDDBB,1.3);sun.position.set(10,22,12);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-28;sun.shadow.camera.right=28;sun.shadow.camera.top=28;sun.shadow.camera.bottom=-28;sun.shadow.camera.near=0.5;sun.shadow.camera.far=80;scene.add(sun);
scene.add(new THREE.HemisphereLight(0xFFCC88,0x336622,0.5));
const grillFire=new THREE.PointLight(0xFF5500,3.5,6);grillFire.position.set(0,1.4,4.1);scene.add(grillFire);
const intA=new THREE.PointLight(0xFFCC55,1.5,9);intA.position.set(-3,2.8,3);scene.add(intA);
const intB=new THREE.PointLight(0xFFCC55,1.5,9);intB.position.set(3,2.8,3);scene.add(intB);
const signGlow=new THREE.PointLight(0xFFFFFF,2.0,8);signGlow.position.set(0,5.5,9.2);scene.add(signGlow);
const lockLight=new THREE.PointLight(0xFFFFFF,1.5,3.5);lockLight.position.set(5.5,1.5,1.5);scene.add(lockLight);
const fireLight=new THREE.PointLight(0xFF3300,0,8);fireLight.position.set(0,2,4);scene.add(fireLight);


function lm(color,emi,emiI=0.4){const m=new THREE.MeshLambertMaterial({color});if(emi){m.emissive=new THREE.Color(emi);m.emissiveIntensity=emiI;}return m;}
function bx(w,h,d,m){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);mesh.castShadow=true;mesh.receiveShadow=true;return mesh;}
function cy(rt,rb,h,m){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,16),m);mesh.castShadow=true;return mesh;}
function sp(r,m){const mesh=new THREE.Mesh(new THREE.SphereGeometry(r,12,8),m);mesh.castShadow=true;return mesh;}
function at(o,x,y,z){o.position.set(x,y,z);return o;}

const colliders=[];
function addCol(cx,cz,hw,hd){colliders.push({minX:cx-hw,maxX:cx+hw,minZ:cz-hd,maxZ:cz+hd});}
function resolvePlayer(pos,r=0.38){if(!inSewer){for(let _ci=0;_ci<colliders.length;_ci++){if(_ci===extColIdx&&!extColActive)continue;const c=colliders[_ci];const cx=(c.minX+c.maxX)/2,cz=(c.minZ+c.maxZ)/2;const hw=(c.maxX-c.minX)/2+r,hd=(c.maxZ-c.minZ)/2+r;const dx=pos.x-cx,dz=pos.z-cz;if(Math.abs(dx)<hw&&Math.abs(dz)<hd){const ox=hw-Math.abs(dx),oz=hd-Math.abs(dz);if(ox<oz)pos.x+=ox*Math.sign(dx);else pos.z+=oz*Math.sign(dz);}}pos.x=Math.max(-21.5,Math.min(269.5,pos.x));pos.z=Math.max(-127.5,Math.min(79.5,pos.z));}else{const lx=pos.x-40;const lz=pos.z-40;const inMain=(lx>=-5.8&&lx<=5.8)&&(lz>=-15.8&&lz<=15.8);const inSide=(lx>=5.8&&lx<=12.0)&&(lz>=-2.2&&lz<=2.2);const inRoom=(lx>=11.5&&lx<=17.2)&&(lz>=-2.7&&lz<=2.7);if(inRoom){pos.x=Math.max(40+11.5,Math.min(40+17.2,pos.x));pos.z=Math.max(40-2.7,Math.min(40+2.7,pos.z));}else if(inSide){pos.x=Math.max(40+5.8,Math.min(40+12.0,pos.x));pos.z=Math.max(40-2.2,Math.min(40+2.2,pos.z));}else if(inMain){pos.x=Math.max(40-5.8,Math.min(40+5.8,pos.x));pos.z=Math.max(40-15.8,Math.min(40+15.8,pos.z));}else{const dMain=Math.abs(lx)*1.5+Math.max(0,Math.abs(lz)-8.8);const dSide=Math.max(0,2.2-lx)+Math.abs(lz)*0.5;const dRoom=Math.max(0,11.5-lx)+Math.abs(lz)*0.5;if(dSide<=dMain&&dSide<=dRoom){pos.x=Math.max(40+2.2,Math.min(40+12.0,pos.x));pos.z=Math.max(40-2.2,Math.min(40+2.2,pos.z));}else if(dRoom<dMain){pos.x=Math.max(40+11.5,Math.min(40+17.2,pos.x));pos.z=Math.max(40-2.7,Math.min(40+2.7,pos.z));}else{pos.x=Math.max(40-2.2,Math.min(40+2.2,pos.x));pos.z=Math.max(40-8.8,Math.min(40+8.8,pos.z));}}}}

function textTex(lines,bg,w=512,h=128){const cv=document.createElement('canvas');cv.width=w;cv.height=h;const cx=cv.getContext('2d');cx.fillStyle=bg;cx.fillRect(0,0,w,h);lines.forEach(({t,s,c,y,f})=>{cx.fillStyle=c||'#FFE600';cx.font=f||`bold ${s}px Impact`;cx.textAlign='center';cx.fillText(t,w/2,y);});return new THREE.CanvasTexture(cv);}

// --- WORLD GEOMETRY ---
const road=bx(100,0.02,100,lm(0x2A2A2A));road.position.y=-0.01;road.receiveShadow=true;scene.add(road);
const sw=bx(28,0.15,14,lm(0xAAAAAA));at(sw,0,0.075,5);sw.receiveShadow=true;scene.add(sw);
const wallM=lm(0x888888),wallDM=lm(0x666666),woodM=lm(0x555555),woodLM=lm(0x777777);
const backWall=bx(14,7,0.4,wallM);at(backWall,0,3.5,0);scene.add(backWall);addCol(0,-0.2,7,0.6);

// 🖼️ POSTERS on exterior back wall — facing road
{
  const tLoader = new THREE.TextureLoader();
  const posters = [
    { file:'model/supertuffratkebab.png',  x:-4.0, y:3.2 },
    { file:'model/superrat.png', x: 0,   y:3.2 },
    { file:'model/Tuffrat.png',  x: 4.0, y:3.2 },
  ];
  posters.forEach(p=>{
    tLoader.load(p.file, tex=>{
      tex.colorSpace = THREE.SRGBColorSpace;
      const mat = new THREE.MeshBasicMaterial({map:tex, side:THREE.FrontSide});
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.8), mat);
      mesh.position.set(p.x, p.y, -0.22);
      mesh.rotation.y = Math.PI;
      scene.add(mesh);
      const frame = bx(2.32, 2.92, 0.03, lm(0x111111));
      at(frame, p.x, p.y, -0.20);
      scene.add(frame);
    });
  });
}
const sideL=bx(0.4,7,9.5,wallDM);at(sideL,-7,3.5,4.75);scene.add(sideL);addCol(-7,4.75,0.5,4.85);
const sideR=bx(0.4,7,9.5,wallDM);at(sideR,7,3.5,4.75);scene.add(sideR);addCol(7,4.75,0.5,4.85);
const floorMats=[lm(0xCCCCCC),lm(0xAAAAAA)];
for(let fi=-5;fi<=5;fi++)for(let fj=0;fj<=5;fj++){const t=bx(1.25,0.12,1.58,(fi+fj)%2===0?floorMats[0]:floorMats[1]);at(t,fi*1.27+0.63,0.06,fj*1.58+0.79);t.receiveShadow=true;scene.add(t);}
const roofMesh=bx(14.4,0.35,9.6,lm(0x333333));at(roofMesh,0,7.18,4.75);scene.add(roofMesh);
const oh=bx(15,0.2,2.4,lm(0x222222));at(oh,0,7.1,9.2);scene.add(oh);
[-5,0,5].forEach(x=>{const s=bx(0.12,0.9,0.12,lm(0x555555));at(s,x,6.65,9.2);scene.add(s);});
[-6.8,6.8].forEach(x=>{const p=bx(0.55,7,0.55,lm(0xDDDDDD));at(p,x,3.5,9.4);scene.add(p);[1.1,6.0].forEach(y=>{const band=bx(0.62,0.14,0.62,lm(0xAAAAAA));at(band,x,y,9.4);scene.add(band);});});
const dfTop=bx(4.2,0.44,0.5,woodM);at(dfTop,0,4.7,0.25);scene.add(dfTop);
[-2.3,2.3].forEach(x=>{const df=bx(0.35,4.7,0.5,woodM);at(df,x,2.35,0.25);scene.add(df);addCol(x,0.25,0.42,0.5);});
[-5.5,5.5].forEach(x=>{const wf=bx(2.5,2.2,0.2,woodM);at(wf,x,3.2,0.15);scene.add(wf);const wg=new THREE.Mesh(new THREE.BoxGeometry(2.1,1.8,0.05),new THREE.MeshLambertMaterial({color:0x88CCEE,transparent:true,opacity:0.28}));at(wg,x,3.2,0.22);scene.add(wg);const sill=bx(2.7,0.1,0.35,woodLM);at(sill,x,2.1,0.2);scene.add(sill);});

const grillBody=bx(5.4,0.8,1.8,lm(0x8B4513));at(grillBody,0,0.4,4.1);scene.add(grillBody);addCol(0,4.1,2.8,1.05);
const grillFrame=bx(5.4,0.1,1.8,lm(0x1A1A1A));at(grillFrame,0,0.85,4.1);scene.add(grillFrame);
for(let i=-5;i<=5;i++){const bar=bx(0.07,0.07,1.7,lm(0x4A4A4A));at(bar,i*0.48,0.92,4.1);scene.add(bar);}
for(let j=-3;j<=3;j++){const bar=bx(5.3,0.04,0.07,lm(0x4A4A4A));at(bar,0,0.92,4.1+j*0.24);scene.add(bar);}
const coalPlane=new THREE.Mesh(new THREE.PlaneGeometry(5.1,1.65),new THREE.MeshBasicMaterial({color:0xFF2200,transparent:true,opacity:0.65}));coalPlane.rotation.x=-Math.PI/2;at(coalPlane,0,0.6,4.1);scene.add(coalPlane);
[[-2.4,3.25],[2.4,3.25],[-2.4,4.95],[2.4,4.95]].forEach(([x,z])=>{const leg=bx(0.12,0.8,0.12,lm(0x333333));at(leg,x,0.4,z);scene.add(leg);});
const hood=bx(5.6,1.2,0.9,lm(0x111111));at(hood,0,3.5,3.9);scene.add(hood);
const hoodAngle=bx(5.6,0.08,1.4,lm(0x1A1A1A));at(hoodAngle,0,2.9,4.25);hoodAngle.rotation.x=-0.4;scene.add(hoodAngle);
const hoodPipe=cy(0.14,0.14,1.8,lm(0x222222));at(hoodPipe,0,4.75,3.9);scene.add(hoodPipe);
const hoodLabel=new THREE.Mesh(new THREE.PlaneGeometry(3.5,0.55),new THREE.MeshLambertMaterial({map:textTex([{t:'COOKING GRILL — F to place rat/kebab',s:20,c:'#FF8800',y:44,f:'bold 20px monospace'}],'rgba(0,0,0,0.75)',512,64),transparent:true,side:THREE.DoubleSide}));at(hoodLabel,0,3.0,4.45);scene.add(hoodLabel);

const bkG=new THREE.Group();
const bkBody=new THREE.Mesh(new THREE.CylinderGeometry(0.56,0.46,0.74,20),lm(0xC8A456));at(bkBody,0,0.37,0);bkG.add(bkBody);
const bkRim=new THREE.Mesh(new THREE.TorusGeometry(0.57,0.056,10,28),lm(0xA07830));bkRim.rotation.x=Math.PI/2;at(bkRim,0,0.76,0);bkG.add(bkRim);
for(let i=0;i<10;i++){const line=bx(0.03,0.74,0.03,lm(0x9A7220));line.position.set(Math.sin(i/10*Math.PI*2)*0.52,0.37,Math.cos(i/10*Math.PI*2)*0.52);bkG.add(line);}
[[-0.2,-0.1],[0.2,0.1],[0,0.2]].forEach(([x,z])=>{const h=sp(0.11,lm(0xBB9A7C));at(h,x,0.82,z);bkG.add(h);const e=sp(0.033,lm(0xFF2222,0x880000,1.2));at(e,x+0.07,0.9,z+0.07);bkG.add(e);});
at(bkG,-3.5,0,1.4);scene.add(bkG);
const BASKET_POS=new THREE.Vector3(-3.5,0.76,1.4);addCol(-3.5,1.4,0.7,0.7);
const bkRing=new THREE.Mesh(new THREE.RingGeometry(0.66,0.82,28),new THREE.MeshBasicMaterial({color:0xFFFFFF,side:THREE.DoubleSide,transparent:true,opacity:0.35}));bkRing.rotation.x=-Math.PI/2;at(bkRing,-3.5,0.1,1.4);scene.add(bkRing);

const extG=new THREE.Group();
const extBody2=cy(0.12,0.12,0.6,lm(0xFF2222));at(extBody2,0,0.3,0);extG.add(extBody2);
const extTop=cy(0.08,0.12,0.15,lm(0xCC1111));at(extTop,0,0.675,0);extG.add(extTop);
const extValve=bx(0.18,0.06,0.05,lm(0xAA8800));at(extValve,0,0.9,0);extG.add(extValve);
const extHose=cy(0.02,0.02,0.25,lm(0x111111));extHose.rotation.z=Math.PI/2;at(extHose,0.18,0.78,0);extG.add(extHose);
at(extG,5.5,0,4.5);scene.add(extG);
const EXT_POS=new THREE.Vector3(5.5,0.5,4.5);
const extColIdx=colliders.length;addCol(5.5,4.5,0.25,0.25);let extColActive=true;
const extRing=new THREE.Mesh(new THREE.RingGeometry(0.3,0.42,20),new THREE.MeshBasicMaterial({color:0xFFFFFF,side:THREE.DoubleSide,transparent:true,opacity:0.4}));extRing.rotation.x=-Math.PI/2;at(extRing,5.5,0.06,4.5);scene.add(extRing);

const fridgeG=new THREE.Group();
const fridgeBody=bx(1.1,2.1,0.7,lm(0xEEEEEE));at(fridgeBody,0,1.05,0);fridgeG.add(fridgeBody);
const fridgeDoor=bx(0.98,1.95,0.06,lm(0xDDDDDD));at(fridgeDoor,0,1.05,0.38);fridgeG.add(fridgeDoor);
const fhandle=bx(0.06,0.35,0.06,lm(0xAAAAAA));at(fhandle,0.38,1.2,0.43);fridgeG.add(fhandle);
const fglass=new THREE.Mesh(new THREE.BoxGeometry(0.72,1.5,0.03),new THREE.MeshLambertMaterial({color:0x88CCFF,transparent:true,opacity:0.35}));at(fglass,0,1.15,0.41);fridgeG.add(fglass);
const fridgeGlowL=new THREE.PointLight(0x88CCFF,0.8,1.2);at(fridgeGlowL,0,1.2,0.1);fridgeG.add(fridgeGlowL);
[0.5,1.0,1.5].forEach(y=>{const fshelf=bx(0.8,0.04,0.5,lm(0xCCCCCC));at(fshelf,0,y,0.05);fridgeG.add(fshelf);});
[0.65,1.15,1.65].forEach(y=>{[-0.18,0.18].forEach(x=>{const fkb=bx(0.12,0.06,0.08,lm(0x8B3300,0x441100,0.3));at(fkb,x,y,0.05);fridgeG.add(fkb);});});
const fcomp=bx(1.1,0.18,0.7,lm(0xCCCCCC));at(fcomp,0,0.09,0);fridgeG.add(fcomp);
const fridgeLbl=new THREE.Mesh(new THREE.PlaneGeometry(0.85,0.22),new THREE.MeshLambertMaterial({map:textTex([{t:'KEBAB INSIDE — E grab, F grill',s:16,c:'#00BFFF',y:42,f:'bold 16px Impact'}],'rgba(0,20,40,0.9)',380,64),transparent:true,side:THREE.DoubleSide}));at(fridgeLbl,0,1.9,0.42);fridgeG.add(fridgeLbl);
at(fridgeG,-5.5,0,1.0);scene.add(fridgeG);addCol(-5.5,1.0,0.65,0.45);
const FRIDGE_POS=new THREE.Vector3(-5.5,1.05,1.0);


const floatRatG=new THREE.Group();
const floatRatMesh_placeholder=mkRat();floatRatMesh_placeholder.scale.set(0.22,0.22,0.22);floatRatMesh_placeholder.rotation.set(0,Math.PI,0);floatRatG.add(floatRatMesh_placeholder);let floatRatMesh=floatRatMesh_placeholder;
const frRing=new THREE.Mesh(new THREE.RingGeometry(0.38,0.52,28),new THREE.MeshBasicMaterial({color:0xFFD166,side:THREE.DoubleSide,transparent:true,opacity:0.55}));frRing.rotation.x=-Math.PI/2;floatRatG.add(frRing);
floatRatG.position.set(BASKET_POS.x,1.3,BASKET_POS.z);floatRatG.userData.tag='floatRat';scene.add(floatRatG);
// Basket count label
const basketLblCanvas=document.createElement('canvas');basketLblCanvas.width=128;basketLblCanvas.height=64;
const basketLblCtx=basketLblCanvas.getContext('2d');
const basketLblTex=new THREE.CanvasTexture(basketLblCanvas);
const basketLblMesh=new THREE.Mesh(new THREE.PlaneGeometry(0.9,0.45),new THREE.MeshBasicMaterial({map:basketLblTex,transparent:true,depthWrite:false,side:THREE.DoubleSide}));
basketLblMesh.position.set(BASKET_POS.x,2.4,BASKET_POS.z);scene.add(basketLblMesh);
function updateBasketLabel(){
  const bc=(typeof basketCount!=='undefined')?basketCount:8;
  basketLblCtx.clearRect(0,0,128,64);
  basketLblCtx.fillStyle='rgba(0,0,0,0.75)';basketLblCtx.roundRect(2,2,124,60,8);basketLblCtx.fill();
  basketLblCtx.font='bold 28px Bebas Neue,monospace';basketLblCtx.fillStyle='#FFD166';
  basketLblCtx.textAlign='center';basketLblCtx.fillText('🐀 x'+bc,64,42);
  basketLblTex.needsUpdate=true;
}
setTimeout(()=>updateBasketLabel(),100);
window._updateBasketLabel=updateBasketLabel;
function rebuildFloatRat(){if(!ratModelReady)return;floatRatG.remove(floatRatMesh);const newMesh=mkRat();newMesh.scale.set(0.22,0.22,0.22);newMesh.rotation.set(0,Math.PI,0);floatRatG.add(newMesh);floatRatMesh=newMesh;}

const floatKebabG=new THREE.Group();
const floatKebabMesh=mkKebab();floatKebabMesh.scale.set(0.6,0.6,0.6);floatKebabG.add(floatKebabMesh);
const fkRing=new THREE.Mesh(new THREE.RingGeometry(0.38,0.52,28),new THREE.MeshBasicMaterial({color:0x00BFFF,side:THREE.DoubleSide,transparent:true,opacity:0.55}));fkRing.rotation.x=-Math.PI/2;floatKebabG.add(fkRing);
floatKebabG.position.set(FRIDGE_POS.x,2.5,FRIDGE_POS.z);floatKebabG.userData.tag='floatKebab';scene.add(floatKebabG);
const fridgeRing=new THREE.Mesh(new THREE.RingGeometry(0.66,0.82,28),new THREE.MeshBasicMaterial({color:0x00BFFF,side:THREE.DoubleSide,transparent:true,opacity:0.35}));fridgeRing.rotation.x=-Math.PI/2;at(fridgeRing,-5.5,0.1,1.0);scene.add(fridgeRing);

const lkG=new THREE.Group();
const lkBody=bx(0.92,1.88,0.58,lm(0x8B1A1A));at(lkBody,0,0.94,0);lkG.add(lkBody);
const lkDoor=bx(0.88,1.82,0.05,lm(0xAA2222));at(lkDoor,0,0.94,0.31);lkG.add(lkDoor);
for(let i=0;i<7;i++){const sl=bx(0.62,0.045,0.06,lm(0x660000));at(sl,0,1.6-i*0.2,0.33);lkG.add(sl);}
const lkHandle=bx(0.06,0.22,0.09,lm(0x888888));at(lkHandle,0.32,0.94,0.34);lkG.add(lkHandle);
for(let i=0;i<5;i++){const s=bx(0.09,1.88,0.06,lm(i%2===0?0xFFDD00:0x111111));at(s,-0.42+i*0.21,0.94,-0.02);lkG.add(s);}
const lkLbl=new THREE.Mesh(new THREE.PlaneGeometry(0.72,0.22),new THREE.MeshLambertMaterial({map:textTex([{t:'GUN LOCKER',s:28,c:'#FFD166',y:46,f:'bold 28px Impact'}],'rgba(80,0,0,0.85)',256,72),transparent:true,side:THREE.DoubleSide}));at(lkLbl,0,1.6,0.35);lkG.add(lkLbl);
at(lkG,5.5,0,1.0);scene.add(lkG);addCol(5.5,1.0,0.6,0.42);
const LOCKER_POS=new THREE.Vector3(5.5,0.94,1.0);

// ============================================================
// GUN WALL MOUNT — left wall — now shows shotgun.glb
// ============================================================
const GUN_WALL_POS=new THREE.Vector3(-6.6,1.1,4.5);
let wallGunAvailable=true; // whether the weapon mount on the left wall currently holds the shotgun (not a glock)
const gunWallG=new THREE.Group();




// Try to place shotgun.glb on wall — if model ready use it, else procedural fallback
if(shotgunModelReady&&shotgunGltfScene){
  const wallShotgun=shotgunGltfScene.clone(true);
  wallShotgun.scale.set(0.18,0.18,0.18);
  wallShotgun.position.set(0,0.02,0.08);
  wallShotgun.rotation.set(0,Math.PI/2,0);
  gunWallG.add(wallShotgun);
  gunWallG.userData.wallShotgunMesh=wallShotgun;
} else {
  // Procedural fallback (will be swapped by rebuildVmShotgun once GLB loads)
  const gwBarrel=bx(0.52,0.045,0.04,lm(0x222222));gwBarrel.position.set(-0.05,0.02,0.06);gunWallG.add(gwBarrel);
  const gwGrip=bx(0.09,0.16,0.04,lm(0x333333));gwGrip.position.set(0.15,-0.05,0.06);gunWallG.add(gwGrip);
  const gwFrame=bx(0.3,0.1,0.04,lm(0x2A2A2A));gwFrame.position.set(0.05,0.025,0.06);gunWallG.add(gwFrame);
}

// Label sign above
const gwLbl=new THREE.Mesh(new THREE.PlaneGeometry(0.62,0.14),new THREE.MeshLambertMaterial({map:textTex([{t:'[ E ] PICK UP GUN',s:18,c:'#FFD166',y:40,f:'bold 18px Impact'}],'rgba(40,0,0,0.9)',256,56),transparent:true,side:THREE.DoubleSide}));
gwLbl.position.set(0,0.28,0.04);
gunWallG.add(gwLbl);

// Glow light
const gwLight=new THREE.PointLight(0xFF4400,1.2,2.5);
gwLight.position.set(0,0.1,0.4);
gunWallG.add(gwLight);

gunWallG.position.set(GUN_WALL_POS.x,GUN_WALL_POS.y,GUN_WALL_POS.z);
gunWallG.rotation.y=Math.PI/2;
scene.add(gunWallG);

// ============================================================
// FRYING PAN WALL MOUNT — back wall, center
// ============================================================
const PAN_WALL_POS = new THREE.Vector3(0, 1.1, 0.28);
const panWallG = new THREE.Group();

// Procedural pan on wall
const panDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.22,0.04,18), lm(0x1A1A1A));
panDisc.rotation.z = Math.PI/2; panDisc.position.set(0.06,0,0); panWallG.add(panDisc);
const panRim = new THREE.Mesh(new THREE.TorusGeometry(0.22,0.025,8,24), lm(0x2A2A2A));
panRim.rotation.y = Math.PI/2; panWallG.add(panRim);
const panHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.025,0.38,8), lm(0x1A1A1A));
panHandle.rotation.z = Math.PI/2; panHandle.position.set(-0.28,0,0); panWallG.add(panHandle);

// Try GLB override
const panGltfLoader = new THREE.GLTFLoader();
panGltfLoader.load('model/fryingpan1111.glb', function(gltf){
  // Remove procedural fallback pieces now that GLB is ready
  panWallG.remove(panDisc);
  panWallG.remove(panRim);
  panWallG.remove(panHandle);
  const pm = gltf.scene;
  const box = new THREE.Box3().setFromObject(pm);
  const sz = new THREE.Vector3(); box.getSize(sz);
  const sc = 0.9/Math.max(sz.x,sz.y,sz.z);
  pm.scale.set(sc,sc,sc);
  // Face forward (toward player), handle pointing up
  pm.rotation.set(Math.PI/2, 0, 0);
  // Centre horizontally
  const box2 = new THREE.Box3().setFromObject(pm);
  const centre = new THREE.Vector3(); box2.getCenter(centre);
  pm.position.sub(centre);
  panWallG.add(pm);
  console.log('fryingpan1111.glb loaded on wall!');
}, undefined, function(){ /* no GLB — keep procedural */ });

const panWallLbl = new THREE.Mesh(new THREE.PlaneGeometry(0.85,0.18),
  new THREE.MeshLambertMaterial({map:textTex([{t:'[ E ] FRYING PAN',s:18,c:'#FF8C00',y:40,f:'bold 18px Impact'}],'rgba(20,10,0,0.9)',256,56),transparent:true,side:THREE.DoubleSide}));
panWallLbl.position.set(0,0.38,0.04); panWallG.add(panWallLbl);
const panWallLight = new THREE.PointLight(0xFF6600,1.0,2.2);
panWallLight.position.set(0,0.1,0.4); panWallG.add(panWallLight);
panWallG.position.copy(PAN_WALL_POS);
scene.add(panWallG);
let panWallAvailable = true;

// Pan viewmodel
const vmPan = new THREE.Group();
// Procedural fallback pieces (removed when GLB loads)
const vmPanDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.18,0.035,16), lm(0x1A1A1A));
vmPanDisc.rotation.z = Math.PI/2; vmPanDisc.position.set(0.1,0,0); vmPan.add(vmPanDisc);
const vmPanRim2 = new THREE.Mesh(new THREE.TorusGeometry(0.18,0.022,7,20), lm(0x2A2A2A));
vmPanRim2.rotation.y = Math.PI/2; vmPan.add(vmPanRim2);
const vmPanHandle2 = new THREE.Mesh(new THREE.CylinderGeometry(0.022,0.022,0.32,8), lm(0x1A1A1A));
vmPanHandle2.rotation.z = Math.PI/2; vmPanHandle2.position.set(-0.22,0,0); vmPan.add(vmPanHandle2);
vmPan.position.set(0.18,-0.16,-0.38);
vmPan.rotation.set(0.05,-0.08,0);
vmPan.visible = false;
// Load GLB for viewmodel pan
const vmPanLoader = new THREE.GLTFLoader();
vmPanLoader.load('model/fryingpan1111.glb', function(gltf){
  vmPan.remove(vmPanDisc); vmPan.remove(vmPanRim2); vmPan.remove(vmPanHandle2);
  const pm = gltf.scene;
  const box = new THREE.Box3().setFromObject(pm);
  const sz = new THREE.Vector3(); box.getSize(sz);
  const sc = 0.45 / Math.max(sz.x, sz.y, sz.z);
  pm.scale.set(sc, sc, sc);
  // Handle pointing toward player (into screen = -Z), face tilted up
  pm.rotation.set(Math.PI/2, 0, Math.PI/2);
  // Centre it
  const box2 = new THREE.Box3().setFromObject(pm);
  const centre = new THREE.Vector3(); box2.getCenter(centre);
  pm.position.sub(centre);
  vmPan.add(pm);
}, undefined, function(){});
let vmPanBuilt2 = true;

function dropPan(){
  if(heldItem!=='pan')return;
  heldItem=null; hasPan=false;
  panSwingCooldown=0; panSwinging=false;
  vmPan.visible=false;
  panWallAvailable=true; panWallG.visible=true;
  updateHeldUI();
  showMsg('Frying pan returned','#aaa');
}

function swingPan(){
  if(!hasPan||!gameRunning||panSwingCooldown>0)return;
  panSwingCooldown=0.55; panSwinging=true;
  playSound('panswing');
  flash('mflash',35);
  // Hit inspector
  if(inspActive&&inspMesh&&PP.distanceTo(inspMesh.position)<2.5){
    hitInspector(); hitInspector(); // double hit
    showMsg('PAN SMASH! Inspector hit x2 🍳','#FF8C00');
    return;
  }
  // Knock out customer (lose star)
  for(const cd of customers){
    if(!cd.served&&!cd.exiting&&PP.distanceTo(cd.mesh.position)<2.2){
      cd.exiting=true;
      spawnPart(cd.mesh.position.clone().add(new THREE.Vector3(0,0.8,0)),0xFF8C00,14);
      loseStar('You hit a customer with a pan! -1 star');
      showMsg('BONK! Customer knocked out 🍳 -1 star','#FF8C00');
      return;
    }
  }
  // Damage sewer rats
  if(inSewer){
    for(const r of sewerRats){
      if(PP.distanceTo(r.mesh.position)<2.0){
        r.hp-=2;
        spawnBlood(r.mesh.position.clone().add(new THREE.Vector3(0,0.3,0)),12);
        if(r.hp<=0){scene.remove(r.mesh);score+=25;basketCount++;updateHUD();showMsg('Sewer rat KO! +25pts 🍳','#FFD166');}
        else showMsg('PAN HIT rat! 🍳','#FF8C00');
        sewerRats.splice(0,sewerRats.length,...sewerRats.filter(r2=>r2.hp>0));
        return;
      }
    }
  }
  // Hit tax guy
  if(taxGuyMesh&&taxPhase==='taxing'&&taxGuyHP>0&&PP.distanceTo(taxGuyMesh.position)<2.5){
    spawnBlood(taxGuyMesh.position.clone().add(new THREE.Vector3(0,1,0)),20);
    taxGuyHP-=2;
    if(taxGuyMesh._hpBar){const p=Math.max(0,taxGuyHP/TAX_GUY_MAX_HP);taxGuyMesh._hpBar.scale.x=p;taxGuyMesh._hpBar.position.x=(p-1)*0.36;}
    if(taxGuyHP<=0) killTaxGuy();
    else showMsg('PAN SMASH! Tax guy hit 🍳','#FF8C00');
    return;
  }
  // Hit enforcers
  if(taxPhase==='evading'){
    for(const enf of taxEnforcers){
      if(!enf||!enf.mesh||enf.hp<=0)continue;
      if(PP.distanceTo(enf.mesh.position)<2.2){
        spawnBlood(enf.mesh.position.clone().add(new THREE.Vector3(0,1,0)),15);
        enf.hp-=2;
        if(enf.mesh._hpBar){const p=Math.max(0,enf.hp/TAX_ENFORCER_MAX_HP);enf.mesh._hpBar.scale.x=p;enf.mesh._hpBar.position.x=(p-1)*0.36;}
        if(enf.hp<=0) killTaxEnforcer(enf);
        else showMsg('PAN HIT enforcer! 🍳','#FF8C00');
        return;
      }
    }
  }
  showMsg('WHOOSH — swing the pan! 🍳','#888');
}

const menuBrd=bx(3.6,2.1,0.09,woodM);at(menuBrd,3.5,4,0.26);scene.add(menuBrd);
menuBrd.material=new THREE.MeshLambertMaterial({map:textTex([{t:'MENU',s:28,c:'#FFD166',y:36,f:"bold 28px 'Bebas Neue',Impact"},{t:'Rat Kebab ........... 50k',s:14,c:'#ddd',y:62,f:'13px monospace'},{t:'Extra Crispy ......... 65k',s:14,c:'#ddd',y:82,f:'13px monospace'},{t:'Family Pack ........ 120k Epsteinfuck',s:14,c:'#ddd',y:102,f:'13px monospace'}],'#2A1A0A')});
const menuBorder2=bx(3.8,2.3,0.06,woodLM);at(menuBorder2,3.5,4,0.22);scene.add(menuBorder2);
const bigSign=bx(10,1.6,0.22,lm(0x333333));bigSign.material=new THREE.MeshLambertMaterial({map:textTex([{t:'RAT KEBAB — BY TONY',s:36,c:'#fff',y:88}],'#1a1a1a')});at(bigSign,0,7.8,9.2);scene.add(bigSign);
const bigBorder=bx(10.3,1.92,0.1,lm(0x555555));at(bigBorder,0,7.8,9.15);scene.add(bigBorder);
const neonBoard=new THREE.Mesh(new THREE.PlaneGeometry(7.8,1.45),new THREE.MeshLambertMaterial({map:textTex([{t:'RAT KEBAB — BY TONY',s:42,c:'#fff',y:65,f:"bold 42px 'Bebas Neue',Impact"}],'rgba(0,0,0,0.92)',700,105),emissive:0x111111,emissiveIntensity:0.5,transparent:true}));at(neonBoard,0,9.5,9.2);scene.add(neonBoard);
const neonRing=new THREE.Mesh(new THREE.TorusGeometry(1.45,0.058,10,46),lm(0xFFFFFF,0xFFFFFF,2.8));at(neonRing,0,6.55,9.2);scene.add(neonRing);
[[-7,8.8],[7,8.8]].forEach(([x,z])=>{const pole=cy(0.04,0.04,6.5,lm(0xCCCCCC));at(pole,x,3.25,z);scene.add(pole);const flag=bx(0.98,0.6,0.03,lm(0xDA0000));at(flag,x+0.49,6.0,z);scene.add(flag);const star=sp(0.15,lm(0xFFE600));at(star,x+0.49,6.0,z+0.05);scene.add(star);});

const trees=[];
function mkTree(x,z,lean=0){const g=new THREE.Group();const trunk=cy(0.23,0.33,4.8,lm(0x5A3E28));at(trunk,0,2.4,0);g.add(trunk);[[1.95,5.2,0x33BB55],[1.6,6.5,0x2AA845],[1.25,7.6,0x228835]].forEach(([r,y,c])=>{const cn=new THREE.Mesh(new THREE.SphereGeometry(r,10,7),lm(c,0x005500,0.1));at(cn,0,y,0);cn.castShadow=true;g.add(cn);});g.position.set(x,0,z);g.rotation.z=lean;scene.add(g);trees.push(g);}
mkTree(-11.5,5,-0.04);mkTree(11.5,5,0.04);mkTree(-13.5,0,-0.07);mkTree(13.5,0,0.07);
// Tree colliders
addCol(-11.5,5,0.4,0.4);addCol(11.5,5,0.4,0.4);addCol(-13.5,0,0.4,0.4);addCol(13.5,0,0.4,0.4);

function mkLamp(x,z){const post=cy(0.07,0.07,5.8,lm(0x999999));at(post,x,2.9,z);scene.add(post);const arm=bx(1.05,0.07,0.07,lm(0x999999));at(arm,x+0.52,5.7,z);scene.add(arm);const shade=new THREE.Mesh(new THREE.ConeGeometry(0.24,0.3,10,1,true),new THREE.MeshLambertMaterial({color:0x333333,side:THREE.DoubleSide}));shade.rotation.x=Math.PI;at(shade,x+1.04,5.55,z);scene.add(shade);const bulb=sp(0.11,lm(0xFFFFAA,0xFFFF44,2.2));at(bulb,x+1.04,5.6,z);scene.add(bulb);const pl=new THREE.PointLight(0xFFEE88,1.8,10);at(pl,x+1.04,5.38,z);scene.add(pl);}
mkLamp(-8.5,10.5);mkLamp(8.5,10.5);
// Lamp post colliders
addCol(-8.5,10.5,0.18,0.18);addCol(8.5,10.5,0.18,0.18);

const SEWER_Y=-6.5;
const sewerGroup=new THREE.Group();
const sewMat=lm(0x3A3028);
const stFloor2=bx(12,0.2,32,lm(0x2A2020));at(stFloor2,0,SEWER_Y,0);sewerGroup.add(stFloor2);
const stCeil2=bx(12,0.2,32,lm(0x1A1A1A));at(stCeil2,0,SEWER_Y+4.2,0);sewerGroup.add(stCeil2);
const stWallL=bx(0.25,4.4,32,sewMat);at(stWallL,-6,SEWER_Y+2.2,0);sewerGroup.add(stWallL);
const stWallR1=bx(0.25,4.4,12,sewMat);at(stWallR1,6,SEWER_Y+2.2,-10);sewerGroup.add(stWallR1);
const stWallR2=bx(0.25,4.4,12,sewMat);at(stWallR2,6,SEWER_Y+2.2,10);sewerGroup.add(stWallR2);
const stWallRtop=bx(0.25,4.4,12,sewMat);at(stWallRtop,6,SEWER_Y+2.2,0);sewerGroup.add(stWallRtop);
const stEndN=bx(12,4.4,0.25,sewMat);at(stEndN,0,SEWER_Y+2.2,-16);sewerGroup.add(stEndN);
const stEndS=bx(12,4.4,0.25,sewMat);at(stEndS,0,SEWER_Y+2.2,16);sewerGroup.add(stEndS);
const waterChan=new THREE.Mesh(new THREE.BoxGeometry(1.4,0.14,32),new THREE.MeshLambertMaterial({color:0x1A3A1A,transparent:true,opacity:0.85}));at(waterChan,0,SEWER_Y+0.07,0);sewerGroup.add(waterChan);
const entryCircleLight=new THREE.PointLight(0xFFEE88,3.5,6);entryCircleLight.position.set(0,SEWER_Y+2.8,0);sewerGroup.add(entryCircleLight);
const entryCircleGlow=new THREE.Mesh(new THREE.CircleGeometry(0.7,28),new THREE.MeshBasicMaterial({color:0xFFFF99,transparent:true,opacity:0.55}));entryCircleGlow.rotation.x=-Math.PI/2;entryCircleGlow.position.set(0,SEWER_Y+0.15,0);sewerGroup.add(entryCircleGlow);
const entryCircleRing1=new THREE.Mesh(new THREE.RingGeometry(0.7,0.9,28),new THREE.MeshBasicMaterial({color:0xFFDD55,transparent:true,opacity:0.7}));entryCircleRing1.rotation.x=-Math.PI/2;entryCircleRing1.position.set(0,SEWER_Y+0.16,0);sewerGroup.add(entryCircleRing1);
const entryCircleRing2=new THREE.Mesh(new THREE.RingGeometry(0.9,1.05,28),new THREE.MeshBasicMaterial({color:0xFFDD55,transparent:true,opacity:0.35}));entryCircleRing2.rotation.x=-Math.PI/2;entryCircleRing2.position.set(0,SEWER_Y+0.16,0);sewerGroup.add(entryCircleRing2);
const ceilMH=new THREE.Mesh(new THREE.CylinderGeometry(0.65,0.65,0.1,24),lm(0x444444));ceilMH.position.set(0,SEWER_Y+3.38,0);sewerGroup.add(ceilMH);
[-6,-2,2,6].forEach(x=>{const pipe=cy(0.06,0.06,0.5,lm(0x555555));at(pipe,x,SEWER_Y+3.2,0);sewerGroup.add(pipe);});
const sewerLights=[];
[-12,-6,0,6,12].forEach(x=>{const sl=new THREE.PointLight(0x88FF44,1.2,14);sl.position.set(0,SEWER_Y+3.8,x);sewerGroup.add(sl);sewerLights.push(sl);const bulb=sp(0.1,lm(0xAAFF66,0x88FF33,2));bulb.position.set(0,SEWER_Y+3.95,x);sewerGroup.add(bulb);});
const sewExit=new THREE.Mesh(new THREE.CylinderGeometry(0.55,0.55,0.12,18),lm(0x555555,0x888888,0.4));sewExit.position.set(0,SEWER_Y+0.12,14.0);sewerGroup.add(sewExit);
for(let i=0;i<6;i++){const rung=bx(0.5,0.06,0.06,lm(0x888888));rung.position.set(0,SEWER_Y+0.5+i*0.5,14.0);sewerGroup.add(rung);}
const sewManholeRim2=new THREE.Mesh(new THREE.CylinderGeometry(0.65,0.65,0.1,24),lm(0x666666));sewManholeRim2.position.set(0,SEWER_Y+4.15,14.0);sewerGroup.add(sewManholeRim2);
const sewManholeLid2=new THREE.Mesh(new THREE.CylinderGeometry(0.6,0.6,0.06,24),lm(0x222222));sewManholeLid2.position.set(0,SEWER_Y+4.18,14.0);sewerGroup.add(sewManholeLid2);
for(let r=-3;r<=3;r++){const gl=bx(1.1,0.02,0.04,lm(0x3A3A3A));gl.position.set(0,SEWER_Y+4.22,14.0+r*0.15);sewerGroup.add(gl);}
for(let r=-3;r<=3;r++){const gl=bx(0.04,0.02,1.1,lm(0x3A3A3A));gl.position.set(r*0.15,SEWER_Y+4.22,14.0);sewerGroup.add(gl);}
const shaftLight=new THREE.PointLight(0xFFEE88,2.5,6);shaftLight.position.set(0,SEWER_Y+3.2,14.0);sewerGroup.add(shaftLight);
const exitGlow=new THREE.Mesh(new THREE.RingGeometry(0.62,0.78,24),new THREE.MeshBasicMaterial({color:0xFFFF88,side:THREE.DoubleSide,transparent:true,opacity:0.6}));exitGlow.rotation.x=-Math.PI/2;exitGlow.position.set(0,SEWER_Y+0.18,14.0);sewerGroup.add(exitGlow);
const exitSign=new THREE.Mesh(new THREE.PlaneGeometry(1.3,0.35),new THREE.MeshLambertMaterial({map:textTex([{t:'↑ CLIMB OUT press E',s:20,c:'#FFD166',y:42,f:'bold 20px Impact'}],'rgba(0,0,0,0.9)',340,64),transparent:true,side:THREE.DoubleSide}));exitSign.position.set(0,SEWER_Y+2.8,14.0);sewerGroup.add(exitSign);

const stSideFloor=bx(9.5,0.2,4.6,lm(0x252015));at(stSideFloor,7.2,SEWER_Y,0);sewerGroup.add(stSideFloor);
const stSideCeil=bx(9.5,0.2,4.6,lm(0x181818));at(stSideCeil,7.2,SEWER_Y+3.4,0);sewerGroup.add(stSideCeil);
const stSideWallB=bx(9.5,3.6,0.25,lm(0x302820));at(stSideWallB,7.2,SEWER_Y+1.8,-2.3);sewerGroup.add(stSideWallB);
const stSideWallF=bx(9.5,3.6,0.25,lm(0x302820));at(stSideWallF,7.2,SEWER_Y+1.8,2.3);sewerGroup.add(stSideWallF);
const waterChan2=new THREE.Mesh(new THREE.BoxGeometry(10,0.15,1.1),new THREE.MeshLambertMaterial({color:0x1A301A,transparent:true,opacity:0.85}));at(waterChan2,7,SEWER_Y+0.07,0);sewerGroup.add(waterChan2);
[3,6,9].forEach(ox=>{const pipe2=cy(0.055,0.055,0.45,lm(0x444444));at(pipe2,ox+2.5,SEWER_Y+3.22,0);sewerGroup.add(pipe2);const drip=sp(0.04,lm(0x224422));drip.position.set(ox+2.5,SEWER_Y+3.0,0);sewerGroup.add(drip);});
const sideTunnelLights=[];
{const sl2=new THREE.PointLight(0xAAFF55,1.2,12);sl2.position.set(7,SEWER_Y+2.9,0);sewerGroup.add(sl2);sideTunnelLights.push(sl2);const bulb2=sp(0.09,lm(0xCCFF88,0x88FF33,2.0));bulb2.position.set(7,SEWER_Y+3.05,0);sewerGroup.add(bulb2);}
const arrowTex=textTex([{t:'→ SIDE TUNNEL',s:22,c:'#FFCC00',y:44,f:'bold 22px Impact'}],'rgba(0,0,0,0.88)',280,64);
const arrowSign=new THREE.Mesh(new THREE.PlaneGeometry(1.5,0.38),new THREE.MeshLambertMaterial({map:arrowTex,transparent:true,side:THREE.DoubleSide}));arrowSign.position.set(2.35,SEWER_Y+2.0,2.1);arrowSign.rotation.y=-Math.PI/2;sewerGroup.add(arrowSign);
const srFloor=bx(5.5,0.2,5.5,lm(0x1E1A14));srFloor.position.set(14.5,SEWER_Y,0);sewerGroup.add(srFloor);
const srCeil=bx(5.5,0.2,5.5,lm(0x141414));srCeil.position.set(14.5,SEWER_Y+4.5,0);sewerGroup.add(srCeil);
const srWallN=bx(5.5,4.7,0.3,lm(0x282018));srWallN.position.set(14.5,SEWER_Y+2.35,-2.75);sewerGroup.add(srWallN);
const srWallS=bx(5.5,4.7,0.3,lm(0x282018));srWallS.position.set(14.5,SEWER_Y+2.35,2.75);sewerGroup.add(srWallS);
const srWallE=bx(0.3,4.7,5.5,lm(0x282018));srWallE.position.set(17.25,SEWER_Y+2.35,0);sewerGroup.add(srWallE);
const srWallW=bx(0.3,4.7,5.5,lm(0x282018));srWallW.position.set(11.75,SEWER_Y+2.35,0);sewerGroup.add(srWallW);
const srLight=new THREE.PointLight(0xFF3300,3.5,10);srLight.position.set(14.5,SEWER_Y+3.2,0);sewerGroup.add(srLight);
const srBulb=sp(0.14,lm(0xFF5500,0xFF2200,3.5));srBulb.position.set(14.5,SEWER_Y+4.2,0);sewerGroup.add(srBulb);
for(let ch=0;ch<5;ch++){const link=new THREE.Mesh(new THREE.TorusGeometry(0.045,0.012,5,10),lm(0x555555));link.position.set(14.5,SEWER_Y+4.0-ch*0.14,0);link.rotation.x=ch%2===0?0:Math.PI/2;sewerGroup.add(link);}
const srSignTex=textTex([{t:'DO NOT ENTER',s:30,c:'#FF3300',y:46,f:'bold 30px Impact'},{t:'rat territory — u have been warned',s:12,c:'#884400',y:72,f:'italic 12px monospace'}],'#1A0A00',340,90);
const srSign=new THREE.Mesh(new THREE.PlaneGeometry(1.95,0.58),new THREE.MeshLambertMaterial({map:srSignTex,transparent:true,side:THREE.DoubleSide}));srSign.position.set(17.1,SEWER_Y+2.5,0);srSign.rotation.y=-Math.PI/2;sewerGroup.add(srSign);
[[13.6,-1.3,0],[15.4,1.1,0],[13.9,1.6,0],[13.6,-1.3,0.65],[15.4,1.1,0.65]].forEach(([x,z,dy])=>{const crate=bx(0.65,0.65,0.65,lm(0x4A3820));crate.position.set(x,SEWER_Y+0.4+dy,z);sewerGroup.add(crate);const lid=bx(0.68,0.07,0.68,lm(0x3A2810));lid.position.set(x,SEWER_Y+0.74+dy,z);sewerGroup.add(lid);});
[[16.8,-0.8],[16.6,0.7],[16.2,-0.1]].forEach(([x,z])=>{for(let sk=0;sk<3;sk++){const skull=sp(0.08+Math.random()*0.03,lm(0xCCBBAA));skull.position.set(x+(Math.random()-.5)*0.28,SEWER_Y+0.14+sk*0.06,z+(Math.random()-.5)*0.28);sewerGroup.add(skull);}});
const barrel=cy(0.24,0.28,0.62,lm(0x4A3010));at(barrel,16.2,SEWER_Y+0.42,-1.5);sewerGroup.add(barrel);
const barrelLid=cy(0.26,0.26,0.05,lm(0x3A2808));at(barrelLid,16.2,SEWER_Y+0.76,-1.5);sewerGroup.add(barrelLid);
for(let br=0;br<3;br++){const band3=new THREE.Mesh(new THREE.TorusGeometry(0.26,0.02,5,16),lm(0x222222));band3.rotation.x=Math.PI/2;band3.position.set(16.2,SEWER_Y+0.2+br*0.2,-1.5);sewerGroup.add(band3);}
const barrelGlow=new THREE.PointLight(0xFFAA00,0.8,1.2);barrelGlow.position.set(16.2,SEWER_Y+0.5,-1.5);sewerGroup.add(barrelGlow);
[[17.0,SEWER_Y+1.2,-1.2],[17.0,SEWER_Y+2.4,1.0],[11.9,SEWER_Y+1.8,0.5]].forEach(([x,y,z])=>{const moss=new THREE.Mesh(new THREE.CircleGeometry(0.25+Math.random()*0.15,8),new THREE.MeshLambertMaterial({color:0x1A3A10,transparent:true,opacity:0.75,side:THREE.DoubleSide}));moss.position.set(x,y,z);moss.rotation.y=Math.PI/2;sewerGroup.add(moss);});
const puddle=new THREE.Mesh(new THREE.CircleGeometry(0.8,14),new THREE.MeshLambertMaterial({color:0x0A180A,transparent:true,opacity:0.7}));puddle.rotation.x=-Math.PI/2;puddle.position.set(14.5,SEWER_Y+0.12,0.2);sewerGroup.add(puddle);

const manholeGroup=new THREE.Group();
const MH_X=0,MH_Z=22;
const manholeRim=new THREE.Mesh(new THREE.CylinderGeometry(0.72,0.72,0.12,28),lm(0x777777));manholeRim.position.set(MH_X,0.06,MH_Z);manholeGroup.add(manholeRim);
const manholeLid=new THREE.Mesh(new THREE.CylinderGeometry(0.68,0.68,0.07,28),lm(0x222222));manholeLid.position.set(MH_X,0.11,MH_Z);manholeGroup.add(manholeLid);
for(let row=-4;row<=4;row++){const gl=bx(1.24,0.025,0.045,lm(0x3A3A3A));gl.position.set(MH_X,0.145,MH_Z+row*0.145);manholeGroup.add(gl);}
for(let col=-4;col<=4;col++){const gl=bx(0.045,0.025,1.24,lm(0x3A3A3A));gl.position.set(MH_X+col*0.145,0.145,MH_Z);manholeGroup.add(gl);}
const sewerTex=textTex([{t:'SEWER',s:28,c:'#888888',y:48,f:'bold 28px Impact'}],'#1A1A1A',200,64);
const sewerPlate=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.03,0.18),new THREE.MeshLambertMaterial({map:sewerTex,color:0x999999}));sewerPlate.position.set(MH_X,0.16,MH_Z);manholeGroup.add(sewerPlate);
[[-0.38,-0.38],[0.38,-0.38],[-0.38,0.38],[0.38,0.38]].forEach(([dx,dz])=>{const bolt=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,0.04,8),lm(0x111111));bolt.position.set(MH_X+dx,0.16,MH_Z+dz);manholeGroup.add(bolt);});
const mhGlow=new THREE.Mesh(new THREE.RingGeometry(0.73,0.88,28),new THREE.MeshBasicMaterial({color:0x00FF88,side:THREE.DoubleSide,transparent:true,opacity:0.5}));mhGlow.rotation.x=-Math.PI/2;mhGlow.position.set(MH_X,0.18,MH_Z);manholeGroup.add(mhGlow);
scene.add(manholeGroup);

// ── BREAD GLB LOADER ─────────────────────────────────────────────────
let breadGltfScene = null;
const breadLoader = new THREE.GLTFLoader();
breadLoader.load('model/bread.glb', function(gltf){
  breadGltfScene = gltf.scene;
  breadGltfScene.traverse(c=>{ if(c.isMesh){ c.castShadow=true; c.receiveShadow=true; } });
  buildVmBread();
}, undefined, e=>console.warn('bread.glb failed:',e));

// ── mkBread: small procedural loaf with bread.glb centered on it ────
// SIZE controls the world scale (e.g. 0.18 for floor/grill, 0.13 for viewmodel)
function mkBread(size){
  size = size || 0.18;
  const g = new THREE.Group();

  // Procedural base — always visible, acts as size anchor
  const loafMat = new THREE.MeshLambertMaterial({color:0xD4944A});
  const darkMat = new THREE.MeshLambertMaterial({color:0xA06020});
  const loaf = new THREE.Mesh(new THREE.SphereGeometry(size * 0.5, 12, 8), loafMat);
  loaf.scale.set(1.55, 0.75, 1.0);
  loaf.visible = false;
  loaf.castShadow = true;
  g.add(loaf);
  const topBump = new THREE.Mesh(new THREE.SphereGeometry(size*0.55, 10, 7), darkMat);
  topBump.position.set(0, size*0.55, 0);
  topBump.visible = false;
  g.add(topBump);
  // Score lines
  [-size*0.28, size*0.28].forEach(x=>{
    const sc = new THREE.Mesh(new THREE.BoxGeometry(size*0.06, size*0.08, size*1.1), darkMat);
    sc.position.set(x, size*0.7, 0);
    sc.visible = false;
    g.add(sc);
  });

  // GLB overlay — scaled to match procedural size and centered
  if(breadGltfScene){
    const glb = breadGltfScene.clone(true);
    glb.traverse(c=>{ if(c.isMesh){ c.castShadow=true; c.material=c.material.clone(); } });
    const box = new THREE.Box3().setFromObject(glb);
    const sz = new THREE.Vector3(); box.getSize(sz);
    const sc = (size*2.0) / Math.max(sz.x, sz.y, sz.z);
    glb.scale.set(sc, sc, sc);
    // Center the GLB on origin
    const box2 = new THREE.Box3().setFromObject(glb);
    const centre = new THREE.Vector3(); box2.getCenter(centre);
    glb.position.sub(centre);
    g.add(glb);
  }

  return g;
}

let heldBreadData = null;

// ── FRONT PLAZA ──────────────────────────────────────────────────────
// Big concrete area in front of the store (negative Z = in front)
const plazaMat = new THREE.MeshLambertMaterial({color:0x888880});
// One big unified plaza slab covering kebab shop + breadshop + all surrounding area
// Kebab shop: x=-7 to 7, Breadshop: x=14 to 34, Road starts at z=10.5
const plazaFloor = new THREE.Mesh(new THREE.BoxGeometry(80,0.18,24),plazaMat);
plazaFloor.position.set(5,0.02,-1); // centred between both shops, covers z=-13 to z=11
scene.add(plazaFloor);

// Plaza curb strips —围 the unified plaza (x=-20 to 40, z=-13 to 11)
const curbMat = lm(0xAAAAAA);
const curbBack = bx(82,0.25,0.35,curbMat); curbBack.position.set(5,0.1,-13.2); scene.add(curbBack);
const curbLeft2 = bx(0.35,0.25,24,curbMat); curbLeft2.position.set(-35.2,0.1,-1); scene.add(curbLeft2);
const curbRight2 = bx(0.35,0.25,24,curbMat); curbRight2.position.set(45.2,0.1,-1); scene.add(curbRight2);

// Pavement crack/tile lines across full unified plaza
for(let cx=-4;cx<=8;cx++){
  const crackV=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.01,24),lm(0x777772));
  crackV.position.set(cx*5,0.12,-1); scene.add(crackV);
}
for(let cz=-2;cz<=2;cz++){
  const crackH=new THREE.Mesh(new THREE.BoxGeometry(62,0.01,0.06),lm(0x777772));
  crackH.position.set(10,0.12,cz*4-1); scene.add(crackH);
}
// Street lights on the plaza
[[-16,-6],[16,-6],[-16,-16],[16,-16],[0,-16]].forEach(([px,pz])=>{
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.1,5,8),lm(0x444444));
  pole.position.set(px,2.5,pz); scene.add(pole);
  const arm=new THREE.Mesh(new THREE.BoxGeometry(1.2,0.08,0.08),lm(0x444444));
  arm.position.set(px+0.6,5.1,pz); scene.add(arm);
  const bulb=new THREE.Mesh(new THREE.SphereGeometry(0.18,8,6),lm(0xFFFF99,0xFFFF66,2));
  bulb.position.set(px+1.2,5.1,pz); scene.add(bulb);
  const streetLight=new THREE.PointLight(0xFFEEBB,1.0,12);
  streetLight.position.set(px+1.2,5,pz); scene.add(streetLight);
  addCol(px,pz,0.18,0.18); // street light pole collider
});
// Benches on the plaza
[[-6,-5],[6,-5],[-6,-14],[6,-14]].forEach(([px,pz])=>{
  const bench=new THREE.Mesh(new THREE.BoxGeometry(2,0.12,0.5),lm(0x6B4226));
  bench.position.set(px,0.5,pz); scene.add(bench);
  const legL=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.5,0.5),lm(0x4A3020));
  legL.position.set(px-0.9,0.25,pz); scene.add(legL);
  const legR=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.5,0.5),lm(0x4A3020));
  legR.position.set(px+0.9,0.25,pz); scene.add(legR);
  addCol(px,pz,1.1,0.35); // bench collider
});
// Trash cans
[[-10,-3],[10,-3],[0,-8]].forEach(([px,pz])=>{
  const can=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.2,0.6,10),lm(0x335533));
  can.position.set(px,0.3,pz); scene.add(can);
  const lid=new THREE.Mesh(new THREE.CylinderGeometry(0.24,0.24,0.06,10),lm(0x224422));
  lid.position.set(px,0.63,pz); scene.add(lid);
  addCol(px,pz,0.28,0.28); // trash can collider
});

// 🌳 BLACK TREES — Eesa (left) and Aiden (further left) on the plaza
{
  function mkBlackTree(tx, tz, name){
    // Trunk
    const trunk=new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.25,2.2,10),lm(0x0a0a0a));
    trunk.position.set(tx,1.1,tz); scene.add(trunk);
    addCol(tx,tz,0.38,0.38); // solid collider for black tree trunk
    // Foliage layers
    [[0,3.2,0,1.6],[0,4.2,0,1.3],[0.3,4.9,0.2,0.95],[-0.2,5.4,-0.1,0.7]].forEach(([ox,oy,oz,r])=>{
      const leaf=new THREE.Mesh(new THREE.SphereGeometry(r,10,8),lm(0x050505));
      leaf.position.set(tx+ox,oy,tz+oz); scene.add(leaf);
    });
    [[1.0,3.6,0.4,0.7],[-0.9,3.8,-0.3,0.75],[0.4,3.5,-0.8,0.65],[-0.5,4.4,0.7,0.6]].forEach(([ox,oy,oz,r])=>{
      const leaf=new THREE.Mesh(new THREE.SphereGeometry(r,8,6),lm(0x080808));
      leaf.position.set(tx+ox,oy,tz+oz); scene.add(leaf);
    });

    // ── Minecraft-style wooden sign in front of tree ──
    const poleH = 1.6;
    const signPole=new THREE.Mesh(new THREE.BoxGeometry(0.18,poleH,0.18),lm(0x8B6914));
    signPole.position.set(tx, poleH/2, tz+1.4); scene.add(signPole);
    addCol(tx, tz+1.4, 0.18, 0.18); // sign pole collider

    // Board sits right on top of pole
    const boardBaseY = poleH; // bottom of board = top of pole

    // Pixelated wood board — built from a grid of small boxes like MC
    const COLS=8, ROWS=5;
    const BW=0.14, BH=0.12;
    const boardW=COLS*BW, boardH=ROWS*BH;
    const woodColors=[0xC8A44A,0xB8943A,0xD4AA55,0xBE9835,0xCAA240,0xBC9230,0xD2A848,0xB49030];
    for(let r=0;r<ROWS;r++) for(let col=0;col<COLS;col++){
      const col3=woodColors[(r*3+col*2)%woodColors.length];
      const plank=new THREE.Mesh(new THREE.BoxGeometry(BW-0.01,BH-0.01,0.06),new THREE.MeshLambertMaterial({color:col3}));
      plank.position.set(tx - boardW/2 + col*BW + BW/2, boardBaseY + r*BH + BH/2, tz+1.44);
      scene.add(plank);
    }
    for(let r=0;r<ROWS-1;r++){
      const grain=new THREE.Mesh(new THREE.BoxGeometry(boardW+0.02,0.025,0.07),lm(0x7A5510));
      grain.position.set(tx, boardBaseY + r*BH + BH, tz+1.45); scene.add(grain);
    }
    const border=new THREE.Mesh(new THREE.BoxGeometry(boardW+0.06,boardH+0.06,0.04),lm(0x6A4808));
    border.position.set(tx, boardBaseY + boardH/2, tz+1.42); scene.add(border);
    addCol(tx, tz+1.44, boardW/2+0.08, 0.12); // sign board collider

    const cv=document.createElement('canvas'); cv.width=256; cv.height=128;
    const ctx=cv.getContext('2d');
    ctx.clearRect(0,0,256,128);
    ctx.font='bold 52px "Courier New", monospace';
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.fillStyle='rgba(0,0,0,0.4)';
    ctx.fillText(name,130,68);
    ctx.fillStyle='#2A0E00';
    ctx.fillText(name,128,66);
    const tex=new THREE.CanvasTexture(cv);
    const textPlane=new THREE.Mesh(
      new THREE.PlaneGeometry(boardW*0.85,boardH*0.7),
      new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false})
    );
    textPlane.position.set(tx, boardBaseY + boardH/2, tz+1.48);
    scene.add(textPlane);
  }

  mkBlackTree(-15, -4, 'EESA');
  mkBlackTree(-15, -11, 'AIDEN');
}

// ── DRIVEABLE CARS ────────────────────────────────────────────────────
const cars = [];
let inCar = null;

const CAR_SPAWN = [
  { x: -18, z: -18, ry: 0 },
  { x:  18, z: -18, ry: Math.PI },
];
const F1_CAR_SPAWN = [{ x: 185, z: 18, ry: 0 }];

function addCarFromModel(gltf, sp, stats){
  const mesh = gltf.scene.clone(true);
  mesh.traverse(c=>{ if(c.isMesh){c.castShadow=true;c.receiveShadow=true;} });
  const box = new THREE.Box3().setFromObject(mesh);
  const sz = new THREE.Vector3(); box.getSize(sz);
  const sc = 4.0 / Math.max(sz.x, sz.z);
  mesh.scale.set(sc, sc, sc);
  const box2 = new THREE.Box3().setFromObject(mesh);
  const ctr = new THREE.Vector3(); box2.getCenter(ctr);
  mesh.position.x -= ctr.x - sp.x;
  mesh.position.z -= ctr.z - sp.z;
  const groundOffset = -box2.min.y;
  mesh.position.y = groundOffset;
  mesh.rotation.y = sp.ry;
  scene.add(mesh);
  const car = {
    mesh, x: sp.x, y: 0, z: sp.z, ry: sp.ry, speed: 0,
    groundOffset,
    width: sz.x*sc*0.5+0.3, depth: sz.z*sc*0.5+0.3,
    maxSpeed: stats.maxSpeed, acc: stats.acc, steer: stats.steer,
    camDist: stats.camDist, camLookY: stats.camLookY,
    isF1: stats.isF1||false,
  };
  cars.push(car);
}

function loadCars(){
  const carLoader = new THREE.GLTFLoader();
  carLoader.load('model/Carsocool.glb', function(gltf){
    CAR_SPAWN.forEach(sp=>{
      addCarFromModel(gltf, sp, {maxSpeed:14,acc:7,steer:1.6,camDist:5.2,camLookY:1.15});
    });
    console.log('Carsocool cars loaded!');
  }, undefined, e => console.warn('Car load error (Carsocool)', e));

  const f1Loader = new THREE.GLTFLoader();
  f1Loader.load('model/f1.glb', function(gltf){
    gltf.scene.traverse(c=>{ if(c.isMesh){ c.material=c.material.clone(); c.material.color=new THREE.Color(0xFF0000); c.material.emissive=new THREE.Color(0x440000); c.material.emissiveIntensity=0.3; } });
    F1_CAR_SPAWN.forEach(sp=>{ addCarFromModel(gltf, sp, {maxSpeed:70,acc:35,steer:1.9,camDist:5.5,camLookY:0.8,isF1:true}); });
    console.log('F1 cars loaded!');
  }, undefined, e=>console.warn('Car load error (F1)',e));
}
loadCars();

function getCarPlayerNear(){
  for(const car of cars){
    const dx=PP.x-car.x, dz=PP.z-car.z;
    if(Math.sqrt(dx*dx+dz*dz)<3.5) return car;
  }
  return null;
}
function enterCar(car){
  inCar=car; car.speed=0;
  if(car.isF1) showMsg('🏎️ F1! WASD=steer  E=exit','#FF2222');
  else showMsg('🚗 Car! WASD=steer  E=exit','#FFD166');
}
function exitCar(){
  if(!inCar) return;
  const ejectX=inCar.x+Math.cos(inCar.ry)*2.5;
  const ejectZ=inCar.z-Math.sin(inCar.ry)*2.5;
  PP.set(ejectX,PH,ejectZ);
  const wasF1=inCar.isF1; inCar=null;
  showMsg(wasF1?'🏎️ Exited F1':'🚗 Exited car','#aaa');
}
function updateCar(delta){
  if(!inCar) return;
  const car=inCar;
  const CAR_MAX=car.maxSpeed??14;
  const CAR_ACC=car.acc??7;
  const CAR_STEER=car.steer??1.6;
  if(keys['KeyS']||keys['ArrowDown'])   car.speed=Math.min(CAR_MAX,car.speed+CAR_ACC*delta);
  else if(keys['KeyW']||keys['ArrowUp']) car.speed=Math.max(-CAR_MAX*0.5,car.speed-CAR_ACC*delta);
  else{ car.speed*=Math.pow(0.05,delta); if(Math.abs(car.speed)<0.05)car.speed=0; }
  if(Math.abs(car.speed)>0.1){
    const steerDir=car.speed>0?1:-1;
    if(keys['KeyA']||keys['ArrowLeft'])  car.ry-=CAR_STEER*delta*steerDir;
    if(keys['KeyD']||keys['ArrowRight']) car.ry+=CAR_STEER*delta*steerDir;
  }
  const modelOffset=car.isF1?0:-Math.PI/2;
  const moveAngle=car.ry+modelOffset;
  car.x-=Math.sin(moveAngle)*car.speed*delta;
  car.z-=Math.cos(moveAngle)*car.speed*delta;
  // Collision
  const hw=Math.max(car.width||1.2,1.5), hd=Math.max(car.depth||2.2,1.5);
  for(let i=0;i<colliders.length;i++){
    const c=colliders[i];
    const cx=(c.minX+c.maxX)/2,cz=(c.minZ+c.maxZ)/2;
    const chw=(c.maxX-c.minX)/2+hw,chd=(c.maxZ-c.minZ)/2+hd;
    const dx=car.x-cx,dz=car.z-cz;
    if(Math.abs(dx)<chw&&Math.abs(dz)<chd){
      const ox=chw-Math.abs(dx),oz=chd-Math.abs(dz);
      if(ox<oz)car.x+=ox*Math.sign(dx);else car.z+=oz*Math.sign(dz);
      car.speed*=0.2;
    }
  }
  car.x=Math.max(-21,Math.min(269,car.x));
  car.z=Math.max(-127,Math.min(79,car.z));
  car.y=0;
  car.mesh.position.set(car.x,car.y+(car.groundOffset||0),car.z);
  car.mesh.rotation.y=car.ry;
  // Camera
  const camAngle=car.ry+modelOffset;
  const tgtX=car.x-Math.sin(camAngle)*(car.isF1?7:8);
  const tgtZ=car.z-Math.cos(camAngle)*(car.isF1?7:8);
  const smooth=8*delta;
  camera.position.x+=(tgtX-camera.position.x)*Math.min(smooth,1);
  camera.position.y=car.y+1.5;
  camera.position.z+=(tgtZ-camera.position.z)*Math.min(smooth,1);
  camera.lookAt(car.x,car.y+0.6,car.z);
  yaw=car.ry+Math.PI;
  PP.set(car.x,PH,car.z);
}
window._updateCar=updateCar;
window._enterCar=enterCar;
window._exitCar=exitCar;
window._getCarPlayerNear=getCarPlayerNear;
window._inCar=()=>inCar;

// ══════════════════════════════════════════════════════════════════════
// ── EXPANDED MAP (neighbourhood, free drive zone, F1 oval track)
// ══════════════════════════════════════════════════════════════════════
(function(){
  const WH=4.5,WT=0.7,WM=lm(0x555555),YM=lm(0xFFDD00);
  function wall(x,z,w,d){
    const b=bx(w,WH,d,WM);b.position.set(x,WH/2,z);scene.add(b);
    const y=bx(w,0.22,d,YM);y.position.set(x,WH,z);scene.add(y);
    addCol(x,z,w/2,d/2);
  }

  // ── NEIGHBOURHOOD ──────────────────────────────────────────────────
  const nbPave=bx(80,0.18,5,lm(0x999994));nbPave.position.set(14,0.02,32);scene.add(nbPave);
  const nbKerb=bx(80,0.25,0.3,lm(0xBBBBBB));nbKerb.position.set(14,0.1,30.1);scene.add(nbKerb);
  const nbGrass=bx(80,0.12,52,lm(0x4A7A38));nbGrass.position.set(14,0.01,56);scene.add(nbGrass);
  const pM=lm(0xBBBBAA);
  const pH=bx(54,0.15,2.2,pM);pH.position.set(4,0.08,34.8);scene.add(pH);
  [[-15],[5],[22]].forEach(([px])=>{const p=bx(2.4,0.15,10,pM);p.position.set(px,0.08,39);scene.add(p);});
  const pH2=bx(54,0.15,2.2,pM);pH2.position.set(4,0.08,46);scene.add(pH2);
  function mkB(cx,cz,w,d,h,wc,rc){
    const wm=lm(wc);
    const f=bx(w,h,0.3,wm);f.position.set(cx,h/2,cz-d/2);scene.add(f);
    const bk=bx(w,h,0.3,wm);bk.position.set(cx,h/2,cz+d/2);scene.add(bk);
    const lw2=bx(0.3,h,d,wm);lw2.position.set(cx-w/2,h/2,cz);scene.add(lw2);
    const rw2=bx(0.3,h,d,wm);rw2.position.set(cx+w/2,h/2,cz);scene.add(rw2);
    const fl=bx(w,0.12,d,lm(0xCCCCCC));fl.position.set(cx,0.06,cz);scene.add(fl);
    const rf=bx(w+0.5,0.45,d+0.5,lm(rc));rf.position.set(cx,h+0.22,cz);scene.add(rf);
    const dr=bx(0.9,2.0,0.1,lm(0x5C3A1A));dr.position.set(cx,1.0,cz-d/2-0.18);scene.add(dr);
    [-w/3,w/3].forEach(wx=>{
      const wf=bx(1.0,1.0,0.08,lm(0x3A2A1A));wf.position.set(cx+wx,h*0.55,cz-d/2-0.18);scene.add(wf);
      const wg=new THREE.Mesh(new THREE.BoxGeometry(0.8,0.8,0.04),new THREE.MeshLambertMaterial({color:0x88CCEE,transparent:true,opacity:0.45}));
      wg.position.set(cx+wx,h*0.55,cz-d/2-0.18);scene.add(wg);
    });
    addCol(cx,cz,w/2+0.3,d/2+0.3);
  }
  mkB(-15,40,9,7,5.5,0xEEEEDD,0x2A8A2A);
  mkB(5,40,11,7,5.5,0xDDCCAA,0xCC4422);
  mkB(22,40,9,7,5.5,0xCCDDEE,0x2244AA);
  mkB(-18,62,10,9,5.5,0xAA8866,0x882222);
  mkB(-3,63,11,9,6,0xEEEEEE,0x884422);
  mkB(13,62,10,9,5.5,0x8899CC,0x334488);
  mkB(28,63,10,9,5.5,0xDDCC66,0x886622);
  [[-20,34],[0,34],[16,34],[30,34],[-20,47],[0,47],[16,47],[30,47]].forEach(([tx,tz])=>{
    const t=cy(0.18,0.22,3.5,lm(0x5A3E28));t.position.set(tx,1.75,tz);scene.add(t);addCol(tx,tz,0.28,0.28);
    [[1.6,4.2,0x33BB55],[1.3,5.5,0x2AA845],[0.9,6.4,0x228835]].forEach(([r,y,c])=>{
      const lf=new THREE.Mesh(new THREE.SphereGeometry(r,8,6),lm(c));lf.position.set(tx,y,tz);scene.add(lf);
    });
  });

  // ── FREE DRIVE ZONE ────────────────────────────────────────────────
  const FX=110,FZ=27,FW=110,FD=90;
  const ftm=bx(FW,0.04,FD,lm(0x2A2A2A));ftm.position.set(FX,0.01,FZ);scene.add(ftm);
  for(let gx=-50;gx<=50;gx+=10){const g=bx(0.1,0.03,FD,lm(0x3A3A3A));g.position.set(FX+gx,0.04,FZ);scene.add(g);}
  for(let gz=-40;gz<=40;gz+=10){const g=bx(FW,0.03,0.1,lm(0x3A3A3A));g.position.set(FX,0.04,FZ+gz);scene.add(g);}
  [[85,10],[95,30],[110,5],[120,25],[100,45],[130,15],[115,40],[90,38]].forEach(([cx,cz])=>{
    const cone=new THREE.Mesh(new THREE.ConeGeometry(0.22,0.7,8),lm(0xFF6600));cone.position.set(cx,0.35,cz);scene.add(cone);
    const base=bx(0.5,0.06,0.5,lm(0xFF6600));base.position.set(cx,0.03,cz);scene.add(base);
    addCol(cx,cz,0.25,0.25);
  });

  // ── F1 CAR ZONE ────────────────────────────────────────────────────
  const PX=220,PZ=27,PW=100,PD=90;
  const ptm=bx(PW,0.04,PD,lm(0x252525));ptm.position.set(PX,0.01,PZ);scene.add(ptm);
  for(let gx=-45;gx<=45;gx+=10){const g=bx(0.1,0.03,PD,lm(0x353535));g.position.set(PX+gx,0.04,PZ);scene.add(g);}
  for(let gz=-40;gz<=40;gz+=10){const g=bx(PW,0.03,0.1,lm(0x353535));g.position.set(PX,0.04,PZ+gz);scene.add(g);}
  for(let px=-35;px<=35;px+=12){
    const bay=bx(10,0.03,18,lm(0x333333));bay.position.set(PX+px,0.05,PZ);scene.add(bay);
    const l1=bx(0.15,0.03,18,lm(0xFFFFFF));l1.position.set(PX+px-5,0.06,PZ);scene.add(l1);
    const l2=bx(0.15,0.03,18,lm(0xFFFFFF));l2.position.set(PX+px+5,0.06,PZ);scene.add(l2);
  }

  // ── F1 OVAL TRACK ──────────────────────────────────────────────────
  const OX=140,OZ=-82,OW=115,OH=28,TW=11;
  const tM=lm(0x1A1A1A),kR=lm(0xEE2222),kW=lm(0xEEEEEE);
  const og=bx(OW*2+TW*2+20,0.08,OH*2+TW*2+20,lm(0x2F7022));og.position.set(OX,0,OZ);scene.add(og);
  const ig=bx(OW*2-TW*3,0.1,OH*2-TW*3,lm(0x3A8A2A));ig.position.set(OX,0.04,OZ);scene.add(ig);
  const F1_SPAWN_X=OX-OW, F1_SPAWN_Z=OZ-OH+4;
  const f1SpawnRing=new THREE.Mesh(new THREE.RingGeometry(2.0,2.55,48),new THREE.MeshBasicMaterial({color:0xFF2222,side:THREE.DoubleSide,transparent:true,opacity:0.7}));
  f1SpawnRing.rotation.x=-Math.PI/2;f1SpawnRing.position.set(F1_SPAWN_X,0.055,F1_SPAWN_Z);scene.add(f1SpawnRing);
  const f1SpawnDot=new THREE.Mesh(new THREE.CircleGeometry(0.18,16),new THREE.MeshBasicMaterial({color:0xFF6666,side:THREE.DoubleSide}));
  f1SpawnDot.rotation.x=-Math.PI/2;f1SpawnDot.position.set(F1_SPAWN_X,0.06,F1_SPAWN_Z);scene.add(f1SpawnDot);
  window.F1_SPAWN_POS={x:F1_SPAWN_X,z:F1_SPAWN_Z};
  // Straights
  const sTop=bx(OW*2,0.06,TW,tM);sTop.position.set(OX,0.05,OZ-OH);scene.add(sTop);
  const sBot=bx(OW*2,0.06,TW,tM);sBot.position.set(OX,0.05,OZ+OH);scene.add(sBot);
  const sLft=bx(TW,0.06,OH*2,tM);sLft.position.set(OX-OW,0.05,OZ);scene.add(sLft);
  const sRgt=bx(TW,0.06,OH*2,tM);sRgt.position.set(OX+OW,0.05,OZ);scene.add(sRgt);
  // Kerbs
  function kS(x,z,len,vert){const n=Math.ceil(len/1.5);for(let i=0;i<n;i++){const k=bx(1.5,0.09,1.5,i%2===0?kR:kW);k.position.set(x+(vert?0:(i-n/2)*1.5+0.75),0.08,z+(vert?(i-n/2)*1.5+0.75:0));scene.add(k);}}
  kS(OX,OZ-OH-TW/2-1,OW*2,false);kS(OX,OZ-OH+TW/2+1,OW*2,false);
  kS(OX,OZ+OH-TW/2-1,OW*2,false);kS(OX,OZ+OH+TW/2+1,OW*2,false);
  kS(OX-OW-TW/2-1,OZ,OH*2,true);kS(OX-OW+TW/2+1,OZ,OH*2,true);
  kS(OX+OW-TW/2-1,OZ,OH*2,true);kS(OX+OW+TW/2+1,OZ,OH*2,true);
  // Centre dashes
  for(let dx=-OW+4;dx<OW;dx+=7){
    const d1=bx(3.5,0.07,0.2,lm(0xFFFFFF));d1.position.set(OX+dx,0.07,OZ-OH);scene.add(d1);
    const d2=bx(3.5,0.07,0.2,lm(0xFFFFFF));d2.position.set(OX+dx,0.07,OZ+OH);scene.add(d2);
  }
  // Start/finish line
  for(let i=0;i<8;i++){const sq=bx(TW/8,0.09,1.4,lm(i%2===0?0x000000:0xFFFFFF));sq.position.set(OX-OW-TW/2+i*(TW/8)+TW/16,0.08,OZ-OH+4);scene.add(sq);}
  const beam=bx(TW,0.2,0.2,lm(0x333333));beam.position.set(OX-OW,3.5,OZ-OH+4);scene.add(beam);
  [OX-OW-TW/2+1,OX-OW+TW/2-1].forEach(px=>{const post=bx(0.2,3.5,0.2,lm(0x333333));post.position.set(px,1.75,OZ-OH+4);scene.add(post);});

  // ── YELLOW BRIDGES ─────────────────────────────────────────────────
  const br1=bx(10,0.22,14,lm(0xFFDD00));br1.position.set(53,0.11,27);scene.add(br1);
  const br2=bx(9,0.22,14,lm(0xFFDD00));br2.position.set(166,0.11,27);scene.add(br2);
  const br3=bx(14,0.22,20,lm(0xFFDD00));br3.position.set(14,0.11,-31);scene.add(br3);
  const br4=bx(14,0.22,20,lm(0xFFDD00));br4.position.set(FX,0.11,-31);scene.add(br4);
  const br5=bx(14,0.22,20,lm(0xFFDD00));br5.position.set(PX,0.11,-31);scene.add(br5);

  // ── BORDER WALLS ───────────────────────────────────────────────────
  wall(120,80,310,WT);
  wall(120,-128,310,WT);
  const wWa=bx(WT,WH,210,WM);wWa.position.set(-22,WH/2,-24);scene.add(wWa);const yWa=bx(WT,0.22,210,YM);yWa.position.set(-22,WH,-24);scene.add(yWa);addCol(-22,-24,0.5,105);
  const wEa=bx(WT,WH,210,WM);wEa.position.set(270,WH/2,-24);scene.add(wEa);const yEa=bx(WT,0.22,210,YM);yEa.position.set(270,WH,-24);scene.add(yEa);addCol(270,-24,0.5,105);
})();
// ─────────────────────────────────────────────────────────────────────
// ── RAY GUN WALL MOUNT (plaza, right side) ──────────────────────────────
const RAYGUN_WALL_POS = new THREE.Vector3(6.6, 1.1, 4.5);
const rayGunWallG = new THREE.Group();
// Procedural fallback
const rgPlate = new THREE.Mesh(new THREE.BoxGeometry(0.18,0.55,0.55), lm(0x1A1A2E));
rayGunWallG.add(rgPlate);
const rgBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.055,0.055,0.35,10), lm(0x00FFAA,0x00FFAA,2.0));
rgBarrel.rotation.z=Math.PI/2; rgBarrel.position.set(0.22,0.0,0); rayGunWallG.add(rgBarrel);
const rgLight = new THREE.PointLight(0x00FFAA,1.5,4); rgLight.position.set(0.3,0,0); rayGunWallG.add(rgLight);
const rgLbl = new THREE.Mesh(new THREE.PlaneGeometry(1.1,0.28),
  new THREE.MeshBasicMaterial({map:textTex([{t:'[E] RAY GUN',s:20,c:'#00FFAA',y:38,f:'bold 20px monospace'}],'rgba(0,0,0,0.88)',256,56),transparent:true,side:THREE.DoubleSide}));
rgLbl.position.set(0,0.55,0); rayGunWallG.add(rgLbl);
// Load GLB for wall display
const rgWallLoader = new THREE.GLTFLoader();
rgWallLoader.load('model/RayGun.glb', function(gltf){
  rayGunWallG.remove(rgPlate);
  rayGunWallG.remove(rgBarrel);
  const rg = gltf.scene;
  const box = new THREE.Box3().setFromObject(rg);
  const sz = new THREE.Vector3(); box.getSize(sz);
  const sc = 0.9/Math.max(sz.x,sz.y,sz.z);
  rg.scale.set(sc,sc,sc);
  // Centre it
  const box2 = new THREE.Box3().setFromObject(rg);
  const centre = new THREE.Vector3(); box2.getCenter(centre);
  rg.position.sub(centre);
  rg.rotation.set(0, Math.PI/2, 0); // point sideways
  rayGunWallG.add(rg);
}, undefined, function(){});
rayGunWallG.position.copy(RAYGUN_WALL_POS);
rayGunWallG.rotation.y = Math.PI/2;
scene.add(rayGunWallG);
let rayGunWallAvailable = true;

// ── BLOCK SPAWNER BUTTON ─────────────────────────────────────────────
const SPAWN_BTN_POS = new THREE.Vector3(0, 0.11, -10);

// ── RETRO TV ─────────────────────────────────────────────────────────
{
  // TV sits on plaza facing the road (+Z direction = toward player spawn)
  // Player comes from z=10 side, so screen faces +Z
  const TX=8, TY=0, TZ=-6;
  const TV_POS = new THREE.Vector3(TX,TY,TZ);
  let tvState=0, tvStaticCtx=null, tvStaticTex=null, tvStaticAnim=null;

  // ── Cabinet (wood body) ──
  const tvCabinet=bx(1.8,1.4,0.9,lm(0x5C3A1A));
  tvCabinet.position.set(TX,0.85+0.45,TZ); scene.add(tvCabinet);
  addCol(TX,TZ,0.95,0.5);

  // ── Legs — attached to bottom of cabinet ──
  const legH=0.55, legY=legH/2;
  [[-0.62,-0.3],[0.62,-0.3],[-0.62,0.3],[0.62,0.3]].forEach(([dx,dz])=>{
    const leg=bx(0.12,legH,0.12,lm(0x3A2008));
    leg.position.set(TX+dx, legY, TZ+dz); scene.add(leg);
  });
  // Cross brace between legs
  const brace=bx(1.2,0.07,0.07,lm(0x3A2008));
  brace.position.set(TX,0.25,TZ); scene.add(brace);

  // ── Screen bezel (black frame, on FRONT face = +Z side) ──
  const FRONT_Z = TZ + 0.46; // front face of cabinet
  const bezel=bx(1.38,1.08,0.07,lm(0x111111));
  bezel.position.set(TX,1.3,FRONT_Z); scene.add(bezel);

  // ── Screen (slightly in front of bezel) ──
  const screenCanvas=document.createElement('canvas');
  screenCanvas.width=512; screenCanvas.height=384;
  tvStaticCtx=screenCanvas.getContext('2d');
  tvStaticTex=new THREE.CanvasTexture(screenCanvas);
  const screenMat=new THREE.MeshBasicMaterial({map:tvStaticTex,side:THREE.FrontSide});
  const screenMesh=new THREE.Mesh(new THREE.PlaneGeometry(1.18,0.88),screenMat);
  screenMesh.position.set(TX,1.3,FRONT_Z+0.04);
  // Screen faces +Z (toward player)
  screenMesh.rotation.y=0;
  scene.add(screenMesh);

  // ── Knobs (right side of bezel) ──
  [0.28,-0.28].forEach(dy=>{
    const knob=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,0.07,12),lm(0x222222));
    knob.rotation.x=Math.PI/2;
    knob.position.set(TX+0.76,1.3+dy,FRONT_Z+0.01); scene.add(knob);
  });

  // ── Antennas ──
  const ant1=bx(0.04,0.6,0.04,lm(0x999999));
  ant1.position.set(TX-0.3,1.95,TZ); ant1.rotation.z=0.3; scene.add(ant1);
  const ant2=bx(0.04,0.6,0.04,lm(0x999999));
  ant2.position.set(TX+0.3,1.95,TZ); ant2.rotation.z=-0.3; scene.add(ant2);

  // ── Screen glow light aimed toward player ──
  const tvLight=new THREE.PointLight(0x88AAFF,0,4);
  tvLight.position.set(TX,1.3,FRONT_Z+1.5); scene.add(tvLight);

  // ── Label ──
  const tvLbl=new THREE.Mesh(new THREE.PlaneGeometry(1.4,0.25),
    new THREE.MeshBasicMaterial({map:textTex([{t:'[ E ] TV',s:24,c:'#FFD166',y:46,f:'bold 24px monospace'}],'rgba(0,0,0,0.85)',300,64),transparent:true,side:THREE.DoubleSide}));
  tvLbl.position.set(TX,2.2,FRONT_Z); scene.add(tvLbl);

  // ── Video element ──
  const vid=document.createElement('video');
  vid.style.cssText='position:fixed;opacity:0;pointer-events:none;width:1px;height:1px;';
  vid.loop=true; vid.playsInline=true; vid.crossOrigin='anonymous';
  document.body.appendChild(vid);
  const vidTex=new THREE.VideoTexture(vid);
  vidTex.minFilter=THREE.LinearFilter;

  function tvDrawOff(){
    tvStaticCtx.fillStyle='#000';
    tvStaticCtx.fillRect(0,0,512,384);
    tvStaticTex.needsUpdate=true;
    screenMesh.material=new THREE.MeshBasicMaterial({map:tvStaticTex,side:THREE.FrontSide});
    tvLight.intensity=0;
  }

  function tvDrawStatic(){
    const img=tvStaticCtx.createImageData(512,384);
    for(let i=0;i<img.data.length;i+=4){
      const v=Math.random()*255|0;
      img.data[i]=img.data[i+1]=img.data[i+2]=v; img.data[i+3]=255;
    }
    tvStaticCtx.putImageData(img,0,0);
    tvStaticTex.needsUpdate=true;
    screenMesh.material=new THREE.MeshBasicMaterial({map:tvStaticTex,side:THREE.FrontSide});
    tvLight.intensity=0.4+Math.random()*0.3;
    tvLight.color.setRGB(0.8+Math.random()*0.2,0.8+Math.random()*0.2,0.8+Math.random()*0.2);
  }

  function tvShowVideo(src){
    vid.src=src; vid.load();
    vid.play().catch(e=>{ vid.muted=true; vid.play(); });
    screenMesh.material=new THREE.MeshBasicMaterial({map:vidTex,side:THREE.FrontSide});
    tvLight.intensity=0.7; tvLight.color.set(0x88AAFF);
  }

  let staticNode=null;
  function startStaticSound(){
    ensureAudio(); stopStaticSound();
    const buf=actx.createBuffer(1,actx.sampleRate*0.5,actx.sampleRate);
    const d=buf.getChannelData(0);
    for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*0.12;
    staticNode=actx.createBufferSource();
    staticNode.buffer=buf; staticNode.loop=true;
    const g=actx.createGain(); g.gain.value=0.15;
    staticNode.connect(g); g.connect(actx.destination);
    staticNode.start();
  }
  function stopStaticSound(){if(staticNode){try{staticNode.stop();}catch(e){}staticNode=null;}}

  window.tvInteract=function(fromSync){
    if(!fromSync) tvState=(tvState+1)%10;
    cancelAnimationFrame(tvStaticAnim);
    stopStaticSound();
    vid.pause(); vid.src='';
    if(tvState===0){ tvDrawOff(); showMsg('📺 TV off','#aaa'); }
    else if(tvState===1){
      function animStatic(){tvDrawStatic();tvStaticAnim=requestAnimationFrame(animStatic);}
      animStatic(); startStaticSound(); showMsg('📺 CH1 — Static 📡','#aaa');
    }
    else if(tvState===2){ tvShowVideo('model/sperm.mp4'); showMsg('📺 CH2 — Playing...','#FFD166'); }
    else if(tvState===3){ tvShowVideo('model/mommyasmr.mp4'); showMsg('📺 CH3 — Playing...','#FFD166'); }
    else if(tvState===4){ tvShowVideo('model/sad.mp4'); showMsg('📺 CH4 — Playing...','#FFD166'); }
    else if(tvState===5){ tvShowVideo('model/evd.mp4'); showMsg('📺 CH5 — Playing...','#FFD166'); }
    else if(tvState===6){ tvShowVideo('model/cat.mp4'); showMsg('📺 CH6 — Playing...','#FFD166'); }
    else if(tvState===7){ tvShowVideo('model/Ceo.mp4'); showMsg('📺 CH7 — Playing...','#FFD166'); }
    else if(tvState===8){ tvShowVideo('model/chessfunnyvid.mp4'); showMsg('📺 CH8 — Playing...','#FFD166'); }
    else if(tvState===9){ tvShowVideo('model/DiddyDiddygoaway.mp4'); showMsg('📺 CH9 — Playing...','#FFD166'); }
    if(!fromSync&&window.mpSocket&&window.mpConnected) mpSocket.emit('tvSync',{state:tvState});
  };
  window.tvSetState=function(state){tvState=state;window.tvInteract(true);};

  window.TV_POS=TV_POS;
  tvDrawOff();
}
const spawnBtnBase = new THREE.Mesh(new THREE.CylinderGeometry(0.55,0.6,0.22,16), lm(0x333333));
spawnBtnBase.position.set(0, 0.13, -10); scene.add(spawnBtnBase);
const spawnBtnTop = new THREE.Mesh(new THREE.CylinderGeometry(0.42,0.42,0.1,16), new THREE.MeshLambertMaterial({color:0xFF3300, emissive:0xFF1100, emissiveIntensity:1.2}));
spawnBtnTop.position.set(0, 0.27, -10); scene.add(spawnBtnTop);
const spawnBtnLight = new THREE.PointLight(0xFF4400, 1.8, 5);
spawnBtnLight.position.set(0, 0.8, -10); scene.add(spawnBtnLight);
const spawnBtnLbl = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.28),
  new THREE.MeshLambertMaterial({map:textTex([{t:'[ E ] SPAWN BLOCK',s:18,c:'#FF4400',y:40,f:'bold 18px monospace'}],'rgba(0,0,0,0.85)',280,56), transparent:true, side:THREE.DoubleSide}));
spawnBtnLbl.position.set(0, 0.7, -9.45); scene.add(spawnBtnLbl);



// Spawned pushable crates
const spawnedCrates = [];
let draggedCrate = null;   // the crate being dragged
let dragDist = 0;          // distance from camera to hold it at
const DRAG_KEY = 'MouseRight'; // we'll use right-click
function spawnCrate() {
  const cx = PP.x + Math.sin(yaw)*2.2;
  const cz = PP.z + Math.cos(yaw)*2.2; // note: forward is -cos(yaw) but spawn in front
  const size = 0.9;
  const colors = [0xFF6600,0x0055FF,0x00BB44,0xFF2299,0xFFCC00,0x00CCFF];
  const col = colors[spawnedCrates.length % colors.length];
  const mat = new THREE.MeshLambertMaterial({color:col});
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(size,size,size), mat);
  // edge lines
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(size,size,size)),
    new THREE.LineBasicMaterial({color:0xffffff, transparent:true, opacity:0.35})
  );
  mesh.add(edges);
  mesh.position.set(cx, size/2 + 0.11, cz);
  mesh.userData.tag = 'crate';
  scene.add(mesh);
  spawnedCrates.push({mesh, size, vx:0, vz:0});
  showMsg('Block spawned! Walk into it to push it', '#FF6600');
  playSound('catch');
}

function updateCrates(delta) {
  for(let i = spawnedCrates.length-1; i>=0; i--) {
    const c = spawnedCrates[i];
    if(draggedCrate === c) {
      // Dragged: move to crosshair target position
      const dir = new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion).normalize();
      const target = camera.position.clone().addScaledVector(dir, dragDist);
      target.y = c.size/2 + 0.11; // keep on ground
      c.mesh.position.lerp(target, 0.22);
      c.vx = 0; c.vz = 0;
      continue;
    }
    // Apply friction
    c.vx *= 0.91; c.vz *= 0.91;
    if(Math.abs(c.vx)<0.002) c.vx=0;
    if(Math.abs(c.vz)<0.002) c.vz=0;
    c.mesh.position.x += c.vx;
    c.mesh.position.z += c.vz;
    // Clamp to plaza bounds
    c.mesh.position.x = Math.max(-19, Math.min(19, c.mesh.position.x));
    c.mesh.position.z = Math.max(-21, Math.min(11, c.mesh.position.z));
    // Player walks into crate — push it
    const dx = PP.x - c.mesh.position.x;
    const dz = PP.z - c.mesh.position.z;
    const dist = Math.sqrt(dx*dx + dz*dz);
    const pushR = c.size/2 + 0.46;
    if(dist < pushR && dist > 0.01) {
      const nx = dx/dist, nz = dz/dist;
      // separate so they don't overlap
      const overlap = pushR - dist;
      PP.x += nx * overlap * 0.55;
      PP.z += nz * overlap * 0.55;
      c.mesh.position.x -= nx * overlap * 0.45;
      c.mesh.position.z -= nz * overlap * 0.45;
      // push velocity proportional to how fast player is moving into it
      c.vx = -nx * 0.28;
      c.vz = -nz * 0.28;
    }
  }
}

function tryGrabCrate() {
  if(inSewer || heldItem) return;
  if(draggedCrate) { draggedCrate = null; showMsg('Block released','#aaa'); return; }
  // Raycast for crate
  raycaster.setFromCamera(SCREEN_CENTER, camera);
  const meshes = spawnedCrates.map(c=>c.mesh);
  const hits = raycaster.intersectObjects(meshes, false);
  if(hits.length > 0 && hits[0].distance < 9) {
    const hit = hits[0].object;
    const c = spawnedCrates.find(c=>c.mesh===hit);
    if(c) {
      draggedCrate = c;
      dragDist = Math.max(2.5, Math.min(7, hits[0].distance));
      showMsg('Dragging block — right-click again to release','#FF6600');
    }
  }
}
// ─────────────────────────────────────────────────────────────────────

const MANHOLE_POS=new THREE.Vector3(0,0.1,22);
const SEWER_ENTRY_POS=new THREE.Vector3(40,SEWER_Y+1.7,40);
const SEWER_EXIT_POS=new THREE.Vector3(40,SEWER_Y+1.7,54);
sewerGroup.position.set(40,0,40);scene.add(sewerGroup);
sewerGroup.visible=false;sewerLights.forEach(l=>l.intensity=0);sideTunnelLights.forEach(l=>l.intensity=0);srLight.intensity=0;shaftLight.intensity=0;entryCircleLight.intensity=0;barrelGlow.intensity=0;

function mkSewerCap(){const g=new THREE.Group();const lid=new THREE.Mesh(new THREE.CylinderGeometry(0.62,0.62,0.09,20),lm(0x444444));g.add(lid);const rim=new THREE.Mesh(new THREE.TorusGeometry(0.64,0.06,8,20),lm(0x666666));rim.rotation.x=Math.PI/2;g.add(rim);for(let r2=-3;r2<=3;r2++){const gl=bx(1.12,0.025,0.045,lm(0x333333));gl.position.set(0,0.05,r2*0.16);g.add(gl);const gl2=bx(0.045,0.025,1.12,lm(0x333333));gl2.position.set(r2*0.16,0.05,0);g.add(gl2);}[[-0.38,-0.38],[0.38,-0.38],[-0.38,0.38],[0.38,0.38]].forEach(([dx,dz])=>{const bolt=new THREE.Mesh(new THREE.CylinderGeometry(0.038,0.038,0.05,8),lm(0x111111));bolt.position.set(dx,0.06,dz);g.add(bolt);});const lbl=new THREE.Mesh(new THREE.PlaneGeometry(1.6,0.34),new THREE.MeshLambertMaterial({map:textTex([{t:'[E]ENTER SEWER',s:22,c:'#00FF88',y:42,f:'bold 22px Impact'}],'rgba(0,0,0,0.88)',300,62),transparent:true,side:THREE.DoubleSide}));lbl.position.set(0,0.9,0);g.add(lbl);return g;}
const floatCapG=mkSewerCap();floatCapG.position.set(MANHOLE_POS.x,0.55,MANHOLE_POS.z);floatCapG.scale.set(0.55,0.55,0.55);floatCapG.userData.tag='sewerCap';scene.add(floatCapG);
const capRingGlow=new THREE.Mesh(new THREE.RingGeometry(0.72,0.9,24),new THREE.MeshBasicMaterial({color:0x00FF88,side:THREE.DoubleSide,transparent:true,opacity:0.55}));capRingGlow.rotation.x=-Math.PI/2;capRingGlow.position.set(MANHOLE_POS.x,0.2,MANHOLE_POS.z);scene.add(capRingGlow);
function mkExitCap(){const g=new THREE.Group();const lid2=new THREE.Mesh(new THREE.CylinderGeometry(0.58,0.58,0.09,20),lm(0x555555));g.add(lid2);const rim2=new THREE.Mesh(new THREE.TorusGeometry(0.60,0.055,8,20),lm(0x888888));rim2.rotation.x=Math.PI/2;g.add(rim2);for(let r2=-2;r2<=2;r2++){const gl=bx(1.0,0.025,0.04,lm(0x333333));gl.position.set(0,0.05,r2*0.18);g.add(gl);const gl2=bx(0.04,0.025,1.0,lm(0x333333));gl2.position.set(r2*0.18,0.05,0);g.add(gl2);}const lbl2=new THREE.Mesh(new THREE.PlaneGeometry(1.6,0.34),new THREE.MeshLambertMaterial({map:textTex([{t:'[E]EXIT SEWER',s:22,c:'#FFD166',y:42,f:'bold 22px Impact'}],'rgba(0,0,0,0.88)',300,62),transparent:true,side:THREE.DoubleSide}));lbl2.position.set(0,0.9,0);g.add(lbl2);return g;}
const floatExitCapG=mkExitCap();floatExitCapG.position.set(0,SEWER_Y+0.65,14.0);floatExitCapG.scale.set(0.5,0.5,0.5);floatExitCapG.userData.tag='sewerExit';sewerGroup.add(floatExitCapG);
const exitCapRing=new THREE.Mesh(new THREE.RingGeometry(0.66,0.82,24),new THREE.MeshBasicMaterial({color:0xFFD166,side:THREE.DoubleSide,transparent:true,opacity:0.55}));exitCapRing.rotation.x=-Math.PI/2;exitCapRing.position.set(0,SEWER_Y+0.2,14.0);sewerGroup.add(exitCapRing);

const clouds=[];
function mkCloud(x,y,z,s=1){const g=new THREE.Group();[{p:[0,0,0],r:1.75},{p:[1.8,0.32,0],r:1.4},{p:[-1.8,0.32,0],r:1.2},{p:[0,1.0,0],r:1.1}].forEach(({p,r})=>{const c=new THREE.Mesh(new THREE.SphereGeometry(r*s,9,6),lm(0xFFFFFF));c.position.set(...p);g.add(c);});g.position.set(x,y,z);scene.add(g);clouds.push(g);}
mkCloud(-22,25,-30,1.25);mkCloud(15,27,-32,1.05);mkCloud(26,21,-22,0.9);mkCloud(-6,29,-36,1.5);

function addWire(x1,y1,z1,x2,y2,z2){const pts=[];for(let i=0;i<=12;i++){const t=i/12;pts.push(new THREE.Vector3(x1+(x2-x1)*t,y1+(y2-y1)*t+Math.sin(t*Math.PI)*-0.55,z1+(z2-z1)*t));}scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0x222222})));}
addWire(-17,9.2,7,17,9.2,7);addWire(-17,8.65,7,17,8.65,7);

const COOK_TIME=60;
const GSLOTS=[new THREE.Vector3(-1.72,0.97,4.1),new THREE.Vector3(-0.57,0.97,4.1),new THREE.Vector3(0.57,0.97,4.1),new THREE.Vector3(1.72,0.97,4.1)];
const grillSlots=GSLOTS.map(pos=>({pos,item:null,itemType:null,cookTime:0,maxCook:COOK_TIME,done:false,burned:false,frozen:false,ring:null}));
grillSlots.forEach(s=>{const pts=[];for(let i=0;i<=30;i++){const a=-Math.PI/2+Math.PI*2*(i/30);pts.push(new THREE.Vector3(Math.cos(a)*0.25,0,Math.sin(a)*0.25));}const ring=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0xFFE600,linewidth:2}));ring.rotation.x=-Math.PI/2;ring.position.copy(s.pos);ring.position.y+=0.06;ring.visible=false;scene.add(ring);s.ring=ring;});

let shopFireLevel=0,shopOnFire=false;
let extinguisherAmmoo=100;

// --- BREADSHOP GLB ---
(function(){
  // Breadshop sits to the right of kebab shop, facing south (door toward road at z=11+)
  // Kebab shop: x=-7 to 7, z=0 to 9.5
  // Breadshop: x=15 to 29 (centre=22), z=0 to 9.5 (centre=4.75) — same as kebab
  const BS_X = 26;
  const BS_Z = 4.75;
  const BS_W = 28;   // 2x kebab shop width
  const BS_D = 16;   // bigger depth too

  const bsLoader = new THREE.GLTFLoader();
  bsLoader.load('model/BREADSHOP.glb', function(gltf){
    const bs = gltf.scene;
    bs.traverse(c=>{ if(c.isMesh){ c.castShadow=true; c.receiveShadow=true; c.raycast=()=>{}; } });


    const box = new THREE.Box3().setFromObject(bs);
    const sz = new THREE.Vector3(); box.getSize(sz);
    // Scale to match kebab shop width (14 units)
    const sc = 20 / Math.max(sz.x, sz.z);
    bs.scale.set(sc, sc, sc);
    // Try rotation 0 = door faces -Z (back), PI = door faces +Z (front/road)
    // PI/2 = door faces +X (right), -PI/2 = door faces -X (left)
    bs.rotation.y = -Math.PI/2; // face south toward road
    const box2 = new THREE.Box3().setFromObject(bs);
    const c2 = new THREE.Vector3(); box2.getCenter(c2);
    bs.position.set(BS_X - c2.x, -box2.min.y, BS_Z - c2.z);
    scene.add(bs);

    // Checkerboard floor fitted exactly inside building footprint
    const cols=10, rows=8;
    const tw=BS_W/cols, td=BS_D/rows;
    const m1=new THREE.MeshLambertMaterial({color:0xFFFFFF}), m2=new THREE.MeshLambertMaterial({color:0x050505});
    for(let fi=0;fi<cols;fi++) for(let fj=0;fj<rows;fj++){
      const tile=new THREE.Mesh(new THREE.BoxGeometry(tw-0.04,0.07,td-0.04),(fi+fj)%2===0?m1:m2);
      tile.position.set(BS_X-BS_W/2+fi*tw+tw/2, 0.04, BS_Z-BS_D/2+fj*td+td/2);
      tile.receiveShadow=true;
      scene.add(tile);
    }
    console.log('BREADSHOP loaded scale='+sc.toFixed(3));

  }, undefined, function(e){ console.warn('BREADSHOP load error', e); });

  // ── BREADSHOP INTERIOR ────────────────────────────────────────────
  const BX=26, BZ=4.75;

  // ── PAYMENT COUNTER ───────────────────────────────────────────────
  const counterBase=bx(3.5,0.9,0.9,lm(0x5C3A1A));
  counterBase.position.set(BX,0.45,BZ+2.5); scene.add(counterBase);
  const counterTop=bx(3.7,0.08,1.1,lm(0x8B6914));
  counterTop.position.set(BX,0.91,BZ+2.5); scene.add(counterTop);
  const regBase=bx(0.5,0.3,0.35,lm(0x222222));
  regBase.position.set(BX+0.6,1.06,BZ+2.5); scene.add(regBase);
  const regScreen=bx(0.38,0.28,0.06,lm(0x111111));
  regScreen.position.set(BX+0.6,1.24,BZ+2.32); scene.add(regScreen);

  // ── JASON NPC ─────────────────────────────────────────────────────
  const jasonSkinColor = 0xC68642;
  const jasonMesh = (function(){
    const g=new THREE.Group();
    const bodyMat=new THREE.MeshLambertMaterial({color:0xC8A400});
    const bodyCyl=new THREE.Mesh(new THREE.CylinderGeometry(0.26,0.30,0.72,18),bodyMat);
    bodyCyl.position.y=0.55; g.add(bodyCyl);
    const bodyCapTop=new THREE.Mesh(new THREE.SphereGeometry(0.26,16,8,0,Math.PI*2,0,Math.PI/2),bodyMat);
    bodyCapTop.position.y=0.91; g.add(bodyCapTop);
    const bodyCapBot=new THREE.Mesh(new THREE.SphereGeometry(0.30,16,8,0,Math.PI*2,Math.PI/2,Math.PI/2),bodyMat);
    bodyCapBot.position.y=0.19; g.add(bodyCapBot);
    const headMat=new THREE.MeshLambertMaterial({color:jasonSkinColor});
    const head=new THREE.Mesh(new THREE.SphereGeometry(0.30,18,12),headMat);
    head.position.y=1.30; head.castShadow=true; g.add(head);
    const eyeMat=new THREE.MeshLambertMaterial({color:0x111111});
    const eyeL=new THREE.Mesh(new THREE.SphereGeometry(0.072,10,8),eyeMat);
    eyeL.scale.set(0.7,1.0,0.45); eyeL.position.set(-0.105,1.32,0.27); g.add(eyeL);
    const eyeR=new THREE.Mesh(new THREE.SphereGeometry(0.072,10,8),eyeMat);
    eyeR.scale.set(0.7,1.0,0.45); eyeR.position.set(0.105,1.32,0.27); g.add(eyeR);

    const nlc=document.createElement('canvas'); nlc.width=128; nlc.height=32;
    const nlx=nlc.getContext('2d');
    nlx.fillStyle='rgba(0,0,0,0.7)'; nlx.fillRect(0,0,128,32);
    nlx.font='bold 18px monospace'; nlx.fillStyle='#FFD166'; nlx.textAlign='center';
    nlx.fillText('JASON',64,22);
    const nlTex=new THREE.CanvasTexture(nlc);
    const nlMesh=new THREE.Mesh(new THREE.PlaneGeometry(0.8,0.2),new THREE.MeshBasicMaterial({map:nlTex,transparent:true,side:THREE.DoubleSide}));
    nlMesh.position.y=1.72; g.add(nlMesh); g._nameLabel=nlMesh;
    const ilc=document.createElement('canvas'); ilc.width=256; ilc.height=48;
    const ilx=ilc.getContext('2d');
    ilx.fillStyle='rgba(0,0,0,0.75)'; ilx.fillRect(0,0,256,48);
    ilx.font='bold 14px monospace'; ilx.fillStyle='#fff'; ilx.textAlign='center';
    ilx.fillText('[E] GET BREAD',128,30);
    const ilTex=new THREE.CanvasTexture(ilc);
    const ilMesh=new THREE.Mesh(new THREE.PlaneGeometry(1.4,0.28),new THREE.MeshBasicMaterial({map:ilTex,transparent:true,side:THREE.DoubleSide}));
    ilMesh.position.y=2.1; g.add(ilMesh); g._interactLabel=ilMesh;
    return g;
  })();
  jasonMesh.position.set(BX,0,BZ+1.2);
  jasonMesh.rotation.y=Math.PI;
  scene.add(jasonMesh);
  addCol(BX,BZ+1.2,0.35,0.35);
  window._jasonMesh=jasonMesh;
  window.JASON_POS=new THREE.Vector3(BX,0,BZ+1.2);

  // ── BREAD VENDING MACHINES ────────────────────────────────────────
  const VEND_POS_LIST=[];
  [{x:BX-5,z:BZ-3},{x:BX+5,z:BZ-3}].forEach(vp=>{
    const cab=bx(0.7,2.2,1.1,lm(0x2A2A3A)); cab.position.set(vp.x,1.1,vp.z); scene.add(cab);
    addCol(vp.x,vp.z,0.4,0.6);
    const vendLbl=new THREE.Mesh(new THREE.PlaneGeometry(0.9,0.28),new THREE.MeshBasicMaterial({map:textTex([{t:'BREAD [E] GET',s:18,c:'#FFD166',y:42,f:'bold 18px monospace'}],'rgba(0,0,0,0.85)',256,64),transparent:true,side:THREE.DoubleSide}));
    vendLbl.position.set(vp.x,2.5,vp.z); scene.add(vendLbl);
    VEND_POS_LIST.push(new THREE.Vector3(vp.x,0,vp.z));
  });
  window.VEND_POS_LIST=VEND_POS_LIST;

  // ── Fill gap between plaza and road with sidewalk strip ──────────
  const sidewalk = bx(80, 0.18, 3, lm(0x888880));
  sidewalk.position.set(10, 0.02, 12);
  scene.add(sidewalk);
  // Kerb at edge of sidewalk -> road
  const kerb = bx(80, 0.25, 0.3, lm(0xBBBBBB));
  kerb.position.set(10, 0.1, 13.6);
  scene.add(kerb);

  // ── ROAD ─────────────────────────────────────────────────────────
  const mainRoad = bx(80, 0.04, 16, lm(0x1A1A1A));
  mainRoad.position.set(10, 0.01, 22);
  scene.add(mainRoad);
  // Yellow centre dashes
  for(let i=-14;i<=14;i++){
    const dash=bx(2.4,0.05,0.14,lm(0xFFDD00));
    dash.position.set(i*4.5,0.05,22);
    scene.add(dash);
  }
  // White edge lines
  const edgeNear=bx(80,0.05,0.18,lm(0xFFFFFF)); edgeNear.position.set(10,0.05,14.1); scene.add(edgeNear);
  const edgeFar=bx(80,0.05,0.18,lm(0xFFFFFF));  edgeFar.position.set(10,0.05,29.9);  scene.add(edgeFar);
})();

// --- GUN VIEWMODEL ---
var gunScene=new THREE.Scene();
var gunCam=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,0.01,10);
const gunGroup=new THREE.Group();
let vmLight;
const slideM=lm(0x1A1A1A),frameM=lm(0x2A2A2A),gripM=lm(0x222222);
const slide=bx(0.038,0.038,0.265,slideM);slide.position.set(0,0.012,-0.13);gunGroup.add(slide);
for(let i=0;i<5;i++){const ser=bx(0.041,0.04,0.006,lm(0x0A0A0A));ser.position.set(0,0.012,-0.01+i*-0.015);gunGroup.add(ser);}
const gkBarrel=new THREE.Mesh(new THREE.CylinderGeometry(0.011,0.011,0.04,10),slideM);gkBarrel.rotation.x=Math.PI/2;gkBarrel.position.set(0,0.009,-0.275);gunGroup.add(gkBarrel);
const muzzle=new THREE.Mesh(new THREE.TorusGeometry(0.011,0.003,6,12),lm(0x333333));muzzle.rotation.x=Math.PI/2;muzzle.position.set(0,0.009,-0.295);gunGroup.add(muzzle);
const fsight=bx(0.005,0.008,0.005,lm(0x333333));fsight.position.set(0,0.034,-0.255);gunGroup.add(fsight);
const rsight=bx(0.03,0.007,0.006,lm(0x2A2A2A));rsight.position.set(0,0.033,-0.045);gunGroup.add(rsight);
const frame2=bx(0.042,0.032,0.24,frameM);frame2.position.set(0,-0.012,-0.12);gunGroup.add(frame2);
const rail2=bx(0.038,0.018,0.14,frameM);rail2.position.set(0,-0.007,-0.2);gunGroup.add(rail2);
const tg=new THREE.Mesh(new THREE.TorusGeometry(0.024,0.006,6,16,Math.PI),frameM);tg.position.set(0,-0.024,0.02);tg.rotation.z=Math.PI/2;gunGroup.add(tg);
const trigger2=bx(0.006,0.022,0.009,lm(0x222222));trigger2.position.set(0,-0.013,0.015);gunGroup.add(trigger2);
const grip2=bx(0.04,0.085,0.11,gripM);grip2.position.set(0,-0.065,0.045);grip2.rotation.x=-0.08;gunGroup.add(grip2);
for(let row=0;row<4;row++)for(let col=0;col<3;col++){const dot=new THREE.Mesh(new THREE.SphereGeometry(0.003,4,3),lm(0x111111));dot.position.set(-0.015+col*0.015,-0.03-row*0.017,0.105+row*0.003);gunGroup.add(dot);}
const bs=bx(0.038,0.08,0.018,lm(0x1E1E1E));bs.position.set(0,-0.065,0.1);gunGroup.add(bs);
const mag2=bx(0.034,0.045,0.095,lm(0x1A1A1A));mag2.position.set(0,-0.108,0.045);gunGroup.add(mag2);
const magFloor=bx(0.038,0.008,0.098,lm(0x333333));magFloor.position.set(0,-0.131,0.045);gunGroup.add(magFloor);
gunGroup.position.set(0.15,-0.14,-0.3);gunGroup.rotation.set(0.0,-0.06,0);gunGroup.scale.set(1.8,1.8,1.8);gunGroup.visible=false;
gunScene.add(gunGroup);gunScene.add(new THREE.AmbientLight(0xffffff,0.8));
const gunDL=new THREE.DirectionalLight(0xffffee,0.6);gunDL.position.set(1,2,2);gunScene.add(gunDL);
// small viewmodel light attached to the gun group to brighten held weapon
vmLight=new THREE.PointLight(0xffffff,0);
vmLight.position.set(0.5,0.5,-0.2);
gunGroup.add(vmLight);

// ============================================================
// SHOTGUN VIEWMODEL
// ============================================================
function mkShotgunProcedural(){
  const g=new THREE.Group();
  const woodM2=new THREE.MeshLambertMaterial({color:0x5A3010});
  const metalM2=new THREE.MeshLambertMaterial({color:0x222222});
  const stock=new THREE.Mesh(new THREE.BoxGeometry(0.04,0.048,0.22),woodM2);stock.position.set(0,-0.01,0.1);g.add(stock);
  const recv=new THREE.Mesh(new THREE.BoxGeometry(0.044,0.052,0.18),metalM2);recv.position.set(0,0.005,-0.04);g.add(recv);
  const barrel2=new THREE.Mesh(new THREE.CylinderGeometry(0.013,0.013,0.38,10),metalM2);barrel2.rotation.x=Math.PI/2;barrel2.position.set(0,0.008,-0.29);g.add(barrel2);
  const pump=new THREE.Mesh(new THREE.BoxGeometry(0.042,0.032,0.1),woodM2);pump.position.set(0,-0.006,-0.2);g.add(pump);
  const grip3=new THREE.Mesh(new THREE.BoxGeometry(0.036,0.07,0.07),woodM2);grip3.position.set(0,-0.055,0.04);grip3.rotation.x=0.1;g.add(grip3);
  const tg2=new THREE.Mesh(new THREE.TorusGeometry(0.018,0.005,5,12,Math.PI),metalM2);tg2.position.set(0,-0.022,0.04);tg2.rotation.z=Math.PI/2;g.add(tg2);
  const muz=new THREE.Mesh(new THREE.CylinderGeometry(0.018,0.013,0.025,10),metalM2);muz.rotation.x=Math.PI/2;muz.position.set(0,0.008,-0.49);g.add(muz);
  return g;
}

var vmShotgun=mkShotgunProcedural();
vmShotgun.visible=false;
// default viewmodel pose (moved down, pushed further back, and reduced scale)
vmShotgun.position.set(0.45, -0.42, -1.6);
vmShotgun.rotation.set(0.0,-0.06,0);
vmShotgun.scale.set(0.4,0.4,0.4);
gunScene.add(vmShotgun);
gunScene.add(vmPan);

function rebuildVmShotgun(){
  if(!shotgunModelReady||!shotgunGltfScene)return;
  if(vmShotgunBuilt)return;
  if(typeof gunScene==='undefined'||!gunScene)return; // gunScene not ready yet
  vmShotgunBuilt=true;
  const wasVisible=vmShotgun?vmShotgun.visible:false;
  if(vmShotgun)gunScene.remove(vmShotgun);
  // Clone raw GLB and make a wrapper group so we can center the geometry
  const raw = shotgunGltfScene.clone(true);
  raw.traverse(c=>{ if(c.isMesh){ c.material = c.material.clone(); c.castShadow = false; } });

  // flip the imported model so it faces correctly in the viewmodel (rotate 180° around Y)
  raw.rotation.y += Math.PI;

  // compute bounding box of the raw mesh (in its local space)
  const box = new THREE.Box3().setFromObject(raw);
  const center = box.getCenter(new THREE.Vector3());
  // shift the raw mesh so its center is at the group's origin
  raw.position.sub(center);
  
  // Create a wrapper group that will be positioned/rotated/scaled as the viewmodel
  const wrapper = new THREE.Group();
  wrapper.add(raw);
  wrapper.visible = wasVisible;

  // apply viewmodel transform to wrapper (keeps raw geometry centered inside)
  // move the shotgun lower, push it further back, and reduce scale so it doesn't cover the whole view
  wrapper.position.set(0.45, -0.42, -1.6);
  wrapper.rotation.set(0.0, -0.06, 0);
  wrapper.scale.set(0.4, 0.4, 0.4);

  gunScene.add(wrapper);
  // make vmShotgun reference the wrapper (so existing code that toggles/positions vmShotgun works)
  vmShotgun = wrapper;

  // Swap in GLB on wall mount if it loaded after the wall was already built
  if(gunWallG&&!gunWallG.userData.wallShotgunMesh){
    // Remove old procedural fallback pieces (not hooks/plaque)
    const toRemove=[];
    gunWallG.children.forEach(c=>{
      if(!c.userData.isHook&&!c.userData.isPlaque&&!(c===gwLbl)&&!(c===gwLight))
        toRemove.push(c);
    });
    toRemove.forEach(c=>gunWallG.remove(c));
    const wallShotgun=shotgunGltfScene.clone(true);
    wallShotgun.scale.set(0.18,0.18,0.18);
    wallShotgun.position.set(0,0.02,0.08);
    wallShotgun.rotation.set(0,Math.PI/2,0);
    gunWallG.add(wallShotgun);
    gunWallG.userData.wallShotgunMesh=wallShotgun;
  }
}


const extScene=new THREE.Scene();
const extGroup2=new THREE.Group();
const extBod=cy(0.06,0.06,0.3,lm(0xFF2222));extBod.rotation.x=-0.4;extGroup2.add(extBod);
const extNoz=bx(0.015,0.015,0.12,lm(0x111111));extNoz.position.set(0,0.03,-0.15);extNoz.rotation.x=-0.3;extGroup2.add(extNoz);
const extHan=bx(0.12,0.015,0.05,lm(0xCC0000));extHan.position.set(0,0.065,-0.02);extGroup2.add(extHan);
extGroup2.position.set(0.1,-0.12,-0.28);extGroup2.rotation.set(0.1,-0.1,0);
extScene.add(extGroup2);extScene.add(new THREE.AmbientLight(0xffffff,0.8));



function mkVmKebab(){const g=new THREE.Group();const lmH=function(col){return new THREE.MeshLambertMaterial({color:col});};const tortilla=new THREE.Mesh(new THREE.CylinderGeometry(0.28,0.28,0.042,20,1,false,0,Math.PI),lmH(0xDEBB60));tortilla.rotation.y=Math.PI/2;tortilla.position.y=0.021;g.add(tortilla);const bottom=new THREE.Mesh(new THREE.CircleGeometry(0.28,20,0,Math.PI),lmH(0xC9A84C));bottom.rotation.x=-Math.PI/2;bottom.rotation.z=Math.PI/2;g.add(bottom);const top2=new THREE.Mesh(new THREE.CircleGeometry(0.28,20,0,Math.PI),lmH(0xD4AA50));top2.rotation.x=Math.PI/2;top2.rotation.z=-Math.PI/2;top2.position.y=0.042;g.add(top2);const cheese=new THREE.Mesh(new THREE.CylinderGeometry(0.285,0.285,0.03,20,1,true,0,Math.PI),lmH(0xFFCC22));cheese.rotation.y=Math.PI/2;cheese.position.y=0.021;g.add(cheese);for(let i=0;i<3;i++){const mark=new THREE.Mesh(new THREE.BoxGeometry(0.4,0.007,0.03),lmH(0x3A2000));mark.position.set(-0.04,0.048,-0.08+i*0.08);mark.rotation.y=0.15;g.add(mark);}return g;}
function mkVmRat(){if(ratModelReady&&ratGltfScene){const clone=ratGltfScene.clone(true);clone.scale.set(1,1,1);clone.traverse(c=>{if(c.isMesh){c.material=c.material.clone();c.castShadow=false;}});return clone;}return mkVmRatProcedural();}
function mkVmRatProcedural(){const g=new THREE.Group();const lmH=function(col){return new THREE.MeshLambertMaterial({color:col});};const body=new THREE.Mesh(new THREE.SphereGeometry(0.18,12,8),lmH(0x7A5C4A));body.scale.set(1.5,0.82,1.0);g.add(body);const head=new THREE.Mesh(new THREE.SphereGeometry(0.12,10,7),lmH(0x7A5C4A));head.position.set(0.24,0.04,0);g.add(head);const snout=new THREE.Mesh(new THREE.SphereGeometry(0.06,8,6),lmH(0x8B6A58));snout.scale.set(1.3,0.85,1.0);snout.position.set(0.33,0.02,0);g.add(snout);[0.08,-0.08].forEach(function(z){const ear=new THREE.Mesh(new THREE.SphereGeometry(0.052,8,6),lmH(0x8A6B5A));ear.position.set(0.18,0.16,z);g.add(ear);const earI=new THREE.Mesh(new THREE.SphereGeometry(0.032,6,5),lmH(0xFF7070));earI.position.set(0.182,0.16,z);g.add(earI);});[0.07,-0.07].forEach(function(z){const eye=new THREE.Mesh(new THREE.SphereGeometry(0.026,6,5),lmH(0xFF2222));eye.position.set(0.34,0.08,z);g.add(eye);});const nose=new THREE.Mesh(new THREE.SphereGeometry(0.022,6,5),lmH(0xFF6666));nose.position.set(0.38,0.03,0);g.add(nose);const tailPts=[];for(let i=0;i<=8;i++){const t=i/8;tailPts.push(new THREE.Vector3(-0.22-t*0.35,Math.sin(t*Math.PI)*0.12,0));}g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(tailPts),new THREE.LineBasicMaterial({color:0xC08080})));return g;}

var vmKebab=mkVmKebab();vmKebab.visible=false;vmKebab.position.set(0.15,-0.14,-0.3);vmKebab.rotation.set(0.3,-0.4,0.08);vmKebab.scale.set(0.5,0.5,0.5);gunScene.add(vmKebab);
// Ray gun viewmodel
function mkVmRayGun(){
  const g=new THREE.Group();
  if(rayGunModelReady&&rayGunGltfScene){
    const m=rayGunGltfScene.clone(true);
    const box=new THREE.Box3().setFromObject(m);
    const sz=new THREE.Vector3(); box.getSize(sz);
    const sc=0.5/Math.max(sz.x,sz.y,sz.z);
    m.scale.set(sc,sc,sc);
    // Centre the model
    const box2=new THREE.Box3().setFromObject(m);
    const centre=new THREE.Vector3(); box2.getCenter(centre);
    m.position.sub(centre);
    g.add(m);
  } else {
    // fallback procedural ray gun
    const body=new THREE.Mesh(new THREE.BoxGeometry(0.28,0.1,0.1),lm(0x223344));g.add(body);
    const barrel=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.03,0.22,8),lm(0x00FFAA,0x00FFAA,1.5));barrel.rotation.z=Math.PI/2;barrel.position.set(0.22,0.02,0);g.add(barrel);
  }
  return g;
}
var vmRayGun=mkVmRayGun();
vmRayGun.visible=false;
vmRayGun.position.set(0.22,-0.18,-0.35);
vmRayGun.rotation.set(0, Math.PI, 0);
vmRayGun.scale.set(1,1,1);
gunScene.add(vmRayGun);

var vmRat=mkVmRat();vmRat.visible=false;vmRat.position.set(0.2,-0.18,-0.45);vmRat.rotation.set(0.0,Math.PI+0.3,0.0);vmRat.scale.set(0.11,0.11,0.11);
gunScene.add(vmRat);
// Bread viewmodel — rebuilt once bread GLB loads
var vmBread=null;
function buildVmBread(){
  if(vmBread) gunScene.remove(vmBread);
  vmBread = mkBread(0.11); // bigger viewmodel size
  vmBread.visible = false;
  vmBread.position.set(0.15, -0.14, -0.30);
  vmBread.rotation.set(0.3, -0.4, 0.08);
  gunScene.add(vmBread);
}
var vmGrilledRat=null;
function buildVmGrilledRat(){if(vmGrilledRat){gunScene.remove(vmGrilledRat);}if(ratModelReady&&ratGltfScene){vmGrilledRat=ratGltfScene.clone(true);vmGrilledRat.scale.set(1,1,1);vmGrilledRat.traverse(c=>{if(c.isMesh){c.material=c.material.clone();c.material.color.setHex(0x4A2200);c.castShadow=false;}});}else{vmGrilledRat=mkVmRatProcedural();vmGrilledRat.traverse(c=>{if(c.isMesh&&c.material){c.material=c.material.clone();c.material.color.setHex(0x4A2200);}if(c.isLine){c.material=c.material.clone();c.material.color.setHex(0x2A1000);}});}vmGrilledRat.visible=false;vmGrilledRat.position.set(0.2,-0.18,-0.45);vmGrilledRat.rotation.set(0.0,Math.PI+0.3,0.0);vmGrilledRat.scale.set(0.11,0.11,0.11);gunScene.add(vmGrilledRat);}
buildVmGrilledRat();

function checkAndRebuildVmRat(){if(!vmRatBuilt&&ratModelReady){vmRatBuilt=true;const wasVisible=vmRat?vmRat.visible:false;if(vmRat)gunScene.remove(vmRat);vmRat=mkVmRat();vmRat.visible=wasVisible;vmRat.position.set(0.2,-0.18,-0.45);vmRat.rotation.set(0.0,Math.PI+0.3,0.0);vmRat.scale.set(0.11,0.11,0.11);gunScene.add(vmRat);buildVmGrilledRat();rebuildFloatRat();}}

let gunBob=0,gunRecoil=0,isReloading=false;
let shotgunRecoil=0;
let score=0,served=0,stars=10,level=1;
let rats=[],customers=[],particles=[];
let inspMesh=null,inspData=null,inspActive=false,inspHP=0;
let inspLeaveTimer=0,inspWarningShown=false;
let heldItem=null;let heldRatData=null,heldKebabData=null; window.__heldItem=()=>heldItem;
Object.defineProperty(window,'heldItem',{get:()=>heldItem});
Object.defineProperty(window,'carriedItem',{get:()=>carriedItem});
let hasRayGun=false,rayGunAmmo=10,rayGunMaxAmmo=10,rayGunCooldown=0;
let rayRecharging=false,rayRechargeTimer=0;
const RAY_RECHARGE_TIME=30;
const rayRings=[];  // active ring projectiles
let basketCount=8;let hasGun=false,ammo=6,maxAmmo=6;
let hasShotgun=false,shotgunAmmo=9,shotgunMaxAmmo=9;
let hasPan=false,panSwingCooldown=0,panSwinging=false;
let inSewer=false;let playerHP=100,maxPlayerHP=100;
const sewerRats=[];let hasExt=false;
let custT=0,inspT=0,refillT=0;

// ── COMBO SYSTEM ──────────────────────────────────────────────────────
let comboCount=0, comboTimer=0;
const COMBO_WINDOW=6.0; // seconds to serve next customer for combo

// rain state declared below with the full system
let rainChanceTimer=0;
const INSP_INTERVAL=300;
const PP=new THREE.Vector3(0,1.7,10);
let freeCam=false;
const fcPos=new THREE.Vector3(0,4,10);
let fcYaw=Math.PI, fcPitch=0;
let velY=0,onGround=true,bobPhase=0,moving=false,stepT=0;
window.__setYaw=(v)=>{yaw=v;}; window.__getYaw=()=>yaw;
window.__setPitch=(v)=>{pitch=v;}; window.__getPitch=()=>pitch;
window.__setVelY=(v)=>{velY=v;}; window.__isGameRunning=()=>gameRunning;
const GRAV=-16,JSPD=5.2,PH=1.7,SPD=4.5,IDIST=2.3,GDIST=2.8;
let isSprinting=false;
const DAY_DURATION=135,NIGHT_DURATION=135,TRANS_DURATION=15;
const FULL_DAY=DAY_DURATION+TRANS_DURATION+NIGHT_DURATION+TRANS_DURATION;
let dayTime=0,dayCount=1,isNight=false;

function lerp(a,b,t){return a+(b-a)*Math.max(0,Math.min(1,t));}

function updateDayNight(delta){
  if(!gameRunning)return;
  dayTime+=delta;if(dayTime>=FULL_DAY){dayTime-=FULL_DAY;dayCount++;}
  const t=dayTime;let skyR,skyG,skyB,fogR,fogG,fogB,ambI,sunI,sunR,sunG,sunB;
  if(t<DAY_DURATION){isNight=false;skyR=0.53;skyG=0.63;skyB=0.75;fogR=0.67;fogG=0.67;fogB=0.67;ambI=0.55;sunI=1.3;sunR=1;sunG=0.87;sunB=0.73;}
  else if(t<DAY_DURATION+TRANS_DURATION){const p=(t-DAY_DURATION)/TRANS_DURATION;isNight=false;skyR=lerp(0.53,0.02,p);skyG=lerp(0.63,0.02,p);skyB=lerp(0.75,0.08,p);fogR=lerp(0.67,0.08,p);fogG=lerp(0.67,0.08,p);fogB=lerp(0.67,0.12,p);ambI=lerp(0.55,0.06,p);sunI=lerp(1.3,0.05,p);sunR=1;sunG=lerp(0.87,0.3,p);sunB=lerp(0.73,0.1,p);}
  else if(t<DAY_DURATION+TRANS_DURATION+NIGHT_DURATION){isNight=true;skyR=0.02;skyG=0.02;skyB=0.08;fogR=0.08;fogG=0.08;fogB=0.12;ambI=0.06;sunI=0.05;sunR=0.3;sunG=0.3;sunB=0.6;}
  else{const p=(t-(DAY_DURATION+TRANS_DURATION+NIGHT_DURATION))/TRANS_DURATION;isNight=false;skyR=lerp(0.02,0.53,p);skyG=lerp(0.02,0.63,p);skyB=lerp(0.08,0.75,p);fogR=lerp(0.08,0.67,p);fogG=lerp(0.08,0.67,p);fogB=lerp(0.12,0.67,p);ambI=lerp(0.06,0.55,p);sunI=lerp(0.05,1.3,p);sunR=1;sunG=lerp(0.3,0.87,p);sunB=lerp(0.1,0.73,p);}
  scene.background.setRGB(skyR,skyG,skyB);
  scene.fog.color.setRGB(fogR,fogG,fogB);
  scene.children.filter(c=>c.isAmbientLight).forEach(l=>l.intensity=ambI);
  sun.intensity=sunI;sun.color.setRGB(sunR,sunG,sunB);
  const el=document.getElementById('dayCounter');
  if(el){
    let lbl,secs;
    if(t<DAY_DURATION){lbl='🌙 Night in';secs=DAY_DURATION-t;}
    else if(t<DAY_DURATION+TRANS_DURATION){lbl='🌙 Night in';secs=DAY_DURATION+TRANS_DURATION-t;}
    else if(t<DAY_DURATION+TRANS_DURATION+NIGHT_DURATION){lbl='☀️ Day in';secs=DAY_DURATION+TRANS_DURATION+NIGHT_DURATION-t;}
    else{lbl='☀️ Day in';secs=FULL_DAY-t;}
    const m=Math.floor(secs/60),s=Math.floor(secs%60);
    el.textContent=`DAY ${dayCount}  |  ${lbl} ${m}:${s.toString().padStart(2,'0')}`;
  }
}

// ================================================================
// RAIN SYSTEM — Minecraft-style vertical rain streaks
// ================================================================
const RAIN_COUNT = 600;
const rainMeshes = [];
let rainOn = false;
let rainFadeTimer = 0;
let rainIntensity = 0;

// Wet road overlay
const wetRoadMesh = (function(){
  const mat = new THREE.MeshLambertMaterial({
    color:0x111122, transparent:true, opacity:0,
    emissive:new THREE.Color(0x112233), emissiveIntensity:0.5
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(200,200), mat);
  m.rotation.x = -Math.PI/2;
  m.position.set(10, 0.03, 10);
  scene.add(m);
  return m;
})();

// Build MC-style rain pool — thin vertical lines in a grid around player
(function(){
  const mat = new THREE.MeshBasicMaterial({
    color:0x9AADCC, transparent:true, opacity:0.55
  });
  // Each drop is a thin tall box — like MC rain streaks
  for(let i=0;i<RAIN_COUNT;i++){
    const drop = new THREE.Mesh(
      new THREE.BoxGeometry(0.025, 0.55, 0.025),
      mat.clone()
    );
    drop.visible = false;
    scene.add(drop);
    rainMeshes.push({
      mesh: drop,
      // Offset within the rain grid (fixed relative position to player)
      ox: (Math.random()-0.5)*60,
      oz: (Math.random()-0.5)*60,
      // Random vertical phase so they don't all hit ground at same time
      phase: Math.random(),
      col: 0.75 + Math.random()*0.25 // slight brightness variation
    });
  }
})();

function startRain(){
  if(rainOn) return;
  rainOn = true;
  showMsg('🌧 Raining!','#88AAFF');
  if(window.mpSocket&&window.mpConnected&&mpIsHost) mpSocket.emit('weatherSync',{rain:true});
}
function stopRain(){
  if(!rainOn) return;
  rainOn = false;
  if(window.mpSocket&&window.mpConnected&&mpIsHost) mpSocket.emit('weatherSync',{rain:false});
}

function updateRain(delta){
  if(!gameRunning) return;

  // Random night rain trigger
  rainChanceTimer += delta;
  if(rainChanceTimer > 12){
    rainChanceTimer = 0;
    if(isNight && !rainOn && Math.random()<0.45) startRain();
    if(!isNight && rainOn) stopRain();
    if(isNight && rainOn && Math.random()<0.2) stopRain();
  }

  // Fade in/out
  if(rainOn) rainIntensity = Math.min(1, rainIntensity + delta*0.8);
  else       rainIntensity = Math.max(0, rainIntensity - delta*0.6);

  const active = rainIntensity > 0.01;

  // Wet road
  wetRoadMesh.material.opacity = rainIntensity * 0.5;

  // MC-style: drops fall straight down in a box around player
  // Speed: fast like MC (~15 units/sec), reset at top when they hit y=0
  const FALL_SPEED = 16;
  const RAIN_HEIGHT = 22; // spawn height above ground

  rainMeshes.forEach(r => {
    r.mesh.visible = active;
    if(!active) return;

    r.mesh.material.opacity = 0.45 * rainIntensity;

    // Move down
    r.phase += delta * FALL_SPEED / RAIN_HEIGHT;
    if(r.phase >= 1) r.phase -= 1;

    // Position: fixed grid offset from player, cycling height
    r.mesh.position.x = PP.x + r.ox;
    r.mesh.position.z = PP.z + r.oz;
    r.mesh.position.y = RAIN_HEIGHT - r.phase * RAIN_HEIGHT;

    // Splash at ground — flash white then reset
    if(r.mesh.position.y < 0.3 && r.mesh.position.y > 0) {
      r.mesh.material.opacity = 0.9 * rainIntensity;
      r.mesh.scale.set(1.5, 0.3, 1.5);
    } else {
      r.mesh.scale.set(1, 1, 1);
    }
  });
}
function getCookColor(prog,burned){if(burned)return new THREE.Color(0x111111);if(prog<=0)return new THREE.Color(0xEEEEDD);if(prog<0.25)return new THREE.Color(0xDDBB99);if(prog<0.5)return new THREE.Color(0xBB7733);if(prog<0.75)return new THREE.Color(0xAA5522);if(prog<1.0)return new THREE.Color(0x8B3300);return new THREE.Color(0x441100);}

const CCOLS=[0xDDDDDD,0xCCCCCC,0xEEEEEE,0xE8E8E8,0xF0F0F0,0xC8C8C8,0xD8D8D8,0xE0E0E0];

// ================================================================
// TAX SYSTEM
// ================================================================
const TAX_CYCLE_SECONDS=120;
const TAX_BILL_DELAY_SECONDS=12;
const TAX_GUY_MAX_HP=6;
const TAX_ENFORCER_MAX_HP=3;
const TAX_ATTACK_DIST=2.4;
const TAX_ATTACK_COOLDOWN=1.0;
const TAX_ATTACK_DAMAGE=10;
const TAX_SPAWN_BASE=new THREE.Vector3(0,0,11.5); // in front of shop, visible from player start
const taxEnforcersTotal=5;
let taxCycleT=0,taxPhase='none',taxDueT=0,taxWarningShown=false,taxEarningsStart=0;
let taxGuyMesh=null,taxGuyHP=0,taxGuyAtkCooldown=0;
let taxEnforcers=[],taxEnforcersKilled=0;

function mkTaxGuy(){
  const g=new THREE.Group();
  const bodyMat=new THREE.MeshLambertMaterial({color:0x222222});
  const bodyCyl=new THREE.Mesh(new THREE.CylinderGeometry(0.26,0.30,0.72,18),bodyMat);
  bodyCyl.position.y=0.55;g.add(bodyCyl);
  const head=new THREE.Mesh(new THREE.SphereGeometry(0.30,18,12),new THREE.MeshLambertMaterial({color:0xFFDDB0}));
  head.position.y=1.30;g.add(head);
  const hat=new THREE.Mesh(new THREE.CylinderGeometry(0.27,0.32,0.10,18),new THREE.MeshLambertMaterial({color:0x440000}));
  hat.position.set(0,1.73,0);g.add(hat);
  const badge=bx(0.06,0.32,0.035,lm(0xFF4444,0xAA0000,0.7));badge.position.set(0.24,0.65,0.30);g.add(badge);
  const hpBg=bx(0.72,0.07,0.07,lm(0x440000));hpBg.position.set(0,2.55,0);g.add(hpBg);
  const hpFg=bx(0.72,0.07,0.08,lm(0xFF2222,0xFF0000,0.6));hpFg.position.set(0,2.55,0);g.add(hpFg);
  g._hpBar=hpFg;
  const eyeMat=new THREE.MeshLambertMaterial({color:0x111111});
  const eyeL=new THREE.Mesh(new THREE.SphereGeometry(0.072,10,8),eyeMat);
  eyeL.scale.set(0.7,1.0,0.45);eyeL.position.set(-0.105,1.32,0.27);g.add(eyeL);
  const eyeR=eyeL.clone();eyeR.position.set(0.105,1.32,0.27);g.add(eyeR);
  // Floating name label
  const nc=document.createElement('canvas');nc.width=256;nc.height=48;
  const nx=nc.getContext('2d');
  nx.fillStyle='rgba(60,0,0,0.85)';nx.fillRect(0,0,256,48);
  nx.font='bold 22px Bebas Neue,monospace';nx.fillStyle='#FF4444';nx.textAlign='center';
  nx.fillText('💼 TAX GUY',128,32);
  const nlm=new THREE.Mesh(new THREE.PlaneGeometry(1.6,0.32),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(nc),transparent:true,side:THREE.DoubleSide}));
  nlm.position.y=2.9;g.add(nlm);g._nameLabel=nlm;
  // Red glow light so he's visible at night
  const glow=new THREE.PointLight(0xFF2200,1.5,4);glow.position.y=1.2;g.add(glow);
  return g;
}

function mkTaxEnforcer(){
  const g=new THREE.Group();
  const bodyMat=new THREE.MeshLambertMaterial({color:0x113344});
  const bodyCyl=new THREE.Mesh(new THREE.CylinderGeometry(0.26,0.30,0.72,18),bodyMat);
  bodyCyl.position.y=0.55;g.add(bodyCyl);
  const head=new THREE.Mesh(new THREE.SphereGeometry(0.30,18,12),new THREE.MeshLambertMaterial({color:0xFFDDB0}));
  head.position.y=1.30;g.add(head);
  const helm=new THREE.Mesh(new THREE.CylinderGeometry(0.27,0.32,0.18,18),new THREE.MeshLambertMaterial({color:0x002244}));
  helm.position.set(0,1.64,0);g.add(helm);
  const gun=bx(0.08,0.10,0.35,lm(0x333333));gun.position.set(0.22,0.95,0.0);gun.rotation.z=Math.PI/2;g.add(gun);
  const hpBg=bx(0.72,0.07,0.07,lm(0x440000));hpBg.position.set(0,2.55,0);g.add(hpBg);
  const hpFg=bx(0.72,0.07,0.08,lm(0xFF2222,0x660000,0.6));hpFg.position.set(0,2.55,0);g.add(hpFg);
  g._hpBar=hpFg;
  return g;
}

function clearTaxEntities(){
  if(taxGuyMesh){scene.remove(taxGuyMesh);taxGuyMesh=null;}
  taxEnforcers.forEach(e=>{if(e.mesh)scene.remove(e.mesh);});
  taxEnforcers=[];taxEnforcersKilled=0;
}

function startTaxCycle(){
  taxPhase='taxing';taxCycleT=0;taxDueT=TAX_BILL_DELAY_SECONDS;taxWarningShown=false;
  clearTaxEntities();
  taxGuyHP=TAX_GUY_MAX_HP;taxGuyAtkCooldown=0;
  taxGuyMesh=mkTaxGuy();taxGuyMesh.position.copy(TAX_SPAWN_BASE);taxGuyMesh.visible=true;scene.add(taxGuyMesh);
  showMsg('💼 TAX GUY INCOMING! Kill him to evade...','#FF8800');playSound('inspector');
}

function spawnTaxEnforcers(){
  const offsets=[[-2,0],[2,0],[-1,1.6],[1,1.6],[0,-2]];
  taxEnforcers=offsets.map(([dx,dz])=>{
    const mesh=mkTaxEnforcer();
    mesh.position.set(TAX_SPAWN_BASE.x+dx,0,TAX_SPAWN_BASE.z+dz);
    scene.add(mesh);
    return{mesh,hp:TAX_ENFORCER_MAX_HP,atkCooldown:0};
  });
  taxEnforcersKilled=0;
  showMsg('💀 Enforcers incoming! Kill 5!','#FF4444');
}

function killTaxGuy(){
  if(taxPhase!=='taxing')return;
  taxPhase='evading';
  if(taxGuyMesh)scene.remove(taxGuyMesh);taxGuyMesh=null;
  clearTaxEntities();spawnTaxEnforcers();
  showMsg('Tax evaded! Now defeat the enforcers!','#06D6A0');
}

function killTaxEnforcer(enf){
  if(!enf||enf._dead)return;
  enf._dead=true;enf.hp=0;
  if(enf.mesh)scene.remove(enf.mesh);
  taxEnforcersKilled++;
  if(taxEnforcersKilled>=taxEnforcersTotal){showMsg('Enforcers defeated! You escaped the tax!','#06D6A0');endTaxCycle();}
  else if(taxEnforcersKilled===taxEnforcersTotal-1)showMsg('Last enforcer!','#FF8800');
}

function applyTaxPayment(){
  if(stars>1){stars--;updateHUD();showMsg('TAX PAID! -1 STAR 💸','#EF476F');flash('dmg',220);}
  else showMsg('TAX RAID — no stars left!','#EF476F');
}

function endTaxCycle(){clearTaxEntities();taxPhase='none';taxCycleT=0;taxEarningsStart=score;}

function updateTax(delta){
  if(taxPhase==='none'){
    taxCycleT+=delta;
    if(taxCycleT>=TAX_CYCLE_SECONDS)startTaxCycle();
    return;
  }
  if(taxPhase==='taxing'){
    taxDueT-=delta;
    if(!taxWarningShown&&taxDueT<=5){taxWarningShown=true;showMsg('TAX DUE NOW! Kill the tax guy!','#FF8800');}
    if(taxGuyMesh){
      const toP=PP.clone().sub(taxGuyMesh.position);toP.y=0;
      if(toP.length()>0.001)taxGuyMesh.rotation.y=Math.atan2(toP.x,toP.z);
      taxGuyAtkCooldown=Math.max(0,taxGuyAtkCooldown-delta);
      const dist=toP.length();
      if(taxDueT>0&&dist<TAX_ATTACK_DIST&&taxGuyAtkCooldown<=0){
        taxGuyAtkCooldown=TAX_ATTACK_COOLDOWN;
        playerHP=Math.max(0,playerHP-TAX_ATTACK_DAMAGE);updateHealthBar();flash('dmg',120);
        showMsg('TAX ATTACK! -'+TAX_ATTACK_DAMAGE,'#FF4444');
      }
      if(taxGuyMesh._hpBar){const p=Math.max(0,taxGuyHP/TAX_GUY_MAX_HP);taxGuyMesh._hpBar.scale.x=p;taxGuyMesh._hpBar.position.x=(p-1)*0.36;}
    }
    if(taxDueT<=0&&taxPhase==='taxing'&&taxGuyHP>0){applyTaxPayment();endTaxCycle();}
    return;
  }
  if(taxPhase==='evading'){
    taxEnforcers.forEach(enf=>{
      if(!enf.mesh||enf.hp<=0)return;
      const toP=PP.clone().sub(enf.mesh.position);toP.y=0;
      const dist=toP.length();
      if(dist>0.001)enf.mesh.rotation.y=Math.atan2(toP.x,toP.z);
      if(dist>0.6){enf.mesh.position.x+=toP.x/dist*1.2*delta;enf.mesh.position.z+=toP.z/dist*1.2*delta;}
      enf.atkCooldown=Math.max(0,enf.atkCooldown-delta);
      if(dist<TAX_ATTACK_DIST&&enf.atkCooldown<=0){
        enf.atkCooldown=TAX_ATTACK_COOLDOWN;
        playerHP=Math.max(0,playerHP-TAX_ATTACK_DAMAGE);updateHealthBar();flash('dmg',120);
        showMsg('Enforcer hits you! -'+TAX_ATTACK_DAMAGE,'#FF4444');
      }
      if(enf.mesh._hpBar){const p=Math.max(0,enf.hp/TAX_ENFORCER_MAX_HP);enf.mesh._hpBar.scale.x=p;enf.mesh._hpBar.position.x=(p-1)*0.36;}
    });
  }
}

function mkCustomer(color){
  const g=new THREE.Group();
  const bodyMat=new THREE.MeshLambertMaterial({color});
  const bodyCyl=new THREE.Mesh(new THREE.CylinderGeometry(0.26,0.30,0.72,18),bodyMat);
  bodyCyl.position.y=0.55;bodyCyl.castShadow=true;g.add(bodyCyl);
  const bodyCapTop=new THREE.Mesh(new THREE.SphereGeometry(0.26,16,8,0,Math.PI*2,0,Math.PI/2),bodyMat);
  bodyCapTop.position.y=0.91;bodyCapTop.castShadow=true;g.add(bodyCapTop);
  const bodyCapBot=new THREE.Mesh(new THREE.SphereGeometry(0.30,16,8,0,Math.PI*2,Math.PI/2,Math.PI/2),bodyMat);
  bodyCapBot.position.y=0.19;bodyCapBot.castShadow=true;g.add(bodyCapBot);
  const headMat=new THREE.MeshLambertMaterial({color});
  const head=new THREE.Mesh(new THREE.SphereGeometry(0.30,18,12),headMat);
  head.position.y=1.30;head.castShadow=true;g.add(head);
  const eyeMat=new THREE.MeshLambertMaterial({color:0x111111});
  const eyeL=new THREE.Mesh(new THREE.SphereGeometry(0.072,10,8),eyeMat);
  eyeL.scale.set(0.7,1.0,0.45);eyeL.position.set(-0.105,1.32,0.27);g.add(eyeL);
  const eyeR=new THREE.Mesh(new THREE.SphereGeometry(0.072,10,8),eyeMat);
  eyeR.scale.set(0.7,1.0,0.45);eyeR.position.set(0.105,1.32,0.27);g.add(eyeR);
  const barBg=bx(0.68,0.07,0.07,lm(0x222222));barBg.position.set(0,1.82,0);g.add(barBg);
  const barFg=bx(0.68,0.07,0.08,lm(0xffffff));barFg.position.set(0,1.82,0);g.add(barFg);
  g._bar=barFg;g.castShadow=true;return g;
}

function mkInspector(){
  const g=new THREE.Group();
  const bodyMat=new THREE.MeshLambertMaterial({color:0x1A3A6A});
  const accentMat=new THREE.MeshLambertMaterial({color:0x0A2050});
  const bodyCyl=new THREE.Mesh(new THREE.CylinderGeometry(0.28,0.32,0.75,18),bodyMat);
  bodyCyl.position.y=0.55;bodyCyl.castShadow=true;g.add(bodyCyl);
  const bodyCapTop=new THREE.Mesh(new THREE.SphereGeometry(0.28,16,8,0,Math.PI*2,0,Math.PI/2),bodyMat);
  bodyCapTop.position.y=0.925;g.add(bodyCapTop);
  const bodyCapBot=new THREE.Mesh(new THREE.SphereGeometry(0.32,16,8,0,Math.PI*2,Math.PI/2,Math.PI/2),bodyMat);
  bodyCapBot.position.y=0.175;g.add(bodyCapBot);
  for(let gi=0;gi<4;gi++){const groove=new THREE.Mesh(new THREE.TorusGeometry(0.315-gi*0.005,0.013,6,18),accentMat);groove.rotation.x=Math.PI/2;groove.position.y=0.22+gi*0.09;g.add(groove);}
  const badge=bx(0.06,0.32,0.035,lm(0xFFD700,0xFFAA00,0.8));badge.position.set(0.24,0.65,0.30);g.add(badge);
  const clipb=bx(0.22,0.28,0.03,lm(0xCCCCCC));clipb.position.set(-0.30,0.68,0.27);clipb.rotation.z=0.18;g.add(clipb);
  const clipLines=bx(0.16,0.18,0.02,lm(0x888888));clipLines.position.set(-0.30,0.68,0.295);clipLines.rotation.z=0.18;g.add(clipLines);
  const headMat=new THREE.MeshLambertMaterial({color:0xFFDDB0});
  const head=new THREE.Mesh(new THREE.SphereGeometry(0.30,18,12),headMat);
  head.position.y=1.33;head.castShadow=true;g.add(head);
  const hatMat=new THREE.MeshLambertMaterial({color:0x0A1F40});
  const hatBrim=new THREE.Mesh(new THREE.CylinderGeometry(0.40,0.40,0.055,18),hatMat);
  hatBrim.position.y=1.72;g.add(hatBrim);
  const hatCrown=new THREE.Mesh(new THREE.CylinderGeometry(0.25,0.30,0.32,18),hatMat);
  hatCrown.position.y=1.92;g.add(hatCrown);
  const hatTop=new THREE.Mesh(new THREE.SphereGeometry(0.25,14,8,0,Math.PI*2,0,Math.PI/2),hatMat);
  hatTop.position.y=2.09;g.add(hatTop);
  const hatBand=new THREE.Mesh(new THREE.TorusGeometry(0.295,0.025,6,18),lm(0xFFD700));
  hatBand.rotation.x=Math.PI/2;hatBand.position.y=1.75;g.add(hatBand);
  const eyeMat=new THREE.MeshLambertMaterial({color:0x111111});
  const eyeL=new THREE.Mesh(new THREE.SphereGeometry(0.072,10,8),eyeMat);
  eyeL.scale.set(0.7,1.0,0.45);eyeL.position.set(-0.105,1.35,0.28);g.add(eyeL);
  const eyeR=new THREE.Mesh(new THREE.SphereGeometry(0.072,10,8),eyeMat);
  eyeR.scale.set(0.7,1.0,0.45);eyeR.position.set(0.105,1.35,0.28);g.add(eyeR);
  const hpBg=bx(0.72,0.07,0.07,lm(0x440000));hpBg.position.set(0,2.55,0);g.add(hpBg);
  const hpFg=bx(0.72,0.07,0.08,lm(0xFF2222,0xFF0000,0.6));hpFg.position.set(0,2.55,0);g.add(hpFg);
  g._hpBar=hpFg;
  return g;
}

function mkKebab(){const g=new THREE.Group();const tortilla=new THREE.Mesh(new THREE.CylinderGeometry(0.38,0.38,0.055,20,1,false,0,Math.PI),lm(0xDEBB60));tortilla.rotation.y=Math.PI/2;tortilla.position.y=0.028;g.add(tortilla);const bottom=new THREE.Mesh(new THREE.CircleGeometry(0.38,20,0,Math.PI),lm(0xC9A84C));bottom.rotation.x=-Math.PI/2;bottom.rotation.z=Math.PI/2;bottom.position.y=0.001;g.add(bottom);const top2=new THREE.Mesh(new THREE.CircleGeometry(0.38,20,0,Math.PI),lm(0xC9A84C));top2.rotation.x=Math.PI/2;top2.rotation.z=-Math.PI/2;top2.position.y=0.055;g.add(top2);const cheese=new THREE.Mesh(new THREE.CylinderGeometry(0.385,0.385,0.04,20,1,true,0,Math.PI),lm(0xFFCC22));cheese.rotation.y=Math.PI/2;cheese.position.y=0.028;g.add(cheese);for(let i=0;i<4;i++){const mark=new THREE.Mesh(new THREE.BoxGeometry(0.55,0.008,0.04),lm(0x3A2000));mark.position.set(-0.05,0.062,-0.12+i*0.09);mark.rotation.y=0.15;g.add(mark);}const filling=new THREE.Mesh(new THREE.PlaneGeometry(0.72,0.05),lm(0xCC7722));filling.position.set(0,0.028,0);filling.rotation.x=Math.PI/2;g.add(filling);g._isKebab=true;return g;}

function spawnSewerRat(){if(!inSewer||sewerRats.length>=10)return;const mesh=mkRat();mesh.scale.set(0.26,0.26,0.26);const side=(PP.z-40)<0?1:-1;const spawnZ=40+side*(10+Math.random()*4);const spawnX=40+(Math.random()-0.5)*3.6;mesh.position.set(spawnX,SEWER_Y+0.38,spawnZ);scene.add(mesh);sewerRats.push({mesh,hp:2,attackTimer:0,speed:0.03+Math.random()*0.02});}
let sewerRatSpawnT=0;
function updateSewerRats(delta){if(!inSewer){sewerRats.forEach(r=>scene.remove(r.mesh));sewerRats.length=0;return;}sewerRatSpawnT+=delta;if(sewerRatSpawnT>3){spawnSewerRat();sewerRatSpawnT=0;}sewerRats.forEach((r,i)=>{const toPlayer=PP.clone().sub(r.mesh.position);const dist=toPlayer.length();if(dist>0.6){const spd=r.speed*(dist<3?1.8:1);r.mesh.position.x+=toPlayer.x/dist*spd;r.mesh.position.z+=toPlayer.z/dist*spd;r.mesh.rotation.y=Math.atan2(toPlayer.x,toPlayer.z);r.mesh.position.y=SEWER_Y+0.38+Math.abs(Math.sin(Date.now()*0.01+i))*0.06;}
  r.mesh.rotation.y=Math.atan2(toPlayer.x,toPlayer.z);r.attackTimer-=delta;if(dist<1.5&&r.attackTimer<=0){r.attackTimer=0.4;playerHP=Math.max(0,playerHP-8);updateHealthBar();document.getElementById('healthbar').classList.add('on');flash('dmg',150);showMsg('🐀 RAT ATTACK!','#FF4444');if(playerHP<=0)endGame('Eaten alive by sewer rats!','#AA2200');}});sewerRats.filter(r=>r.hp<=0).forEach(r=>scene.remove(r.mesh));sewerRats.splice(0,sewerRats.length,...sewerRats.filter(r=>r.hp>0));}
function damageSewerRat(){if(!inSewer||!hasGun||ammo<=0)return;const dir=new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion).normalize();for(const r of sewerRats){const toR=r.mesh.position.clone().sub(PP).normalize();if(dir.angleTo(toR)<0.15&&PP.distanceTo(r.mesh.position)<12){r.hp--;spawnBlood(r.mesh.position.clone().add(new THREE.Vector3(0,0.3,0)),20);if(r.hp<=0){scene.remove(r.mesh);score+=25;basketCount++;updateHUD();if(window._updateBasketLabel)window._updateBasketLabel();if(window.mpSocket&&window.mpConnected)mpSocket.emit('basketSync',{count:basketCount});showMsg('Sewer rat killed! +25pts +1 rat to basket 🐀','#FFD166');}return;}}}
function updateHealthBar(){
  const pct=Math.max(0,playerHP/maxPlayerHP*100);
  const fill=document.getElementById('hb-fill');
  const label=document.getElementById('hb-label');
  fill.style.width=pct+'%';
  const col=pct>60?'linear-gradient(to right,#22cc22,#66ff66)':pct>30?'linear-gradient(to right,#ff8800,#ffcc00)':'linear-gradient(to right,#ff2222,#ff6666)';
  fill.style.background=col;
  label.textContent='❤ '+Math.ceil(playerHP)+' / '+maxPlayerHP;
  // Flash the bar on damage
  fill.classList.remove('hit');
  void fill.offsetWidth; // force reflow
  fill.classList.add('hit');
  // Always show during gameplay
  if(gameRunning) document.getElementById('healthbar').classList.add('on');
  // Die at 0
  if(playerHP<=0&&gameRunning){
    playerHP=0;
    showMsg('Ezzzzzz you suck 💀','#FF2222');
    setTimeout(()=>endGame('You died! Ezzzzzz you suck 💀','#AA0000'),1200);
  }
}

function spawnCustomer(){
  if(customers.length>=4)return;
  const side=Math.random()<0.5?-1:1;
  const isVIP = Math.random()<0.035; // 3.5% chance VIP
  const color = isVIP ? 0xFFD700 : CCOLS[Math.floor(Math.random()*CCOLS.length)];
  const mesh=mkCustomer(color);
  const tx=side*(2.5+Math.random()*3);
  mesh.position.set(side*16,0,6.5+Math.random()*1.5);
  const maxP = isVIP ? 300 : 800+Math.random()*500; // VIP only waits 5s (300 patience at ~60/s)
  const cdObj={mesh,tx,side,patience:maxP,maxP,served:false,exiting:false,bp:Math.random()*Math.PI*2,hp:2,isVIP};
  mesh.userData.isCustomer=true;mesh.userData.cdRef=cdObj;
  mesh.traverse(c=>{c.userData.isCustomer=true;c.userData.cdRef=cdObj;});
  customers.push(cdObj);scene.add(mesh);

  // VIP hat — gold top hat on their head
  if(isVIP){
    const brim=new THREE.Mesh(new THREE.CylinderGeometry(0.42,0.42,0.06,16),new THREE.MeshLambertMaterial({color:0xFFD700}));
    brim.position.set(0,1.72,0); mesh.add(brim);
    const crown=new THREE.Mesh(new THREE.CylinderGeometry(0.26,0.30,0.38,16),new THREE.MeshLambertMaterial({color:0xFFAA00}));
    crown.position.set(0,1.94,0); mesh.add(crown);
    // VIP label
    const vc=document.createElement('canvas');vc.width=128;vc.height=32;
    const vx=vc.getContext('2d');
    vx.fillStyle='rgba(0,0,0,0.7)';vx.fillRect(0,0,128,32);
    vx.font='bold 16px monospace';vx.fillStyle='#FFD700';vx.textAlign='center';
    vx.fillText('⭐ VIP ⭐',64,22);
    const vt=new THREE.CanvasTexture(vc);
    const vlbl=new THREE.Mesh(new THREE.PlaneGeometry(1.0,0.25),new THREE.MeshBasicMaterial({map:vt,transparent:true,side:THREE.DoubleSide}));
    vlbl.position.set(0,2.45,0); mesh.add(vlbl);
    mesh._vipLabel=vlbl;
  }
}

function spawnInspector(){if(inspActive)return;if(!inspMesh){inspMesh=mkInspector();inspMesh.userData.isInspector=true;inspMesh.traverse(ch=>{ch.userData.isInspector=true;});scene.add(inspMesh);}const side=Math.random()<0.5?-1:1;inspMesh.position.set(side*18,0,6.5);inspMesh.visible=true;inspHP=3;inspData={vx:-side*0.038,side};inspActive=true;updateInspBar();showMsg('HEALTH INSPECTOR INCOMING','#EF476F');playSound('inspector');triggerGlitch();}

const raycaster=new THREE.Raycaster();const SCREEN_CENTER=new THREE.Vector2(0,0);
function getCrosshairTarget(){raycaster.setFromCamera(SCREEN_CENTER,camera);const hits=raycaster.intersectObjects(scene.children,true);for(const h of hits){let obj=h.object;while(obj&&!obj.userData.tag)obj=obj.parent;if(obj&&obj.userData.tag)return{tag:obj.userData.tag,obj,dist:h.distance};}return null;}

function tryInteract(){
  // Car exit/entry
  if(inCar){ exitCar(); return; }
  const nearCar=getCarPlayerNear();
  if(nearCar){ enterCar(nearCar); return; }
  // E always tries to pick up carried/floor items first
  if(tryPickupDropped()) return;
  // Ray gun pickup in plaza
  if(rayGunWallAvailable&&!inSewer&&PP.distanceTo(RAYGUN_WALL_POS)<2.2&&!heldItem){
    hasRayGun=true; rayGunAmmo=rayGunMaxAmmo; heldItem='raygun';
    rayGunWallAvailable=false; rayGunWallG.visible=false;
    document.getElementById('ammodiv').style.opacity='1';
    updateHeldUI(); updatePowerBar(); showMsg('RAY GUN! Click=shoot — power bar depletes!','#00FFAA'); return;
  }
  // Spawn button on plaza
  if(!inSewer && PP.distanceTo(SPAWN_BTN_POS)<2.2){spawnCrate();return;}
  if(!inSewer && window.TV_POS && PP.distanceTo(window.TV_POS)<2.2){window.tvInteract();return;}
  // Jason in breadshop
  if(!inSewer && window.JASON_POS && PP.distanceTo(window.JASON_POS)<2.5){
    if(heldItem){showMsg("Hands full — drop first (Q)","#FF8800");return;}
    const bm=mkBread(0.28); bm.visible=false; scene.add(bm);
    heldItem='bread'; heldBreadData={mesh:bm,grilled:false};
    updateHeldUI(); showMsg('Jason gave you bread! F=grill','#FFD166'); playSound('ding'); return;
  }
  // Vending machines
  if(!inSewer && window.VEND_POS_LIST){
    for(const vp of window.VEND_POS_LIST){
      if(PP.distanceTo(vp)<2.0){
        if(heldItem){showMsg("Drop what you have first (Q)","#FF8800");return;}
        const bm=mkBread(0.28); bm.visible=false; scene.add(bm);
        heldItem='bread'; heldBreadData={mesh:bm,grilled:false};
        updateHeldUI(); showMsg('Bread dispensed!','#FFD166'); playSound('catch'); return;
      }
    }
  }
  if(heldItem==='kebab'||heldItem==='fkebab'){const nearCust=customers.some(cd=>!cd.served&&!cd.exiting&&PP.distanceTo(cd.mesh.position)<IDIST+0.7);if(nearCust){tryServe();return;}}
  if(heldItem==='grilledbread'){const nearCust=customers.some(cd=>!cd.served&&!cd.exiting&&PP.distanceTo(cd.mesh.position)<IDIST+0.7);if(nearCust){tryServe();return;}}
  const xTarget=getCrosshairTarget();const xTag=xTarget?xTarget.tag:null;
  const nearBasket=PP.distanceTo(BASKET_POS)<1.8;
  if(basketCount>0&&(xTag==='floatRat'||(nearBasket&&xTag!=='floatKebab'&&xTag!=='fridge'))){basketCount--;if(window._updateBasketLabel)window._updateBasketLabel();if(window.mpSocket&&window.mpConnected)mpSocket.emit('basketSync',{count:basketCount});const rd={mesh:mkRat(),caught:true,onGrill:false,done:false,frozen:false};rd.mesh.visible=false;rats.push(rd);heldItem='rat';heldRatData=rd;updateHeldUI();showMsg('Got a rat! F=grill','#FFD166');playSound('catch');return;}
  const nearFridge=PP.distanceTo(FRIDGE_POS)<1.8;
  if(xTag==='floatKebab'||xTag==='fridge'||nearFridge){const kb=mkKebab();kb.visible=false;scene.add(kb);heldItem='fkebab';heldKebabData={km:kb,fridge:true};updateHeldUI();showMsg('Kebab! F=grill E near customer=serve','#00BFFF');playSound('ding');return;}
  if(!inSewer&&(xTag==='sewerCap'||PP.distanceTo(MANHOLE_POS)<2.2)){inSewer=true;sewerGroup.visible=true;sewerLights.forEach(l=>l.intensity=1.4);sideTunnelLights.forEach(l=>l.intensity=1.2);srLight.intensity=3.5;shaftLight.intensity=2.5;scene.fog=new THREE.FogExp2(0x111108,0.07);scene.background=new THREE.Color(0x111108);draggedCrate=null;PP.copy(SEWER_ENTRY_POS);yaw=Math.PI;pitch=0;velY=0;document.getElementById('healthbar').classList.add('on');playerHP=maxPlayerHP;updateHealthBar();showMsg('You crawled into the sewer! RATS INCOMING! Side tunnel →','#FF4444');return;}
  const exitWorldPos=new THREE.Vector3(40,SEWER_Y+1.7,54);
  if(inSewer&&(xTag==='sewerExit'||PP.distanceTo(exitWorldPos)<2.0)){inSewer=false;sewerGroup.visible=false;sewerLights.forEach(l=>l.intensity=0);sideTunnelLights.forEach(l=>l.intensity=0);srLight.intensity=0;shaftLight.intensity=0;entryCircleLight.intensity=0;barrelGlow.intensity=0;scene.fog=new THREE.FogExp2(0xAAAAAA,0.016);scene.background=new THREE.Color(0x888888);PP.set(MANHOLE_POS.x,1.7,MANHOLE_POS.z);yaw=Math.PI;pitch=0;velY=0;document.getElementById('healthbar').classList.remove('on');playerHP=Math.min(maxPlayerHP,playerHP+30);sewerRats.forEach(r=>scene.remove(r.mesh));sewerRats.length=0;showMsg('You escaped the sewer! +30 HP','#FFD166');return;}
  if(!hasGun&&PP.distanceTo(LOCKER_POS)<IDIST+0.6){hasGun=true;ammo=maxAmmo;heldItem='gun';document.getElementById('ammodiv').style.opacity='1';document.getElementById('xhair').className='gun';updateHeldUI();showMsg('Glock 19 equipped! Click=shoot R=reload Q=drop gun','#EF476F');playSound('gunpickup');lockLight.intensity=1.2;return;}
  // Wall gun pickup (left wall) - Rifle on wall is actually a shotgun in-game
  if(wallGunAvailable&&PP.distanceTo(GUN_WALL_POS)<IDIST+0.9&&PP.distanceTo(MANHOLE_POS)>2.0){
    // if player already has any weapon just ignore
    if(!hasGun && !hasShotgun){
      hasShotgun=true;
      shotgunAmmo=shotgunMaxAmmo;
      heldItem='shotgun';
      wallGunAvailable=false;
      gunWallG.visible=false;
      document.getElementById('ammodiv').style.opacity='1';
      document.getElementById('xhair').className='shotgun';
      updateHeldUI();
      showMsg('Shotgun picked up from wall! 3 pellets per shot','#FF9900');
      playSound('gunpickup');
      return;
    }
  }
  // Shotgun pickup — available from same locker when not holding gun (legacy locker)
  if(!hasShotgun&&!hasGun&&PP.distanceTo(LOCKER_POS)<IDIST+0.6){hasShotgun=true;shotgunAmmo=shotgunMaxAmmo;heldItem='shotgun';document.getElementById('ammodiv').style.opacity='1';document.getElementById('xhair').className='shotgun';updateHeldUI();showMsg('SHOTGUN! 3 pellets per shot — 9 shells total','#FF9900');playSound('gunpickup');lockLight.intensity=1.2;return;}
  if(panWallAvailable&&PP.distanceTo(PAN_WALL_POS)<2.2&&!heldItem){hasPan=true;heldItem='pan';panWallAvailable=false;panWallG.visible=false;updateHeldUI();showMsg('Frying Pan! Click=swing Q=drop 🍳','#FF8C00');playSound('gunpickup');return;}
  if(!hasExt&&PP.distanceTo(EXT_POS)<IDIST+0.5){hasExt=true;extinguisherAmmoo=100;heldItem='ext';extG.visible=false;extRing.visible=false;extColActive=false;document.getElementById('xhair').className='ext';updateHeldUI();showMsg('Extinguisher! Click=spray Q=drop','#00BFFF');return;}
  for(const s of grillSlots){if(s.done&&s.item&&PP.distanceTo(s.pos)<GDIST){const si=grillSlots.indexOf(s);if(s.itemType==='rat'){const rd=s.item;rd.mesh.visible=false;heldItem='kebab';heldKebabData={km:rd.mesh,fridge:false,grillKebab:false,isGrilledRat:true};rats=rats.filter(r=>r!==rd);}else if(s.itemType==='bread'){const bm=s.item._mesh;bm.visible=false;heldItem='grilledbread';heldBreadData={mesh:bm,grilled:true};}else{const km=s.item._mesh;km.visible=false;heldItem='kebab';heldKebabData={km,fridge:false,grillKebab:true,isGrilledRat:false};}s.item=null;s.itemType=null;s.done=false;s.burned=false;s.cookTime=0;s.ring.visible=false;if(window.mpSocket&&window.mpConnected)mpSocket.emit('grillUpdate',{slotIndex:si,action:'remove'});updateHeldUI();showMsg(heldItem==='grilledbread'?'🍞 Grilled bread! Sell to customer — E near them':'Grilled! Walk to customer + E to serve','#06D6A0');playSound('ding');return;}}
  if(basketCount<=0)showMsg('Basket empty! Go to sewer and kill rats to restock 🐀','#FF8800');
  else showMsg('Nothing nearby','#666');
}

function tryGrill(){if(heldItem!=='rat'&&heldItem!=='fkebab'&&heldItem!=='bread'){showMsg(heldItem?'Cant grill this item':'Grab a rat, kebab or bread first','#888');return;}for(const s of grillSlots){if(!s.item&&PP.distanceTo(s.pos)<GDIST){if(heldItem==='rat'){const rd=heldRatData;rd.caught=false;rd.onGrill=true;rd.mesh.visible=true;rd.mesh.position.copy(s.pos);rd.mesh.position.y+=0.28;rd.mesh.rotation.set(0,0,Math.PI/2);scene.add(rd.mesh);rd.mesh.traverse(c=>{if(c.isMesh&&c.material&&c.material.color)c.material.color.copy(getCookColor(0,false));});s.item=rd;s.itemType='rat';heldItem=null;heldRatData=null;}else if(heldItem==='bread'){const bm=heldBreadData.mesh;bm.visible=true;bm.position.copy(s.pos);bm.position.y+=0.08;bm.rotation.set(0,Math.random()*Math.PI,0);scene.add(bm);bm.traverse(c=>{if(c.isMesh&&c.material&&c.material.color)c.material.color.copy(getCookColor(0,false));});s.item={mesh:bm,_mesh:bm};s.itemType='bread';heldItem=null;heldBreadData=null;}else{const km=heldKebabData.km;km.visible=true;km.position.copy(s.pos);km.rotation.set(0,Math.PI/2,0);scene.add(km);km.traverse(c=>{if(c.isMesh&&c.material&&c.material.color)c.material.color.copy(getCookColor(0,false));});s.item={mesh:km,_mesh:km};s.itemType='kebab';heldItem=null;heldKebabData=null;}s.cookTime=0;s.done=false;s.burned=false;s.frozen=false;s.maxCook=8;s.ring.visible=true;updateHeldUI();
      // Sync grill placement to all players
      if(window.mpSocket&&window.mpConnected){const si=grillSlots.indexOf(s);mpSocket.emit('grillUpdate',{slotIndex:si,action:'place',itemType:s.itemType,maxCook:8});}
      const _gt=s.itemType;showMsg(_gt==='bread'?'Grilling bread! 🍞 ~8s':_gt==='rat'?'Grilling rat! 🐀 ~8s':'Grilling kebab! ~8s','#FF8800');playSound('sizzle');spawnPart(s.pos,0xFF5500,10);return;}}showMsg('Walk closer to the grill!','#EF476F');}

function tryServe(){
  // Sell grilled bread to customer
  if(heldItem==='grilledbread'){
    for(const cd of customers){
      if(!cd.served&&!cd.exiting&&PP.distanceTo(cd.mesh.position)<IDIST+0.7){
        cd.served=true;cd.exiting=true;
        let basePts=Math.floor(80*(cd.patience/cd.maxP))+40;
        const vipMult=cd.isVIP?3:1;
        comboCount++;comboTimer=COMBO_WINDOW;
        let comboMult=comboCount>=5?3:comboCount>=3?2:1;
        let comboMsg=comboCount>=5?' 🔥x'+comboCount+' COMBO!':comboCount>=3?' ⚡x'+comboCount+' COMBO!':comboCount>=2?' x'+comboCount:'';
        const pts=Math.floor(basePts*vipMult*comboMult);
        score+=pts;served++;stars=Math.min(10,stars+1);updateHUD();
        spawnPart(cd.mesh.position,cd.isVIP?0xFFD700:0xFFD166,cd.isVIP?35:20);
        if(heldBreadData?.mesh)scene.remove(heldBreadData.mesh);
        heldItem=null;heldBreadData=null;updateHeldUI();
        showMsg((cd.isVIP?'⭐ VIP! ':'')+'Sold grilled bread! +'+pts+'pts 🍞'+comboMsg,(cd.isVIP?'#FFD700':'#FFD166'));
        playSound('ding');checkLevel();return;
      }
    }
    showMsg('Walk up to a customer to sell bread!','#EF476F');return;
  }
  if(heldItem!=='kebab'&&heldItem!=='fkebab'){showMsg(heldItem?'Need a grilled kebab':'Grab something first','#888');return;}for(const cd of customers){if(!cd.served&&!cd.exiting&&PP.distanceTo(cd.mesh.position)<IDIST+0.7){cd.served=true;cd.exiting=true;const isFridge=heldKebabData&&heldKebabData.fridge&&!heldKebabData.grillKebab;if(isFridge){const poopPos=cd.mesh.position.clone().add(new THREE.Vector3(0,0.6,0));for(let i=0;i<50;i++){const size=0.05+Math.random()*0.1;const p=new THREE.Mesh(new THREE.SphereGeometry(size,4,3),new THREE.MeshBasicMaterial({color:Math.random()<0.5?0x5C3317:0x8B5A2B,transparent:true}));p.position.copy(poopPos);const a=Math.random()*Math.PI*2,el=(Math.random()-0.3)*Math.PI;const spd=0.05+Math.random()*0.14;scene.add(p);particles.push({mesh:p,vx:Math.cos(el)*Math.cos(a)*spd,vy:Math.abs(Math.sin(el))*spd+0.02,vz:Math.cos(el)*Math.sin(a)*spd,life:1,decay:0.016+Math.random()*0.012});}const poopDecal=new THREE.Mesh(new THREE.CircleGeometry(0.3+Math.random()*0.15,10),new THREE.MeshBasicMaterial({color:0x3B1F0A,transparent:true,opacity:0.9}));poopDecal.rotation.x=-Math.PI/2;poopDecal.position.set(cd.mesh.position.x,0.02,cd.mesh.position.z);scene.add(poopDecal);particles.push({mesh:poopDecal,vx:0,vy:0,vz:0,life:1,decay:0.002});scene.remove(cd.mesh);scene.remove(heldKebabData.km);heldItem=null;heldKebabData=null;updateHeldUI();loseStar('Customer got food poisoning! -1 star');showMsg('POOP EXPLOSION - RAW FOOD! -1 star','#8B5A2B');comboCount=0;comboTimer=0;return;}

          // ── VIP multiplier ──────────────────────────────────────────
          const vipMult = cd.isVIP ? 3 : 1;
          let basePts = Math.floor(100*(cd.patience/cd.maxP))+50;
          
          // ── COMBO multiplier ────────────────────────────────────────
          comboCount++;
          comboTimer=COMBO_WINDOW;
          let comboMult=1;
          let comboMsg='';
          if(comboCount>=5){comboMult=3;comboMsg=' 🔥x'+comboCount+' COMBO!';}
          else if(comboCount>=3){comboMult=2;comboMsg=' ⚡x'+comboCount+' COMBO!';}
          else if(comboCount>=2){comboMsg=' x'+comboCount;}

          const pts = Math.floor(basePts * vipMult * comboMult);
          score+=pts;served++;stars=Math.min(10,stars+1);updateHUD();
          spawnPart(cd.mesh.position,cd.isVIP?0xFFD700:0xFFD166,cd.isVIP?35:20);
          
          if(cd.isVIP){
            showMsg('⭐ VIP SERVED! +'+pts+'pts x3'+(comboMsg?comboMsg:''),'#FFD700');
            playSound('levelup');
          } else if(comboMult>1){
            showMsg('Served! +'+pts+'pts'+comboMsg,'#FF8800');
            playSound('ding');
          } else {
            showMsg('Served! +'+pts+'pts -- +1 star','#FFD166');
            playSound('ding');
          }
          scene.remove(heldKebabData.km);heldItem=null;heldKebabData=null;updateHeldUI();checkLevel();return;}}showMsg('Walk up to a customer!','#EF476F');}

// ── DROPPED ITEMS ON FLOOR ──────────────────────────────────────────
// ── DROPPED / CARRIED ITEMS ──────────────────────────────────────────
// Items float in front of player while "carried" — press Q to place on floor,
// press E when crosshair on them to pick back up
const droppedItems = []; // items placed on floor (not being carried)
let carriedItem = null;  // item currently floating in front of player

function mkDropMesh(type){
  let mesh;
  if(type==='rat'){ mesh=mkRat(); mesh.scale.set(0.12,0.12,0.12); }
  else if(type==='bread'||type==='grilledbread'){ mesh=mkBread(0.28); }
  else { mesh=mkKebab(); mesh.scale.set(0.6,0.6,0.6); }
  mesh.visible=true;
  return mesh;
}

// Start carrying an item — it floats in front of the player
function startCarrying(type, ratData, kebabData, breadData){
  // If already carrying something, place it first
  if(carriedItem) placeCarried();
  const mesh = mkDropMesh(type);
  scene.add(mesh);
  carriedItem = {mesh, type, ratData:ratData||null, kebabData:kebabData||null, breadData:breadData||null};
  showMsg('Carrying — Q=place on floor  E=pick back up','#FFD166');
}

// Place carried item on the floor in front of player
function placeCarried(){
  if(!carriedItem) return;
  const dropDist=1.4;
  const fx=PP.x-Math.sin(yaw)*dropDist;
  const fz=PP.z-Math.cos(yaw)*dropDist;
  carriedItem.mesh.position.set(fx, 0.15, fz);

  // Pickup ring
  const ringCol=carriedItem.type==='rat'?0xFFD166:carriedItem.type==='bread'||carriedItem.type==='grilledbread'?0xFF8800:0x00BFFF;
  const ring=new THREE.Mesh(new THREE.RingGeometry(0.35,0.50,24),
    new THREE.MeshBasicMaterial({color:ringCol,side:THREE.DoubleSide,transparent:true,opacity:0.7}));
  ring.rotation.x=-Math.PI/2; ring.position.y=0.01;
  scene.add(ring);

  const dropId=Date.now()+Math.random();
  const d={mesh:carriedItem.mesh, ring, type:carriedItem.type,
    ratData:carriedItem.ratData, kebabData:carriedItem.kebabData, breadData:carriedItem.breadData,
    bobT:Math.random()*Math.PI*2, placed:true, id:dropId};
  droppedItems.push(d);
  carriedItem=null;
  if(window.mpSocket&&window.mpConnected&&mpRoomCode){
    mpSocket.emit('itemDrop',{id:dropId,type:d.type,x:d.mesh.position.x,y:d.mesh.position.y,z:d.mesh.position.z});
  }
  showMsg('Item placed — aim at it + E to pick up','#aaa');
}

// Try to pick up a floor item the crosshair is pointing at
function tryPickupDropped(){
  if(carriedItem){
    // Already carrying — pick back up into hand
    const type=carriedItem.type;
    scene.remove(carriedItem.mesh);
    _restoreToHand(carriedItem);
    carriedItem=null;
    return true;
  }
  // Check floor items via crosshair direction
  const dir=new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion).normalize();
  for(let i=droppedItems.length-1;i>=0;i--){
    const d=droppedItems[i];
    const toItem=d.mesh.position.clone().add(new THREE.Vector3(0,0.3,0)).sub(PP).normalize();
    const dist=PP.distanceTo(d.mesh.position);
    if(dist<3.5 && dir.angleTo(toItem)<0.22){
      scene.remove(d.mesh); scene.remove(d.ring);
      if(window.mpSocket&&window.mpConnected&&d.id) mpSocket.emit('itemPickup',{id:d.id});
      droppedItems.splice(i,1);
      _restoreToHand(d);
      return true;
    }
  }
  return false;
}

function _restoreToHand(d){
  if(d.type==='rat'){
    const rd=d.ratData||{mesh:mkRat(),caught:true,onGrill:false,done:false,frozen:false};
    rd.mesh.visible=false;
    if(!rats.includes(rd))rats.push(rd);
    heldItem='rat'; heldRatData=rd;
    showMsg('Rat picked up! F=grill','#FFD166');
  } else if(d.type==='bread'||d.type==='grilledbread'){
    const bd=d.breadData||{mesh:mkBread(0.28),grilled:d.type==='grilledbread'};
    bd.mesh.visible=false;
    heldItem=d.type; heldBreadData=bd;
    showMsg('Bread picked up!','#FFD166');
  } else {
    const km=mkKebab(); km.visible=false; scene.add(km);
    heldItem='fkebab'; heldKebabData={km,fridge:false};
    showMsg('Kebab picked up! F=grill or E=serve','#00BFFF');
  }
  playSound('catch');
  updateHeldUI();
}

function dropBread(){
  if(heldItem!=='bread'&&heldItem!=='grilledbread')return;
  startCarrying(heldItem, null, null, heldBreadData);
  heldItem=null; heldBreadData=null; updateHeldUI();
}

function dropRat(){
  startCarrying('rat', heldRatData, null, null);
  heldItem=null; heldRatData=null; updateHeldUI();
}

function dropKebab(){
  startCarrying(heldItem==='fkebab'?'fkebab':'kebab', null, heldKebabData, null);
  if(heldKebabData?.km) heldKebabData.km.visible=false;
  heldItem=null; heldKebabData=null; updateHeldUI();
}
function dropRayGun(){
  if(heldItem!=='raygun')return;
  heldItem=null;hasRayGun=false;rayGunAmmo=0;
  rayRecharging=false;rayRechargeTimer=0;
  document.getElementById('ammodiv').style.opacity='0';
  vmRayGun.visible=false;updateHeldUI();
  rayGunWallAvailable=true;rayGunWallG.visible=true;
  showMsg('Ray gun returned','#aaa');
}
function dropGun(){if(heldItem!=='gun')return;heldItem=null;hasGun=false;ammo=0;document.getElementById('ammodiv').style.opacity='0';document.getElementById('xhair').className='';gunGroup.visible=false;updateHeldUI();
  // dropping a regular Glock doesn't put anything back on the wall
  showMsg('Gun dropped','#aaa');
}
function dropShotgun(){if(heldItem!=='shotgun')return;heldItem=null;hasShotgun=false;shotgunAmmo=0;document.getElementById('ammodiv').style.opacity='0';document.getElementById('xhair').className='';vmShotgun.visible=false;updateHeldUI();
  if(!wallGunAvailable){
    wallGunAvailable=true;
    gunWallG.visible=true;
    showMsg('Shotgun returned to wall mount','#aaa');
  } else {
    showMsg('Shotgun dropped — go back to locker for another','#aaa');
  }
}
function dropExtinguisher(){if(heldItem!=='ext')return;hasExt=false;heldItem=null;extG.visible=true;extRing.visible=true;extColActive=true;document.getElementById('xhair').className='';document.getElementById('dropext').classList.remove('on');updateHeldUI();showMsg('Extinguisher put down','#aaa');}

function tryShootCustomer(){if(!hasGun||ammo<=0)return;const dir=new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion).normalize();for(const cd of customers){if(cd.exiting||cd.served)continue;const toC=cd.mesh.position.clone().add(new THREE.Vector3(0,0.8,0)).sub(PP).normalize();if(dir.angleTo(toC)<0.22&&PP.distanceTo(cd.mesh.position)<18){ammo--;updateAmmoUI();gunRecoil=1;flash('mflash',60);playSound('gunshot');spawnBullet(PP.clone(),dir);cd.exiting=true;spawnPart(cd.mesh.position.clone().add(new THREE.Vector3(0,0.8,0)),0xffffff,12);loseStar('You shot a customer! -1 star');return;}}if(hasGun&&ammo>0){ammo--;updateAmmoUI();gunRecoil=1;flash('mflash',50);playSound('gunshot');spawnBullet(PP.clone(),dir);}}


// ── SHOOT AND HIT ────────────────────────────────────────────────────
function shootGun(){
  if(!hasGun||isReloading||!gameRunning)return;
  if(ammo<=0){showMsg('Out of ammo! R=reload','#EF476F');playSound('empty');return;}
  ammo--;updateAmmoUI();gunRecoil=1;flash('mflash',60);playSound('gunshot');
  const dir=new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion).normalize();
  spawnBullet(PP.clone(),dir);
  doShootHit(dir,50);
  damageSewerRat();
  if(window.mpShootRemote)mpShootRemote(PP.clone(),dir,35);
}

// Core hit function — called by all guns with their direction and damage
function doShootHit(dir, damage){
  // CUSTOMERS
  for(const cd of customers){
    if(cd.exiting||cd.served)continue;
    const toC=cd.mesh.position.clone().add(new THREE.Vector3(0,0.8,0)).sub(PP).normalize();
    if(dir.angleTo(toC)<0.22&&PP.distanceTo(cd.mesh.position)<18){
      spawnBlood(cd.mesh.position.clone().add(new THREE.Vector3(0,1,0)),55);
      flash('dmg',120);
      cd.hp=(cd.hp||2)-1;
      if(cd.hp<=0){cd.exiting=true;loseStar('Shot a customer! -1 star');showMsg('💀 Customer down! -1 star','#FF2222');if(window.mpSocket&&window.mpConnected)mpSocket.emit('customerKill',{x:cd.mesh.position.x,y:cd.mesh.position.y+1,z:cd.mesh.position.z});}
      else showMsg('Customer hit! One more! 🩸','#FF6644');
      return;
    }
  }
  // INSPECTOR
  if(inspActive&&inspMesh){
    const toI=inspMesh.position.clone().add(new THREE.Vector3(0,1,0)).sub(PP).normalize();
    if(dir.angleTo(toI)<0.22&&PP.distanceTo(inspMesh.position)<25){
      hitInspector();
      return;
    }
  }
  // TAX GUY
  if(taxGuyMesh&&taxPhase==='taxing'&&taxGuyHP>0){
    const toT=taxGuyMesh.position.clone().add(new THREE.Vector3(0,1,0)).sub(PP).normalize();
    if(dir.angleTo(toT)<0.22&&PP.distanceTo(taxGuyMesh.position)<25){
      spawnBlood(taxGuyMesh.position.clone().add(new THREE.Vector3(0,1,0)),35);
      flash('dmg',80);
      taxGuyHP--;
      if(taxGuyMesh._hpBar){const p=Math.max(0,taxGuyHP/TAX_GUY_MAX_HP);taxGuyMesh._hpBar.scale.x=p;taxGuyMesh._hpBar.position.x=(p-1)*0.36;}
      if(taxGuyHP<=0) killTaxGuy();
      else showMsg('Tax guy hit! '+taxGuyHP+' HP left','#FF8800');
      return;
    }
  }
  // TAX ENFORCERS
  if(taxPhase==='evading'){
    for(const enf of taxEnforcers){
      if(!enf||!enf.mesh||enf.hp<=0)continue;
      const toE=enf.mesh.position.clone().add(new THREE.Vector3(0,1,0)).sub(PP).normalize();
      if(dir.angleTo(toE)<0.22&&PP.distanceTo(enf.mesh.position)<25){
        spawnBlood(enf.mesh.position.clone().add(new THREE.Vector3(0,1,0)),30);
        enf.hp--;
        if(enf.mesh._hpBar){const p=Math.max(0,enf.hp/TAX_ENFORCER_MAX_HP);enf.mesh._hpBar.scale.x=p;enf.mesh._hpBar.position.x=(p-1)*0.36;}
        if(enf.hp<=0) killTaxEnforcer(enf);
        else showMsg('Enforcer hit!','#FF8800');
        return;
      }
    }
  }
  // MP PLAYERS
  if(window.mpSocket&&window.mpConnected){
    for(const id in mpPositions){
      const pos=mpPositions[id];if(!pos)continue;
      const bodyPos=new THREE.Vector3(pos.x,pos.y-0.85,pos.z);
      const toMp=bodyPos.clone().sub(PP).normalize();
      if(dir.angleTo(toMp)<0.22&&PP.distanceTo(bodyPos)<25){
        spawnBlood(bodyPos.clone().add(new THREE.Vector3(0,0.5,0)),40);
        mpSocket.emit('bulletHit',{targetId:id,damage:damage});
        showMsg('🎯 HIT! '+damage+' dmg','#FF4444');
        return;
      }
    }
  }
  // SEWER RATS
  damageSewerRat();
}

function reloadGun(){if(!hasGun||isReloading||ammo===maxAmmo)return;isReloading=true;showMsg('Reloading...','#888');playSound('reload');setTimeout(()=>{ammo=maxAmmo;isReloading=false;updateAmmoUI();showMsg('Reloaded!','#06D6A0');},1800);}

function shootRayGun(){
  if(!hasRayGun||!gameRunning)return;
  if(rayRecharging){showMsg('Recharging... '+Math.ceil(rayRechargeTimer)+'s','#FF8800');return;}
  if(rayGunAmmo<=0){
    rayRecharging=true; rayRechargeTimer=RAY_RECHARGE_TIME;
    showMsg('RAY GUN DEPLETED! Recharging for 30s ⚡','#FF4400');
    updatePowerBar(); return;
  }
  if(rayGunCooldown>0)return;
  rayGunAmmo--;
  updateAmmoUI(); updatePowerBar();
  if(rayGunAmmo<=0){
    rayRecharging=true; rayRechargeTimer=RAY_RECHARGE_TIME;
    showMsg('RAY GUN DEPLETED! Recharging for 30s ⚡','#FF4400');
  }
  rayGunCooldown=0.7;
  flash('mflash',40);
  // spawn expanding ring projectile
  const dir=new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion).normalize();
  const ringGeo=new THREE.TorusGeometry(0.18,0.04,8,32);
  const ringMat=new THREE.MeshBasicMaterial({color:0x00FFAA,transparent:true,opacity:0.9,side:THREE.DoubleSide});
  const ring=new THREE.Mesh(ringGeo,ringMat);
  ring.position.copy(camera.position).addScaledVector(dir,0.6);
  // orient ring to face direction of travel
  ring.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1), dir);
  scene.add(ring);
  // inner glow ring
  const innerGeo=new THREE.TorusGeometry(0.12,0.02,6,24);
  const inner=new THREE.Mesh(innerGeo,new THREE.MeshBasicMaterial({color:0xAAFFEE,transparent:true,opacity:0.6}));
  inner.quaternion.copy(ring.quaternion);
  inner.position.copy(ring.position);
  scene.add(inner);
  rayRings.push({ring,inner,dir:dir.clone(),speed:0.28,life:1.0,radius:0.18,born:Date.now()});
  // point light flash at muzzle
  const muzzleFlash=new THREE.PointLight(0x00FFAA,4,5);
  muzzleFlash.position.copy(ring.position);
  scene.add(muzzleFlash);
  setTimeout(()=>scene.remove(muzzleFlash),120);
  showMsg('','');
}

function updateRayRings(delta){
  // recharge countdown
  if(rayRecharging){
    rayRechargeTimer-=delta;
    updatePowerBar();
    if(rayRechargeTimer<=0){
      rayRecharging=false; rayRechargeTimer=0; rayGunAmmo=rayGunMaxAmmo;
      updateAmmoUI(); updatePowerBar();
      showMsg('RAY GUN RECHARGED! ⚡','#00FFAA');
    }
  }
  rayGunCooldown=Math.max(0,rayGunCooldown-delta);
  for(let i=rayRings.length-1;i>=0;i--){
    const r=rayRings[i];
    // move forward
    r.ring.position.addScaledVector(r.dir, r.speed);
    r.inner.position.copy(r.ring.position);
    // expand ring
    r.radius+=delta*0.9;
    r.ring.scale.setScalar(r.radius/0.18);
    r.inner.scale.setScalar(r.radius/0.12*0.9);
    r.life-=delta*0.55;
    r.ring.material.opacity=Math.max(0,r.life*0.9);
    r.inner.material.opacity=Math.max(0,r.life*0.6);
    // check if ring hits NPCs/inspector — knock THEM back, not the player
    const distToPlayer=r.ring.position.distanceTo(PP);
    // Inspector knockback
    if(inspActive&&inspMesh){
      const distToInsp=r.ring.position.distanceTo(inspMesh.position);
      if(distToInsp<r.radius+0.8&&distToInsp>r.radius-0.9&&!r.hitInsp){
        r.hitInsp=true;
        const pushDir=inspMesh.position.clone().sub(r.ring.position).normalize();
        inspMesh.position.addScaledVector(pushDir,5);
        spawnBlood(inspMesh.position.clone().add(new THREE.Vector3(0,1,0)),18);
        hitInspector();
        showMsg('RAY BLAST! Inspector knocked back! ⚡','#00FFAA');
      }
    }
    // Tax guy ray hit
    if(taxGuyMesh&&taxPhase==='taxing'&&taxGuyHP>0&&!r.hitTaxGuy){
      const dTax=r.ring.position.distanceTo(taxGuyMesh.position);
      if(dTax<r.radius+0.8&&dTax>r.radius-0.9){
        r.hitTaxGuy=true;
        const pushDir=taxGuyMesh.position.clone().sub(r.ring.position).normalize();
        taxGuyMesh.position.addScaledVector(pushDir,4);
        spawnBlood(taxGuyMesh.position.clone().add(new THREE.Vector3(0,1,0)),20);
        taxGuyHP--;
        if(taxGuyMesh._hpBar){const p=Math.max(0,taxGuyHP/TAX_GUY_MAX_HP);taxGuyMesh._hpBar.scale.x=p;taxGuyMesh._hpBar.position.x=(p-1)*0.36;}
        if(taxGuyHP<=0) killTaxGuy();
        else showMsg('⚡ Tax guy blasted!','#FF8800');
      }
    }
    // Tax enforcer ray hits
    if(taxPhase==='evading'&&!r.hitTaxEnf){
      for(const enf of taxEnforcers){
        if(!enf||!enf.mesh||enf.hp<=0)continue;
        const dEnf=r.ring.position.distanceTo(enf.mesh.position);
        if(dEnf<r.radius+0.8&&dEnf>r.radius-0.9){
          r.hitTaxEnf=true;
          const pushDir=enf.mesh.position.clone().sub(r.ring.position).normalize();
          enf.mesh.position.addScaledVector(pushDir,4);
          spawnBlood(enf.mesh.position.clone().add(new THREE.Vector3(0,1,0)),20);
          enf.hp--;
          if(enf.mesh._hpBar){const p=Math.max(0,enf.hp/TAX_ENFORCER_MAX_HP);enf.mesh._hpBar.scale.x=p;enf.mesh._hpBar.position.x=(p-1)*0.36;}
          if(enf.hp<=0) killTaxEnforcer(enf);
          else showMsg('⚡ Enforcer blasted!','#FF8800');
          break;
        }
      }
    }
    // Customer knockback
    for(const cd of customers){
      if(cd.exiting||cd.served)continue;
      const distToCust=r.ring.position.distanceTo(cd.mesh.position);
      if(distToCust<r.radius+0.8&&distToCust>r.radius-0.9&&!r.hitCust){
        r.hitCust=true;
        const pushDir=cd.mesh.position.clone().sub(r.ring.position).normalize();
        cd.mesh.position.addScaledVector(pushDir,6);
        spawnBlood(cd.mesh.position.clone().add(new THREE.Vector3(0,1,0)),25);
        cd.hp=(cd.hp||2)-1;
        if(cd.hp<=0){cd.exiting=true;loseStar('Ray gunned a customer! -1 star');showMsg('💀 RAY BLAST! Customer sent flying! -1 star','#FF2222');}
        else{showMsg('⚡ Customer blasted back! One more!','#00FFAA');}
      }
    }
    // Check if ring hits any remote MP player
    if(window.mpSocket&&window.mpConnected){
      for(const id in mpPlayers){
        const mp=mpPlayers[id];if(!mp||!mp.mesh)continue;
        const d=r.ring.position.distanceTo(mp.mesh.position);
        if(d<r.radius+0.8&&d>r.radius-0.9&&!r.hitPlayers){
          r.hitPlayers=true;
          mpSocket.emit('bulletHit',{targetId:id,damage:50});
          mpSocket.emit('rayHit',{targetId:id});
          spawnBlood(mp.mesh.position.clone().add(new THREE.Vector3(0,1,0)),30);
          showMsg('⚡ RAY BLAST! 50 dmg','#00FFAA');
        }
      }
    }
    if(r.life<=0){
      scene.remove(r.ring); scene.remove(r.inner);
      rayRings.splice(i,1);
    }
  }
}

function shootShotgun(){
  if(!hasShotgun||isReloading||!gameRunning)return;
  if(shotgunAmmo<=0){showMsg('Shotgun empty! R=reload','#EF476F');playSound('empty');return;}
  shotgunAmmo-=3;if(shotgunAmmo<0)shotgunAmmo=0;
  updateAmmoUI();
  shotgunRecoil=1;
  flash('mflash',80);
  playSound('shotgunshot');
  // Crosshair hit — apply once per shot (shotgun spread handled by pellets)
  doShootHit(new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion).normalize(), 35);
  const xhEl=document.getElementById('xhair');
  xhEl.className='shotgun-bloom';
  setTimeout(()=>{if(heldItem==='shotgun')xhEl.className='shotgun';},220);
  const SPREAD=0.12;
  for(let p=0;p<3;p++){
    const fwd=new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion).normalize();
    const angle=Math.random()*SPREAD;
    const roll=Math.random()*Math.PI*2;
    const right2=new THREE.Vector3(1,0,0).applyQuaternion(camera.quaternion);
    const up2=new THREE.Vector3(0,1,0).applyQuaternion(camera.quaternion);
    const pelletDir=fwd.clone()
      .addScaledVector(right2,Math.cos(roll)*Math.sin(angle))
      .addScaledVector(up2,Math.sin(roll)*Math.sin(angle))
      .normalize();
    spawnBullet(PP.clone(),pelletDir);
    for(const cd of customers){
      if(cd.exiting||cd.served)continue;
      const headPos=cd.mesh.position.clone().add(new THREE.Vector3(0,1.0,0));
      const toHead=headPos.clone().sub(PP).normalize();
      if(pelletDir.angleTo(toHead)<SPREAD&&PP.distanceTo(cd.mesh.position)<18){
        spawnBlood(headPos,40);flash('dmg',100);
        cd.hp=(cd.hp||2)-1;
        if(cd.hp<=0){cd.exiting=true;loseStar('Shotgunned a customer! -1 star');showMsg('💀 Blasted! -1 star','#FF2222');}
        else{showMsg('Customer hit! One more! 🩸','#FF8844');}
        break;
      }
    }
    if(inspActive&&inspMesh){
      const toI=inspMesh.position.clone().add(new THREE.Vector3(0,1,0)).sub(PP).normalize();
      if(pelletDir.angleTo(toI)<SPREAD&&PP.distanceTo(inspMesh.position)<22){
        hitInspector();break;
      }
    }
    if(inSewer){
      for(const r of sewerRats){
        const toR=r.mesh.position.clone().sub(PP).normalize();
        if(pelletDir.angleTo(toR)<SPREAD&&PP.distanceTo(r.mesh.position)<14){
          r.hp-=2;spawnBlood(r.mesh.position.clone().add(new THREE.Vector3(0,0.3,0)),15);
          if(r.hp<=0){scene.remove(r.mesh);score+=25;basketCount++;updateHUD();if(window._updateBasketLabel)window._updateBasketLabel();if(window.mpSocket&&window.mpConnected)mpSocket.emit('basketSync',{count:basketCount});showMsg('Sewer rat killed! +1 rat to basket 🐀','#FFD166');}
          break;
        }
      }
      sewerRats.splice(0,sewerRats.length,...sewerRats.filter(r=>r.hp>0));
    }
    if(window.mpShootRemote)mpShootRemote(PP.clone(),pelletDir,18);
  }
}

// shotgun fires 3 pellets — check crosshair hit once per shot
function reloadShotgun(){
  if(!hasShotgun||isReloading||shotgunAmmo===shotgunMaxAmmo)return;
  isReloading=true;showMsg('Reloading shotgun...','#888');playSound('reload');
  setTimeout(()=>{shotgunAmmo=shotgunMaxAmmo;isReloading=false;updateAmmoUI();showMsg('Shotgun reloaded!','#FF9900');},2200);
}
function sprayExtinguisher(){if(!hasExt||extinguisherAmmoo<=0||!gameRunning)return;extinguisherAmmoo-=8;flash('freeze',200);playSound('extspray');grillSlots.forEach(s=>{if(s.item&&PP.distanceTo(s.pos)<GDIST+1){s.frozen=true;setTimeout(()=>{s.frozen=false;},8000);showMsg('Frozen! Slower cooking','#00BFFF');}});if(shopOnFire){shopFireLevel=Math.max(0,shopFireLevel-25);updateFireBar();}spawnFreezeCloud(PP.clone().add(new THREE.Vector3(-Math.sin(yaw)*2,0,-Math.cos(yaw)*2)));if(extinguisherAmmoo<=0){hasExt=false;heldItem=null;document.getElementById('xhair').className='';updateHeldUI();}}

function spawnBlood(pos,n=40){for(let i=0;i<n;i++){const size=0.04+Math.random()*0.09;const p=new THREE.Mesh(new THREE.SphereGeometry(size,4,3),new THREE.MeshBasicMaterial({color:Math.random()<0.6?0xBB0000:0xFF1111,transparent:true}));p.position.copy(pos);const a=Math.random()*Math.PI*2,el=(Math.random()-0.5)*Math.PI;const spd=0.06+Math.random()*0.18;scene.add(p);particles.push({mesh:p,vx:Math.cos(el)*Math.cos(a)*spd,vy:Math.abs(Math.sin(el))*spd+0.04,vz:Math.cos(el)*Math.sin(a)*spd,life:1,decay:0.018+Math.random()*0.015});}const decal=new THREE.Mesh(new THREE.CircleGeometry(0.28+Math.random()*0.22,12),new THREE.MeshBasicMaterial({color:0x880000,transparent:true,opacity:0.85}));decal.rotation.x=-Math.PI/2;decal.position.set(pos.x,0.02,pos.z);scene.add(decal);particles.push({mesh:decal,vx:0,vy:0,vz:0,life:1,decay:0.003});}
function spawnBullet(from,dir){const trail=new THREE.Mesh(new THREE.CylinderGeometry(0.015,0.015,0.55,4),lm(0xFFDD44,0xFFAA00,2));trail.rotation.x=Math.PI/2;trail.position.copy(from);trail.lookAt(from.clone().add(dir));trail.rotateX(Math.PI/2);scene.add(trail);particles.push({mesh:trail,vx:dir.x*0.9,vy:dir.y*0.9,vz:dir.z*0.9,life:1,decay:0.18,isBullet:true});}
function spawnFreezeCloud(pos){for(let i=0;i<20;i++){const p=new THREE.Mesh(new THREE.SphereGeometry(0.08+Math.random()*0.06,4,3),new THREE.MeshBasicMaterial({color:0x88DDFF,transparent:true}));p.position.copy(pos);const a=Math.random()*Math.PI*2,spd=0.04+Math.random()*0.08;scene.add(p);particles.push({mesh:p,vx:Math.cos(a)*spd,vy:0.04+Math.random()*0.07,vz:Math.sin(a)*spd,life:1,decay:0.025});}}
function hitInspector(){inspHP--;playSound('hit');spawnPart(inspMesh.position.clone().add(new THREE.Vector3(0,1,0)),0xFF2222,14);updateInspBar();if(inspHP<=0){score+=200;updateHUD();spawnPart(inspMesh.position.clone().add(new THREE.Vector3(0,0.9,0)),0xFFD166,28);showMsg('INSPECTOR DOWN! +200','#ddd');playSound('inspdown');inspMesh.visible=false;inspActive=false;document.getElementById('inspbar').classList.remove('on');}else{showMsg(['Direct hit!','Keep shooting!','One more!'][3-inspHP]||'Hit!','#EF476F');}}

function igniteFire(){if(shopOnFire)return;shopOnFire=true;shopFireLevel=50;fireLight.intensity=3;fireLight.distance=12;grillFire.intensity=6;updateFireBar();document.getElementById('firebar').classList.add('on');showMsg('THE SHOP IS ON FIRE!','#FF2200');playSound('fire');triggerGlitch();setTimeout(()=>{if(shopOnFire&&shopFireLevel>30)triggerFireCutscene();},5000);}
function triggerFireCutscene(){gameRunning=false;document.getElementById('hud').classList.remove('on');const cs=document.getElementById('cutscene');cs.classList.add('on');const cvc=document.getElementById('cutcanvas');const cctx=cvc.getContext('2d');document.getElementById('cttxt').textContent='THE SHOP BURNS DOWN!';document.getElementById('ctsub').textContent='The Health Inspector arrives on scene...';let frame=0;function drawCut(){if(frame>220){finishCutscene();return;}frame++;const W=cvc.width,H=cvc.height;cctx.fillStyle=`rgb(${Math.floor(80*(1-Math.min(1,frame/80)))},${Math.floor(30*(1-Math.min(1,frame/80)))},0)`;cctx.fillRect(0,0,W,H);cctx.fillStyle='#111';cctx.fillRect(100,120,440,220);cctx.fillRect(160,80,80,45);cctx.fillStyle='#8DB870';cctx.fillRect(102,122,436,218);cctx.fillStyle='#111';cctx.fillRect(180,200,100,140);for(let i=0;i<40;i++){cctx.fillStyle=`hsla(${20+Math.random()*40},100%,${40+Math.random()*30}%,${0.4+Math.random()*0.5})`;cctx.beginPath();cctx.ellipse(80+Math.random()*480,80+Math.random()*60,8+Math.random()*12,40+Math.random()*80+Math.sin(frame*0.3+i)*20,0,0,Math.PI*2);cctx.fill();}for(let i=0;i<15;i++){const age=((frame+i*13)%60)/60;cctx.fillStyle=`rgba(50,50,50,${0.3*(1-age)})`;cctx.beginPath();cctx.arc(200+i*20,(80-age*180+i*5)%300,12+age*30,0,Math.PI*2);cctx.fill();}if(frame>80){const ix=640+Math.max(-320,(80-frame)*4);cctx.fillStyle='#001122';cctx.fillRect(ix-18,200,36,90);cctx.beginPath();cctx.arc(ix,196,22,0,Math.PI*2);cctx.fill();cctx.fillRect(ix-35,210,70,8);cctx.fillRect(ix-12,202,24,28);cctx.fillStyle='#FFD700';cctx.fillRect(ix+8,220,10,8);const legSwing=Math.sin(frame*0.35)*15;cctx.fillStyle='#001122';cctx.save();cctx.translate(ix,290);cctx.fillRect(-12+legSwing,0,14,55);cctx.fillRect(-2-legSwing,0,14,55);cctx.restore();}cctx.fillStyle=`rgba(0,0,0,${Math.min(0.6,frame/60)})`;cctx.fillRect(0,0,W,H);if(frame>100){const a=Math.min(1,(frame-100)/30);cctx.fillStyle=`rgba(255,60,0,${a})`;cctx.font="bold 38px 'Bebas Neue',Impact";cctx.textAlign='center';cctx.fillText('SHOP DESTROYED!',W/2,H/2-20);cctx.fillStyle=`rgba(255,220,100,${a})`;cctx.font="18px 'IBM Plex Mono',monospace";cctx.fillText('The inspector has called the fire department...',W/2,H/2+22);}requestAnimationFrame(drawCut);}drawCut();}
function finishCutscene(){document.getElementById('cutscene').classList.remove('on');endGame('Shop burned down!','#FF4400');}
function spawnPart(pos,color,n){for(let i=0;i<n;i++){const p=new THREE.Mesh(new THREE.SphereGeometry(0.055+Math.random()*0.03,4,3),new THREE.MeshBasicMaterial({color,transparent:true}));p.position.copy(pos);const a=Math.random()*Math.PI*2,spd=0.04+Math.random()*0.1;scene.add(p);particles.push({mesh:p,vx:Math.cos(a)*spd,vy:0.06+Math.random()*0.09,vz:Math.sin(a)*spd,life:1,decay:0.025+Math.random()*0.03});}}

let steamT=0;
function doSteam(delta){steamT+=delta;if(steamT<0.18)return;steamT=0;if(particles.length>60)return;grillSlots.forEach(s=>{if(!s.item||s.frozen)return;const p=new THREE.Mesh(new THREE.SphereGeometry(0.08+Math.random()*0.04,4,3),new THREE.MeshBasicMaterial({color:s.frozen?0xAADDFF:0xCCCCCC,transparent:true,opacity:0.5}));p.position.set(s.pos.x+(Math.random()-.5)*.35,s.pos.y+0.06,s.pos.z+(Math.random()-.5)*.15);scene.add(p);particles.push({mesh:p,vx:(Math.random()-.5)*.007,vy:0.03+Math.random()*.022,vz:0,life:1,decay:0.014,isSteam:true});});if(shopOnFire&&particles.length<80){for(let i=0;i<4;i++){const p=new THREE.Mesh(new THREE.SphereGeometry(0.06+Math.random()*0.1,4,3),new THREE.MeshBasicMaterial({color:Math.random()<0.5?0xFF4400:0xFFAA00,transparent:true}));p.position.set((Math.random()-.5)*10,0.5+Math.random()*2,1+Math.random()*7);scene.add(p);particles.push({mesh:p,vx:(Math.random()-.5)*.04,vy:0.06+Math.random()*0.08,vz:(Math.random()-.5)*.04,life:1,decay:0.02+Math.random()*0.02,isFire:true});}}}

let actx;
function ensureAudio(){if(!actx)actx=new AudioContext();if(actx.state==='suspended')actx.resume();}
function tone(freq,type,dur,gain,start){try{ensureAudio();const o=actx.createOscillator(),g=actx.createGain();o.type=type||'sine';o.connect(g);g.connect(actx.destination);if(start){o.frequency.setValueAtTime(start,actx.currentTime);o.frequency.setValueAtTime(freq,actx.currentTime+0.08);}else o.frequency.value=freq;g.gain.setValueAtTime(gain||0.15,actx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,actx.currentTime+dur);o.start();o.stop(actx.currentTime+dur);}catch(e){}}
function noize(dur,gain,freq=800,q=0.5){try{ensureAudio();const buf=actx.createBuffer(1,actx.sampleRate*dur,actx.sampleRate);const d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;const src=actx.createBufferSource();src.buffer=buf;const g=actx.createGain();g.gain.setValueAtTime(gain,actx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,actx.currentTime+dur);const bpf=actx.createBiquadFilter();bpf.type='bandpass';bpf.frequency.value=freq;bpf.Q.value=q;src.connect(bpf);bpf.connect(g);g.connect(actx.destination);src.start();src.stop(actx.currentTime+dur);}catch(e){}}
function playSound(t){ensureAudio();if(t==='catch')tone(1000,'sine',0.18,0.12,600);if(t==='sizzle')tone(80,'sawtooth',0.45,0.09);if(t==='ding')tone(1320,'sine',0.5,0.2,880);if(t==='start')tone(1500,'sawtooth',0.45,0.15,60);if(t==='busted'){tone(100,'square',1.0,0.25);noize(0.4,0.15,200);}if(t==='step')noize(0.07,0.03,90,2);if(t==='inspector'){tone(200,'sawtooth',0.3,0.18);setTimeout(()=>tone(300,'sawtooth',0.3,0.18),180);}if(t==='levelup')[523,659,784,1047].forEach((f,i)=>setTimeout(()=>tone(f,'sine',0.3,0.14),i*120));if(t==='gunshot'){noize(0.07,0.5,1200,0.3);tone(180,'square',0.1,0.25,400);}if(t==='shotgunshot'){noize(0.12,0.7,600,0.2);tone(120,'square',0.14,0.3,300);}if(t==='hit'){noize(0.04,0.25,300);tone(220,'sawtooth',0.08,0.18);}if(t==='empty')tone(180,'square',0.09,0.14);if(t==='reload'){tone(400,'sine',0.1,0.1);setTimeout(()=>tone(600,'sine',0.1,0.1),300);}if(t==='inspdown')[261,329,392,523].forEach((f,i)=>setTimeout(()=>tone(f,'sine',0.35,0.18),i*100));if(t==='gunpickup'){tone(600,'sine',0.15,0.18,400);setTimeout(()=>tone(900,'sine',0.2,0.18),200);}if(t==='fire'){noize(1.5,0.3,300,0.2);tone(80,'sawtooth',1.5,0.2);}if(t==='extspray')noize(0.3,0.15,4000,1);if(t==='panswing'){noize(0.08,0.18,800,0.8);tone(260,'square',0.09,0.12);}if(t==='burned'){tone(100,'square',0.8,0.2);noize(0.5,0.12,150);}}

function showMsg(txt,col='#fff'){const el=document.getElementById('msg');el.textContent=txt;el.style.color=col;el.style.opacity=1;clearTimeout(el._t);el._t=setTimeout(()=>el.style.opacity=0,2400);}
function updateHUD(){document.getElementById('sv').textContent=score;document.getElementById('srv').textContent=served;document.getElementById('lvl').textContent=level;document.getElementById('starsv').textContent='x'+stars;document.getElementById('starsBot').textContent='x'+stars;}
function updateAmmoUI(){
  if(heldItem==='shotgun'){
    document.getElementById('ammodiv').innerHTML=shotgunAmmo+'<small>/ '+shotgunMaxAmmo+'</small>';
  } else if(heldItem==='raygun'){
    document.getElementById('ammodiv').innerHTML=rayGunAmmo+'<small>/ '+rayGunMaxAmmo+'</small>';
  } else {
    document.getElementById('ammodiv').innerHTML=ammo+'<small>/ '+maxAmmo+'</small>';
  }
}
function updateInspBar(){const el=document.getElementById('inspbar');if(inspActive&&inspMesh){el.classList.add('on');document.getElementById('ibfill').style.width=(inspHP/3*100)+'%';}else el.classList.remove('on');}
function updateFireBar(){document.getElementById('fbfill').style.width=shopFireLevel+'%';}
function updatePowerBar(){
  const bar=document.getElementById('powerbar');
  const fill=document.getElementById('pb-fill');
  const lbl=document.getElementById('pb-label');
  if(!bar||!fill||!lbl)return;
  const show=(heldItem==='raygun')||rayRecharging;
  bar.classList.toggle('on',show);
  if(!show)return;
  if(rayRecharging){
    const prog=Math.max(0,1-(rayRechargeTimer/RAY_RECHARGE_TIME));
    fill.style.width=(prog*100)+'%';
    fill.style.background='linear-gradient(to right,#FF4400,#FF8800)';
    lbl.textContent='⚡ RECHARGING — '+Math.ceil(rayRechargeTimer)+'s';
    lbl.style.color='#FF8800';
  } else {
    const pct=(rayGunAmmo/rayGunMaxAmmo)*100;
    fill.style.width=pct+'%';
    fill.style.background=pct>50?'linear-gradient(to right,#00FFAA,#00CC88)':pct>20?'linear-gradient(to right,#FFCC00,#FF8800)':'linear-gradient(to right,#FF4400,#FF6600)';
    lbl.textContent='⚡ POWER — '+rayGunAmmo+'/'+rayGunMaxAmmo;
    lbl.style.color='#00FFAA';
  }
}
function triggerGlitch(){const g=document.getElementById('glitch');g.classList.add('on');setTimeout(()=>g.classList.remove('on'),110+Math.random()*90);}
function flash(id,ms){const el=document.getElementById(id);el.style.opacity=1;setTimeout(()=>el.style.opacity=0,ms);}
function checkLevel(){if(served>=level*5){level++;updateHUD();showMsg('LEVEL '+level,'#eee');playSound('levelup');}}
function updateCookBar(){const cb=document.getElementById('cookbar');const active=grillSlots.filter(s=>s.item&&!s.done&&!s.burned);if(active.length===0){cb.classList.remove('on');return;}cb.classList.add('on');const worst=active.reduce((a,b)=>a.cookTime>b.cookTime?a:b);const prog=Math.min(1,worst.cookTime/worst.maxCook);const pct=Math.round(prog*100);document.getElementById('cookbar-fill').style.width=pct+'%';document.getElementById('cookbar-time').textContent=Math.round(worst.cookTime)+'s / '+Math.round(worst.maxCook)+'s';const fill=document.getElementById('cookbar-fill');const overTime=worst.cookTime/worst.maxCook;if(overTime<0.3)fill.style.background='linear-gradient(to right,#eee,#ddd)';else if(overTime<0.6)fill.style.background='linear-gradient(to right,#ddd,#CC8800)';else if(overTime<0.9)fill.style.background='linear-gradient(to right,#CC8800,#8B4400)';else if(overTime<1.2)fill.style.background='linear-gradient(to right,#8B4400,#44FF44)';else if(overTime<1.8)fill.style.background='linear-gradient(to right,#FF8800,#FF2200)';else fill.style.background='linear-gradient(to right,#331100,#111)';const lbl=document.getElementById('cookbar-label');if(overTime<0.85)lbl.textContent='COOKING — '+pct+'%';else if(overTime<1.05)lbl.textContent='DONE! PICK UP!(E near grill)';else if(overTime<1.8)lbl.textContent='GETTING OVERCOOKED!!!';else lbl.textContent='BURNING — GRAB IT NOW!!!';lbl.style.color=overTime>1.2?'#FF4400':overTime>0.85?'#44FF44':'#ddd';}

const rc=document.getElementById('rc'),rctx=rc.getContext('2d');
function drawRadar(){const W=rc.width,H=rc.height,cx=W/2,cy=H/2;rctx.clearRect(0,0,W,H);rctx.fillStyle='rgba(0,6,3,0.9)';rctx.fillRect(0,0,W,H);rctx.strokeStyle='rgba(6,214,160,0.14)';[0.5,0.85].forEach(r=>{rctx.beginPath();rctx.arc(cx,cy,cx*r,0,Math.PI*2);rctx.stroke();});rctx.fillStyle='#06D6A0';rctx.beginPath();rctx.arc(cx,cy,3.5,0,Math.PI*2);rctx.fill();rctx.strokeStyle='rgba(6,214,160,0.35)';rctx.lineWidth=1.5;rctx.beginPath();rctx.moveTo(cx,cy);rctx.lineTo(cx+Math.sin(yaw)*(cx-2),cy-Math.cos(yaw)*(cy-2));rctx.stroke();const RANGE=22;const rm=(dx,dz)=>[cx+(dx*Math.cos(-yaw)-dz*Math.sin(-yaw))*(cx/RANGE),cy+(-dx*Math.sin(-yaw)-dz*Math.cos(-yaw))*(cy/RANGE)];const[bx2,by2]=rm(BASKET_POS.x-PP.x,BASKET_POS.z-PP.z);rctx.fillStyle='#FFD166';rctx.beginPath();rctx.arc(bx2,by2,4,0,Math.PI*2);rctx.fill();const[gx2,gy2]=rm(0-PP.x,4.1-PP.z);rctx.fillStyle='#FF5500';rctx.beginPath();rctx.arc(gx2,gy2,4,0,Math.PI*2);rctx.fill();const[fx,fy]=rm(FRIDGE_POS.x-PP.x,FRIDGE_POS.z-PP.z);rctx.fillStyle='#00BFFF';rctx.beginPath();rctx.arc(fx,fy,4,0,Math.PI*2);rctx.fill();

if(!hasExt){const[ex,ey]=rm(EXT_POS.x-PP.x,EXT_POS.z-PP.z);rctx.fillStyle='#00BFFF';rctx.beginPath();rctx.arc(ex,ey,3,0,Math.PI*2);rctx.fill();}if(!hasGun){const[lx,ly]=rm(LOCKER_POS.x-PP.x,LOCKER_POS.z-PP.z);rctx.fillStyle='#EF476F';rctx.beginPath();rctx.arc(lx,ly,3,0,Math.PI*2);rctx.fill();}if(!hasGun&&wallGunAvailable){const[wx,wy]=rm(GUN_WALL_POS.x-PP.x,GUN_WALL_POS.z-PP.z);rctx.fillStyle='#FF9900';rctx.beginPath();rctx.arc(wx,wy,3,0,Math.PI*2);rctx.fill();}customers.forEach(cd=>{const dx=cd.mesh.position.x-PP.x,dz=cd.mesh.position.z-PP.z;if(Math.abs(dx)>RANGE||Math.abs(dz)>RANGE)return;const[rx,ry]=rm(dx,dz);rctx.fillStyle='#4ECDC4';rctx.beginPath();rctx.arc(rx,ry,3,0,Math.PI*2);rctx.fill();});if(inspActive&&inspMesh){const dx=inspMesh.position.x-PP.x,dz=inspMesh.position.z-PP.z;const[rx,ry]=rm(dx,dz);rctx.fillStyle='#EF476F';rctx.beginPath();rctx.arc(rx,ry,5,0,Math.PI*2);rctx.fill();}}

function updateHeldUI(){
  const el=document.getElementById('hico');
  const icons={rat:'🐀',kebab:'🍢',fkebab:'❄',gun:'🔫',ext:'🧊',shotgun:'🔫',raygun:'🔫',pan:'🍳',bread:'🍞',grilledbread:'🍞'};
  if(!heldItem){el.classList.remove('on');}else{el.textContent=icons[heldItem]||'?';el.classList.add('on');}
  document.getElementById('dropext').classList.toggle('on',heldItem==='ext');
  document.getElementById('dropkebab').classList.toggle('on',heldItem==='kebab'||heldItem==='fkebab'||heldItem==='grilledbread');
  const lbl=document.getElementById('itemlabel');
  const lname=document.getElementById('itemlabel-name');
  const labelNames={rat:'RAT',kebab:'KEBAB(GRILLED)',fkebab:'KEBAB(FRIDGE)',gun:'GLOCK 19',ext:'FIRE EXTINGUISHER',shotgun:'SHOTGUN',raygun:'RAY GUN',pan:'FRYING PAN',bread:'BREAD (RAW)',grilledbread:'BREAD (GRILLED)'};
  if(heldItem&&labelNames[heldItem]){lname.textContent=labelNames[heldItem];lbl.classList.add('on');}else{lbl.classList.remove('on');}
  updatePowerBar();
  if(vmRayGun)vmRayGun.visible=(heldItem==='raygun');
  if(vmRayGun)vmRayGun.visible=(heldItem==='raygun');
  if(vmPan)vmPan.visible=(heldItem==='pan');
  if(vmRat)vmRat.visible=(heldItem==='rat');
  if(vmBread)vmBread.visible=(heldItem==='bread'||heldItem==='grilledbread');
  if(vmGrilledRat)vmGrilledRat.visible=(heldItem==='kebab'&&heldKebabData&&heldKebabData.isGrilledRat);
  vmKebab.visible=(heldItem==='fkebab')||(heldItem==='kebab'&&heldKebabData&&!heldKebabData.isGrilledRat);
  gunGroup.visible=(heldItem==='gun');
  if(heldItem==='shotgun'){
    // rebuild viewmodel if GLB loaded late
    if(shotgunModelReady) rebuildVmShotgun();
    if(vmShotgun){
      vmShotgun.visible=true;
      const bb=new THREE.Box3().setFromObject(vmShotgun);
    }
  } else if(vmShotgun){
    vmShotgun.visible=false;
  }
  const obj=document.getElementById('objt');
  if(heldItem==='rat')obj.innerHTML='<span class="k">F</span> Grill <span class="k">E</span> Drop';
  else if(heldItem==='fkebab')obj.innerHTML='<span class="k">F</span> Grill it OR<br><span class="k">E</span> near customer=serve raw';
  else if(heldItem==='kebab')obj.innerHTML='<span class="k">E</span> near customer=Serve<br><span class="k">E</span> away=Drop';
  else if(heldItem==='bread')obj.innerHTML='<span class="k">F</span> Grill it<br><span class="k">Q</span> Drop';
  else if(heldItem==='grilledbread')obj.innerHTML='<span class="k">E</span> near customer=Sell bread<br><span class="k">Q</span> Drop';
  else if(heldItem==='gun')obj.innerHTML='<span class="k">CLICK</span> Shoot<br><span class="k">R</span> Reload('+ammo+'/'+maxAmmo+')<br><span class="k">Q</span> Drop gun';
  else if(heldItem==='ext')obj.innerHTML='<span class="k">CLICK</span> Spray<br><span class="k">Q</span> Drop it<br>Ammo: '+extinguisherAmmoo+'%';
  else obj.innerHTML=`<span class="k">E</span> Basket(${basketCount})<br><span class="k">E</span> Fridge kebab<br><span class="k">F</span> Grill<br><span class="k">E</span> Serve`+(hasGun?'':`<br><span class="k">E</span> Locker=gun`)+(hasExt?'':`<br><span class="k">E</span> Ext`);
}

function startGame(){

// ── RENDER DISTANCE ───────────────────────────────────────────────────
window.__setRenderDistance = function(far){
  camera.far = far;
  camera.updateProjectionMatrix();
  // Also adjust fog density: farther view = less dense fog
  const density = far <= 40 ? 0.045 : far <= 70 ? 0.022 : 0.016;
  if(!inSewer) scene.fog = new THREE.FogExp2(scene.fog.color, density);
};

// ── LOW DETAILS MODE ──────────────────────────────────────────────────
let _lowDetails = false;
window.__setLowDetails = function(on){
  _lowDetails = on;
  if(on){
    renderer.setPixelRatio(1);
    renderer.shadowMap.enabled = false;
    scene.fog = new THREE.FogExp2(scene.fog.color, 0.035); // heavier fog = less to render
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.toneMappingExposure = 1.0;
  } else {
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = false; // shadows stay off (perf)
    scene.fog = new THREE.FogExp2(scene.fog.color, 0.016);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
  }
};
  // Expose drop/carry functions to window for mobile access
  window.dropRat=dropRat; window.dropKebab=dropKebab; window.dropBread=dropBread;
  window.placeCarried=placeCarried;
  ensureAudio();playSound('start');
  document.getElementById('tut').style.display='none';
  document.getElementById('hud').classList.add('on');
  gameRunning=true;requestLock();
  // Bring mobile controller above HUD now that game is running
  const mc=document.getElementById('mobileCtrl');
  if(mc) mc.style.zIndex='9000';
  score=0;served=0;stars=10;level=1;custT=0;inspT=0;refillT=0;
  dayTime=0;dayCount=1;isNight=false;
  const dc=document.getElementById('dayCounter');if(dc)dc.style.display='block';
  shopFireLevel=0;shopOnFire=false;inspWarningShown=false;inspLeaveTimer=0;
  rats.forEach(r=>scene.remove(r.mesh));rats=[];
  customers.forEach(c=>scene.remove(c.mesh));customers=[];
  particles.forEach(p=>scene.remove(p.mesh));particles=[];
  if(inspMesh)inspMesh.visible=false;inspActive=false;
  grillSlots.forEach(s=>{s.item=null;s.itemType=null;s.done=false;s.burned=false;s.cookTime=0;s.ring.visible=false;s.frozen=false;});
  heldItem=null;heldRatData=null;heldKebabData=null;
  hasRayGun=false;rayGunAmmo=rayGunMaxAmmo;rayGunCooldown=0;rayRecharging=false;rayRechargeTimer=0;rayGunWallAvailable=true;rayGunWallG.visible=true;rayRings.forEach(r=>{scene.remove(r.ring);scene.remove(r.inner);});rayRings.length=0;basketCount=8;hasGun=false;ammo=maxAmmo;hasShotgun=false;shotgunAmmo=shotgunMaxAmmo;hasExt=false;extinguisherAmmoo=100;isReloading=false;wallGunAvailable=true;gunWallG.visible=true;hasPan=false;panSwingCooldown=0;panSwinging=false;panWallAvailable=true;panWallG.visible=true;
  extG.visible=true;extRing.visible=true;extColActive=true;
  document.getElementById('ammodiv').style.opacity='0';
  document.getElementById('xhair').className='';
  document.getElementById('firebar').classList.remove('on');
  document.getElementById('inspbar').classList.remove('on');
  document.getElementById('cookbar').classList.remove('on');
  document.getElementById('fireoverlay').style.opacity='0';
  fireLight.intensity=0;grillFire.intensity=3.5;lockLight.color.set(0xFF2222);lockLight.intensity=1.8;
  PP.set(0,1.7,10);yaw=Math.PI;pitch=0;velY=0;onGround=true;
  // Reset tax system
  taxPhase='none';taxCycleT=0;taxDueT=0;taxWarningShown=false;taxEarningsStart=0;
  taxGuyHP=0;taxGuyAtkCooldown=0;clearTaxEntities();
  playerHP=maxPlayerHP;updateHealthBar();document.getElementById('healthbar').classList.add('on');
  sewerRats.forEach(r=>scene.remove(r.mesh));sewerRats.length=0;

  updateHUD();updateHeldUI();spawnCustomer();
  showMsg('E=grab F=grill E near customer=serve','#FFD166');
}

function loseStar(reason){stars=Math.max(0,stars-1);updateHUD();showMsg((reason||'-1 star'),'#EF476F');flash('dmg',250);triggerGlitch();playSound('busted');if(stars<=0)endGame('Ran out of stars!','#EF476F');}
function endGame(reason,col='#EF476F'){gameRunning=false;document.getElementById('fs').textContent=score;document.getElementById('gosb').textContent=reason||'Inspector shut you down';document.getElementById('gotl').style.color=col;document.getElementById('go').classList.add('on');if(document.pointerLockElement===canvas){document.exitPointerLock();}}
function resetGame(){document.getElementById('go').classList.remove('on');document.getElementById('cutscene').classList.remove('on');startGame();}

function update(delta){if(!gameRunning)return;checkAndRebuildVmRat();

  // ── FREECAM MODE (V to toggle) ─────────────────────────────────
  if(freeCam){
    const fspd=(keys['ShiftLeft']||keys['ShiftRight'])?18:7;
    const fwd=new THREE.Vector3(-Math.sin(fcYaw)*Math.cos(fcPitch),Math.sin(fcPitch),-Math.cos(fcYaw)*Math.cos(fcPitch));
    const right=new THREE.Vector3(Math.cos(fcYaw),0,-Math.sin(fcYaw));
    if(keys['KeyW']||keys['ArrowUp']) fcPos.addScaledVector(fwd,fspd*delta);
    if(keys['KeyS']||keys['ArrowDown']) fcPos.addScaledVector(fwd,-fspd*delta);
    if(keys['KeyA']||keys['ArrowLeft']) fcPos.addScaledVector(right,-fspd*delta);
    if(keys['KeyD']||keys['ArrowRight']) fcPos.addScaledVector(right,fspd*delta);
    if(keys['Space']) fcPos.y+=fspd*delta;
    if(keys['ShiftLeft']||keys['ShiftRight']) fcPos.y-=fspd*0.5*delta;
    camera.position.copy(fcPos);
    camera.quaternion.setFromEuler(new THREE.Euler(fcPitch,fcYaw,0,'YXZ'));
    gunGroup.visible=false;
    return;
  }
  gunGroup.visible=true;

  updateCar(delta);
  const sprint=keys['ShiftLeft']||keys['ShiftRight'];const spd=(sprint?7.2:SPD)*delta;const fwd=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw));const right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));moving=false;
  if(!inCar){if(keys['KeyW']||keys['ArrowUp']){PP.addScaledVector(fwd,spd);moving=true;}if(keys['KeyS']||keys['ArrowDown']){PP.addScaledVector(fwd,-spd);moving=true;}if(keys['KeyA']||keys['ArrowLeft']){PP.addScaledVector(right,-spd);moving=true;}if(keys['KeyD']||keys['ArrowRight']){PP.addScaledVector(right,spd);moving=true;}if(keys['Space']&&onGround){velY=JSPD;onGround=false;}}
  velY+=GRAV*delta;PP.y+=velY*delta;const floorY=inSewer?SEWER_Y+1.7:PH;if(PP.y<=floorY){PP.y=floorY;velY=0;onGround=true;}for(let i=0;i<3;i++)resolvePlayer(PP);if(moving&&onGround){bobPhase+=(sprint?13:8)*delta;stepT+=delta;if(stepT>(sprint?0.24:0.44)){playSound('step');stepT=0;}}else bobPhase*=0.88;
  if(!inCar){camera.position.set(PP.x,PP.y+Math.sin(bobPhase)*0.021*(sprint?1.5:1),PP.z);camera.quaternion.setFromEuler(new THREE.Euler(pitch,yaw,0,'YXZ'));}
  gunGroup.position.set(0.15+Math.sin(bobPhase*2)*0.005,-0.14+Math.sin(bobPhase)*0.008,-0.3);gunGroup.rotation.set(0.0+pitch*0.04-gunRecoil*0.1,-0.06,0);extGroup2.position.set(0.1+Math.sin(bobPhase*2)*0.005,-0.12+Math.sin(bobPhase)*0.008,-0.28);gunRecoil*=0.72;if(vmRayGun.visible){vmRayGun.position.set(0.22+Math.sin(bobPhase*2)*0.005,-0.18+Math.sin(bobPhase)*0.008,-0.35);}
if(vmRat&&vmRat.visible){vmRat.position.set(0.2+Math.sin(bobPhase*2)*0.005,-0.18+Math.sin(bobPhase)*0.008,-0.45);}if(vmGrilledRat&&vmGrilledRat.visible){vmGrilledRat.position.set(0.2+Math.sin(bobPhase*2)*0.005,-0.18+Math.sin(bobPhase)*0.008,-0.45);}if(vmKebab.visible){vmKebab.position.set(0.15+Math.sin(bobPhase*2)*0.005,-0.14+Math.sin(bobPhase)*0.008,-0.3);vmKebab.rotation.x=0.3+pitch*0.04;}
if(vmBread&&vmBread.visible){vmBread.position.set(0.15+Math.sin(bobPhase*2)*0.005,-0.14+Math.sin(bobPhase)*0.008,-0.30);vmBread.rotation.set(0.3+pitch*0.04,-0.4,0.08);}
if(vmShotgun&&vmShotgun.visible){vmShotgun.position.set(0.45+Math.sin(bobPhase*2)*0.005,-0.42+Math.sin(bobPhase)*0.008+shotgunRecoil*0.015,-1.6);shotgunRecoil*=0.68;}
if(vmPan&&vmPan.visible){panSwingCooldown=Math.max(0,panSwingCooldown-delta);const swingRot=panSwinging?(Math.sin((1-(panSwingCooldown/0.55))*Math.PI)*1.2):0;if(panSwingCooldown<=0)panSwinging=false;vmPan.position.set(0.18+Math.sin(bobPhase*2)*0.005,-0.16+Math.sin(bobPhase)*0.008,-0.38);vmPan.rotation.set(0.05-swingRot,-0.08,0);}
custT+=delta;inspT+=delta;refillT+=delta;if(custT>6){spawnCustomer();custT=Math.random()*2;}if(!inspActive&&inspT>INSP_INTERVAL){spawnInspector();inspT=0;}updateTax(delta);// basket no longer auto-refills — kill sewer rats to restock
let burnedAnything=false;
if(typeof grillSyncTimer_=="undefined")var grillSyncTimer_=0;grillSyncTimer_+=delta;
const doGrillProgressSync=grillSyncTimer_>2.0;
if(doGrillProgressSync)grillSyncTimer_=0;
grillSlots.forEach((s,si)=>{if(!s.item||s.done||s.burned)return;const rate=s.frozen?0.3:1.0;s.cookTime+=delta*rate;const prog=s.cookTime/s.maxCook;const mesh3D=s.itemType==='rat'?s.item.mesh:s.item._mesh;if(mesh3D){const col=getCookColor(Math.min(1,prog),s.burned);mesh3D.traverse(c=>{if(c.isMesh&&c.material&&c.material.color)c.material.color.copy(col);});}const progCapped=Math.min(1,prog);{const pos=s.ring.geometry.attributes.position;for(let i=0;i<=30;i++){const a=-Math.PI/2+Math.PI*2*(i/30)*progCapped;pos.setXYZ(i,Math.cos(a)*0.25,0,Math.sin(a)*0.25);}pos.needsUpdate=true;}if(s.frozen)s.ring.material.color.setHex(0x00BFFF);else if(prog<0.5)s.ring.material.color.setHex(0xFFEEDD);else if(prog<0.85)s.ring.material.color.setHex(0xFF8800);else if(prog<1.1)s.ring.material.color.setHex(0x00FF88);else s.ring.material.color.setHex(0xFF2200);
  // Sync progress to other players every 2s
  if(doGrillProgressSync&&window.mpSocket&&window.mpConnected){mpSocket.emit('grillUpdate',{slotIndex:si,action:'progress',itemType:s.itemType,cookTime:s.cookTime,maxCook:s.maxCook});}
  if(s.cookTime>=s.maxCook&&!s.done&&!s.burned){s.done=true;if(s.itemType==='rat'&&s.item)s.item.done=true;s.ring.material.color.setHex(0x00FF88);showMsg('KEBAB DONE! E near grill to pick up','#06D6A0');playSound('ding');
    if(window.mpSocket&&window.mpConnected)mpSocket.emit('grillUpdate',{slotIndex:si,action:'done',itemType:s.itemType,cookTime:s.cookTime,maxCook:s.maxCook});
  }if(s.cookTime>s.maxCook+45&&!s.burned){s.burned=true;s.done=false;burnedAnything=true;if(mesh3D)mesh3D.traverse(c=>{if(c.isMesh&&c.material&&c.material.color)c.material.color.copy(getCookColor(0,true));});s.ring.material.color.setHex(0x111111);shopFireLevel=Math.min(100,shopFireLevel+25);updateFireBar();if(!shopOnFire&&shopFireLevel>=50)igniteFire();loseStar('Burned the food! -1 star');playSound('burned');
    if(window.mpSocket&&window.mpConnected)mpSocket.emit('grillUpdate',{slotIndex:si,action:'burned'});
    setTimeout(()=>{if(mesh3D)scene.remove(mesh3D);if(s.itemType==='rat'&&s.item)rats=rats.filter(r=>r!==s.item);s.item=null;s.itemType=null;s.burned=false;s.cookTime=0;s.ring.visible=false;},2000);}});
if(!burnedAnything&&shopFireLevel>0&&!shopOnFire){shopFireLevel=Math.max(0,shopFireLevel-delta*3);updateFireBar();}if(shopOnFire){shopFireLevel=Math.min(100,shopFireLevel+delta*4);updateFireBar();document.getElementById('fireoverlay').style.opacity=Math.min(0.6,shopFireLevel/100);}
updateCookBar();
// ── COMBO countdown ──────────────────────────────────────────────────
if(comboTimer>0){
  comboTimer-=delta;
  if(comboTimer<=0){comboCount=0;comboTimer=0;}
}
customers.forEach(cd=>{if(cd.exiting){cd.mesh.position.x+=cd.side*0.08;return;}cd.mesh.position.x+=(cd.tx-cd.mesh.position.x)*0.03;cd.bp+=0.04;cd.mesh.position.y=Math.sin(cd.bp)*0.03;cd.mesh.rotation.y=Math.atan2(PP.x-cd.mesh.position.x,PP.z-cd.mesh.position.z);if(cd.mesh._nameLabel){cd.mesh._nameLabel.lookAt(camera.position);}if(cd.mesh._vipLabel){cd.mesh._vipLabel.lookAt(camera.position);}cd.patience-=delta;if(cd.mesh._bar){const p=Math.max(0,cd.patience/cd.maxP);cd.mesh._bar.scale.x=p;cd.mesh._bar.position.x=(p-1)*0.34;cd.mesh._bar.material.color.setRGB(cd.isVIP?0:1-p,cd.isVIP?0.85:p*0.9,cd.isVIP?0:0);}if(cd.patience<=0){cd.exiting=true;comboCount=0;comboTimer=0;loseStar((cd.isVIP?'VIP ':'')+'Customer left! -1 star');}});
customers=customers.filter(cd=>{if(cd.exiting&&Math.abs(cd.mesh.position.x)>18){scene.remove(cd.mesh);return false;}return true;});
if(inspActive&&inspData&&inspMesh){inspMesh.position.x+=inspData.vx;const tp=new THREE.Vector2(PP.x-inspMesh.position.x,PP.z-inspMesh.position.z);if(tp.length()<7)inspMesh.rotation.y=Math.atan2(tp.x,tp.y);else inspMesh.rotation.y=inspData.vx<0?-Math.PI/2:Math.PI/2;if(Math.abs(inspMesh.position.x)<8){if(grillSlots.some(s=>s.item)&&Math.random()<0.004){loseStar('Inspector busted you! -1 star');grillSlots.forEach(s=>{if(s.item){const m=s.item.mesh||s.item._mesh;if(m)scene.remove(m);}s.item=null;s.itemType=null;s.done=false;s.burned=false;s.cookTime=0;s.ring.visible=false;});rats=rats.filter(r=>!r.onGrill);triggerGlitch();}}
// Inspector damages player when very close
if(PP.distanceTo(inspMesh.position)<2.0){playerHP=Math.max(0,playerHP-delta*12);updateHealthBar();flash('dmg',80);if(playerHP<=0){}/* updateHealthBar handles death */}
const absX=Math.abs(inspMesh.position.x);if(absX>15&&!inspWarningShown){inspWarningShown=true;inspLeaveTimer=0;showMsg('Inspector leaving! Shoot him!','#FF8800');}if(inspWarningShown)inspLeaveTimer+=delta;if(absX>21){if(inspWarningShown)loseStar('Inspector escaped! -1 star');inspActive=false;inspMesh.visible=false;inspWarningShown=false;inspLeaveTimer=0;document.getElementById('inspbar').classList.remove('on');}if(inspMesh._hpBar){const p=inspHP/3;inspMesh._hpBar.scale.x=p;inspMesh._hpBar.position.x=(p-1)*0.36;}updateInspBar();}
particles.forEach(p=>{if(p.isBullet){p.mesh.position.x+=p.vx;p.mesh.position.y+=p.vy;p.mesh.position.z+=p.vz;}else{p.mesh.position.x+=p.vx;p.mesh.position.y+=p.vy;p.mesh.position.z+=p.vz;p.vy-=p.isFire?0.001:0.004;if(p.isSteam)p.mesh.scale.setScalar(1+(1-p.life)*3);}p.life-=p.decay;p.mesh.material.opacity=p.life;});particles=particles.filter(p=>{if(p.life<=0){scene.remove(p.mesh);return false;}return true;});
doSteam(delta);updateSewerRats(delta);mpSendPosition(delta);mpSendNpcs(delta);
  mpUpdateMeshes();if(!inSewer)updateCrates(delta);updateRayRings(delta);
if(inSewer){srLight.intensity=2.8+Math.sin(Date.now()*0.007)*0.8;}
let near=false;if(window.JASON_POS&&!inSewer&&PP.distanceTo(window.JASON_POS)<2.5)near=true;if(window.VEND_POS_LIST){for(const _vp of window.VEND_POS_LIST){if(PP.distanceTo(_vp)<2.0){near=true;break;}}}if(!inSewer&&PP.distanceTo(SPAWN_BTN_POS)<2.2)near=true;if(window.TV_POS&&!inSewer&&PP.distanceTo(window.TV_POS)<2.2)near=true;if(!inSewer&&PP.distanceTo(MANHOLE_POS)<2.2)near=true;if(inSewer&&PP.distanceTo(new THREE.Vector3(40,SEWER_Y+1.7,47))<2.0)near=true;if(PP.distanceTo(BASKET_POS)<IDIST+0.4&&basketCount>0&&!heldItem)near=true;if(PP.distanceTo(FRIDGE_POS)<IDIST+0.5&&!heldItem)near=true;if(!hasGun&&PP.distanceTo(LOCKER_POS)<IDIST+0.6)near=true;if(!hasGun&&wallGunAvailable&&PP.distanceTo(GUN_WALL_POS)<IDIST+0.9)near=true;if(!hasExt&&PP.distanceTo(EXT_POS)<IDIST+0.5)near=true;if(panWallAvailable&&PP.distanceTo(PAN_WALL_POS)<2.2&&!heldItem)near=true;
grillSlots.forEach(s=>{if(s.done&&PP.distanceTo(s.pos)<GDIST&&!heldItem)near=true;});customers.forEach(cd=>{if(!cd.served&&!cd.exiting&&(heldItem==='kebab'||heldItem==='fkebab')&&PP.distanceTo(cd.mesh.position)<IDIST+0.7)near=true;});
// Crate drag hint
if(!inSewer&&!heldItem){
  if(draggedCrate){document.getElementById('inter').classList.add('on');document.getElementById('inter').textContent='[ RIGHT-CLICK ] DROP  |  [ SCROLL ] DISTANCE';near=false;}
  else{
    raycaster.setFromCamera(SCREEN_CENTER,camera);
    const ch=raycaster.intersectObjects(spawnedCrates.map(c=>c.mesh),false);
    if(ch.length>0&&ch[0].distance<9){near=true;document.getElementById('inter').textContent='[ RIGHT-CLICK ] GRAB BLOCK';}
    else document.getElementById('inter').textContent='[ E ] INTERACT';
  }
}
if(!draggedCrate)document.getElementById('inter').classList.toggle('on',near);}

const clock=new THREE.Clock();let time=0;let fpsTime=0,fpsCount=0,fpsDisplay=0;
function animate(){requestAnimationFrame(animate);const delta=Math.min(clock.getDelta(),0.05);time+=delta;fpsTime+=delta;fpsCount++;if(fpsTime>=0.5){fpsDisplay=Math.round(fpsCount/fpsTime);fpsCount=0;fpsTime=0;document.getElementById('fps').textContent=fpsDisplay+' FPS';}
update(delta);
updateDayNight(delta);
updateRain(delta);
grillFire.intensity=(shopOnFire?6:3.5)+Math.sin(time*13)*0.9+Math.sin(time*19)*0.4;grillFire.color.setHSL(0.07+Math.random()*0.025,1,0.52);coalPlane.material.opacity=0.55+Math.sin(time*8)*0.14;
if(shopOnFire){fireLight.intensity=3+Math.sin(time*7)*1.5;fireLight.color.setHSL(0.04+Math.random()*0.04,1,0.5);}
const fl=0.7+0.3*Math.sin(time*7+Math.sin(time*21));neonRing.material.emissiveIntensity=fl*3;signGlow.intensity=fl*2.2;
clouds.forEach((c,i)=>{c.position.x+=(i%2?0.012:-0.01);if(c.position.x>40)c.position.x=-40;if(c.position.x<-40)c.position.x=40;});
trees.forEach((t,i)=>{t.rotation.z=Math.sin(time*0.72+i*1.65)*0.028+(i%2?-0.04:0.04);});
floatRatG.position.y=1.3+Math.sin(time*1.8)*0.12;floatRatMesh.rotation.y=time*1.2;frRing.material.opacity=0.35+Math.sin(time*3)*0.2;
// Jason NPC updates
if(window._jasonMesh){
  window._jasonMesh.position.y=Math.sin(time*1.2)*0.025;
  if(window.JASON_POS){const tp=new THREE.Vector2(PP.x-window.JASON_POS.x,PP.z-window.JASON_POS.z);window._jasonMesh.rotation.y=Math.atan2(tp.x,tp.y);}
  if(window._jasonMesh._nameLabel) window._jasonMesh._nameLabel.lookAt(camera.position);
  if(window._jasonMesh._interactLabel){window._jasonMesh._interactLabel.lookAt(camera.position);const jd=window.JASON_POS?PP.distanceTo(window.JASON_POS):99;window._jasonMesh._interactLabel.visible=(jd<3.5);}
}
// Tax guy label billboard
if(taxGuyMesh&&taxGuyMesh._nameLabel) taxGuyMesh._nameLabel.lookAt(camera.position);
floatKebabG.position.y=2.5+Math.sin(time*1.8+1)*0.12;floatKebabMesh.rotation.y=time*1.0;fkRing.material.opacity=0.35+Math.sin(time*3+1)*0.2;
// Animate carried item — floats in front of player like holding it out
if(carriedItem&&carriedItem.mesh){
  const carryDist=1.2;
  const tx=PP.x-Math.sin(yaw)*carryDist;
  const tz=PP.z-Math.cos(yaw)*carryDist;
  const ty=PP.y-0.7; // fixed height, no bobbing
  carriedItem.mesh.position.lerp(new THREE.Vector3(tx,ty,tz),0.18);
  // no rotation — stands still
}
// Animate dropped floor items
droppedItems.forEach(d=>{
  d.bobT+=0.04;
  d.mesh.position.y=0.15+Math.sin(d.bobT)*0.05;
  // no rotation — stands still on floor
  d.ring.material.opacity=0.4+Math.sin(d.bobT*2)*0.25;
  const dist=PP.distanceTo(d.mesh.position);
  d.ring.material.opacity*=(dist<2.5?1.4:0.6);
});
bkRing.material.opacity=PP.distanceTo(BASKET_POS)<2.8?0.55+Math.sin(time*5)*0.2:0.22;

spawnBtnLight.intensity=1.4+Math.sin(time*4)*0.7;
if(rayGunWallAvailable){const rgL=rayGunWallG.children.find(c=>c.isLight);if(rgL)rgL.intensity=1.2+Math.sin(time*3)*0.6;}spawnBtnTop.material.emissiveIntensity=0.8+Math.sin(time*4)*0.5;
floatCapG.position.y=0.55+Math.sin(time*1.6)*0.1;floatCapG.rotation.y=time*0.7;capRingGlow.material.opacity=inSewer?0:0.4+Math.sin(time*4)*0.2;floatCapG.visible=!inSewer;
floatExitCapG.position.y=SEWER_Y+0.6+Math.sin(time*1.6+1)*0.1;floatExitCapG.rotation.y=-time*0.7;exitCapRing.material.opacity=0.4+Math.sin(time*4+1)*0.2;
mhGlow.material.opacity=inSewer?0:(0.35+Math.sin(time*4)*0.2);
if(inSewer){entryCircleGlow.material.opacity=0.4+Math.sin(time*4)*0.2;entryCircleRing1.material.opacity=0.5+Math.sin(time*4+0.5)*0.25;entryCircleLight.intensity=2.5+Math.sin(time*3)*1.0;sideTunnelLights.forEach((l,i)=>{l.intensity=0.9+Math.sin(time*4+i*1.5)*0.35;});barrelGlow.intensity=0.6+Math.sin(time*5)*0.4;}
if(inSewer){sewerLights.forEach((l,i)=>{l.intensity=1.0+Math.sin(time*3+i*1.2)*0.3;});}
if(!hasExt)extRing.material.opacity=PP.distanceTo(EXT_POS)<2.5?0.55+Math.sin(time*5)*0.2:0.28;fridgeRing.material.opacity=PP.distanceTo(FRIDGE_POS)<2.5?0.65+Math.sin(time*5)*0.2:0.35;if(!hasGun)lockLight.intensity=1.4+Math.sin(time*4)*0.6;
renderer.autoClear=true;renderer.render(scene,camera);renderer.autoClear=false;renderer.clearDepth();
if(typeof basketLblMesh!=='undefined'&&basketLblMesh) basketLblMesh.lookAt(camera.position);
if(gameRunning){
  gunCam.aspect=camera.aspect;
  gunCam.updateProjectionMatrix();
  if(heldItem==='gun'){gunGroup.visible=true;renderer.render(gunScene,gunCam);}
  if(heldItem==='shotgun'){gunGroup.visible=false;renderer.render(gunScene,gunCam);}
  if(heldItem==='raygun'){gunGroup.visible=false;renderer.render(gunScene,gunCam);}
  if(heldItem==='ext') renderer.render(extScene,gunCam);
  if(heldItem==='rat'||heldItem==='kebab'||heldItem==='fkebab'||heldItem==='pan'||heldItem==='bread'||heldItem==='grilledbread'){gunGroup.visible=false;renderer.render(gunScene,gunCam);}
}
}
animate();



// ================================================================
// MENU 3D SCENE — shop interior with grill and 3 rats cooking on top
// ================================================================
(function(){
  const mc = document.getElementById('menuCanvas');
  if(!mc) return;

  const mr = new THREE.WebGLRenderer({canvas:mc, antialias:true, alpha:false});
  mr.setPixelRatio(Math.min(devicePixelRatio,1.5));
  mr.shadowMap.enabled = false;
  mr.toneMapping = THREE.ACESFilmicToneMapping;
  mr.toneMappingExposure = 1.05;
  mr.setClearColor(0x111108, 1);

  const mScene = new THREE.Scene();
  mScene.background = new THREE.Color(0x888888);
  mScene.fog = new THREE.FogExp2(0xAAAAAA, 0.018);

  // Camera — same angle as in-game, looking at the grill from in front
  const mCam = new THREE.PerspectiveCamera(72, 1, 0.05, 120);
  mCam.position.set(0, 1.8, 7.5);
  mCam.lookAt(0, 1.1, 4.1);

  // ── LIGHTS (mirror the game) ──
  mScene.add(new THREE.AmbientLight(0xFFEED8, 0.55));
  const mSun = new THREE.DirectionalLight(0xFFDDBB, 1.3);
  mSun.position.set(10, 22, 12); mScene.add(mSun);
  mScene.add(new THREE.HemisphereLight(0xFFCC88, 0x336622, 0.5));
  const mGrillFire = new THREE.PointLight(0xFF5500, 3.5, 6);
  mGrillFire.position.set(0, 1.4, 4.1); mScene.add(mGrillFire);
  const mIntA = new THREE.PointLight(0xFFCC55, 1.5, 9);
  mIntA.position.set(-3, 2.8, 3); mScene.add(mIntA);
  const mIntB = new THREE.PointLight(0xFFCC55, 1.5, 9);
  mIntB.position.set(3, 2.8, 3); mScene.add(mIntB);

  function mlm(c,e,ei=0.4){const m=new THREE.MeshLambertMaterial({color:c});if(e){m.emissive=new THREE.Color(e);m.emissiveIntensity=ei;}return m;}
  function mbx(w,h,d,m){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);return mesh;}
  function mcy(rt,rb,h,m){return new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,14),m);}

  // ── FLOOR ──
  const floorMats=[mlm(0xCCCCCC),mlm(0xAAAAAA)];
  for(let fi=-5;fi<=5;fi++) for(let fj=0;fj<=5;fj++){
    const t=mbx(1.25,0.12,1.58,(fi+fj)%2===0?floorMats[0]:floorMats[1]);
    t.position.set(fi*1.27+0.63,0.06,fj*1.58+0.79); mScene.add(t);
  }

  // ── WALLS ──
  const wallM=mlm(0x888888), wallDM=mlm(0x666666);
  const backWall=mbx(14,7,0.4,wallM); backWall.position.set(0,3.5,0); mScene.add(backWall);
  const sideL=mbx(0.4,7,9.5,wallDM); sideL.position.set(-7,3.5,4.75); mScene.add(sideL);
  const sideR=mbx(0.4,7,9.5,wallDM); sideR.position.set(7,3.5,4.75); mScene.add(sideR);
  const roof=mbx(14.4,0.35,9.6,mlm(0x333333)); roof.position.set(0,7.18,4.75); mScene.add(roof);

  // ── GRILL (exact match to game: grillBody at y=0.4, grillFrame at y=0.85, bars at y=0.92) ──
  const grillBody=mbx(5.4,0.8,1.8,mlm(0x8B4513)); grillBody.position.set(0,0.4,4.1); mScene.add(grillBody);
  const grillFrame=mbx(5.4,0.1,1.8,mlm(0x1A1A1A)); grillFrame.position.set(0,0.85,4.1); mScene.add(grillFrame);
  for(let i=-5;i<=5;i++){const bar=mbx(0.07,0.07,1.7,mlm(0x4A4A4A));bar.position.set(i*0.48,0.92,4.1);mScene.add(bar);}
  for(let j=-3;j<=3;j++){const bar=mbx(5.3,0.04,0.07,mlm(0x4A4A4A));bar.position.set(0,0.92,4.1+j*0.24);mScene.add(bar);}
  const coalPlane=new THREE.Mesh(new THREE.PlaneGeometry(5.1,1.65),new THREE.MeshBasicMaterial({color:0xFF2200,transparent:true,opacity:0.65}));
  coalPlane.rotation.x=-Math.PI/2; coalPlane.position.set(0,0.6,4.1); mScene.add(coalPlane);
  // grill legs
  [[-2.4,3.25],[2.4,3.25],[-2.4,4.95],[2.4,4.95]].forEach(([x,z])=>{
    const leg=mbx(0.12,0.8,0.12,mlm(0x333333)); leg.position.set(x,0.4,z); mScene.add(leg);
  });
  // hood
  const hood=mbx(5.6,1.2,0.9,mlm(0x111111)); hood.position.set(0,3.5,3.9); mScene.add(hood);
  const hoodPipe=mcy(0.14,0.14,1.8,mlm(0x222222)); hoodPipe.position.set(0,4.75,3.9); mScene.add(hoodPipe);

  // ── 3 RATS ON GRILL ──
  // Game grill slots are at x = -1.72, -0.57, +0.57, +1.72, y=0.97, z=4.1
  // We'll use 3 slots: -1.4, 0, +1.4
  const RAT_SLOTS = [-1.6, 0, 1.6];
  const RAT_Y = 0.97 + 0.28; // game value: slot.pos.y + 0.28
  const RAT_Z = 4.1;
  const ratGroups = [];

  function buildMenuRats(){
    // clear old
    ratGroups.forEach(g=>mScene.remove(g));
    ratGroups.length = 0;

    RAT_SLOTS.forEach((rx, si)=>{
      const g = new THREE.Group();
      let ratM;
      if(ratModelReady && ratGltfScene){
        ratM = ratGltfScene.clone(true);
        ratM.traverse(c=>{if(c.isMesh) c.material=c.material.clone();});
        ratM.scale.set(0.18,0.18,0.18);
      } else {
        ratM = mkRat();
        ratM.scale.set(0.18,0.18,0.18);
      }
      // Cook color — nicely browned like a done kebab
      const cookCol = new THREE.Color(0x8B3300);
      ratM.traverse(c=>{if(c.isMesh&&c.material&&c.material.color) c.material.color.copy(cookCol);});
      // Lie on side like on the grill in-game
      ratM.rotation.set(0, 0, Math.PI/2);
      g.add(ratM);
      // Each rat gets a slightly different spin speed + phase offset
      g.position.set(rx, RAT_Y, RAT_Z);
      // All rats are static on the grill — no spinning
      g.userData.spins = false;
      mScene.add(g);
      ratGroups.push(g);
    });
  }
  buildMenuRats();

  function resizeMenuCanvas(){
    const panelW = Math.max(280, window.innerWidth * 0.30);
    const W = window.innerWidth - panelW;
    const H = window.innerHeight;
    mr.setSize(Math.max(100,W), H);
    mCam.aspect = Math.max(100,W)/H;
    mCam.updateProjectionMatrix();
  }
  resizeMenuCanvas();
  window.addEventListener('resize', resizeMenuCanvas);

  let mTime = 0;
  let mRatBuilt = false;
  let menuAnimating = false;

  function animateMenu(){
    const tutEl2 = document.getElementById('tut');
    if(!tutEl2 || tutEl2.style.display==='none'){
      menuAnimating = false;
      return;
    }
    requestAnimationFrame(animateMenu);
    mTime += 0.016;

    // Rebuild rats once model loads
    if(!mRatBuilt && ratModelReady){ mRatBuilt=true; buildMenuRats(); }

    // Only the center rat spins (rotisserie)
    ratGroups.forEach(g=>{
      if(g.userData.spins) g.rotation.y = mTime * g.userData.spinSpeed;
    });

    // Fire flicker
    mGrillFire.intensity = (3.5 + Math.sin(mTime*13)*0.9 + Math.sin(mTime*19)*0.4);
    mGrillFire.color.setHSL(0.07+Math.random()*0.025, 1, 0.52);
    coalPlane.material.opacity = 0.55 + Math.sin(mTime*8)*0.14;

    mr.render(mScene, mCam);
  }

  const tutEl = document.getElementById('tut');
  const obs = new MutationObserver(()=>{
    if(tutEl && tutEl.style.display !== 'none' && !menuAnimating){
      menuAnimating = true;
      animateMenu();
    }
  });
  obs.observe(tutEl, {attributes:true, attributeFilter:['style']});
  menuAnimating = true;
  animateMenu();

})();


// ================================================================
// MENU BUTTON WIRING — wrapped in DOMContentLoaded so mpscreen exists
// ================================================================
document.addEventListener('DOMContentLoaded', function menuWiring(){
  function ge(id){ return document.getElementById(id); }
  function showPanel(id){
    // studioPanel is fullscreen — handled separately, never hide/show via this fn
    ['menuPanel','modePicker','settingsPanel','creditsPanel'].forEach(p=>{
      const el=ge(p); if(el) el.style.display=(p===id)?'flex':'none';
    });
    const sp=ge('studioPanel'); if(sp) sp.style.display='none';
  }
  showPanel('menuPanel');

  ge('playBtn').addEventListener('click',()=>showPanel('modePicker'));
  ge('settingsBtn').addEventListener('click',()=>showPanel('settingsPanel'));
  ge('creditsBtn').addEventListener('click',()=>showPanel('creditsPanel'));
  ge('modeBackBtn').addEventListener('click',()=>showPanel('menuPanel'));
  ge('settingsBackBtn').addEventListener('click',()=>showPanel('menuPanel'));
  ge('creditsBackBtn').addEventListener('click',()=>showPanel('menuPanel'));

  // ABOUT US — opens Bad Games Studio website in a new tab
  ge('studioBtn').addEventListener('click',()=>{
    window.open('https://prettytasty.github.io/Badgames/', '_blank');
  });

  ge('spCard').addEventListener('click',()=>{
    playerName=(ge('nameinput').value||'').trim().toUpperCase()||'RAT';
    ge('tut').style.display='none';
    startGame();
  });

  // Colour picker swatches
  const swatches = document.querySelectorAll('.colorSwatch');
  if(swatches.length) swatches[0].classList.add('selected');
  swatches.forEach(sw => {
    sw.addEventListener('click', () => {
      swatches.forEach(s => s.classList.remove('selected'));
      sw.classList.add('selected');
      playerColor = parseInt(sw.dataset.color, 16);
    });
  });

  ge('mpCard').addEventListener('click',()=>{
    ge('tut').style.display='none';
    ge('mpscreen').style.display='flex';
  });
});

// ============================================================
// MULTIPLAYER — Socket.io (replaces PeerJS)
// Paste this INSTEAD of the old PeerJS multiplayer code
// ============================================================

// Load Socket.io from CDN — add this line to your <head> or before this script:
// <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>

let mpSocket = null;
let mpConnected = false;
let mpRoomCode = null;
let mpIsHost = false;
const mpPlayers = {};
const mpPositions = {};
Object.defineProperty(window,'mpSocket',{get:()=>mpSocket});
Object.defineProperty(window,'mpConnected',{get:()=>mpConnected});
Object.defineProperty(window,'mpRoomCode',{get:()=>mpRoomCode});
Object.defineProperty(window,'mpIsHost',{get:()=>mpIsHost});


// ── UI helpers ───────────────────────────────────────────────────────
function setMpStatus(txt, col){ 
  const el = document.getElementById('mp-status');
  if(el){ el.textContent = txt; el.style.color = col || 'rgba(255,255,255,0.3)'; }
}
function setJoinStatus(txt, col){ 
  const el = document.getElementById('join-status');
  if(el){ el.textContent = txt; el.style.color = col || 'rgba(255,255,255,0.35)'; }
}
function setServerStatus(txt, col){ 
  const el = document.getElementById('server-status');
  if(el){ el.textContent = txt; el.style.color = col || 'rgba(255,255,255,0.35)'; }
}
function updateMpPlayerList(){
  const el = document.getElementById('mp-players');
  if(!el) return;
  const names = Object.values(mpPositions).map(p => p.name || 'RAT');
  el.textContent = names.length ? '🟢 ' + names.join(' · ') : '';
}

// ── Connect to server ────────────────────────────────────────────────
function connectToServer(address, onConnected) {
  if(mpSocket) { mpSocket.disconnect(); mpSocket = null; }
  
  // Make sure address has http/https
  let url = address.trim();
  if(!url.startsWith('http')) url = 'https://' + url;
  
  setServerStatus('Connecting...', '#FFD166');
  
  try {
    mpSocket = io(url, { transports: ['websocket', 'polling'] });
  } catch(e) {
    setServerStatus('Failed to connect: ' + e.message, '#FF4444');
    return;
  }

  mpSocket.on('connect', () => {
    mpConnected = true;
    setServerStatus('✅ Connected to server!', '#06D6A0');
    if(onConnected) onConnected();
  });

  mpSocket.on('connect_error', (e) => {
    setServerStatus('❌ Cannot reach server', '#FF4444');
    console.warn('MP connect error:', e);
  });

  // ── Server told us we hosted successfully ────────────────────────
  mpSocket.on('hosted', (data) => {
    mpRoomCode = data.code;
    mpIsHost = true;
    document.getElementById('room-code').textContent = data.code;
    document.getElementById('room-code-box').style.display = 'block';
    setMpStatus('✅ Room created! Share code: ' + data.code, '#FFD166');
    // Show START GAME button instead of auto-joining
    document.getElementById('host-start-btn').style.display = 'block';
  });

  // ── Server told us we joined successfully ────────────────────────
  mpSocket.on('joined', (data) => {
    mpRoomCode = data.code;
    mpIsHost = false;
    setJoinStatus('✅ Joined room ' + data.code + '!', '#06D6A0');
    setTimeout(() => {
      document.getElementById('mpscreen').style.display = 'none';
      startGame();
      setTimeout(()=>{ if(mpSocket&&mpConnected) mpSocket.emit('requestState'); },1200);
    }, 900);
  });

  // ── Room not found ────────────────────────────────────────────────
  mpSocket.on('joinError', (msg) => {
    setJoinStatus('❌ ' + msg, '#FF4444');
  });

  // ── Full player list update (on join/leave) ───────────────────────
  mpSocket.on('playerList', (players) => {
    // players = { socketId: { name, x, y, z, yaw }, ... }
    const count = Object.keys(players).length;
    setMpStatus(count + ' player' + (count !== 1 ? 's' : '') + ' in room', '#06D6A0');
    // Store names
    for(const id in players){
      if(!mpPositions[id]) mpPositions[id] = {};
      mpPositions[id].name = players[id].name;
    }
    updateMpPlayerList();
    // Remove players that left
    for(const id in mpPositions){
      if(!players[id]){ removeMpPlayer(id); }
    }
  });

  // ── Another player moved — THE KEY FIX ───────────────────────────
  // This fires for ANY player's movement, not just the host
  mpSocket.on('playerMoved', (data) => {
    // data = { id, x, y, z, yaw, name }
    if(!mpPositions[data.id]) mpPositions[data.id] = {};
    mpPositions[data.id] = { x: data.x, y: data.y, z: data.z, yaw: data.yaw, name: data.name, held: data.held || null, color: data.color || 0x1A6FD4 };
    // Create mesh for this player if we haven't yet
    if(!mpPlayers[data.id]) spawnMpPlayer(data.id, data.name, data.color || 0x1A6FD4);
  });

  // ── Grill sync: someone placed/removed item on grill ────────────
  mpSocket.on('grillUpdate', (data) => {
    // data = { slotIndex, action:'place'|'remove'|'done'|'burned', itemType, cookTime }
    const s = grillSlots[data.slotIndex];
    if(!s) return;
    if(data.action === 'place'){
      if(!s.item){
        let mesh;
        if(data.itemType==='rat'){ mesh=mkRat(); mesh.scale.set(0.22,0.22,0.22); }
        else if(data.itemType==='bread'){ mesh=mkBread(0.28); }
        else { mesh=mkKebab(); }
        mesh.visible=true;
        mesh.position.copy(s.pos);
        mesh.position.y += data.itemType==='bread'?0.15:0.28;
        scene.add(mesh);
        s.item={mesh,_mesh:mesh}; s.itemType=data.itemType;
        s.cookTime=data.cookTime||0; s.done=false; s.burned=false; s.frozen=false;
        s.maxCook=data.maxCook||10; s.ring.visible=true;
      }
    } else if(data.action==='remove'){
      if(s.item){scene.remove(s.item._mesh||s.item.mesh);}
      s.item=null;s.itemType=null;s.done=false;s.burned=false;s.cookTime=0;s.ring.visible=false;
    } else if(data.action==='done'){
      s.done=true; s.cookTime=data.cookTime||s.maxCook;
      if(s.item&&s.item._mesh) s.item._mesh.traverse(c=>{if(c.isMesh&&c.material&&c.material.color)c.material.color.copy(getCookColor(1,false));});
      s.ring.material.color.setHex(0x00FF88);
      showMsg('Someone grilled something! 🍢','#06D6A0');
    } else if(data.action==='burned'){
      if(s.item){scene.remove(s.item._mesh||s.item.mesh);}
      s.item=null;s.itemType=null;s.done=false;s.burned=false;s.cookTime=0;s.ring.visible=false;
    } else if(data.action==='progress'){
      s.cookTime=data.cookTime;
      if(s.item&&s.item._mesh){
        const col=getCookColor(Math.min(1,s.cookTime/(s.maxCook||10)),false);
        s.item._mesh.traverse(c=>{if(c.isMesh&&c.material&&c.material.color)c.material.color.copy(col);});
      }
    }
  });

  // ── Raygun hit: someone shot the raygun and hit a player ─────────
  mpSocket.on('rayHit', (data) => {
    // data = { targetId } — if targetId is our socket id, we got hit
    if(data.targetId === mpSocket.id){
      flash('dmg', 300);
      if(typeof playerHP !== 'undefined'){
        playerHP = Math.max(0, playerHP - 25);
        updateHealthBar();
        showMsg('You got hit by a ray gun! -25 HP','#FF4400');
        if(playerHP <= 0){ loseStar('You got zapped! -1 star'); playerHP=maxPlayerHP; }
      }
      // Strong knockback away from shooter
      velY = 8;
      const knockDir = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
      PP.addScaledVector(knockDir, 5);
    }
  });

  // ── Bullet hit: someone shot the glock/shotgun and hit this player ─
  mpSocket.on('bulletHit', (data) => {
    if(data.targetId === mpSocket.id){
      flash('dmg', 400);
      playSound('hit');
      document.getElementById('healthbar').classList.add('on');
      playerHP = Math.max(0, playerHP - (data.damage||50));
      updateHealthBar();
      if(playerHP <= 0){
        showMsg('Ezzzzzz you suck 💀','#FF2222');
        setTimeout(()=>endGame('You were shot dead! Ezzzzzz you suck 💀','#AA0000'),1200);
      } else {
        showMsg('💀 YOU WERE SHOT! -'+(data.damage||50)+' HP  ('+Math.ceil(playerHP)+' left)','#FF2222');
      }
    } else {
      // Show blood on their mesh so everyone sees it
      const mp=mpPlayers[data.targetId];
      if(mp&&mp.mesh) spawnBlood(mp.mesh.position.clone().add(new THREE.Vector3(0,1,0)),25);
    }
  });
  // ── TV sync ────────────────────────────────────────────────────────
  mpSocket.on('tvSync', (data) => {
    if(window.tvSetState) window.tvSetState(data.state);
  });

  // ── Basket sync ─────────────────────────────────────────────────────
  mpSocket.on('basketSync', (data) => {
    basketCount = data.count;
    if(window._updateBasketLabel) window._updateBasketLabel();
    updateHeldUI();
  });

  // ── NPC sync — update customers from host ───────────────────────────
  mpSocket.on('npcSync', (data) => {
    if(mpIsHost) return;
    if(!data.customers) return;
    data.customers.forEach((nd,i)=>{
      if(i<customers.length){
        const cd=customers[i];
        cd.mesh.position.set(nd.x,nd.y,nd.z);
        cd.tx=nd.tx; cd.side=nd.side;
        cd.patience=nd.patience; cd.maxP=nd.maxP;
        cd.served=nd.served; cd.exiting=nd.exiting; cd.hp=nd.hp;
      } else {
        const mesh=mkCustomer(nd.color||0xDDDDDD);
        mesh.position.set(nd.x,nd.y,nd.z);
        const cdObj={mesh,tx:nd.tx,side:nd.side,patience:nd.patience,maxP:nd.maxP,served:nd.served,exiting:nd.exiting,bp:0,hp:nd.hp};
        customers.push(cdObj); scene.add(mesh);
      }
    });
    while(customers.length>data.customers.length){
      const cd=customers.pop(); scene.remove(cd.mesh);
    }
    if(data.insp){
      if(data.insp.active){
        if(!inspMesh){inspMesh=mkInspector();inspMesh.userData.isInspector=true;inspMesh.traverse(ch=>{ch.userData.isInspector=true;});scene.add(inspMesh);}
        inspMesh.visible=true;inspActive=true;inspHP=data.insp.hp;
        inspMesh.position.set(data.insp.x,data.insp.y,data.insp.z);updateInspBar();
      } else if(inspActive&&!data.insp.active){
        inspActive=false;if(inspMesh)inspMesh.visible=false;
        document.getElementById('inspbar').classList.remove('on');
      }
    }
    if(typeof data.basketCount!=='undefined'){basketCount=data.basketCount;if(window._updateBasketLabel)window._updateBasketLabel();}
    // Rain sync
    if(typeof data.rain!=='undefined'){
      if(data.rain && typeof startRain==='function' && !rainOn) startRain();
      if(!data.rain && typeof stopRain==='function' && rainOn) stopRain();
    }
    // VIP sync — mark which customers are VIPs so client shows hat/label
    if(data.vipIds){
      data.vipIds.forEach(idx=>{
        if(customers[idx]&&!customers[idx].isVIP){
          customers[idx].isVIP=true;
          const cd=customers[idx];
          // Add gold hat
          const brim=new THREE.Mesh(new THREE.CylinderGeometry(0.42,0.42,0.06,16),new THREE.MeshLambertMaterial({color:0xFFD700}));
          brim.position.set(0,1.72,0); cd.mesh.add(brim);
          const crown=new THREE.Mesh(new THREE.CylinderGeometry(0.26,0.30,0.38,16),new THREE.MeshLambertMaterial({color:0xFFAA00}));
          crown.position.set(0,1.94,0); cd.mesh.add(crown);
          const vc=document.createElement('canvas');vc.width=128;vc.height=32;
          const vx=vc.getContext('2d');
          vx.fillStyle='rgba(0,0,0,0.7)';vx.fillRect(0,0,128,32);
          vx.font='bold 16px monospace';vx.fillStyle='#FFD700';vx.textAlign='center';
          vx.fillText('⭐ VIP ⭐',64,22);
          const vlbl=new THREE.Mesh(new THREE.PlaneGeometry(1.0,0.25),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(vc),transparent:true,side:THREE.DoubleSide}));
          vlbl.position.set(0,2.45,0); cd.mesh.add(vlbl); cd.mesh._vipLabel=vlbl;
        }
      });
    }
  });

  // ── Customer kill sync ──────────────────────────────────────────────
  mpSocket.on('customerKill', (data) => {
    const pos=new THREE.Vector3(data.x,data.y,data.z);
    spawnBlood(pos,50);
    showMsg('💀 Someone shot a customer!','#FF6644');
  });

  // ── Chat receive ──────────────────────────────────────────────────
  mpSocket.on('chat', (data) => {
    if(window._addChatMsg) window._addChatMsg(data.text || '', false);
  });

  // ── Weather sync ──────────────────────────────────────────────────
  mpSocket.on('weatherSync', (data) => {
    if(mpIsHost) return;
    if(data.rain && typeof startRain==='function') startRain();
    if(!data.rain && typeof stopRain==='function') stopRain();
  });

  // ── Dropped item sync ─────────────────────────────────────────────
  const remoteDrops = {};
  mpSocket.on('itemDrop', (data) => {
    if(remoteDrops[data.id]) return;
    let mesh;
    if(data.type==='rat'){ mesh=mkRat(); mesh.scale.set(0.12,0.12,0.12); }
    else if(data.type==='bread'||data.type==='grilledbread'){ mesh=mkBread(0.28); }
    else { mesh=mkKebab(); mesh.scale.set(0.6,0.6,0.6); }
    mesh.position.set(data.x,data.y,data.z); mesh.visible=true; scene.add(mesh);
    const ringCol=data.type==='rat'?0xFFD166:data.type==='bread'||data.type==='grilledbread'?0xFF8800:0x00BFFF;
    const ring=new THREE.Mesh(new THREE.RingGeometry(0.35,0.50,24),new THREE.MeshBasicMaterial({color:ringCol,side:THREE.DoubleSide,transparent:true,opacity:0.6}));
    ring.rotation.x=-Math.PI/2; ring.position.set(data.x,0.01,data.z); scene.add(ring);
    remoteDrops[data.id]={mesh,ring};
    droppedItems.push({mesh,ring,type:data.type,ratData:null,kebabData:null,breadData:null,bobT:Math.random()*Math.PI*2,id:data.id});
  });
  mpSocket.on('itemPickup', (data) => {
    const rd=remoteDrops[data.id];
    if(rd){ scene.remove(rd.mesh); scene.remove(rd.ring); delete remoteDrops[data.id]; }
    const idx=droppedItems.findIndex(d=>d.id===data.id);
    if(idx>=0){ scene.remove(droppedItems[idx].mesh); scene.remove(droppedItems[idx].ring); droppedItems.splice(idx,1); }
  });

  mpSocket.on('playerLeft', (data) => {
    removeMpPlayer(data.id);
  });
}

// ── Spawn a human NPC mesh for a remote player ──────────────────────
function mkMpPlayerMesh(name, color) {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshLambertMaterial({ color: color || 0x1A6FD4 });
  g._bodyMat = bodyMat;
  const bodyCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.30, 0.72, 18), bodyMat);
  bodyCyl.position.y = 0.55; bodyCyl.castShadow = true; g.add(bodyCyl);
  const bodyCapTop = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 8, 0, Math.PI*2, 0, Math.PI/2), bodyMat);
  bodyCapTop.position.y = 0.91; g.add(bodyCapTop);
  const bodyCapBot = new THREE.Mesh(new THREE.SphereGeometry(0.30, 16, 8, 0, Math.PI*2, Math.PI/2, Math.PI/2), bodyMat);
  bodyCapBot.position.y = 0.19; g.add(bodyCapBot);

  // Head
  const skinMat = new THREE.MeshLambertMaterial({ color: 0xFFDDB0 });
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.30, 18, 12), skinMat);
  head.position.y = 1.30; head.castShadow = true; g.add(head);

  // Eyes
  const eyeMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.072, 10, 8), eyeMat);
  eyeL.scale.set(0.7, 1.0, 0.45); eyeL.position.set(-0.105, 1.32, 0.27); g.add(eyeL);
  const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.072, 10, 8), eyeMat);
  eyeR.scale.set(0.7, 1.0, 0.45); eyeR.position.set(0.105, 1.32, 0.27); g.add(eyeR);

  g._nameTag = null;

  // Held item indicator (small box in right hand position)
  const heldIndicator = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.08, 0.35),
    new THREE.MeshLambertMaterial({ color: 0x888888 })
  );
  heldIndicator.position.set(0.38, 0.65, 0.25);
  heldIndicator.visible = false;
  g.add(heldIndicator);
  g._heldIndicator = heldIndicator;
  g._heldLabel = null;

  return g;
}

function spawnMpPlayer(id, name, color) {
  const mesh = mkMpPlayerMesh(name, color);
  mesh.userData.mpId = id;
  mesh.traverse(ch=>{ch.userData.mpId=id;});
  scene.add(mesh);
  mpPlayers[id] = { mesh, name: name || 'RAT' };
}

function removeMpPlayer(id) {
  if(mpPlayers[id]) {
    scene.remove(mpPlayers[id].mesh);
    delete mpPlayers[id];
  }
  delete mpPositions[id];
  updateMpPlayerList();
}

// ── Held item colours for the indicator ──────────────────────────────
const MP_HELD_COLORS = {
  gun:      0x888888,
  shotgun:  0x5C3A1E,
  raygun:   0x00FFCC,
  pan:      0x8B8B8B,
  ext:      0xDD2222,
  rat:      0xCC8833,
  kebab:    0xFF8800,
  fkebab:   0xFF8800,
};

// ── Send our own position + held item to the server ──────────────────
let mpSendTimer = 0;
let npcSyncTimer=0;
function mpSendNpcs(delta){
  if(!mpSocket||!mpConnected||!mpRoomCode||!mpIsHost)return;
  npcSyncTimer+=delta;
  const rate=inspActive?0.25:1.0;
  if(npcSyncTimer<rate)return;
  npcSyncTimer=0;
  const npcData=customers.map(cd=>({x:cd.mesh.position.x,y:cd.mesh.position.y,z:cd.mesh.position.z,side:cd.side,tx:cd.tx,patience:cd.patience,maxP:cd.maxP,served:cd.served,exiting:cd.exiting,hp:cd.hp,color:cd.mesh.children[0]&&cd.mesh.children[0].material?cd.mesh.children[0].material.color.getHex():0xDDDDDD}));
  const inspSync=inspActive&&inspMesh?{active:true,x:inspMesh.position.x,y:inspMesh.position.y,z:inspMesh.position.z,hp:inspHP}:{active:false};
  mpSocket.emit('npcSync',{
    customers:npcData,
    basketCount:basketCount,
    insp:inspSync,
    dayTime:typeof dayTime!=='undefined'?dayTime:0,
    dayCount:typeof dayCount!=='undefined'?dayCount:1,
    rain:typeof rainOn!=='undefined'?rainOn:false,
    vipIds:customers.filter(cd=>cd.isVIP&&!cd.exiting).map(cd=>customers.indexOf(cd))
  });
}

function mpSendPosition(delta) {
  if(!mpSocket || !mpConnected || !mpRoomCode) return;
  mpSendTimer += delta;
  if(mpSendTimer < 0.05) return;
  mpSendTimer = 0;
  mpSocket.emit('move', {
    x: PP.x,
    y: PP.y || 1,
    z: PP.z,
    yaw: yaw,
    held: heldItem || null,
    color: playerColor
  });
}

// ── Update remote player meshes each frame ────────────────────────────
function mpUpdateMeshes() {
  for(const id in mpPlayers) {
    const pos = mpPositions[id];
    if(!pos) continue;
    const p = mpPlayers[id];
    const mesh = p.mesh;

    // Smooth lerp position — subtract 1.7 from Y since PP.y is camera/eye height
    mesh.position.x += (pos.x - mesh.position.x) * 0.25;
    mesh.position.y += ((pos.y - 1.7) - mesh.position.y) * 0.25;
    mesh.position.z += (pos.z - mesh.position.z) * 0.25;
    mesh.rotation.y = (pos.yaw || 0) + Math.PI;

    // Update body colour if changed
    if(mesh._bodyMat && pos.color !== undefined) {
      mesh._bodyMat.color.setHex(pos.color);
    }

    // Billboard name tag to always face camera
    if(mesh._nameTag) {
      mesh._nameTag.rotation.y = -mesh.rotation.y;
      const dx = camera.position.x - mesh.position.x;
      const dz = camera.position.z - mesh.position.z;
      mesh._nameTag.rotation.y = Math.atan2(dx, dz);
    }

    // Show/hide held item indicator
    if(mesh._heldIndicator) {
      const held = pos.held || null;
      if(held) {
        mesh._heldIndicator.visible = true;
        const col = MP_HELD_COLORS[held] || 0xffffff;
        mesh._heldIndicator.material.color.setHex(col);
        // Scale: gun/shotgun longer, pan wider
        if(held === 'pan') {
          mesh._heldIndicator.scale.set(1.8, 0.15, 1.8);
        } else if(held === 'ext') {
          mesh._heldIndicator.scale.set(1, 2, 1);
        } else {
          mesh._heldIndicator.scale.set(1, 1, 1);
        }
      } else {
        mesh._heldIndicator.visible = false;
      }
    }
  }
}

// ── Button handlers ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const _hsb = document.getElementById('host-start-btn');
  if(_hsb && !_hsb._wired){ _hsb._wired=true; _hsb.addEventListener('click',()=>{ document.getElementById('mpscreen').style.display='none'; startGame(); }); }

  document.getElementById('hostbtn').addEventListener('click', () => {
    const serverAddr = document.getElementById('serverinput').value.trim();
    if(!serverAddr){ 
      setServerStatus('Enter server address first!', '#FF4444'); 
      document.getElementById('serverinput').focus();
      return; 
    }
    connectToServer(serverAddr, () => {
      mpSocket.emit('host', { name: playerName || 'RAT' });
    });
  });

  document.getElementById('joinbtn').addEventListener('click', () => {
    const code = document.getElementById('codeinput').value.trim().toUpperCase();
    const serverAddr = document.getElementById('serverinput').value.trim();
    if(!code){ setJoinStatus('Enter a room code!', '#FF4444'); return; }
    if(!serverAddr){ setServerStatus('Enter server address first!', '#FF4444'); return; }
    connectToServer(serverAddr, () => {
      mpSocket.emit('join', { code, name: playerName || 'RAT' });
    });
  });

  document.getElementById('serverjoibtn').addEventListener('click', () => {
    const serverAddr = document.getElementById('serverinput').value.trim();
    if(!serverAddr){ setServerStatus('Enter server address!', '#FF4444'); return; }
    connectToServer(serverAddr, () => {
      setServerStatus('✅ Connected! Now HOST or JOIN a room above.', '#06D6A0');
    });
  });

  document.getElementById('mp-back').addEventListener('click', () => {
    document.getElementById('mpscreen').style.display = 'none';
    document.getElementById('tut').style.display = 'flex';
  });

  document.getElementById('mpbtn') && document.getElementById('mpbtn').addEventListener('click', () => {
    document.getElementById('tut').style.display = 'none';
    document.getElementById('mpscreen').style.display = 'flex';
  });
});

// ── Add mpSendPosition and mpUpdateMeshes to your game loop ─────────────
// In your animate() or game loop function, add these two lines:
//
//   mpSendPosition(delta);
//   mpUpdateMeshes();
//
// They go right after where you update PP (player position)

// ================================================================
// CHAT SYSTEM — Y to open, Enter to send, Esc to close
// ================================================================
(function(){
  const chatWindow  = document.getElementById('chatWindow');
  const chatLog     = document.getElementById('chatLog');
  const chatInput   = document.getElementById('chatInput');
  const chatSendBtn = document.getElementById('chatSendBtn');
  const chatFloat   = document.getElementById('chatFloat');
  if(!chatWindow||!chatLog||!chatInput) return;
  let chatOpen=false, isAdmin=false;

  function addMsg(text,isSystem){
    const div=document.createElement('div');
    div.className='chatMsg'+(isSystem?' system':'');
    div.textContent=text;
    chatLog.appendChild(div);
    chatLog.scrollTop=chatLog.scrollHeight;
    if(!isSystem&&chatFloat){
      const b=document.createElement('div');
      b.className='chatFloat-msg'; b.textContent=text;
      chatFloat.appendChild(b);
      setTimeout(()=>{if(b.parentNode)b.remove();},8200);
    }
  }

  function openChat(){
    if(chatOpen)return;
    chatOpen=true;
    chatWindow.style.display='flex';
    if(chatFloat)chatFloat.style.display='none';
    chatInput.value='';
    chatLog.scrollTop=chatLog.scrollHeight;
    if(document.pointerLockElement)document.exitPointerLock();
    setTimeout(()=>chatInput.focus(),30);
  }

  function closeChat(){
    if(!chatOpen)return;
    chatOpen=false;
    chatWindow.style.display='none';
    if(chatFloat)chatFloat.style.display='flex';
    chatInput.blur();
    if(window.gameRunning){
      setTimeout(()=>{const c=document.getElementById('main');if(c)c.requestPointerLock();},120);
    }
  }

  function adminCmd(txt){
    const parts=txt.slice(1).trim().split(/\s+/);
    const cmd=parts[0].toLowerCase();
    if(cmd==='login'){
      if(parts[1]==='tonykynam21032013'){isAdmin=true;addMsg('Welcome Tony 👑 Admin unlocked!',true);}
      else if(parts[1]==='sixonetwothree'){isAdmin=true;addMsg('Welcome Mitchel 👑 Admin unlocked!',true);}
      else addMsg('Wrong password',true);
      return;
    }
    if(!isAdmin){addMsg('/login first',true);return;}
    if(cmd==='rat'){const n=parseInt(parts[1])||1;if(typeof basketCount!=='undefined'){basketCount+=n;if(window._updateBasketLabel)window._updateBasketLabel();}addMsg('+'+n+' rats',true);}
    else if(cmd==='money'){const n=parseInt(parts[1])||1000;if(typeof score!=='undefined'){score+=n;if(typeof updateHUD==='function')updateHUD();}addMsg('+'+n,true);}
    else if(cmd==='god'){if(typeof playerHP!=='undefined'){playerHP=999999;maxPlayerHP=999999;if(typeof updateHealthBar==='function')updateHealthBar();}addMsg('God mode',true);}
    else if(cmd==='day'){if(typeof dayTime!=='undefined')dayTime=0;addMsg('Day',true);}
    else if(cmd==='night'){if(typeof dayTime!=='undefined'&&typeof DAY_DURATION!=='undefined')dayTime=DAY_DURATION+15;addMsg('Night',true);}
    else if(cmd==='weather'){
      const w=(parts[1]||'').toLowerCase();
      if(w==='rain'){if(typeof startRain==='function'){startRain();addMsg('🌧️ Rain started',true);}else addMsg('Rain not available',true);}
      else if(w==='clear'){if(typeof stopRain==='function'){stopRain();addMsg('☀️ Weather cleared',true);}else addMsg('Rain not available',true);}
      else addMsg('Usage: /weather rain  OR  /weather clear',true);
    }
    else if(cmd==='spawn'){
      const t=(parts[1]||'').toLowerCase();
      if(t==='rat'||t==='customer'){
        if(typeof spawnCustomer==='function'){spawnCustomer();addMsg('👤 Customer spawned',true);}
        else addMsg('Start a game first',true);
      }
      else if(t==='insp'||t==='inspector'){
        if(typeof spawnInspector==='function'){inspActive=false;spawnInspector();addMsg('🕵️ Inspector spawned',true);}
        else addMsg('Start a game first',true);
      }
      else if(t==='tax'){
        if(typeof startTaxCycle==='function'){taxPhase='none';startTaxCycle();addMsg('💼 Tax guy spawned',true);}
        else addMsg('Start a game first',true);
      }
      else addMsg('Usage: /spawn rat  /spawn insp  /spawn tax',true);
    }
    else if(cmd==='speed'){const n=parseFloat(parts[1])||2;window._adminSpeedMult=n;addMsg('⚡ Speed x'+n,true);}
    else if(cmd==='stars'){const n=parseInt(parts[1])||5;if(typeof stars!=='undefined'){stars=n;if(typeof updateHUD==='function')updateHUD();}addMsg('⭐ Stars='+n,true);}
    else if(cmd==='killall'){if(typeof customers!=='undefined')customers.forEach(cd=>{cd.exiting=true;});addMsg('💀 All customers gone',true);}
    else if(cmd==='killplayers'){
      if(window.mpSocket&&window.mpConnected){for(const id in mpPositions){mpSocket.emit('bulletHit',{targetId:id,damage:99999});}}
      if(typeof playerHP!=='undefined'){playerHP=0;if(typeof updateHealthBar==='function')updateHealthBar();}
      setTimeout(()=>{if(typeof endGame==='function')endGame('Killed by admin 💀','#AA0000');},500);
      addMsg('💀 Killed all players',true);
    }
    else addMsg('❓ Unknown — /rat /money /god /spawn /day /night /weather /speed /stars /killall /killplayers',true);
  }

  function sendMsg(){
    const txt=chatInput.value.trim();
    chatInput.value='';
    if(!txt){closeChat();return;}
    if(txt.startsWith('/')){adminCmd(txt);closeChat();return;}
    addMsg(txt,false);
    if(window.mpSocket&&window.mpConnected)window.mpSocket.emit('chat',{text:txt});
    closeChat();
  }

  chatInput.addEventListener('keydown',e=>{
    e.stopImmediatePropagation(); e.stopPropagation();
    if(e.key==='Enter'){e.preventDefault();sendMsg();}
    if(e.key==='Escape'){e.preventDefault();closeChat();}
  },true);
  chatInput.addEventListener('keyup',e=>{e.stopImmediatePropagation();e.stopPropagation();},true);
  chatInput.addEventListener('keypress',e=>{e.stopImmediatePropagation();e.stopPropagation();},true);
  if(chatSendBtn) chatSendBtn.addEventListener('click',sendMsg);

  window._chatOpen=()=>chatOpen;
  window._openChat=openChat;
  window._addChatMsg=addMsg;

  setTimeout(()=>{try{addMsg('Press Y to chat',true);}catch(e){}},4000);
})();