(function(){
"use strict";
var D=document,B=D.body,H=D.documentElement;
var reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
var fine=matchMedia("(pointer:fine)").matches;
var $=function(s,r){return Array.prototype.slice.call((r||D).querySelectorAll(s))};
var clamp=function(v,a,b){return Math.max(a,Math.min(b,v))};

/* 1 e 2 — entrada + fallback */
var appear=$(".appear"),photo=$(".hero-photo");
appear.concat(photo).forEach(function(el){el.addEventListener("animationend",function(){el.classList.add("is-in")},{once:true})});
requestAnimationFrame(function(){requestAnimationFrame(function(){
  var el=appear[0];var ok=el&&el.getAnimations&&el.getAnimations().some(function(a){return a.playState==="running"||a.playState==="finished"});
  if(!ok)appear.concat(photo).forEach(function(e){e.classList.add("is-in")});
})});
var vid=$(".hero-photo")[0];if(vid){vid.addEventListener("loadeddata",function(){vid.classList.add("is-in")});var p=vid.play&&vid.play();if(p&&p.catch)p.catch(function(){})}

/* 3,4,5 — menu */
var burger=$(".burger")[0],nav=$("#site-nav")[0];
function menu(open){B.classList.toggle("menu-open",open);burger.setAttribute("aria-expanded",open);burger.setAttribute("aria-label",open?"Fechar menu":"Abrir menu")}
burger.addEventListener("click",function(){menu(!B.classList.contains("menu-open"))});
$("a",nav).forEach(function(a){a.addEventListener("click",function(){menu(false)})});
$(".menu-backdrop")[0].addEventListener("click",function(){menu(false)});
addEventListener("keydown",function(e){if(e.key==="Escape")menu(false)});
matchMedia("(min-width:901px)").addEventListener("change",function(e){if(e.matches)menu(false)});

/* rolagem com inércia (naocodei #10) — um único fluxo contínuo */
var cur=scrollY,target=scrollY,raf=0,maxS=function(){return H.scrollHeight-innerHeight};
if(!reduced&&fine){
  H.classList.add("smooth");
  var tick=function(){cur+=(target-cur)*.085;if(Math.abs(target-cur)<.4){cur=target;scrollTo(0,cur);raf=0;return}scrollTo(0,cur);raf=requestAnimationFrame(tick)};
  var run=function(){if(!raf)raf=requestAnimationFrame(tick)};
  addEventListener("wheel",function(e){if(e.ctrlKey||B.classList.contains("menu-open"))return;e.preventDefault();target=clamp(target+e.deltaY*(e.deltaMode===1?32:1),0,maxS());run()},{passive:false});
  addEventListener("scroll",function(){if(!raf){cur=target=scrollY}},{passive:true});
  $('a[href^="#"]').forEach(function(a){a.addEventListener("click",function(e){var t=D.querySelector(a.getAttribute("href"));if(!t)return;e.preventDefault();target=clamp(a.getAttribute("href")==="#top"?0:t.getBoundingClientRect().top+scrollY-40,0,maxS());run()})});
}

/* viagem pelas estrelas (naocodei #35) — fundo fixo do site inteiro */
var cv=$("#stars")[0],cx=cv.getContext("2d"),W,Hh,dpr=Math.min(devicePixelRatio||1,1.5),stars=[],vel=0;
function size(){W=innerWidth;Hh=innerHeight;cv.width=W*dpr;cv.height=Hh*dpr;cx.setTransform(dpr,0,0,dpr,0,0)}
size();addEventListener("resize",size);
for(var i=0;i<(innerWidth<700?110:220);i++)stars.push({x:Math.random()*2-1,y:Math.random()*2-1,z:Math.random()});
function drawStars(){
  cx.clearRect(0,0,W,Hh);var f=Math.max(W,Hh)*.5,sp=.0012+Math.min(Math.abs(vel),60)*.00009;
  for(var i=0;i<stars.length;i++){var s=stars[i],pz=s.z+sp*4;s.z-=sp;
    if(s.z<=.03){s.x=Math.random()*2-1;s.y=Math.random()*2-1;s.z=1;pz=1}
    var x=W/2+s.x/s.z*f*.5,y=Hh/2+s.y/s.z*f*.5,px=W/2+s.x/pz*f*.5,py=Hh/2+s.y/pz*f*.5;
    if(x<0||x>W||y<0||y>Hh)continue;
    var a=(1-s.z)*.9+.1;cx.strokeStyle="rgba(190,208,255,"+a+")";cx.lineWidth=(1-s.z)*1.8+.3;cx.beginPath();cx.moveTo(px,py);cx.lineTo(x+.01,y);cx.stroke()}
}

/* revelar palavras (#16) */
$(".rw").forEach(function(el){var t=el.textContent.trim().split(/\s+/);el.setAttribute("aria-label",t.join(" "));el.innerHTML=t.map(function(w,i){return '<span class="w" aria-hidden="true"><span style="--i:'+i+'">'+w+'</span></span> '}).join("")});
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}})},{threshold:.4});
$(".rw").forEach(function(el){io.observe(el)});

/* texto que se preenche (#04) */
var fill=$(".fill")[0],fw=[];
if(fill){fill.innerHTML=fill.textContent.trim().split(/\s+/).map(function(w){return '<span class="f">'+w+'</span>'}).join(" ");fw=$(".f",fill)}

/* odômetro (#18) */
$(".odo").forEach(function(el){var n=el.dataset.odo;el.innerHTML='<span>'+[0,1,2,3,4,5,6,7,8,9].join("<br>")+'</span>';var s=el.firstChild;el.style.width=".62em";el.dataset.n=n;setTimeout(function(){s.style.transform="translateY(-"+(n*10)+"%)"},1500)});

