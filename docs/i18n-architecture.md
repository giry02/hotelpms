# Hotel PMS i18n Architecture

## Goal

All UI text should be addressed by stable translation keys, not by searching and replacing visible Korean or English text.

## Files

- Dashboard catalog: `dashboard/common/js/i18n-catalog.js`
- Dashboard engine: `dashboard/common/js/i18n.js`
- Admin catalog: `admin/common/js/admin-i18n-catalog.js`
- Admin engine: `admin/common/js/admin-i18n.js`

## Markup Pattern

```html
<h1 data-i18n="page.revenueAnalytics"></h1>
<button data-i18n="common.search"></button>
<input data-i18n-placeholder="common.search">
```

Legacy `data-i18n-key` is still supported for existing pages, but new work should use `data-i18n`.

## JavaScript Pattern

```js
label.textContent = t('reports.weeklyTotal');
```

Dynamic business data should store translation keys or localized fields:

```js
{ id: 'spa', nameKey: 'service.spa' }
```

Then render with:

```js
nameEl.textContent = t(item.nameKey);
```

## Adding a Language

Add a new top-level language code to each catalog:

```js
vi: {
  "common.search": "Tim kiem"
}
```

Every language should carry the same keys. Missing keys fall back to the key name so gaps are visible during QA.

## Migration Rule

Do not add new Korean or English literals directly into render functions. Add a key to the catalog first, then reference it with `data-i18n` or `t(key)`.
