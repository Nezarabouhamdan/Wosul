/** Runs on every page: language switch, mobile menu, services menu and header state. */
import type { Language } from '../shared/catalog.ts';
import { currentLanguage, element, elements, LANGUAGE_CHANGE } from './dom.ts';

const STORAGE_KEY = 'wosul-language';

// Storage can be unavailable (private mode, blocked cookies); Arabic is the default.
function storedLanguage(): Language {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'ar';
  } catch {
    return 'ar';
  }
}

function rememberLanguage(language: Language): void {
  try {
    localStorage.setItem(STORAGE_KEY, language);
  } catch {
    // Not remembered; the switch still works for this page view.
  }
}

/**
 * Pages are rendered in Arabic. Every translatable element (including <title>)
 * carries data-ar / data-en, so switching swaps those in place.
 */
function applyLanguage(language: Language): void {
  const root = document.documentElement;
  root.lang = language;
  root.dir = language === 'ar' ? 'rtl' : 'ltr';

  for (const el of elements('[data-ar][data-en]')) {
    el.innerHTML = el.dataset[language] ?? '';
  }
  for (const field of elements<HTMLInputElement | HTMLTextAreaElement>('[data-placeholder-ar]')) {
    field.placeholder = (language === 'ar' ? field.dataset.placeholderAr : field.dataset.placeholderEn) ?? '';
  }

  const toggle = element('#language');
  toggle.textContent = language === 'ar' ? 'EN' : 'عربي';
  toggle.setAttribute('aria-label', language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية');

  document.dispatchEvent(new CustomEvent(LANGUAGE_CHANGE, { detail: { language } }));
}

function setUpLanguageSwitch(): void {
  element('#language').addEventListener('click', () => {
    const language = currentLanguage() === 'ar' ? 'en' : 'ar';
    rememberLanguage(language);
    applyLanguage(language);
  });
  if (storedLanguage() === 'en') applyLanguage('en');
}

function setUpMenu(): void {
  const menu = element('#menu');
  const navigation = element('#navigation');
  const setOpen = (open: boolean) => {
    menu.setAttribute('aria-expanded', String(open));
    navigation.classList.toggle('is-open', open);
  };

  menu.addEventListener('click', () => setOpen(menu.getAttribute('aria-expanded') !== 'true'));
  for (const link of elements('a', navigation)) link.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setOpen(false);
  });
  document.addEventListener('pointerdown', (event) => {
    if (event.target instanceof Element && !event.target.closest('.header')) setOpen(false);
  });
}

/** On desktop, hovering also opens the menu (CSS); this handles click, keyboard and closing. */
function setUpServicesMenu(): void {
  const group = element('.nav-services');
  const toggle = element('#services-toggle');
  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';
  const setOpen = (open: boolean) => toggle.setAttribute('aria-expanded', String(open));

  toggle.addEventListener('click', () => setOpen(!isOpen()));
  group.addEventListener('focusout', (event) => {
    if (!(event.relatedTarget instanceof Node && group.contains(event.relatedTarget))) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  });
  document.addEventListener('pointerdown', (event) => {
    if (event.target instanceof Node && !group.contains(event.target)) setOpen(false);
  });
}

function setUpHeaderBackground(): void {
  const header = element('.header');
  const update = () => header.classList.toggle('is-scrolled', scrollY > 24);
  addEventListener('scroll', update, { passive: true });
  update();
}

setUpLanguageSwitch();
setUpMenu();
setUpServicesMenu();
setUpHeaderBackground();
