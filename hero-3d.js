// @ts-check
export {};
// Dependency-free cinematic 3D layer. Uses perspective projection on a 2D canvas
// so production does not depend on a third-party runtime CDN.
const canvas = /** @type {HTMLCanvasElement|null} */ (document.getElementById('hero-three'));
const hero = /** @type {HTMLElement|null} */ (document.querySelector('.hero'));
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const capable = Boolean(canvas && hero && matchMedia('(min-width: 901px)').matches && matchMedia('(pointer: fine)').matches && !reduced);

if (capable && canvas && hero) {
  const ctx = canvas.getContext('2d', { alpha: true });
  if (ctx) {
    const DPR_MAX = 1.35;
    let width = 1, height = 1, dpr = 1;
    let visible = true;
    let lastFrame = 0;
    let rx = 0.18, ry = -0.45, targetX = 0, targetY = 0;

    const phi = (1 + Math.sqrt(5)) / 2;
    const raw = [
      [0,1,phi],[0,-1,phi],[0,1,-phi],[0,-1,-phi],
      [1,phi,0],[-1,phi,0],[1,-phi,0],[-1,-phi,0],
      [phi,0,1],[-phi,0,1],[phi,0,-1],[-phi,0,-1]
    ];
    const vertices = raw.map(([x,y,z]) => {
      const len = Math.hypot(x,y,z) || 1;
      return {x:x/len*1.18,y:y/len*1.18,z:z/len*1.18};
    });
    const distances = [];
    for(let i=0;i<vertices.length;i++) for(let j=i+1;j<vertices.length;j++){
      const a=vertices[i],b=vertices[j];
      distances.push({i,j,d:Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z)});
    }
    const edgeLength = Math.min(...distances.map(x=>x.d));
    const edges = distances.filter(x=>x.d < edgeLength*1.08).map(({i,j})=>[i,j]);

    const particles = Array.from({length:220},()=>{
      const r=1.45+Math.random()*1.55;
      const theta=Math.random()*Math.PI*2;
      const u=Math.random()*2-1;
      const s=Math.sqrt(1-u*u);
      return {x:r*s*Math.cos(theta),y:r*u*.72,z:r*s*Math.sin(theta),size:.55+Math.random()*1.25,phase:Math.random()*Math.PI*2};
    });

    /** @param {{x:number,y:number,z:number}} p @param {number} ax @param {number} ay */
    const rotate = (p, ax, ay) => {
      const cy=Math.cos(ay), sy=Math.sin(ay), cx=Math.cos(ax), sx=Math.sin(ax);
      const x1=p.x*cy-p.z*sy, z1=p.x*sy+p.z*cy;
      return {x:x1,y:p.y*cx-z1*sx,z:p.y*sx+z1*cx};
    };
    /** @param {{x:number,y:number,z:number}} p */
    const project = p => {
      const depth = 4.7 + p.z;
      const scale = Math.min(width,height)*.22 / Math.max(1.8,depth);
      return {x:width*.69+p.x*scale,y:height*.48+p.y*scale,z:depth,scale};
    };

    const resize = () => {
      const rect=hero.getBoundingClientRect();
      width=Math.max(1,rect.width);height=Math.max(1,rect.height);dpr=Math.min(devicePixelRatio||1,DPR_MAX);
      canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
      canvas.style.width=`${width}px`;canvas.style.height=`${height}px`;
      ctx.setTransform(dpr,0,0,dpr,0,0);
    };
    resize();
    addEventListener('resize',resize,{passive:true});

    hero.addEventListener('pointermove',/** @param {PointerEvent} e */(e)=>{
      const r=hero.getBoundingClientRect();
      targetY=((e.clientX-r.left)/Math.max(1,r.width)-.5)*.32;
      targetX=((e.clientY-r.top)/Math.max(1,r.height)-.5)*.22;
    },{passive:true});

    if('IntersectionObserver' in window){
      const observer=new IntersectionObserver(([entry])=>{visible=Boolean(entry?.isIntersecting);},{threshold:.02});
      observer.observe(hero);
    }

    /** @param {number} now */
    const draw = now => {
      requestAnimationFrame(draw);
      if(!visible||document.hidden||now-lastFrame<16.4) return;
      lastFrame=now;
      rx+=(targetX-rx)*.025;ry+=(targetY-ry)*.025;ry+=.00115;
      ctx.clearRect(0,0,width,height);

      // Soft orbiting particles.
      for(const point of particles){
        const wobble={x:point.x,y:point.y+Math.sin(now*.00035+point.phase)*.035,z:point.z};
        const p=project(rotate(wobble,rx*.55,ry*.72));
        const alpha=Math.max(.05,Math.min(.45,(6-p.z)*.12));
        ctx.beginPath();ctx.fillStyle=`rgba(239,201,137,${alpha.toFixed(3)})`;
        ctx.arc(p.x,p.y,point.size*Math.max(.55,p.scale*.012),0,Math.PI*2);ctx.fill();
      }

      const projected=vertices.map(v=>project(rotate(v,rx,ry)));
      ctx.lineWidth=.75;ctx.strokeStyle='rgba(217,173,112,.22)';
      ctx.beginPath();
      for(const [a,b] of edges){ctx.moveTo(projected[a].x,projected[a].y);ctx.lineTo(projected[b].x,projected[b].y);}ctx.stroke();

      for(const p of projected){ctx.beginPath();ctx.fillStyle='rgba(240,207,149,.42)';ctx.arc(p.x,p.y,1.15,0,Math.PI*2);ctx.fill();}
    };
    document.body.classList.add('has-3d');
    requestAnimationFrame(draw);
  }
}
