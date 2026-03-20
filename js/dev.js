
  
  function toast(msg, err) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.style.borderColor = err ? '#ff4d6a' : '#00e5a0';
    t.style.color = err ? '#ff4d6a' : '#00e5a0';
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2200);
  }
  function copyEl(id) {
    const el = document.getElementById(id);
    navigator.clipboard.writeText(el.value || el.textContent);
    toast('copied!');
  }

  // JSON
  function syntaxHL(json) {
    try {
      const s = JSON.stringify(JSON.parse(json), null, 2);
      return s.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, m => {
        if (/^"/.test(m)) return /:$/.test(m) ? `<span class="json-key">${m}</span>` : `<span class="json-str">${m}</span>`;
        if (/true|false/.test(m)) return `<span class="json-bool">${m}</span>`;
        if (/null/.test(m)) return `<span class="json-null">${m}</span>`;
        return `<span class="json-num">${m}</span>`;
      });
    } catch { return json; }
  }
  function jsonFormat() {
    try {
      const parsed = JSON.parse(document.getElementById('json-input').value);
      const el = document.getElementById('json-output');
      el.innerHTML = syntaxHL(JSON.stringify(parsed));
      el.classList.remove('hidden');
    } catch(e) { toast('JSON inválido: ' + e.message, true); }
  }
  function jsonMinify() {
    try {
      const el = document.getElementById('json-output');
      el.innerHTML = JSON.stringify(JSON.parse(document.getElementById('json-input').value));
      el.classList.remove('hidden');
    } catch(e) { toast('JSON inválido: ' + e.message, true); }
  }
  function jsonValidate() {
    try {
      JSON.parse(document.getElementById('json-input').value);
      toast('JSON válido ✓');
    } catch(e) { toast('Inválido: ' + e.message, true); }
  }

  // Regex
  function escapeHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function runRegex() {
    const pattern = document.getElementById('regex-pattern').value;
    const flags   = document.getElementById('regex-flags').value;
    const text    = document.getElementById('regex-test').value;
    const info    = document.getElementById('regex-info');
    const out     = document.getElementById('regex-output');
    if (!pattern || !text) { out.classList.add('hidden'); info.classList.add('hidden'); return; }
    try {
      const re = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g');
      const matches = [...text.matchAll(new RegExp(pattern, flags.includes('g') ? flags : flags + 'g'))];
      info.textContent = `${matches.length} match${matches.length !== 1 ? 'es' : ''}`;
      info.classList.remove('hidden');
      const highlighted = text.replace(re, m => `<mark class="bg-accent/20 text-accent rounded px-0.5">${escapeHtml(m)}</mark>`);
      out.innerHTML = escapeHtml(text).replace(
        new RegExp(escapeHtml(pattern), flags.includes('g') ? flags : flags + 'g'),
        m => `<mark class="bg-accent/20 text-accent rounded px-0.5">${m}</mark>`
      );
      out.innerHTML = highlighted;
      out.classList.remove('hidden');
    } catch(e) { info.textContent = 'Erro: ' + e.message; info.classList.remove('hidden'); out.classList.add('hidden'); }
  }
  document.getElementById('regex-pattern').addEventListener('input', runRegex);
  document.getElementById('regex-flags').addEventListener('input', runRegex);

  // GitHub
  // TODO repos publicas colocar um cadeado
  async function ghLookup() {
    // TODO Adicionar validacao de usuarios inexistentes
    const user = document.getElementById('gh-user').value.trim();
    if (!user) { toast('Username vazio', true); return; }
    try {
      // dados do usuario e da reposicao
      const [uRes, rRes] = await Promise.all([
        fetch(`https://api.github.com/users/${encodeURIComponent(user)}`),
        fetch(`https://api.github.com/users/${encodeURIComponent(user)}/repos?sort=updated&per_page=6`)
      ]);

      if (!uRes.ok) { toast('Usuário não encontrado', true); return; }
      const u = await uRes.json();
      const repos = await rRes.json();
      console.log(u)
      console.log(repos)
      const el = document.getElementById('gh-result');
      el.innerHTML = `
        <div class="flex gap-4 mb-4">
          <img src="${u.avatar_url}" class="w-16 h-16 rounded border border-bdr shrink-0" alt="">
          <div>
            <div class="text-white font-bold text-sm">${u.name || u.login}</div>
            <div class="text-muted text-[11px]">
              <a class="!text-green-400 hover:underline" href="${u.html_url}" target="_blank">@${u.login}</a>
            </div>
            ${u.bio ? `<div class="text-[11px] mt-1 text-body">${u.bio}</div>` : ''}
            ${u.location ? `<div class="text-[10px] text-muted mt-1">📍 ${u.location}</div>` : ''}
          </div>
        </div>
        <div class="grid grid-cols-3 gap-2 mb-4 text-center">
          <div class="bg-bg border border-bdr rounded-sm py-2">
            <div class="text-accent text-sm font-bold">${u.public_repos}</div>
            <div class="text-[9px] text-muted tracking-widest">REPOS</div>
          </div>
          <div class="bg-bg border border-bdr rounded-sm py-2">
            <div class="text-accent text-sm font-bold">${u.followers}</div>
            <div class="text-[9px] text-muted tracking-widest">FOLLOWERS</div>
          </div>
          <div class="bg-bg border border-bdr rounded-sm py-2">
            <div class="text-accent text-sm font-bold">${u.following}</div>
            <div class="text-[9px] text-muted tracking-widest">FOLLOWING</div>
          </div>
        </div>
        ${repos.length ? `
          <div class="text-[9px] text-muted tracking-widest mb-2">REPOS RECENTES</div>
          <div class="space-y-1.5">
            ${repos.map(r => `
              <div class="bg-bg border border-bdr rounded-sm px-3 py-2 flex items-center justify-between">
                <a href="${r.url}"target="_blank" class="text-[11px] text-blue hover:underline">${r.name}</a>
                <div class="flex gap-3 text-[10px] text-muted">
                  ${r.language ? `<span>${r.language}</span>` : ''}
                  <span>★ ${r.stargazers_count}</span>
                </div>
              </div>`).join('')}
          </div>` : ''}`;
      el.classList.remove('hidden');
    } catch(e) { toast('Erro: ' + e.message, true); }
  }
  document.getElementById('gh-user').addEventListener('keydown', e => { if (e.key === 'Enter') ghLookup(); }); // quando houver o "Enter", chama a funcao

  // Color Converter
  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : {r,g,b};
  }
  function rgbToHex(r,g,b) { 
    return '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join(''); 
  }
  function rgbToHsl(r,g,b) {
    r/=255; g/=255; b/=255;
    const max=Math.max(r,g,b), min=Math.min(r,g,b); let h,s; const l=(max+min)/2;
    if (max===min) { h=s=0; } else {
      const d=max-min; s=l>.5?d/(2-max-min):d/(max+min);
      switch(max) {
        case r: h=((g-b)/d+(g<b?6:0))/6; break;
        case g: h=((b-r)/d+2)/6; break;
        case b: h=((r-g)/d+4)/6; break;
      }
    }
    return {h:Math.round(h*360), s:Math.round(s*100), l:Math.round(l*100)};
  }
  function hslToRgb(h,s,l) {
    s/=100; l/=100;
    const k=n=>(n+h/30)%12, a=s*Math.min(l,1-l);
    const f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));
    return {r:Math.round(f(0)*255), g:Math.round(f(8)*255), b:Math.round(f(4)*255)};
  }
  function updateAll(r,g,b) {
    const {h,s,l} = rgbToHsl(r,g,b);
    document.getElementById('col-hex').value = rgbToHex(r,g,b);
    document.getElementById('col-rgb').value = `${r}, ${g}, ${b}`;
    document.getElementById('col-hsl').value = `${h}, ${s}%, ${l}%`;
    document.getElementById('color-preview').style.background = rgbToHex(r,g,b);
  }
  function fromHex() {
    const hex = document.getElementById('col-hex').value.trim();
    document.getElementById('color-preview').style.background = hex;
    if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return;
    const {r,g,b} = hexToRgb(hex);
    const {h,s,l} = rgbToHsl(r,g,b);
    document.getElementById('col-rgb').value = `${r}, ${g}, ${b}`;
    document.getElementById('col-hsl').value = `${h}, ${s}%, ${l}%`;
  }
  function fromRgb() {
    const parts = document.getElementById('col-rgb').value.split(',').map(x => parseInt(x));
    if (parts.length !== 3 || parts.some(isNaN)) return;
    const [r,g,b] = parts.map(v => Math.min(255, Math.max(0, v)));
    updateAll(r,g,b);
  }
  function fromHsl() {
    const raw = document.getElementById('col-hsl').value.replace(/%/g,'').split(',').map(x => parseFloat(x.trim()));
    if (raw.length !== 3 || raw.some(isNaN)) return;
    const [h,s,l] = raw;
    const {r,g,b} = hslToRgb(h,s,l);
    const hex = rgbToHex(r,g,b);
    document.getElementById('col-hex').value = hex;
    document.getElementById('col-rgb').value = `${r}, ${g}, ${b}`;
    document.getElementById('color-preview').style.background = hex;
  }
  function copyRgb() {
    const v = document.getElementById('col-rgb').value;
    navigator.clipboard.writeText(`rgb(${v})`); toast('copied!');
  }
  function copyHsl() {
    const v = document.getElementById('col-hsl').value;
    navigator.clipboard.writeText(`hsl(${v})`); toast('copied!');
  }

  // Matrix
  const mc = document.getElementById('matrix-bg'), mx = mc.getContext('2d');
  const mChars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&'.split('');
  const mSize = 14; let mDrops, mSpeeds, mTimers = [];
  function mResize() {
    mc.width = window.innerWidth; mc.height = window.innerHeight;
    const cols = Math.floor(mc.width / mSize);
    mDrops = Array(cols).fill(1); mSpeeds = Array.from({length:cols}, () => .3+Math.random()*.5); mTimers = Array(cols).fill(0);
  }
  mResize();
  function mDraw() {
    mx.fillStyle = 'rgba(0,0,0,0.05)'; mx.fillRect(0,0,mc.width,mc.height);
    for (let i=0; i<mDrops.length; i++) {
      mTimers[i] += mSpeeds[i]; if (mTimers[i]<1) continue; mTimers[i]=0;
      const y = mDrops[i]*mSize;
      mx.fillStyle = y > mc.height-mSize*3 ? '' : (Math.random()>.05 ? '#00ff2b' : '#009a22');
      mx.font = mSize+'px monospace';
      mx.fillText(mChars[Math.floor(Math.random()*mChars.length)], i*mSize, y);
      if (y > mc.height && Math.random()>.975) mDrops[i]=0;
      mDrops[i]++;
    }
    requestAnimationFrame(mDraw);
  }
  mDraw(); 
  window.addEventListener('resize', mResize);


  // Deixando o Color Converter Dinamico
  document.querySelector('#color-preview').addEventListener('click',(e)=>{
    document.querySelector('#color-picker').click()
    // console.log(e)
  })
  document.querySelector('#color-picker').addEventListener('change',(e)=>{
    document.getElementById('col-hex').value = e.target.value
    console.log(e.target.value)
    fromHex()
  })
  document.querySelector('#col-hex').addEventListener('keydown',fromHex)
