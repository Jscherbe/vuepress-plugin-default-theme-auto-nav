const { description } = require('../../package');
const plugin = require("../../index.js");

module.exports = {
  title: '@ulu/vuepress-plugin-auto-nav (test)',
  description: description,
  themeConfig: {
    pluginAutoNav: {
      createSidebar: true,
      createNav: false,
      sidebarAllSections: true
    }
  },
  plugins: [
    plugin
  ]
}