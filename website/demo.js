const demo = document.getElementById('demo');
const copyBtn = document.getElementById('copy');

const frames = [
  { text: '$ const state = dbg.track({ user: { name: "Gurjot" } }, "state");', cls: 'line-dim' },
  { text: '$ state.user.name = "John";', cls: 'line-dim' },
  { text: '', cls: '' },
  { text: '⚡ TRACK', cls: 'line-warn' },
  { text: '', cls: '' },
  { text: 'state.user.name', cls: '' },
  { text: '"Gurjot" → "John"', cls: 'line-ok' },
  { text: '', cls: '' },
  { text: 'Location:', cls: 'line-dim' },
  { text: 'app.ts:12', cls: 'line-dim' },
  { text: '', cls: '' },
  { text: '$ await dbg(fetchUser(123), "fetchUser");', cls: 'line-dim' },
  { text: '⏳ pending...', cls: 'line-dim' },
  { text: '✅ resolved (+142ms)', cls: 'line-ok' },
];

async function play() {
  demo.textContent = '';
  for (const frame of frames) {
    const line = document.createElement('div');
    if (frame.cls) line.className = frame.cls;
    line.textContent = frame.text || ' ';
    demo.appendChild(line);
    demo.scrollTop = demo.scrollHeight;
    await new Promise((r) => setTimeout(r, frame.text ? 280 : 120));
  }
}

play();
setInterval(play, 12000);

copyBtn?.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText('npm install lookman');
    copyBtn.textContent = 'Copied';
    setTimeout(() => {
      copyBtn.textContent = 'Copy';
    }, 1200);
  } catch {
    copyBtn.textContent = 'Select & copy';
  }
});
