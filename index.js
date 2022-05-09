const path = require("path");

module.exports = opts => {
  return {
    name: "@ulu/vuepress-plugin-sidebar-auto-pages",
    enhanceAppFiles: path.resolve(__dirname, "enhanceAppFiles.js")
  }
}