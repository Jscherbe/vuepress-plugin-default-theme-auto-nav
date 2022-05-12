/**
 * Default Options for Plugin
 */
const defaults = {
  createSidebar: true,
  createNav: true,
  sidebarGroupDefaults: {
    collapsable: false,
    initialOpenGroupIndex: -1,
    sidebarDepth: 2,
  },
  /**
   * If true it should show the whole tree else show by section (landing page)
   */
  sidebarAllSections: false,
  /**
   * Default sorting for children
   * - Sort by weight/order and if equal (ie. 0) fallback to alphbetical
   * - Or if order/weight not present = 0 fallback to alphabetical
   */
  sort(a, b) {
    const getWeight = p => p.frontmatter.weight || p.frontmatter.order || 0;
    const getTitle = p => '' + p.title; // Force string
    return  getWeight(a) - getWeight(b) || getTitle(a).localeCompare(getTitle(b));
  }
};

/**
 * Adds config for sidebar based on page's paths, grouping by section
 * - Options can be passed in user's themeConfig.pluginAutoNav
 * @todo Make this work for the nav option also
 */
export default ({ siteData }) => {
  const { themeConfig } = siteData;
  const options = Object.assign({}, defaults, themeConfig.pluginAutoNav);
  const { sidebar, nav } = createMenus(siteData.pages, options);
  if (options.createNav) {
    themeConfig.nav = nav;
  }
  if (options.createSidebar) {
    themeConfig.sidebar = sidebar;
  }
}

/**
 * Creates a sidebar/nav config based on page path structure
 */
function createMenus(pages, options) {
  let sidebar = false;
  let nav = false;
  const newTree = () => Object.create(null);
  const tree = newTree();
  /**
   * Construct a tree of all the pages based on path segments
   * - Makes nested tree-like structure
   */
  pages.forEach(page => {
    const segments = page.regularPath.split("/").filter(i => i !== "");
    let currentTree = tree;
    segments.forEach((seg, index) => {
      if (!currentTree[seg]) {
        currentTree[seg] = { tree: newTree() };
      }
      // End of path segments add page data
      if (index === segments.length - 1) {
        currentTree[seg].page = page;
        currentTree[seg].segments = segments;
      }
      currentTree = currentTree[seg].tree;
    });
  });
  

  const all = convertTree(tree, options);
  sortChildren(all, options);
  removeLocalProps(all);
  
  // Make sidebar
  if (options.sidebarAllSections) {
    // Full menu of all sections
    sidebar = all;
  } else {
    // Breakup up into sidebar's section api (object by section path)
    sidebar = all.reduce((sections, group) => {
      sections[group.path] = [group];
      return sections;
    }, {});
  }
  // Create nav from top level groups
  nav = all.map(({ path: link, title: text }) => ({ link, text }));

  return { sidebar, nav };
} 
/**
 * Convert tree to vuepress nav/sidebar API (Array of Objects with children)
 */
function convertTree(tree, options) {
  const items = Object.values(tree);
  if (!items.length) {
    return null;
  }
  return items.map(({ page, tree }) => {
    const config = {};
    const children = convertTree(tree, options);

    if (children) {
      Object.assign(config, options.sidebarGroupDefaults, { 
        type: "group",
        children
      });
    }
    if (page) {
      config.page = page;
      config.path = page.regularPath;
      config.title = page.title;
    }
    return config;
  });
}
/**
 * Applies sort function through all groups
 */
function sortChildren(children, options) {
  if (children?.length) {
    children.sort((a, b) => {
      return options.sort(a.page, b.page);
    });
    children.forEach(child => {
      if (child.children) {
        sortChildren(child.children, options);
      }
    });
  }
}
/**
 * Remove the extra properties used for sorting/internally
 */
 function removeLocalProps(group) {
  delete group.page;
  if (group.children) {
    group.children.forEach(removeLocalProps);
  }
}