/* luz que segue o mouse (#12) + cursor (#09) */
var cards=$(".scard");cards.forEach(function(c,i){c.style.setProperty("--k",i);c.addEventListener("pointermove",function(e){var r=c.getBoundingClientRect();c.style.setProperty("--mx",e.clientX-r.left+"px");c.style.setProperty("--my",e.clientY-r.top+"px")})});
var dot=$(".cur-dot")[0],ring=$(".cur-ring")[0],mx=0,my=0,rx=0,ry=0;
if(fine){addEventListener("pointermove",function(e){mx=e.clientX;my=e.clientY;B.classList.add("cursor-on");dot.style.transform="translate("+mx+"px,"+my+"px)"},{passive:true});
  D.addEventListener("pointerover",function(e){ring.classList.toggle("hov",!!e.target.closest("a,button"))});}

/* botão elástico (#14) */
$(".elastic").forEach(function(b){var s=1,v=0,t=1,on=0;
  function loop(){v+=(t-s)*.18;v*=.78;s+=v;b.style.transform="scale("+s.toFixed(3)+")";if(Math.abs(v)>.001||Math.abs(t-s)>.001)requestAnimationFrame(loop);else{on=0;b.style.transform=""}}
  function go(x){t=x;if(!on){on=1;requestAnimationFrame(loop)}}
  b.addEventListener("pointerenter",function(){go(1.07)});b.addEventListener("pointerleave",function(){go(1)});
  b.addEventListener("pointerdown",function(){go(.94)});b.addEventListener("pointerup",function(){go(1.07)});
});

/* confete (#29) + copiar */
var cc=$("#confetti")[0],cg=cc.getContext("2d"),parts=[],cr=0;
function confetti(x,y){if(reduced)return;cc.width=innerWidth;cc.height=innerHeight;var cols=["#4a78ff","#8fb0ff","#ffffff","#ffc83d"];
  for(var i=0;i<46;i++)parts.push({x:x,y:y,vx:(Math.random()-.5)*11,vy:-Math.random()*11-3,r:Math.random()*6,vr:(Math.random()-.5)*.4,w:5+Math.random()*5,c:cols[i%4]});
  if(!cr)cr=requestAnimationFrame(cf)}
function cf(){cg.clearRect(0,0,cc.width,cc.height);parts=parts.filter(function(p){return p.y<cc.height+20});
  parts.forEach(function(p){p.vy+=.35;p.vx*=.985;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;cg.save();cg.translate(p.x,p.y);cg.rotate(p.r);cg.fillStyle=p.c;cg.fillRect(-p.w/2,-p.w/4,p.w,p.w/2);cg.restore()});
  cr=parts.length?requestAnimationFrame(cf):0;if(!cr)cg.clearRect(0,0,cc.width,cc.height)}
var toast=$("#toast")[0],tt;
$("[data-ip]").forEach(function(b){b.addEventListener("click",function(){
  var ip=b.dataset.ip;
  var done=function(){var o=b.textContent;b.textContent="Copiado!";setTimeout(function(){b.textContent=o},1800);toast.classList.add("show");clearTimeout(tt);tt=setTimeout(function(){toast.classList.remove("show")},1900);var r=b.getBoundingClientRect();confetti(r.left+r.width/2,r.top+r.height/2)};
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(ip).then(done,function(){fb(ip);done()})}else{fb(ip);done()}
})});
function fb(t){var a=D.createElement("textarea");a.value=t;B.appendChild(a);a.select();try{D.execCommand("copy")}catch(e){}a.remove()}

/* loop único de rolagem: parallax do hero, progresso, pilha, linha do tempo, texto */
var hdr=$("#hdr")[0],prog=$(".progress i")[0],hc=$(".hero-copy")[0],tl=$(".tl")[0],tlf=$(".tl-line i")[0],steps=$(".tl-step"),last=-1,ly=scrollY;
function frame(){
  var y=scrollY,vh=innerHeight;vel+=((y-ly)-vel)*.15;ly=y;
  mx&&(rx+=(mx-rx)*.18,ry+=(my-ry)*.18,ring.style.transform="translate("+rx+"px,"+ry+"px)");
  if(!reduced)drawStars();
  if(y!==last||Math.abs(vel)>.1){last=y;
    hdr.classList.toggle("scrolled",y>40);prog.style.transform="scaleX("+(maxS()>0?y/maxS():0)+")";
    var h=clamp(y/vh,0,1);hc.style.transform="translateY("+(y*.22)+"px)";hc.style.opacity=1-h*1.1;if(vid)vid.style.transform="scale("+(1+h*.08)+") translateY("+(y*.12)+"px)";
    if(fill){var r=fill.getBoundingClientRect(),p=clamp((vh*.8-r.top)/(r.height+vh*.35),0,1),n=fw.length;for(var i=0;i<n;i++)fw[i].style.opacity=clamp(.2+((p*(n+3)-i)/3)*.8,.2,1)}
    cards.forEach(function(c,i){var nx=cards[i+1];if(!nx)return;var top=parseFloat(getComputedStyle(c).top),t=clamp((nx.getBoundingClientRect().top-top)/c.offsetHeight,0,1);
      c.style.transform="scale("+(.93+.07*t)+")";c.style.filter="brightness("+(.55+.45*t)+")"});
    if(tl){var r2=tl.getBoundingClientRect(),q=clamp((vh*.6-r2.top)/r2.height,0,1);tlf.style.transform="scaleY("+q+")";
      steps.forEach(function(s){var sr=s.getBoundingClientRect();s.classList.toggle("on",sr.top<vh*.6)})}
  }
  requestAnimationFrame(frame)
}
D.addEventListener("visibilitychange",function(){ly=scrollY});
frame();
})();
