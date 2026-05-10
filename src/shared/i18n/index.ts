import { computed, ref } from 'vue';
import { messages, type MessageKey } from '@/shared/i18n/messages';
import type { Language } from '@/shared/types/models';

type Replacements = Record<string, string | number>;

const locale = ref<Language>('en');

export function setLocale(value: Language) {
  locale.value = value;
  document.documentElement.lang = value;
}

export function getLocale(): Language {
  return locale.value;
}

export function translate(key: MessageKey, replacements: Replacements = {}, language = locale.value): string {
  const template = messages[language][key] ?? messages.en[key] ?? key;
  return applyReplacements(template, replacements);
}

export function useI18n() {
  return {
    locale: computed(() => locale.value),
    t: translate,
  };
}

function applyReplacements(template: string, replacements: Replacements): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = replacements[key];
    return value === undefined ? match : String(value);
  });
}
