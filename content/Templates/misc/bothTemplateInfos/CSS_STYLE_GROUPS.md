# CSS Styles in headStyles.html - Usage Analysis

## ✅ STYLES USED IN THIS FILE

### Global Element Selectors (Apply to all matching elements)
- `html, body` - Base font size, line-height, font-family
- `h1` - Form title styling
- `h2, h3, h4, h5, p` - Typography (if present in content)
- `button` - All buttons (including toggle buttons)
- `input, textarea` - Form inputs
- `a` - Links
- `strong, em` - Text formatting
- `table, tr, th, td` - Table elements (if present)

### Navigation Module Classes (Used in nav bar)
- `.app-components-ui-Navigation-module__siteNav--hvOMW`
- `.app-components-ui-Navigation-module__primaryRow--DTcFz`
- `.app-components-ui-Navigation-module__navLeft--mHyUD`
- `.app-components-ui-Navigation-module__navLogo--Ycbjz`
- `.app-components-ui-Navigation-module__navSearch--oEGRr`
- `.app-components-ui-Navigation-module__navSearchFull--zWdq6`
- `.app-components-ui-Navigation-module__searchField--wf41j`
- `.app-components-ui-Navigation-module__navRight--EP23M`
- `.app-components-ui-Navigation-module__buttonLink--SNlql`
- `.app-components-ui-Navigation-module__mobileNavigation--SIFdP`

### Hamburger Menu Classes (Used in mobile menu)
- `.app-components-ui-HamburgerMenu-module__menuItem--nk06h`
- `.app-components-ui-HamburgerMenu-module__emphasized--EBXvz`

### Bookmarks Menu Classes (Used in bookmarks)
- `.app-components-ui-BookmarksMenu-BookmarksMenu-module__container--jI2QK`
- `.app-components-ui-BookmarksMenu-BookmarksMenu-module__header--F71Wl`
- `.app-components-ui-BookmarksMenu-BookmarksMenu-module__title--qkHVR`
- `.app-components-ui-BookmarksMenu-BookmarksMenu-module__closeButton--hHinX`
- `.app-components-ui-BookmarksMenu-BookmarksMenu-module__activeFolderHeader--nlj_u`
- `.app-components-ui-BookmarksMenu-BookmarksMenu-module__list--ujsrv`

### App Container Classes
- `.app-App-module__outerContainer--wxnC5`

---

## ❌ STYLES NOT USED IN THIS FILE

### Unused Navigation Classes
- `.app-components-ui-Navigation-module__root--GWbPP` (ID selector, not class)
- `.app-components-ui-Navigation-module__search-page-container--jqcK5`
- `.app-components-ui-Navigation-module__disabled-feature--u4hnc`
- `.app-components-ui-Navigation-module__iconcell--rVIoo`
- `.app-components-ui-Navigation-module__compact--tv3LI`

### Unused Content Classes
- `.app-components-ui-Navigation-module__org--main--header--description--IgM7f`
- `.app-components-ui-Navigation-module__service--description--aAMrZ`

### Unused Utility Classes
- `.material-symbols-outlined` (if no Material icons present)
- `.intercom-launcher-frame` (if no Intercom chat widget)
- `.message` (if no message boxes)

### Other Unused Styles
- Banner, Footer, NewsArticles, Partners, PopUpMessage, ResourceCard, SearchBar, Section modules (if not present in HTML)

---

## NOTES
- The minified CSS includes styles for the ENTIRE application
- Only a subset is actually used in this specific file
- Unused styles add unnecessary page weight (~200KB+)
- Consider creating a file-specific stylesheet for better performance
