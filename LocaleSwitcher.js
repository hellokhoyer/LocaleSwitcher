/*!
 *
 *   LocaleSwitcher - A Custom Web Component for localization.
 *   Author: Abul Khoyer <abulkhoyer.com>
 *   Version: v1.0.0
 *   License(s): MIT
 *
 */

/**
 * Shared Locale Configuration
 * @type {Object}
 * @property {string[]} locales - The supported languages.
 * @property {string} defaultLocale - The default language for the site.
 * @property {string} path - The URL path for loading the language JSON files.
 */
const LocaleConfig = {
  locales: ["en"],
  defaultLocale: "en",
  path: "/locales/{locale}.json",
};

/**
 * <locale-switcher>
 * A custom element for switching between languages.
 * It manages locale settings and provides an dropdown for the user to select the language.
 */
class LocaleSwitcher extends HTMLElement {
  #select;

  /**
   * Configure the locales and default locale for the component
   * @param {Object} options Configuration options.
   * @param {string[]} options.locales - List of available locales.
   * @param {string} options.defaultLocale - The default locale to use.
   * @param {string} options.path - Path to fetch locale files.
   */
  static configure({ locales, defaultLocale, path }) {
    LocaleConfig.locales = locales;
    LocaleConfig.defaultLocale = defaultLocale;
    if (path) LocaleConfig.path = path;
  }

  /**
   * Retrieve the current locale from localStorage, the HTML `lang` attribute, or fallback to the default.
   * @returns {string} The current locale.
   */
  #getLocale() {
    return (
      localStorage.getItem("locale") ||
      document.documentElement.getAttribute("lang") ||
      navigator.language?.split("-")[0] ||
      LocaleConfig.defaultLocale
    );
  }

  /**
   * Save the selected locale in localStorage.
   * @param {string} locale The selected locale.
   */
  #saveLocale(locale) {
    localStorage.setItem("locale", locale);
  }

  /**
   * Emit a custom `languagechange` event.
   * @param {string} locale The new selected locale.
   */
  #emit(locale) {
    const langDir = (() => {
      try {
        return new Intl.Locale(locale).textInfo?.direction || "ltr";
      } catch {
        return "ltr";
      }
    })();

    document.documentElement.setAttribute("lang", locale);
    document.documentElement.setAttribute("dir", langDir);

    this.dispatchEvent(
      new CustomEvent("languagechange", {
        bubbles: true,
        detail: { locale },
      })
    );
  }

  /**
   * Called when the element is connected to the DOM. Sets up the language selector.
   */
  connectedCallback() {
    this.innerHTML = `
      <label id="locale-label" for="locale-select">Language:</label>
      <select id="locale-select" aria-labelledby="locale-label" style="margin-left: 0.5em;"></select>
    `;

    this.#select = this.querySelector("select");
    const current = this.#getLocale();

    LocaleConfig.locales.forEach((locale) => {
      const opt = document.createElement("option");
      opt.value = locale;
      opt.textContent =
        locale === LocaleConfig.defaultLocale
          ? `${locale.toUpperCase()} (Default)`
          : locale.toUpperCase();
      if (locale === current) {
        opt.setAttribute("selected", "");
        opt.setAttribute("aria-selected", "true");
      }
      this.#select.appendChild(opt);
    });

    this.#select.value = current;

    this.#select.addEventListener("change", () => {
      const selected = this.#select.value;
      window.__userLanguageSwitched = true;
      this.#saveLocale(selected);
      this.#emit(selected);
    });

    this.#emit(current);
  }
}

customElements.define("locale-switcher", LocaleSwitcher);

/**
 * <locale-text>
 * A custom element that translates content dynamically based on the current locale.
 */
class LocaleText extends HTMLElement {
  #locale;

  static #dictionaries = {};
  static #loadingPromises = {};

  /**
   * Load the locale JSON data if not already loaded
   * @param {string} locale The locale to load.
   * @returns {Promise<void>}
   */
  static async #loadLocale(locale) {
    const isDefault = locale === LocaleConfig.defaultLocale;
    const isInitialLoad =
      document.documentElement.getAttribute("lang") ===
        LocaleConfig.defaultLocale && !window.__userLanguageSwitched;

    const shouldSkip = isDefault && isInitialLoad;
    if (shouldSkip) return;

    if (!LocaleConfig.locales.includes(locale)) return;
    if (this.#dictionaries[locale]) return;

    if (!this.#loadingPromises[locale]) {
      const url = LocaleConfig.path.replace("{locale}", locale);
      this.#loadingPromises[locale] = fetch(url)
        .then((res) => res.json())
        .then((data) => {
          this.#dictionaries[locale] = data;
        })
        .catch((err) => {
          console.warn(`[locale-text] Failed to load locale ${locale}:`, err);
          this.#dictionaries[locale] = {};
        });
    }

    await this.#loadingPromises[locale];
  }

  /**
   * Get the translation for a given key.
   * @param {string} key The translation key.
   * @returns {string} The translated string.
   */
  async #getTranslation(key) {
    await LocaleText.#loadLocale(this.#locale);
    return LocaleText.#dictionaries[this.#locale]?.[key];
  }

  /**
   * Event listener for locale change. Updates the component's locale.
   * @param {CustomEvent} e The language change event.
   */
  #onLangChange = (e) => {
    const newLocale = e.detail.locale;
    if (LocaleConfig.locales.includes(newLocale)) {
      this.#locale = newLocale;
      this.#render();
    }
  };

  /**
   * Render the translated content.
   */
  async #render() {
    const key = this.getAttribute("key");
    const translated = await this.#getTranslation(key);
    if (translated) {
      this.textContent = translated;
    }
  }

  /**
   * Called when the element is connected to the DOM.
   */
  connectedCallback() {
    this.#locale =
      localStorage.getItem("locale") ||
      document.documentElement.getAttribute("lang") ||
      navigator.language?.split("-")[0] ||
      LocaleConfig.defaultLocale;

    document.addEventListener("languagechange", this.#onLangChange);
    this.#render();
  }

  /**
   * Called when the element is disconnected from the DOM.
   */
  disconnectedCallback() {
    document.removeEventListener("languagechange", this.#onLangChange);
  }

  /**
   * Observed attributes for dynamic re-render.
   * @returns {string[]} List of observed attributes.
   */
  static get observedAttributes() {
    return ["key"];
  }

  /**
   * Callback for when an attribute changes.
   * @param {string} name The attribute name.
   * @param {string} oldVal The previous value of the attribute.
   * @param {string} newVal The new value of the attribute.
   */
  attributeChangedCallback(name, oldVal, newVal) {
    if (name === "key" && oldVal !== newVal) {
      this.#render();
    }
  }
}

customElements.define("locale-text", LocaleText);
