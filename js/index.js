  function formatBytes(b) { return b < 1024 ? `${b}B` : `${(b/1024).toFixed(1)}KB`; }

  // Matrix
  const mc = document.getElementById('matrix-bg'); const mx = mc.getContext('2d');
  const mChars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&'.split('');
  const mSize = 14; let mDrops, mSpeeds, mTimers = [];
  function mResize() {
    mc.width = window.innerWidth; mc.height = window.innerHeight;
    const cols = Math.floor(mc.width / mSize);
    mDrops = Array(cols).fill(1); mSpeeds = Array.from({length:cols}, () => .3+Math.random()*.5); mTimers = Array(cols).fill(0);
  }
  mResize();
  function mDraw() {
    mx.fillStyle='rgba(0,0,0,0.05)'; mx.fillRect(0,0,mc.width,mc.height);
    for (let i=0;i<mDrops.length;i++) {
      mTimers[i]+=mSpeeds[i]; if(mTimers[i]<1) continue; mTimers[i]=0;
      const y=mDrops[i]*mSize; 
      //define as cores do estilo matrix
      mx.fillStyle=y>mc.height-mSize*3?'':(Math.random()>.05?'#00ff2b':'#009a22');
      mx.font=mSize+'px monospace';
      mx.fillText(mChars[Math.floor(Math.random()*mChars.length)], i*mSize, y);
      if(y>mc.height&&Math.random()>.975) mDrops[i]=0;
      mDrops[i]++;
    }
    requestAnimationFrame(mDraw);
  }
  mDraw(); window.addEventListener('resize', mResize);