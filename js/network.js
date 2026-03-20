  function toast(msg, err) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.style.borderColor = err ? '#ff4d6a' : '#00e5a0';
    t.style.color = err ? '#ff4d6a' : '#00e5a0';
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2200);
  }
  function formatBytes(b) { return b < 1024 ? `${b}B` : `${(b/1024).toFixed(1)}KB`; }
  function copyEl(id) {
    const el = document.getElementById(id);
    navigator.clipboard.writeText(el.value || el.textContent);
    toast('copied!');
  }

  // HTTP
  document.getElementById('http-method').addEventListener('change', function() {
    document.getElementById('body-section').classList.toggle('hidden', !['POST','PUT','PATCH'].includes(this.value));
  });
  function addHeader(k='', v='') {
    const list = document.getElementById('headers-list');
    const div = document.createElement('div');
    div.className = 'coll-item flex gap-2';
    div.innerHTML = `
      <input value="${k}" placeholder="Header-Name" class="flex-1 bg-bg border border-bdr text-[11px] px-2 py-1 rounded-sm focus:outline-none focus:border-accent placeholder:text-muted header-key">
      <input value="${v}" placeholder="value" class="flex-1 bg-bg border border-bdr text-[11px] px-2 py-1 rounded-sm focus:outline-none focus:border-accent placeholder:text-muted header-val">
      <button onclick="this.parentElement.remove()" class="coll-del text-danger text-[11px] px-2 hover:opacity-80">✕</button>`;
    list.appendChild(div);
  }
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
  async function sendRequest() {
    const method = document.getElementById('http-method').value;
    const url = document.getElementById('http-url').value.trim();
    if (!url) { toast('URL vazia', true); return; }
    const headers = {};
    document.querySelectorAll('#headers-list .coll-item').forEach(row => {
      const k = row.querySelector('.header-key').value.trim();
      const v = row.querySelector('.header-val').value.trim();
      if (k) headers[k] = v;
    });
    const opts = { method, headers };
    const body = document.getElementById('http-body').value;
    if (['POST','PUT','PATCH'].includes(method) && body) opts.body = body;
    document.getElementById('http-loading').classList.add('active');
    document.getElementById('http-response').classList.add('hidden');
    const t0 = Date.now();
    try {
      const res = await fetch(url, opts);
      const elapsed = Date.now() - t0;
      const text = await res.text();
      const statusEl = document.getElementById('http-status');
      statusEl.textContent = `${res.status} ${res.statusText}`;
      statusEl.className = `text-[11px] px-2 py-0.5 rounded-sm font-bold ${res.ok ? 'm-get' : 'm-delete'}`;
      document.getElementById('http-time').textContent = `${elapsed}ms`;
      document.getElementById('http-size').textContent = formatBytes(new Blob([text]).size);
      document.getElementById('http-body-out').innerHTML = syntaxHL(text);
      document.getElementById('http-response').classList.remove('hidden');
    } catch(e) { toast('Erro: ' + e.message, true); }
    finally { document.getElementById('http-loading').classList.remove('active'); }
  }

  // URL Encode/Decode
  function urlEncode() { document.getElementById('url-output').value = encodeURIComponent(document.getElementById('url-input').value); }
  function urlDecode() {
    try { document.getElementById('url-output').value = decodeURIComponent(document.getElementById('url-input').value); }
    catch { toast('URL inválida', true); }
  }

  // Meu IP
  async function myIP(){
    try{
      const req = await fetch(`https://api.ipify.org?format=json`)
      if (!req.ok) return 
      const resp = await req.json()
      const ip = resp.ip
      // console.log(resp)
      const el = document.querySelector('#ip')
      el.addEventListener('click',(e)=>{
        navigator.clipboard.writeText(e.target.innerText) //exemplo de como copiar para o navegador
      })
      el.innerHTML = `
        <div class="flex flex-col items-center bg-bg border border-bdr rounded-sm p-1 w-fit">
        <div class="text-[9px] text-muted tracking-widest mb-0.5">MEU IP</div>
        <div class="flex gap-1">
          <i title="Pesquisar Novamente" class="text-gray-500 hover:text-accent" width="16" height="16" data-lucide="refresh-cw"></i> 
          <div class="text-[12px] text-accent">${ip}</div>
        </div>
          </div>
          `
      el.classList.remove('hidden')
      lucide.createIcons()

      return el
    }
    catch{
        toast('Erro: ' + e.message, true);
    }
  }
myIP()

function flagName(flag) {
  return `https://flagcdn.com/w40/${flag.toLowerCase()}.png`;
}


  // Rastreador de IP
  async function ipLookup() {
    const ip = document.getElementById('ip-input').value.trim();
    try {
      const res = await fetch(ip ? `https://ipapi.co/${ip}/json/` : 'https://ipapi.co/json/');
      const d = await res.json();
      
      if (d.error) { toast(d.reason, true); return; }
      const fields = [
        ['IP', d.ip], 
        ['País', `<img src="${flagName(d.country_code)}" class="h-4 inline mr-1">${d.country_name}`],
        ['Cidade', d.city], 
        ['Região', d.region], 
        ['Org / ASN', d.org], 
        ['Timezone', d.timezone],
        ['Lat / Lon', `${d.latitude}, ${d.longitude}`], ['Postal', d.postal]
      ];
      // console.log(flagName(fields['flag']))
      const el = document.getElementById('ip-result');
      el.innerHTML = fields.map(([k,v]) => `
        <div class="bg-bg border border-bdr rounded-sm px-3 py-2">
          <div class="text-[9px] text-muted tracking-widest mb-0.5">${k}</div>
          <div class="text-[12px]">
            ${v ?? '—'}
          </div>
        </div>`).join('');
      el.classList.remove('hidden');
    } catch(e) { toast('Erro: ' + e.message, true); }
  }

  // DNS Lookup
  async function dnsLookup() {
    const domain = document.getElementById('dns-domain').value.trim();
    const type = document.getElementById('dns-type').value;
    if (!domain) { toast('Domínio vazio', true); return; }
    try {
      const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${type}`);
      const d = await res.json();
      const el = document.getElementById('dns-result');
      const typeMap = {1:'A',28:'AAAA',15:'MX',16:'TXT',5:'CNAME',2:'NS'};
      if (!d.Answer?.length) {
        el.innerHTML = '<p class="text-muted text-[11px]">Nenhum registro encontrado.</p>';
      } else {
        el.innerHTML = d.Answer.map(r => `
          <div class="bg-bg border border-bdr rounded-sm px-3 py-2 flex items-center gap-3 text-[11px]">
            <span class="text-blue w-12 shrink-0">${typeMap[r.type] ?? r.type}</span>
            <span class="flex-1 break-all">${r.data}</span>
            <span class="text-muted shrink-0">TTL ${r.TTL}</span>
          </div>`).join('');
      }
      el.classList.remove('hidden');
    } catch(e) { toast('Erro: ' + e.message, true); }
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