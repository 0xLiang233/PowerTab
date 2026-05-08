export const QUICK_TAB_SWITCHER_CSS = `
#power-tab-quick-tab-switcher-root {
  all: initial;
  --power-tab-scrollbar-size: 8px;
  --power-tab-scrollbar-thumb: rgba(128, 139, 171, 0.2);
  --power-tab-scrollbar-thumb-hover: rgba(128, 139, 171, 0.35);
  --power-tab-scrollbar-thumb-active: rgba(128, 139, 171, 0.5);
  --power-tab-scrollbar-track: transparent;
}

#power-tab-quick-tab-switcher-root,
#power-tab-quick-tab-switcher-root * {
  box-sizing: border-box;
  font-family: 'Plus Jakarta Sans', Geist, system-ui, -apple-system, sans-serif;
  scrollbar-width: thin;
  scrollbar-color: var(--power-tab-scrollbar-thumb) var(--power-tab-scrollbar-track);
}

#power-tab-quick-tab-switcher-root [hidden] {
  display: none !important;
}

#power-tab-quick-tab-switcher-root *::-webkit-scrollbar {
  width: var(--power-tab-scrollbar-size);
  height: var(--power-tab-scrollbar-size);
}

#power-tab-quick-tab-switcher-root *::-webkit-scrollbar-track {
  background: transparent;
}

#power-tab-quick-tab-switcher-root *::-webkit-scrollbar-thumb {
  min-height: 44px;
  border: 2px solid transparent;
  border-radius: 999px;
  background: var(--power-tab-scrollbar-thumb);
  background-clip: padding-box;
}

#power-tab-quick-tab-switcher-root *::-webkit-scrollbar-thumb:hover {
  background: var(--power-tab-scrollbar-thumb-hover);
  background-clip: padding-box;
}

#power-tab-quick-tab-switcher-root *::-webkit-scrollbar-thumb:active {
  background: var(--power-tab-scrollbar-thumb-active);
  background-clip: padding-box;
}

#power-tab-quick-tab-switcher-root *::-webkit-scrollbar-corner {
  background: transparent;
}

.power-tab-switcher__backdrop {
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  display: grid;
  place-items: center;
  background: rgba(16, 24, 40, 0.08);
  padding: 24px;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.power-tab-switcher {
  width: min(1200px, 100%);
  max-height: min(82vh, 800px);
  overflow: auto;
  border: 1px solid rgba(220, 225, 239, 0.25);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.88);
  color: #101828;
  box-shadow: 0 24px 64px rgba(16, 24, 40, 0.12);
  backdrop-filter: blur(24px) saturate(160%);
  -webkit-backdrop-filter: blur(24px) saturate(160%);
  padding: 20px 20px 24px;
  font-weight: 450;
}

.power-tab-switcher__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 14px;
}

.power-tab-switcher__label {
  color: #6a5cff;
  text-transform: uppercase;
  letter-spacing: 0.11em;
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
}

.power-tab-switcher__hint {
  color: #94a3b8;
  font-size: 11px;
  line-height: 1.35;
  text-align: right;
  white-space: nowrap;
}

.power-tab-switcher__toolbar {
  display: grid;
  grid-template-columns: minmax(280px, 1fr) minmax(250px, 300px);
  gap: 10px;
  align-items: stretch;
  margin-bottom: 12px;
}

.power-tab-switcher__toolbar:has(.power-tab-switcher__previous[hidden]) {
  grid-template-columns: 1fr;
}

.power-tab-switcher__search {
  min-width: 0;
  min-height: 44px;
  display: grid;
  grid-template-columns: 16px minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  border: 1px solid rgba(220, 225, 239, 0.46);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.56);
  padding: 0 13px;
}

.power-tab-switcher__search:focus-within {
  border-color: rgba(106, 92, 255, 0.24);
  background: rgba(255, 255, 255, 0.76);
  box-shadow: 0 0 0 2px rgba(106, 92, 255, 0.055);
}

.power-tab-switcher__search-icon {
  position: relative;
  width: 15px;
  height: 15px;
  color: #94a3b8;
}

.power-tab-switcher__search-icon::before {
  content: '';
  position: absolute;
  left: 1px;
  top: 1px;
  width: 9px;
  height: 9px;
  border: 1.8px solid currentColor;
  border-radius: 999px;
}

.power-tab-switcher__search-icon::after {
  content: '';
  position: absolute;
  left: 10px;
  top: 11px;
  width: 6px;
  height: 1.8px;
  border-radius: 999px;
  background: currentColor;
  transform: rotate(45deg);
  transform-origin: left center;
}

.power-tab-switcher__search-input {
  min-width: 0;
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: #101828;
  font: inherit;
  font-size: 13px;
  line-height: 1.4;
}

.power-tab-switcher__search-input::placeholder {
  color: rgba(100, 116, 139, 0.72);
}

.power-tab-switcher__search-count {
  color: #94a3b8;
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
}

.power-tab-switcher__previous {
  min-width: 0;
  border: 1px solid rgba(220, 225, 239, 0.48);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.62);
  color: #101828;
  padding: 7px 11px;
  text-align: left;
  cursor: pointer;
}

.power-tab-switcher__previous:hover,
.power-tab-switcher__previous:focus-visible {
  border-color: rgba(106, 92, 255, 0.42);
  outline: none;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 0 0 3px rgba(106, 92, 255, 0.08);
}

.power-tab-switcher__previous-label {
  display: block;
  margin-bottom: 3px;
  color: #6a5cff;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.power-tab-switcher__previous-main {
  min-width: 0;
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr) auto;
  gap: 9px;
  align-items: center;
}

.power-tab-switcher__previous-favicon {
  width: 22px;
  height: 22px;
  display: block;
}

.power-tab-switcher__previous-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.power-tab-switcher__previous-title,
.power-tab-switcher__previous-subtitle {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.power-tab-switcher__previous-title {
  color: #101828;
  font-size: 11px;
  font-weight: 700;
}

.power-tab-switcher__previous-subtitle {
  color: #64748b;
  font-size: 10px;
}

.power-tab-switcher__previous-key {
  color: #94a3b8;
  font-size: 9px;
  font-weight: 700;
  white-space: nowrap;
}

.power-tab-switcher__list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 12px;
}

.power-tab-switcher__item {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  contain: layout paint style;
  min-width: 0;
  min-height: 128px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  border: 1px solid rgba(220, 225, 239, 0.35);
  border-radius: 14px;
  background: #ffffff;
  padding: 14px;
  color: inherit;
  text-align: left;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.01);
  cursor: pointer;
}

.power-tab-switcher__item::marker {
  content: '';
}

.power-tab-switcher__item::before,
.power-tab-switcher__item::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.06s ease-out;
}

.power-tab-switcher__item::before {
  background: linear-gradient(180deg, rgba(106, 92, 255, 0.08), rgba(106, 92, 255, 0.02));
}

.power-tab-switcher__item::after {
  inset: -1px;
  border: 1px solid rgba(106, 92, 255, 0.5);
  box-shadow: 0 8px 20px rgba(106, 92, 255, 0.06);
}

.power-tab-switcher__headline {
  width: 100%;
  min-width: 0;
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) 24px;
  align-items: start;
  column-gap: 10px;
}

.power-tab-switcher__close {
  width: 24px;
  height: 24px;
  display: inline-grid;
  place-items: center;
  padding: 0;
  margin-top: -2px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  opacity: 0.72;
  transition: opacity 0.06s ease-out, background-color 0.06s ease-out, color 0.06s ease-out;
}

.power-tab-switcher__close:hover,
.power-tab-switcher__close:focus-visible {
  background: rgba(15, 23, 42, 0.06);
  color: #475569;
  opacity: 1;
  outline: none;
}

.power-tab-switcher__close svg {
  width: 14px;
  height: 14px;
  display: block;
}

.power-tab-switcher__item:hover {
  border-color: rgba(106, 92, 255, 0.2);
}

.power-tab-switcher__item--current {
}

.power-tab-switcher__item--current::before {
  opacity: 1;
}

.power-tab-switcher__item--current .power-tab-switcher__title::after {
  content: 'Current';
  display: inline-flex;
  vertical-align: 1px;
  margin-left: 7px;
  padding: 2px 6px;
  border-radius: 999px;
  background: rgba(106, 92, 255, 0.12);
  color: #6a5cff;
  font-size: 9px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0.02em;
}

.power-tab-switcher__item--preview {
  border-color: rgba(106, 92, 255, 0.46);
  box-shadow: 0 10px 26px rgba(106, 92, 255, 0.08);
}

.power-tab-switcher__item--preview::after {
  opacity: 1;
}

.power-tab-switcher__item--current.power-tab-switcher__item--preview {
  border-color: rgba(106, 92, 255, 0.54);
}

.power-tab-switcher__item--current.power-tab-switcher__item--preview::before {
  opacity: 1;
  background: linear-gradient(180deg, rgba(106, 92, 255, 0.12), rgba(106, 92, 255, 0.04));
}

.power-tab-switcher__item--current.power-tab-switcher__item--preview::after {
  opacity: 1;
  box-shadow: 0 10px 22px rgba(106, 92, 255, 0.1);
}

.power-tab-switcher__favicon-shell {
  width: 24px;
  height: 24px;
  display: block;
  flex: 0 0 24px;
}

.power-tab-switcher__favicon {
  width: 24px;
  height: 24px;
  display: block;
  border-radius: 6px;
}

.power-tab-switcher__favicon--fallback {
  display: grid;
  place-items: center;
  color: #6a5cff;
  background: rgba(106, 92, 255, 0.06);
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
}

.power-tab-switcher__title,
.power-tab-switcher__subtitle {
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
}

.power-tab-switcher__title {
  min-width: 0;
  width: 100%;
  -webkit-line-clamp: 2;
  font-size: 14px;
  line-height: 1.35;
  font-weight: 600;
  color: #101828;
}

.power-tab-switcher__subtitle {
  -webkit-line-clamp: 2;
  color: #64748b;
  font-size: 12px;
  line-height: 1.45;
  word-break: break-word;
}

.power-tab-switcher__empty {
  padding: 24px 4px;
  color: #94a3b8;
  font-size: 14px;
  text-align: center;
}

@media (max-width: 1240px) {
  .power-tab-switcher {
    width: min(94vw, 1200px);
  }
}

@media (max-width: 900px) {
  .power-tab-switcher {
    width: min(94vw, 1200px);
  }

  .power-tab-switcher__backdrop {
    padding: 16px;
  }

  .power-tab-switcher__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .power-tab-switcher__hint {
    text-align: left;
    white-space: normal;
  }

  .power-tab-switcher__toolbar {
    grid-template-columns: 1fr;
  }

  .power-tab-switcher__list {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 560px) {
  .power-tab-switcher__list {
    grid-template-columns: 1fr;
  }
}
`;
