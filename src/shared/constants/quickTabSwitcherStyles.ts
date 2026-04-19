export const QUICK_TAB_SWITCHER_CSS = `
#power-tab-quick-tab-switcher-root {
  all: initial;
}

#power-tab-quick-tab-switcher-root,
#power-tab-quick-tab-switcher-root * {
  box-sizing: border-box;
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

#power-tab-quick-tab-switcher-root [hidden] {
  display: none !important;
}

.power-tab-switcher__backdrop {
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  display: grid;
  place-items: center;
  background: rgba(15, 12, 10, 0.1);
  padding: 24px;
}

.power-tab-switcher {
  width: min(980px, 100%);
  max-height: min(76vh, 700px);
  overflow: auto;
  border: 1px solid rgba(229, 221, 209, 0.62);
  border-radius: 22px;
  background: rgba(255, 253, 249, 0.66);
  color: #1f1915;
  box-shadow: 0 24px 56px rgba(15, 12, 10, 0.14);
  backdrop-filter: blur(22px) saturate(135%);
  -webkit-backdrop-filter: blur(22px) saturate(135%);
  padding: 16px 16px 18px;
}

.power-tab-switcher__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 12px;
}

.power-tab-switcher__label {
  color: #b66a38;
  text-transform: uppercase;
  letter-spacing: 0.11em;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.power-tab-switcher__hint {
  color: #7d7168;
  font-size: 12px;
  line-height: 1.35;
  text-align: right;
  white-space: nowrap;
}

.power-tab-switcher__list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.power-tab-switcher__item {
  min-height: 138px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  border: 1px solid rgba(229, 221, 209, 0.86);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.76);
  padding: 14px;
  color: inherit;
  text-align: left;
  box-shadow: 0 10px 22px rgba(31, 25, 21, 0.045);
  transition: border-color 140ms ease, background 140ms ease, box-shadow 140ms ease, transform 140ms ease;
}

.power-tab-switcher__item:hover {
  border-color: rgba(182, 106, 56, 0.26);
  background: rgba(255, 250, 245, 0.84);
  box-shadow: 0 12px 24px rgba(31, 25, 21, 0.055);
  transform: translateY(-1px);
}

.power-tab-switcher__item--active {
  border-color: rgba(182, 106, 56, 0.34);
  background: rgba(255, 248, 241, 0.88);
  box-shadow: 0 0 0 2px rgba(182, 106, 56, 0.1), 0 14px 26px rgba(31, 25, 21, 0.06);
  transform: translateY(-1px);
}

.power-tab-switcher__favicon-shell {
  width: 26px;
  height: 26px;
  display: block;
}

.power-tab-switcher__favicon {
  width: 26px;
  height: 26px;
  display: block;
  flex: 0 0 26px;
  border-radius: 8px;
}

.power-tab-switcher__favicon--fallback {
  display: grid;
  place-items: center;
  color: #b66a38;
  font-size: 22px;
  line-height: 1;
}

.power-tab-switcher__meta {
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.power-tab-switcher__title,
.power-tab-switcher__subtitle {
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
}

.power-tab-switcher__title {
  -webkit-line-clamp: 3;
  font-size: 14px;
  line-height: 1.32;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.power-tab-switcher__subtitle {
  -webkit-line-clamp: 2;
  color: #7d7168;
  font-size: 12px;
  line-height: 1.45;
  word-break: break-word;
}

.power-tab-switcher__empty {
  padding: 18px 4px 4px;
  color: #7d7168;
  font-size: 14px;
}

@media (max-width: 900px) {
  .power-tab-switcher {
    width: min(760px, 100%);
  }

  .power-tab-switcher__list {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
}

@media (max-width: 700px) {
  .power-tab-switcher__backdrop {
    padding: 16px;
  }

  .power-tab-switcher__header {
    flex-direction: column;
    align-items: flex-start;
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
