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
  background: rgba(16, 24, 40, 0.14);
  padding: 24px;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  overscroll-behavior: none;
}

.power-tab-switcher {
  width: min(1200px, 100%);
  height: min(82vh, 800px);
  max-height: min(82vh, 800px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(220, 225, 239, 0.25);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.97);
  color: #101828;
  box-shadow: 0 24px 64px rgba(16, 24, 40, 0.12);
  backdrop-filter: blur(10px) saturate(115%);
  -webkit-backdrop-filter: blur(10px) saturate(115%);
  padding: 20px 20px 24px;
  font-weight: 450;
  overscroll-behavior: contain;
}

.power-tab-switcher__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 10px;
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
  gap: 8px;
  align-items: stretch;
  margin-bottom: 10px;
}

.power-tab-switcher__toolbar:has(.power-tab-switcher__previous[hidden]) {
  grid-template-columns: 1fr;
}

.power-tab-switcher__search {
  min-width: 0;
  min-height: 38px;
  display: grid;
  grid-template-columns: 14px minmax(0, 1fr) auto;
  gap: 9px;
  align-items: center;
  border: 1px solid rgba(220, 225, 239, 0.46);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.56);
  padding: 0 11px;
}

.power-tab-switcher__search:focus-within {
  border-color: rgba(106, 92, 255, 0.24);
  background: rgba(255, 255, 255, 0.76);
  box-shadow: 0 0 0 2px rgba(106, 92, 255, 0.055);
}

.power-tab-switcher__search-icon {
  position: relative;
  width: 14px;
  height: 14px;
  color: #94a3b8;
}

.power-tab-switcher__search-icon::before {
  content: '';
  position: absolute;
  left: 1px;
  top: 1px;
  width: 8px;
  height: 8px;
  border: 1.7px solid currentColor;
  border-radius: 999px;
}

.power-tab-switcher__search-icon::after {
  content: '';
  position: absolute;
  left: 9px;
  top: 10px;
  width: 5px;
  height: 1.7px;
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
  font-size: 12px;
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
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.62);
  color: #101828;
  padding: 6px 10px;
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
  margin-bottom: 2px;
  color: #6a5cff;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.power-tab-switcher__previous-main {
  min-width: 0;
  display: grid;
  grid-template-columns: 20px minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
}

.power-tab-switcher__previous-favicon {
  width: 20px;
  height: 20px;
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
  font-size: 10px;
  font-weight: 700;
}

.power-tab-switcher__previous-subtitle {
  color: #64748b;
  font-size: 9px;
}

.power-tab-switcher__previous-key {
  color: #94a3b8;
  font-size: 9px;
  font-weight: 700;
  white-space: nowrap;
}

.power-tab-switcher__list {
  min-height: 0;
  flex: 1 1 auto;
  overflow: auto;
  align-content: start;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
  gap: 10px;
  padding-right: 4px;
  overscroll-behavior: contain;
}

.power-tab-switcher__item {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  contain: layout paint style;
  min-width: 0;
  height: 76px;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: center;
  border: 1px solid rgba(220, 225, 239, 0.35);
  border-radius: 12px;
  background: #ffffff;
  padding: 12px 12px 12px 14px;
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
  inset: 0 auto 0 0;
  width: 4px;
  border-radius: 999px 0 0 999px;
  background: #6a5cff;
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
  grid-template-columns: 28px minmax(0, 1fr) 24px;
  grid-template-rows: auto auto;
  align-items: center;
  column-gap: 10px;
  row-gap: 4px;
}

.power-tab-switcher__subtitle {
  grid-column: 2 / 3;
  grid-row: 2;
  min-width: 0;
}

.power-tab-switcher__close {
  grid-column: 3;
  grid-row: 1 / 3;
  align-self: center;
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
  border-color: rgba(106, 92, 255, 0.18);
  background: rgba(255, 255, 255, 0.96);
}

.power-tab-switcher__item--current {
  background: #f8f7ff;
}

.power-tab-switcher__item--current::before {
  opacity: 1;
}

.power-tab-switcher__item--current .power-tab-switcher__title::after {
  content: attr(data-current-label);
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
  background: #f6f5ff;
  box-shadow: 0 10px 24px rgba(106, 92, 255, 0.07);
}

.power-tab-switcher__item--preview::after {
  opacity: 1;
}

.power-tab-switcher__item--current.power-tab-switcher__item--preview {
  border-color: rgba(106, 92, 255, 0.54);
}

.power-tab-switcher__item--current.power-tab-switcher__item--preview::before {
  opacity: 1;
  background: #6a5cff;
}

.power-tab-switcher__item--current.power-tab-switcher__item--preview::after {
  opacity: 1;
  box-shadow: 0 10px 22px rgba(106, 92, 255, 0.1);
}

.power-tab-switcher__favicon-shell {
  grid-column: 1;
  grid-row: 1 / 3;
  align-self: center;
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.power-tab-switcher__title {
  grid-column: 2;
  grid-row: 1;
  min-width: 0;
  width: 100%;
  font-size: 13px;
  line-height: 1.25;
  font-weight: 600;
  color: #101828;
}

.power-tab-switcher__subtitle {
  color: #64748b;
  font-size: 11px;
  line-height: 1.3;
}

.power-tab-switcher__empty {
  flex: 1 1 auto;
  display: grid;
  place-items: center;
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
