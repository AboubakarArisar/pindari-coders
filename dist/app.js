(() => {
  const controller = new AbortController();
  const on = (element, event, callback) => element.addEventListener(event, callback, { signal: controller.signal });
  const $ = (id) => document.getElementById(id);
  const fonts = { sans: 'Inter, Arial, sans-serif', serif: 'Georgia, serif', mono: '"DM Mono", monospace' };
  let previousOverflow = '';
  function updateFlex() {
    const gap = Number($('gap').value);
    $('flex-items').style.justifyContent = $('justify').value;
    $('flex-items').style.gap = `${gap}px`;
    $('gap-value').textContent = `${gap}px`;
    $('flex-code').textContent = `display: flex; gap: ${gap}px;`;
    $('copy-css').textContent = 'copy CSS ↗';
  }
  on($('justify'), 'change', updateFlex);
  on($('gap'), 'input', updateFlex);
  on($('copy-css'), 'click', async () => {
    const code = `.container {\n  display: flex;\n  align-items: center;\n  justify-content: ${$('justify').value};\n  gap: ${$('gap').value}px;\n}`;
    try {
      await navigator.clipboard.writeText(code);
      $('copy-css').textContent = 'copied ✓';
      $('copy-status').textContent = 'CSS copied to clipboard.';
    } catch (error) {
      $('flex-code').textContent = code;
      $('copy-status').textContent = 'Clipboard unavailable. Select and copy the CSS shown below the controls.';
      $('copy-css').textContent = 'select code to copy';
    }
  });
  document.querySelectorAll('[data-open]').forEach(button => on(button, 'click', () => {
    previousOverflow = document.body.style.overflow;
    $(button.dataset.open).showModal();
    document.body.style.overflow = 'hidden';
  }));
  document.querySelectorAll('dialog').forEach(dialog => {
    on(dialog.querySelector('.dialog-close'), 'click', () => dialog.close());
    on(dialog, 'close', () => { document.body.style.overflow = previousOverflow; });
    on(dialog, 'click', event => {
      const bounds = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
    });
  });
  function updateType() {
    const size = Number($('type-size').value);
    const tracking = Number($('type-tracking').value);
    $('type-preview').textContent = $('type-text').value || 'your words go here.';
    $('type-preview').style.fontFamily = fonts[$('type-font').value];
    $('type-preview').style.fontSize = `${size}px`;
    $('type-preview').style.letterSpacing = `${tracking}px`;
    $('type-size-value').textContent = `${size}px`;
    $('type-tracking-value').textContent = `${tracking}px`;
    $('type-code').textContent = `font-family: ${fonts[$('type-font').value]}; font-size: ${size}px; letter-spacing: ${tracking}px;`;
  }
  ['type-text', 'type-font', 'type-size', 'type-tracking'].forEach(id => on($(id), 'input', updateType));
  function luminance(hex) {
    const linear = hex.match(/[a-f\d]{2}/gi).map(channel => {
      const value = parseInt(channel, 16) / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
  }
  function contrast(first, second) {
    const light = luminance(first), dark = luminance(second);
    return (Math.max(light, dark) + 0.05) / (Math.min(light, dark) + 0.05);
  }
  function updateColor() {
    const foreground = $('foreground').value, background = $('background').value;
    $('foreground-value').textContent = foreground;
    $('background-value').textContent = background;
    $('contrast-preview').style.color = foreground;
    $('contrast-preview').style.backgroundColor = background;
    const ratio = contrast(foreground, background);
    $('contrast-ratio').textContent = `${ratio.toFixed(2)}:1`;
    $('contrast-verdict').textContent = ratio >= 4.5 ? '✓ Passes AA for normal and large text' : ratio >= 3 ? 'Passes AA for large text only' : 'Low contrast — try a lighter or darker color';
  }
  ['foreground', 'background'].forEach(id => on($(id), 'input', updateColor));
  updateFlex(); updateType(); updateColor();
  if (document.modelContext?.registerTool) {
    const tool = {
      name: 'configure_flex_playground',
      description: 'Set alignment and gap in the visible Flexbox playground. Does not save or send data.',
      inputSchema: { type: 'object', properties: { justify: { type: 'string', enum: ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'] }, gap: { type: 'integer', minimum: 0, maximum: 32 } }, required: ['justify', 'gap'], additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) {
        const allowed = [...$('justify').options].map(option => option.value);
        if (!input || typeof input !== 'object' || Object.keys(input).some(key => !['justify', 'gap'].includes(key)) || !allowed.includes(input.justify) || !Number.isInteger(input.gap) || input.gap < 0 || input.gap > 32) throw new Error('Provide a supported justify value and an integer gap from 0 to 32.');
        $('justify').value = input.justify;
        $('gap').value = String(input.gap);
        updateFlex();
        return { justify: $('justify').value, gap: Number($('gap').value) };
      }
    };
    try {
      Promise.resolve(document.modelContext.registerTool(tool, { signal: controller.signal })).catch(error => console.warn('Playground agent tool registration failed:', error));
    } catch (error) {
      console.warn('Playground agent tool is unavailable:', error);
    }
  }
  // Small regression check for the contrast tool's two mathematical endpoints.
  console.assert(contrast('#000000', '#ffffff') === 21 && contrast('#ffffff', '#ffffff') === 1, 'Contrast calculation failed');
  on(window, 'pagehide', event => { if (!event.persisted) controller.abort(); });
})();
