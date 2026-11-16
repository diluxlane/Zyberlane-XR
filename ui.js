/* Zyberlane XR: approachable progressive controls.
 * The WebGL/VR/gyro engine remains in app.js.
 * No analytics, storage, uploads or remote requests are added here.
 */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const dialogs = ['linkDialog', 'settingsDialog', 'helpDialog'].map($).filter(Boolean);
  const viewer = $('theater');
  const projection = $('projection');
  const help = $('modeHelp');

  const supported = element => element && typeof element.showModal === 'function';

  function showDialog(id) {
    const dialog = $(id);
    if (!dialog) return;
    dialogs.forEach(other => { if (other !== dialog && other.open) other.close(); });
    if (supported(dialog)) dialog.showModal();
    else dialog.setAttribute('open', ''); // Graceful legacy rendering, no false modal claim.
    const focusTarget = dialog.querySelector('input,button,select');
    if (focusTarget) focusTarget.focus();
  }
  function closeDialog(id) {
    const dialog = $(id);
    if (!dialog || !dialog.open) return;
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  }
  const openers = [
    ['openHelp', 'helpDialog'], ['openSettings', 'settingsDialog'],
    ['openLink', 'linkDialog'], ['openLinkEmpty', 'linkDialog']
  ];
  for (const [trigger, destination] of openers) {
    $(trigger)?.addEventListener('click', () => showDialog(destination));
  }
  document.querySelectorAll('[data-close-dialog]').forEach(button => {
    button.addEventListener('click', () => closeDialog(button.dataset.closeDialog));
  });
  for (const dialog of dialogs) {
    // Native dialog restores focus to the invoking control on close.
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right ||
          event.clientY < rect.top || event.clientY > rect.bottom) closeDialog(dialog.id);
    });
    dialog.addEventListener('cancel', () => { /* Native Escape behavior. */ });
  }

  // Labels share the same single real file input. Space and Enter work for
  // keyboard visitors, without a second invisible file picker or upload.
  for (const label of document.querySelectorAll('label[for="localFile"][tabindex]')) {
    label.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      $('localFile').click();
    });
  }
  $('localFile')?.addEventListener('change', () => {
    if (!$('localFile').files?.length) return;
    // Existing app.js handles the chosen file and retains the object-URL privacy model.
    closeDialog('linkDialog');
  });

  const validDirectUrl = value => {
    try {
      const u = new URL(value.trim());
      return u.protocol === 'https:' ||
        (u.protocol === 'http:' && /^(localhost|127\.0\.0\.1)$/.test(u.hostname));
    } catch { return false; }
  };
  function maybeCloseLink() {
    const input = $('videoUrl');
    const feedback = $('linkError');
    if (!input || !feedback) return;
    const valid = validDirectUrl(input.value);
    feedback.hidden = valid;
    feedback.textContent = valid ? '' : 'Enter a direct HTTPS video URL. Regular website and YouTube watch links cannot be opened here.';
    if (valid) closeDialog('linkDialog');
  }
  $('videoUrl')?.addEventListener('input', () => {
    const feedback = $('linkError');
    if (feedback) { feedback.hidden = true; feedback.textContent = ''; }
  });
  // Registered after app.js, so it never replaces its actual URL validation.
  $('loadUrl')?.addEventListener('click', maybeCloseLink);
  $('videoUrl')?.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      maybeCloseLink(); // The app.js listener performs the actual loading.
    }
  });

  function updateModeHelp() {
    const mode = projection.value;
    const prompts = {
      cinema: 'Normal video is best for everyday footage. Choose 180° or 360° only if your video was recorded that way.',
      '360': '360° video lets you look around the whole scene. Drag inside the viewer, or enable supported phone motion.',
      '180': '180° video shows the world in front of you. Drag the viewer or enable supported phone motion.'
    };
    help.textContent = prompts[mode] || prompts.cinema;
    document.documentElement.dataset.xrMode = mode;
  }
  projection?.addEventListener('change', updateModeHelp);
  updateModeHelp();

  // Status feedback is kept in the visible player area, never trapped in an
  // invisible modal or buried beneath a long marketing page.
  $('sourceVideo')?.addEventListener('loadedmetadata', () => {
    const file = $('localFile').files?.[0];
    if (file) $('changeVideo')?.setAttribute('aria-label', 'Change video file: ' + file.name);
  });
  if (viewer) {
    // Leaving the application to use the Back key remains possible in both
    // native and CSS-only fullscreen, per the existing app.js behavior.
    viewer.addEventListener('dblclick', event => {
      if (event.target.closest('button,label,input,select')) return;
      // Do not hijack double taps; device browsers handle gesture zoom.
    });
  }
})();
