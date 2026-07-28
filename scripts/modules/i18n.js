(function () {
    'use strict';

    const TRANSLATIONS = window.I18N_TRANSLATIONS || {};
    const SUPPORTED_LANGUAGES = Object.keys(TRANSLATIONS);
    const STORAGE_KEY = 'sheet2yaml_language';
    const DEFAULT_LANG = 'en';
    const LANGUAGE_LABELS = {
        en: 'English',
        'zh-TW': '繁體中文'
    };

    let currentLang = DEFAULT_LANG;
    const listeners = [];

    function resolveBrowserLanguage() {
        const candidates = [];
        if (Array.isArray(navigator.languages)) {
            candidates.push(...navigator.languages);
        }
        if (navigator.language) {
            candidates.push(navigator.language);
        }

        for (const raw of candidates) {
            if (!raw) continue;
            if (SUPPORTED_LANGUAGES.includes(raw)) return raw;
            const base = raw.split('-')[0];
            if (base === 'zh') {
                if (SUPPORTED_LANGUAGES.includes('zh-TW')) return 'zh-TW';
            }
            const exactBase = SUPPORTED_LANGUAGES.find((lang) => lang === base || lang.startsWith(base + '-'));
            if (exactBase) return exactBase;
        }
        return DEFAULT_LANG;
    }

    function detectLanguage() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && SUPPORTED_LANGUAGES.includes(saved)) {
            return saved;
        }
        if (SUPPORTED_LANGUAGES.length === 0) {
            return DEFAULT_LANG;
        }
        return resolveBrowserLanguage();
    }

    function t(key) {
        const dict = TRANSLATIONS[currentLang] || {};
        if (Object.prototype.hasOwnProperty.call(dict, key)) {
            return dict[key];
        }
        const fallback = TRANSLATIONS[DEFAULT_LANG] || {};
        if (Object.prototype.hasOwnProperty.call(fallback, key)) {
            return fallback[key];
        }
        return key;
    }

    function applyTranslations() {
        document.documentElement.lang = currentLang;

        document.querySelectorAll('[data-i18n]').forEach((el) => {
            const key = el.getAttribute('data-i18n');
            if (key) el.textContent = t(key);
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (key) el.setAttribute('placeholder', t(key));
        });

        document.querySelectorAll('[data-i18n-title]').forEach((el) => {
            const key = el.getAttribute('data-i18n-title');
            if (key) el.setAttribute('title', t(key));
        });

        const titleEl = document.querySelector('title[data-i18n]');
        if (titleEl) {
            document.title = t(titleEl.getAttribute('data-i18n'));
        } else if (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang]['page.title']) {
            document.title = t('page.title');
        }

        const select = document.getElementById('language-select');
        if (select) {
            select.value = currentLang;
        }
    }

    function notifyListeners() {
        listeners.forEach((cb) => {
            try {
                cb(currentLang);
            } catch (err) {
                console.error(err);
            }
        });
    }

    function setLanguage(lang) {
        if (!SUPPORTED_LANGUAGES.includes(lang)) return;
        currentLang = lang;
        localStorage.setItem(STORAGE_KEY, lang);
        applyTranslations();
        notifyListeners();
    }

    function getLanguage() {
        return currentLang;
    }

    function onLanguageChange(callback) {
        if (typeof callback === 'function') {
            listeners.push(callback);
        }
    }

    function populateLanguageSelect() {
        const select = document.getElementById('language-select');
        if (!select) return;

        select.innerHTML = '';
        SUPPORTED_LANGUAGES.forEach((lang) => {
            const option = document.createElement('option');
            option.value = lang;
            option.textContent = LANGUAGE_LABELS[lang] || lang;
            select.appendChild(option);
        });
        select.value = currentLang;

        select.addEventListener('change', () => {
            setLanguage(select.value);
        });
    }

    function initI18n() {
        currentLang = detectLanguage();
        populateLanguageSelect();
        applyTranslations();
    }

    window.I18n = {
        t: t,
        setLanguage: setLanguage,
        getLanguage: getLanguage,
        onLanguageChange: onLanguageChange,
        applyTranslations: applyTranslations,
        initI18n: initI18n,
        SUPPORTED_LANGUAGES: SUPPORTED_LANGUAGES
    };
})();
