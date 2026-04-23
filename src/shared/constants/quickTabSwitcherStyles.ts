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
  margin-bottom: 16px;
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

.power-tab-switcher__list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 12px;
}

.power-tab-switcher__item {
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
  transition: all 0.15s ease;
  cursor: pointer;
}

.power-tab-switcher__headline {
  width: 100%;
  min-width: 0;
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr);
  align-items: center;
  column-gap: 10px;
}

.power-tab-switcher__item:hover {
  transform: translateY(-1px);
  border-color: rgba(106, 92, 255, 0.15);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.power-tab-switcher__item--active {
  transform: translateY(-1.5px);
  border-color: #6a5cff;
  background: #ffffff;
  box-shadow: 0 0 0 2px rgba(106, 92, 255, 0.1), 0 8px 20px rgba(106, 92, 255, 0.08);
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
