const defaults = {
  createSidebar: true,
  createNav: true,
  sidebarGroupDefualts: {
    collapsable: false,
    initialOpenGroupIndex: -1,
    sidebarDepth: 2
  },
  /**
   * If true it should show the whole tree else show by section (landing page)
   */
  sidebarAllSections: false,
  /**
   * Callback function to modify an initial group (ie. change title, etc)(incudes extra page variable in group to get info from)
   */
  modify: null,
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
 * Creates a sidebar config based on page path structure
 */
function createMenus(pages, options) {
  let sidebar = false;
  let nav = false;
  // Get page path information
  const items = pages.map(page => {
    const segments = page.regularPath.split("/").filter(i => i !== "");
    return { page, segments };
  });
  // Reduce the flat list into a sidebar groups by each page's segments
  const all = items.reduce((groups, item) => {
    let current = groups;
    item.segments.forEach(segment => {
      let group = current?.children?.find(g => g.segment === segment);
      if (!group) {
        if (!current.children) {
          Object.assign(current, options.sidebarGroupDefualts);
          current.children = [];
          current.type = "group";
        }
        group = newGroup(item, segment, options)
        current.children.push(group);
      }
      current = group;
    });
    return groups;
  }, []);

  sortChildren(all, options);
  removeLocalProps(all);
  // No sidebar because there are no pages? (not sure if this can happen)
  if (!all.children) {
    return { nav, sidebar };
  }
  
  // Make sidebar
  if (options.sidebarAllSections) {
    // Full menu of all sections
    sidebar = all.children;
  } else {
    // Breakup up into sidebar's section api (object by section path)
    sidebar = all.children.reduce((sections, group) => {
      sections[group.path] = [group];
      return sections;
    }, {});
  }
  // Create nav from top level groups
  nav = all.children.map(({ path: link, title: text }) => ({ link, text }));

  return { sidebar, nav };
} 
/**
 * Go through all groups and their children and apply sorting 
 */
function sortChildren(group, options) {
  if (group?.children?.length) {
    group.children.sort((a, b) => {
      return options.sort(a.page, b.page);
    });
    group.children.forEach(g => sortChildren(g, options));
  }
}
/**
 * Create a new group (could be single page in menu or future group with children)
 */
function newGroup(item, segment, options) {
  const group = {
    title: item.page.title,
    path: item.page.regularPath,
    segment: segment,
    page: item.page
  };
  if (options.modify) {
    options.modify(group);
  }
  return group;
}
/**
 * Remove the extra properties in groups used by this module (page, segment)
 */
function removeLocalProps(group) {
  delete group.segment;
  delete group.page;
  if (group.children) {
    group.children.forEach(removeLocalProps);
  }
}