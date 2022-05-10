# Vuepress Plugin Auto Nav

This plugin fills in the navbar and or sidebar links based on all page's paths. Children are nested. Sidebar show's active section by default. Navbar show's all sections. Sidebar can be configured to show all sections (if not using navbar).

## Page Order

Page order is alphabetical and can be ordered manually by adding a "weight" or "order" property to a page's front matter. Pages will be listed by order/weight ascending.

```yaml
# In a page's frontmatter
order: 10
```

## Usage & Options

Install the plugin (npm), then add the plugin to the end of your plugin array (in vuepress `config.js`).

Options are placed in the vuepress `config.js` within the theme's config. This plugin modify's the theme's configuration during runtime using enhanceAppFiles. So configuration is added to the the theme's config object using the "pluginAutoNav" key.

**Usage and notes on settings:**

``` js

module.exports = {
  themeConfig: {
    pluginAutoNav: {
      /**
       * Generate links for the sidebar (nests children)
       */
      createSidebar: true,
      /**
       * Generate links for the top navbar
       */
      createNav: true,
      /**
       * If true it should show the whole tree else show by section (landing page)
       */
      sidebarAllSections: false
    }
  },
  plugins: [
    "@ulu/vuepress-plugin-auto-nav"
  ]
}

```