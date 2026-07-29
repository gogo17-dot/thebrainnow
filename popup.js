let popupEl = null;
let titleEl = null;
let bodyEl = null;
let closeBtn = null;
let onClose = null;

export function initPopup(closeCallback) {
  onClose = closeCallback;
  popupEl = document.getElementById('structure-popup');
  titleEl = document.getElementById('popup-title');
  bodyEl = document.getElementById('popup-body');
  closeBtn = document.getElementById('popup-close');

  if (!popupEl) return;

  closeBtn?.addEventListener('click', () => {
    hidePopup();
    onClose?.();
  });
  popupEl.addEventListener('click', (e) => {
    if (e.target === popupEl) {
      hidePopup();
      onClose?.();
    }
  });
}

export function showPopup(title, description) {
  if (!popupEl || !titleEl || !bodyEl) return;
  titleEl.textContent = title;
  bodyEl.textContent = description;
  popupEl.hidden = false;
}

export function hidePopup() {
  if (!popupEl) return;
  popupEl.hidden = true;
}
