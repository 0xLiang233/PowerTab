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
  background: rgba(15, 12, 10, 0.26);
  padding: 28px;
}

.power-tab-switcher {
  width: min(1040px, 100%);
  max-height: min(78vh, 760px);
  overflow: auto;
  border: 1px solid rgba(229, 221, 209, 0.9);
  border-radius: 24px;
  background: rgba(255, 253, 249, 0.98);
  color: #1f1915;
  box-shadow: 0 28px 70px rgba(15, 12, 10, 0.22);
  padding: 18px 18px 20px;
}

.power-tab-switcher__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.power-tab-switcher__label {
  color: #b66a38;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 13px;
  font-weight: 700;
}

.power-tab-switcher__hint {
  color: #7d7168;
  font-size: 13px;
  line-height: 1.4;
  text-align: right;
}

.power-tab-switcher__list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 14px;
}

.power-tab-switcher__item {
  min-height: 168px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
  border: 1px solid rgba(229, 221, 209, 0.92);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.9);
  padding: 18px;
  color: inherit;
  text-align: left;
  box-shadow: 0 12px 28px rgba(31, 25, 21, 0.06);
}

.power-tab-switcher__item--active {
  border-color: rgba(182, 106, 56, 0.44);
  background: rgba(182, 106, 56, 0.1);
  box-shadow: 0 0 0 3px rgba(182, 106, 56, 0.12), 0 18px 36px rgba(31, 25, 21, 0.08);
}

.power-tab-switcher__favicon-shell {
  width: 32px;
  height: 32px;
  display: block;
}

.power-tab-switcher__favicon {
  width: 32px;
  height: 32px;
  display: block;
  flex: 0 0 32px;
  border-radius: 9px;
}

.power-tab-switcher__favicon--fallback {
  display: grid;
  place-items: center;
  color: #b66a38;
  font-size: 28px;
  line-height: 1;
}

.power-tab-switcher__meta {
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  font-size: 16px;
  line-height: 1.4;
  font-weight: 600;
}

.power-tab-switcher__subtitle {
  -webkit-line-clamp: 2;
  color: #7d7168;
  font-size: 13px;
  line-height: 1.5;
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
