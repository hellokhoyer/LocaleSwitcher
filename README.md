# LocaleSwitcher – Lightweight Web Components for Localization

**LocaleSwitcher** is a minimalist, dependency-free i18n system powered by Custom Elements. It lets you internationalize your site using simple, FOUC-safe web components with external JSON translation files.

---

## Features

✅ `<locale-switcher>` — Accessible language dropdown
✅ `<locale-text>` — Translation-aware text replacement
✅ FOUC-safe
✅ Automatic language detection
✅ Auto-updates `<html lang>` and `dir="rtl"`
✅ Fully accessible: keyboard + screen reader friendly
✅ Single JS file, no build tools, no dependencies

---

## Quick Start

---

### 0. Create locale file

Create JSON files for inside the `locales/` folder.

- The file name should match the locale code, e.g. `Bn.json` for Bengali.
- Place them inside the `/locales/` directory next to your `index.html`.
- The structure of each file should be a simple key-value object:

Example `/locales/bn.json`:

```json
{
  "greeting": "হ্যালো!",
  "farewell": "বিদায়!"
}

Example `/locales/en.json`:
{
  "greeting": "Hello!",
  "farewell": "Goodbye!"
}
```

---

### 1. Include script on the header.

```html
<script src="./locale-components.js"></script>
<script>
  LocaleSwitcher.configure({
    locales: ["en", "bn"],
    defaultLocale: "bn",
    path: "./locales/{locale}.json",
  });
</script>
```

### 2. Add to your HTML

```html
<locale-switcher></locale-switcher> //language switcher
<h1><locale-text key="greeting">Hello!</locale-text></h1>
//map the locale key
```

For Demo, please clone the repo and run the HTML for preview.

## Why use LocaleComponent?

- No frameworks
- No bundlers
- No dependencies
- Works with static hosting (GitHub Pages, Netlify, etc.)
- Built-in accessibility and graceful fallback

---

## 🌤️ Example Translations

`/locales/bn.json`:

```json
{
  "greeting": "হ্যালো!",
  "farewell": "বিদায়!"
}
```

`/locales/ar.json`:

```json
{
  "greeting": "مرحبا!",
  "farewell": "مع السلامة!"
}
```

---

## 📜 License

MIT License. Free to use, modify, and share.

---
