/* VDA motion — portet fra nvent-nettsiden. Vanilla JS, ingen avhengigheter.
   Tagger eksisterende elementer og lar IntersectionObserver slippe dem inn. */
(function(){
  var d=document,root=d.documentElement;
  root.classList.add('mo'); // uten JS forblir alt synlig
  var redusert=matchMedia('(prefers-reduced-motion: reduce)').matches;

  function klar(fn){d.readyState==='loading'?d.addEventListener('DOMContentLoaded',fn):fn();}
  klar(function(){

    /* ---------- WordRise på hovedtittelen (kun ved sidelast) ---------- */
    var h1=d.querySelector('header h1');
    if(h1&&!redusert&&!h1.querySelector('.mo-w')){
      var ord=h1.textContent.trim().split(/\s+/);
      h1.textContent='';
      ord.forEach(function(w,i){
        var maske=d.createElement('span');maske.className='mo-w';
        var inner=d.createElement('span');inner.textContent=w;
        inner.style.setProperty('--mo-d',(0.1+i*0.07)+'s');
        maske.appendChild(inner);h1.appendChild(maske);
        if(i<ord.length-1)h1.appendChild(d.createTextNode(' '));
      });
      requestAnimationFrame(function(){requestAnimationFrame(function(){
        h1.querySelectorAll('.mo-w').forEach(function(m){m.classList.add('mo-in');});
      });});
    }

    /* ---------- Hero-undertekst og handlinger følger tittelen ---------- */
    [['.hero-sub','0.35s'],['.hero-actions','0.45s'],['.clients','0.55s'],
     ['header .lede','0.15s'],['header .meta','0.25s']].forEach(function(par){
      var el=d.querySelector(par[0]);
      if(el){el.classList.add('mo-reveal');el.style.setProperty('--mo-d',par[1]);}
    });

    /* ---------- Reveal-mål: rolige blokker som fader opp 24px ---------- */
    d.querySelectorAll(
      'section h2, .sec-lede, .prose, .metode-hvorfor, .sec-cta, .case, '+
      '.om-firma, .contact-sub, .contact-actions, .contact-mail, '+
      'main h2, .cta-blokk'
    ).forEach(function(el){el.classList.add('mo-reveal');});

    /* ---------- Stagger-grupper: barna kommer 0.08s etter hverandre ---------- */
    ['.steps','.team','.faq-list','.contact-facts','ul.punkter'].forEach(function(sel){
      d.querySelectorAll(sel).forEach(function(gr){
        Array.prototype.forEach.call(gr.children,function(barn,i){
          barn.classList.add('mo-item');
          barn.style.setProperty('--mo-d',(0.1+i*0.08)+'s');
        });
        gr.classList.add('mo-gruppe');
      });
    });

    /* ---------- PhotoReveal på portrettene (ikke kloner i modalen) ---------- */
    d.querySelectorAll('.team .person-foto').forEach(function(f){f.classList.add('mo-photo');});

    /* ---------- IntersectionObserver: én gang, negative marginer som nvent ---------- */
    function se(mål,margin){
      if(!('IntersectionObserver' in window)||redusert){
        mål.forEach(function(el){el.classList.add('mo-in');
          el.querySelectorAll('.mo-item').forEach(function(b){b.classList.add('mo-in');});});
        return;
      }
      var io=new IntersectionObserver(function(es){
        es.forEach(function(e){
          if(!e.isIntersecting)return;
          e.target.classList.add('mo-in');
          io.unobserve(e.target);
        });
      },{rootMargin:margin});
      mål.forEach(function(el){io.observe(el);});
    }
    se(Array.prototype.slice.call(d.querySelectorAll('.mo-reveal')),'0px 0px -100px 0px');
    se(Array.prototype.slice.call(d.querySelectorAll('.mo-gruppe, .mo-photo')),'0px 0px -80px 0px');

    /* ---------- Glidende understrek i toppmenyen ---------- */
    var links=d.querySelector('.nav-links');
    if(links){
      var strek=d.createElement('span');strek.className='mo-navstrek';strek.setAttribute('aria-hidden','true');
      links.appendChild(strek);
      function flytt(a){
        strek.style.left=a.offsetLeft+'px';
        strek.style.width=a.offsetWidth+'px';
        strek.classList.add('mo-vis');
      }
      links.querySelectorAll(':scope > a:not(.nav-cta)').forEach(function(a){
        a.addEventListener('mouseenter',function(){flytt(a);});
        a.addEventListener('focus',function(){flytt(a);});
      });
      links.addEventListener('mouseleave',function(){strek.classList.remove('mo-vis');});
    }

    /* ---------- Luftstrøm-bakteppet i heroen (kun forsiden) ---------- */
    var hero=d.getElementById('top');
    if(hero&&hero.tagName==='HEADER'){
      var ns='http://www.w3.org/2000/svg';
      var svg=d.createElementNS(ns,'svg');
      svg.setAttribute('class','mo-flyt');
      svg.setAttribute('viewBox','0 0 1440 560');
      svg.setAttribute('preserveAspectRatio','xMidYMid slice');
      svg.setAttribute('aria-hidden','true');
      var strømmer=[
        ['M -60 120 C 300 60, 700 190, 1060 120 S 1600 40, 2000 130','1.5','.10','s1'],
        ['M -60 260 C 340 200, 720 330, 1120 250 S 1660 180, 2000 270','2','.14','s2'],
        ['M -60 420 C 320 360, 760 480, 1140 400 S 1680 330, 2000 430','1.5','.09','s3']
      ];
      strømmer.forEach(function(s){
        var p=d.createElementNS(ns,'path');
        p.setAttribute('d',s[0]);p.setAttribute('stroke-width',s[1]);
        p.setAttribute('opacity',s[2]);p.setAttribute('class',s[3]);
        svg.appendChild(p);
      });
      if(!redusert){
        [[180,170,2.5,'p1'],[420,330,2,'p2'],[760,140,3,'p3'],[1020,380,2,'p4'],[1310,210,2.5,'p5']]
        .forEach(function(c){
          var el=d.createElementNS(ns,'circle');
          el.setAttribute('cx',c[0]);el.setAttribute('cy',c[1]);el.setAttribute('r',c[2]);
          el.setAttribute('class',c[3]);
          svg.appendChild(el);
        });
      }
      hero.insertBefore(svg,hero.firstChild);

      /* ---------- Parallakse med lerp: bakteppet driver, innholdet henger rolig etter ---------- */
      if(!redusert&&matchMedia('(pointer:fine)').matches){
        var wrap=hero.querySelector('.wrap');
        var mål=[{el:svg,rate:.18,y:0},{el:wrap,rate:-.06,y:0}];
        mål.forEach(function(m){if(m.el)m.el.classList.add('mo-par');});
        var aktiv=false;
        function steg(){
          var i_ro=true;
          mål.forEach(function(m){
            if(!m.el)return;
            var vil=scrollY*m.rate;
            m.y+=(vil-m.y)*.08;
            if(Math.abs(vil-m.y)>.1)i_ro=false;else m.y=vil;
            m.el.style.transform='translate3d(0,'+m.y.toFixed(2)+'px,0)';
          });
          if(i_ro){aktiv=false;return;}
          requestAnimationFrame(steg);
        }
        addEventListener('scroll',function(){
          if(!aktiv){aktiv=true;requestAnimationFrame(steg);}
        },{passive:true});
      }
    }

    /* ---------- Myk, eased scrolling til ankere (lengre og roligere enn nettleserens) ---------- */
    if(!redusert){
      d.addEventListener('click',function(ev){
        var a=ev.target.closest?ev.target.closest('a[href^="#"]'):null;
        if(!a)return;
        var id=a.getAttribute('href').slice(1);
        var t=id?d.getElementById(id):d.body;
        if(!t&&id!=='top')return;
        ev.preventDefault();
        var fra=scrollY;
        var til=id==='top'||!t?0:t.getBoundingClientRect().top+scrollY;
        var navH=d.querySelector('nav');til-=navH?navH.offsetHeight:0;
        til=Math.max(0,Math.min(til,d.documentElement.scrollHeight-innerHeight));
        var start=null,DUR=900;
        function ease(x){return 1-Math.pow(1-x,5);} /* easeOutQuint — rolig landing */
        function frame(ts){
          if(start===null)start=ts;
          var p=Math.min((ts-start)/DUR,1);
          /* behavior:'instant' så CSS scroll-behavior:smooth ikke sloss med easingen vår */
          scrollTo({top:fra+(til-fra)*ease(p),behavior:'instant'});
          if(p<1)requestAnimationFrame(frame);
          else if(id)history.replaceState(null,'','#'+id);
        }
        requestAnimationFrame(frame);
      });
    }
  });
})();
