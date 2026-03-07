const CRT_MODE_STORAGE_KEY = 'crt-mode';
const CRT_UNLOCKED_STORAGE_KEY = 'crt-unlocked';
const CHEAT_CODE_SEQUENCE = [
  'arrowup',
  'arrowup',
  'arrowdown',
  'arrowdown',
  'arrowleft',
  'arrowright',
  'arrowleft',
  'arrowright',
  'b',
  'a',
];

/**
 * Adds CRT cheat mode controls:
 * - Cheat code sequence unlock + activation
 * - persists unlocked/mode in localStorage
 * - header toggle
 */
function initCrtMode() {
  let cheatCodeProgress = 0;
  let unlocked = localStorage.getItem(CRT_UNLOCKED_STORAGE_KEY) === 'true';

  const crtToggle = document.getElementById('crt-toggle');
  const crtOnIcon = crtToggle?.querySelector('.crt-on');
  const crtOffIcon = crtToggle?.querySelector('.crt-off');

  const setUnlocked = (value) => {
    unlocked = value;
    localStorage.setItem(CRT_UNLOCKED_STORAGE_KEY, value ? 'true' : 'false');
    if (crtToggle) crtToggle.hidden = !value;
  };

  const syncCrtToggle = () => {
    if (!crtToggle) return;

    const isEnabled = document.body.classList.contains('crt-mode');
    crtToggle.setAttribute('aria-pressed', String(isEnabled));
    crtToggle.setAttribute(
      'aria-label',
      isEnabled ? 'Disable CRT cheat mode' : 'Enable CRT cheat mode',
    );

    if (crtOnIcon instanceof SVGElement) {
      crtOnIcon.style.display = isEnabled ? 'inline' : 'none';
    }
    if (crtOffIcon instanceof SVGElement) {
      crtOffIcon.style.display = isEnabled ? 'none' : 'inline';
    }
  };

  const setCrtMode = (enabled) => {
    document.body.classList.toggle('crt-mode', enabled);
    localStorage.setItem(CRT_MODE_STORAGE_KEY, enabled ? 'true' : 'false');
    syncCrtToggle();
  };

  const toggleCrtMode = () => {
    if (!unlocked) return;
    setCrtMode(!document.body.classList.contains('crt-mode'));
  };

  // Restore persisted state before wiring interactions.
  setUnlocked(unlocked);
  const savedCrtMode = localStorage.getItem(CRT_MODE_STORAGE_KEY) === 'true';
  setCrtMode(unlocked && savedCrtMode);

  crtToggle?.addEventListener('click', toggleCrtMode);

  // Listen for cheat code sequence
  document.addEventListener('keydown', (event) => {
    const target = event.target;
    if (
      target instanceof HTMLElement &&
      (target.isContentEditable ||
        /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
    ) {
      return;
    }

    const key = event.key.toLowerCase();
    const expected = CHEAT_CODE_SEQUENCE[cheatCodeProgress];

    if (key === expected) {
      cheatCodeProgress += 1;
      if (cheatCodeProgress === CHEAT_CODE_SEQUENCE.length) {
        setUnlocked(true);
        setCrtMode(true);
        cheatCodeProgress = 0;
      }
      return;
    }

    cheatCodeProgress = key === CHEAT_CODE_SEQUENCE[0] ? 1 : 0;
  });
}

initCrtMode();
