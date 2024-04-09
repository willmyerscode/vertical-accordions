class WMVerticalAccordion {
  static emitEvent(type, detail = {}, elem = document) {
    // Make sure there's an event type
    if (!type) return;

    // Create a new event
    let event = new CustomEvent(type, {
      bubbles: true,
      cancelable: true,
      detail: detail,
    });

    // Dispatch the event
    return elem.dispatchEvent(event);
  };
  constructor(el){
    this.el = el;
    
    // let url = new URL(window.location.href);
    // let searchParams = new URLSearchParams(url.search);
    // this.paramActive = parseInt(searchParams.get('va-active'));
    
    this.accordionPanels = this.el.querySelectorAll('[data-wm-plugin="vertical-accordions"] .accordion-panel');
    
    // this.openOnLoad = el.getAttribute('data-open') || '1';
    // this.openOnLoad = this.openOnLoad.trim();
    // this.openOnLoad = parseInt(this.openOnLoad);
    this.initialOpen = this.getInitialPanelIndexToOpen();
    this.activePanel = null;
    this.canOpen = true;
    
    this.accordionTitles = this.el.querySelectorAll('.accordion-title');
    this.component = this.el.querySelector('.vertical-accordions');
    this.sections = this.el.querySelectorAll('.accordion-content .sections');
    this.classicSections = this.el.querySelectorAll('.sqs-layout');

    this.init();
  }  
  init () {
    this.bindEvents();
    this.findSizes();
    this.openPanel(this.accordionPanels[this.initialOpen])
    WMVerticalAccordion.emitEvent('wmVerticalAccordions:loaded', {
      container: this.el
    });
  }
  bindEvents() {
    this.addPluginLoadedListener();
    this.resizeEvent();
    this.addClickEvent();
  }
  addPluginLoadedListener() {
    const handleLoaded = () => {
      window.setTimeout(() => {
        this.findSizes();
      }, 1000)
    }
    document.addEventListener('wmVerticalAccordions:loaded', handleLoaded)
  }
  openPanel(panel) {
    if (this.canOpen && panel !== this.activePanel) {
      this.canOpen = false;
      this.removeActiveClasses();
      panel.classList.add('panel-active');
      const currentActivePanel = this.el.querySelector('.panel-active');
      this.activePanel = this.el.querySelector('.panel-active');
      this.allowFocus(this.activePanel)
      this.scrollBack();
      this.activePanel.addEventListener('transitionend', () => {
        this.canOpen = true;
        this.activePanel.removeEventListener('transitionend', null);
      });
    }
  }
  addClickEvent() {
    const handleEvent = (e) => {
      const panel = e.target.closest('.accordion-panel')
      this.openPanel(panel)
    }

    this.accordionPanels.forEach(panel => {
      panel.addEventListener('click', handleEvent)
    });
  }

  removeActiveClasses(){
    this.accordionPanels.forEach((panel) => {
      panel.classList.remove('panel-active');
      this.preventFocusableElements(panel)
    });
  }
  getInitialPanelIndexToOpen() {
    let url = new URL(window.location.href);
    let searchParams = new URLSearchParams(url.search);
    let searchParamActivePanel = searchParams.get('va-active');
    let panelIndex = this.el.getAttribute('data-open') || '1';
    if (searchParamActivePanel) {
      panelIndex = searchParamActivePanel;
    }
      
    panelIndex = parseInt(panelIndex.trim()) - 1;

    if (panelIndex < 0) {
      panelIndex = 0
    } else if (panelIndex > this.accordionPanels.length) {
      panelIndex = this.accordionPanels.length
    }
    return panelIndex;
  }
  findSizes(){
    this.componentSizes = this.component.getBoundingClientRect();
    this.componentWidth = this.componentSizes.width;
    this.totalTitleWidth = 0;
    this.accordionTitles.forEach((title) => {
      var titleSizes = title.getBoundingClientRect();
      var titleWidth = titleSizes.width;
      this.totalTitleWidth += titleWidth;
      
      this.activeWidth = this.componentWidth - this.totalTitleWidth + 'px';
      this.component.style.setProperty('--va-active-width', this.activeWidth);
    });

    if (this.sections.length > 0) {
      let maxHeight = 0;
      this.sections.forEach((section) => {
        var sectionHeight = section.scrollHeight;
        if (sectionHeight > maxHeight) {
          maxHeight = sectionHeight;
        }
        this.activeHeight = sectionHeight + 'px';
        this.component.style.setProperty('--va-active-height', this.activeHeight);
        this.component.style.setProperty('--va-tallest-panel-height', maxHeight + 'px');
      });
    }

    if (this.classicSections.length > 0) {
      let maxHeight = 0;
      this.classicSections.forEach((section) => {
        var sectionHeight = section.scrollHeight;
        if (sectionHeight > maxHeight) {
          maxHeight = sectionHeight;
        }
        this.activeHeight = sectionHeight + 'px';
        this.component.style.setProperty('--va-active-height', this.activeHeight);
        this.component.style.setProperty('--va-tallest-panel-height', maxHeight + 'px');
    });
  }
    
  }
  resizeEvent(){
    window.addEventListener('resize', () => {
      this.findSizes();
    });
  }
  scrollBack() {
    const prevPanel = document.querySelector('.panel-active').previousElementSibling;
    const prevTitle = prevPanel?.querySelector('.accordion-title');
    const rect = this.el.getBoundingClientRect();
    const top = rect.top + window.pageYOffset;
    if (!prevTitle) {
      return;
    } else if (rect.top <= 0) {
      window.scrollTo({
        top: top,
        behavior: 'smooth'
      });
    }
    
  }
  preventFocusableElements(panel) {
    const focusableElements = panel.querySelectorAll('.accordion-content-wrapper a, .accordion-content-wrapper button, .accordion-content-wrapper input, .accordion-content-wrapper textarea, .accordion-content-wrapper select, .accordion-content-wrapper details, .accordion-content-wrapper [tabindex]:not([tabindex="-1"])');
    focusableElements.forEach(el => {
      el.setAttribute('tabindex', '-1');
    });
  }
  allowFocus(panel) {
    const focusableElements = panel.querySelectorAll('.accordion-content-wrapper a, .accordion-content-wrapper button, .accordion-content-wrapper input, .accordion-content-wrapper textarea, .accordion-content-wrapper select, .accordion-content-wrapper details');
    focusableElements.forEach(el => {
      el.removeAttribute('tabindex');
    });
  }
}


(function () {
  function deepMerge (...objs) {
  	function getType (obj) {
  		return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
  	}
  	function mergeObj (clone, obj) {
  		for (let [key, value] of Object.entries(obj)) {
  			let type = getType(value);
  			if (clone[key] !== undefined && getType(clone[key]) === type && ['array', 'object'].includes(type)) {
  				clone[key] = deepMerge(clone[key], value);
  			} else {
  				clone[key] = structuredClone(value);
  			}
  		}
  	}
  	let clone = structuredClone(objs.shift());
  	for (let obj of objs) {
  		let type = getType(obj);
  		if (getType(clone) !== type) {
  			clone = structuredClone(obj);
  			continue;
  		}
  		if (type === 'array') {
  			clone = [...clone, ...structuredClone(obj)];
  		} else if (type === 'object') {
  			mergeObj(clone, obj);
  		} else {
  			clone = obj;
  		}
  	}
  
  	return clone;
  
  }
  const userSettings = 
    window.wmVerticalAccordionSettings ? 
    window.wmVerticalAccordionSettings : {};
  const defaultSettings = {
    titleTag: 'h3',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75 12 3m0 0 3.75 3.75M12 3v18" />
</svg>`
  };
  const mergedSettings = deepMerge({}, defaultSettings, userSettings);

  // function reloadSquarespaceScripts(el) {
  //   const scripts = [];
  //   const accordions = document.querySelectorAll('[data-wm-plugin="vertical-accordions"]');
  //   function loadScripts() {
  //     if (!scripts.length) return;
  //     let hasLoaded = [];
  //     for (let el of scripts){
  //       if (hasLoaded.includes(el.src) || hasLoaded.includes(el.innerHTML) || el.type == 'application/json') continue;
  //       const script = document.createElement('script');
  //       script.src = el.src;
  //       script.async = el.async;
  
  //       script.onload = () => {
  //         //console.log(`${el.src} loaded successfuly`);
  //       };
  
  //       script.onerror = () => {
  //         //console.log(`Error occurred while loading ${el.src}`);
  //       };
  
  //       if (el.innerHTML) {
  //         eval(el.innerHTML);
  //         hasLoaded.push(el.innerHTML)
  //       } else {
  //         document.body.appendChild(script);
  //         hasLoaded.push(el.src)
  //       }
  //     }
  //   };
  //   function runAfterDOMLoaded(fn) {
  //     if (document.readyState === 'loading') {  // Still loading
  //       document.addEventListener('DOMContentLoaded', fn);
  //     } else {  // `DOMContentLoaded` has already fired
  //       fn();
  //     }
  //   }
  //   let hasBkgVideos = false;
  //   let hasListSection = false;
  //   let hasGallerySection = false;
  //   let hasBkgFx = false;


  //   runAfterDOMLoaded(() => {
  //     accordions.forEach(el => {
  //       window.Squarespace?.initializeLayoutBlocks(Y, Y.one(el));
  //       window.Squarespace?.initializeNativeVideo(Y, Y.one(el));
  //       window.Squarespace?.initializePageContent(Y, Y.one(el));
  //       if (el.querySelector('.section-background .sqs-video-background-native')) 
  //       {
  //         hasBkgVideos = true;
  //         }
  //       if (el.querySelector('.page-section.user-items-list-section')) {
  //         hasListSection = true;
  //       }
  //       if (el.querySelector('.page-section.gallery-section')) {
  //         hasGallerySection = true;
  //       }
  //       if (el.querySelector('.background-fx-canvas')) {
  //         hasBkgFx = true;
  //       }
  //     })
  //     if (hasBkgVideos || hasListSection || hasGallerySection || hasBkgFx) {
  //       let sqsLoaderScript = document.querySelector('body > [src*="https://static1.squarespace.com/static/vta"]');
  //       scripts.push(sqsLoaderScript)
  //     }
  
  //     loadScripts()
  //   })
  // }
  function reloadSquarespaceScripts() {
    const loadScript = (scriptSrc, async = true) => {
      if (document.querySelector(`script[src="${scriptSrc}"]`)) return; // Already loaded
  
      const script = document.createElement('script');
      script.src = scriptSrc;
      script.async = async;
      document.body.appendChild(script);
    };
  
    const executeInlineScript = (scriptContent) => {
      // Consider creating a sandboxed environment for execution if possible
      // Alternatively, ensure the content is from a trusted source
      try {
        new Function(scriptContent)();
      } catch (error) {
        console.error('Error executing inline script:', error);
      }
    };
  
    const accordions = document.querySelectorAll('[data-wm-plugin="vertical-accordions"]');
    accordions.forEach(el => {
      window.Squarespace?.initializeLayoutBlocks(Y, Y.one(el));
      window.Squarespace?.initializeNativeVideo(Y, Y.one(el));
      window.Squarespace?.initializePageContent(Y, Y.one(el));
  
      // Directly check and load scripts if needed
      if (el.querySelector('.section-background .sqs-video-background-native') ||
          el.querySelector('.page-section.user-items-list-section') ||
          el.querySelector('.page-section.gallery-section') ||
          el.querySelector('.background-fx-canvas')) {
        const sqsScriptSrc = "https://static1.squarespace.com/static/vta"; // Example, adjust as needed
        loadScript(sqsScriptSrc);
      }
  
      // For inline scripts - assume they are safe and from a trusted source.
      // Replace this with actual selectors and logic as needed.
      el.querySelectorAll('script').forEach(script => {
        if (script.type === 'application/json') return; // Skip JSON scripts
        if (script.src) {
          loadScript(script.src, script.async);
        } else {
          executeInlineScript(script.innerHTML);
        }
      });
    });
  }
  async function getItemsFromCollection(path) {
    try {
      const url = new URL(path, window.location.origin); // Create a URL object from the collection URL
      const params = new URLSearchParams(url.search); // Use URLSearchParams for query parameters
      let isFeatured;
      if (params.has("featured")) {
        isFeatured = true; // Check and log the parameters (if 'size' exists and 'featured' is present)
        params.delete("featured");
      }

      const date = new Date().getTime(); // Adding a cache busting parameter
      params.set("format", "json");
      params.set("date", date);
      url.search = params.toString(); // Update the search part of the URL

      // Make the fetch request using the updated URL
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
      const data = await response.json();
      if (data.past || data.upcoming) {
        data.collectionType = "events";
      }
      if (!data.items) {
        throw new Error(`No items in the collection`);
      }
      if (isFeatured) {
        data.items = data.items.filter(item => item.starred === true);
      }
      return data; // Return the data so it can be used after await
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  }
  async function getHTMLFromURL(url, selector = "#sections") {
    try {
      // Fetch the content from the URL
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const html = await response.text();

      // Parse the HTML and extract content based on the selector
      // Create a new DOM parser
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const selectedContent = doc.querySelector(selector);

      // Return the outer HTML of the selected element or an empty string if not found
      return selectedContent ? selectedContent.outerHTML : "";
    } catch (error) {
      console.error("Error fetching URL:", error);
      return "";
    }
  }
  function toUniqueDataAttribute(str) {
    // Normalize the string to lowercase
    let normalized = str.toLowerCase();

    // Replace spaces and invalid characters with underscores
    let baseString = normalized.replace(/[^a-z0-9\-_]/g, "-");

    // Ensure the string does not start with a digit, two hyphens, or a hyphen followed by a digit
    if (/^[0-9]|^--|^-[\d]/.test(baseString)) {
      baseString = "-" + baseString;
    }

    // Create a base attribute name
    let attributeName = baseString;

    // Check if this attribute already exists and append a number if it does
    let counter = 1;
    while (
      document.querySelector(`[${attributeName}]`) ||
      document.querySelector(`[${attributeName}-${counter}]`)
    ) {
      attributeName = baseString + "-" + counter;
      counter++;
    }

    return attributeName;
  }
  async function PluginBuilderFromSource(el) {
    const data = await getItemsFromCollection(el.dataset.source);
    const items = data.items;
    if (items[0].recordTypeLabel == "portfolio-item") {
      const fetchPromises = items.map(item => getHTMLFromURL(item.fullUrl)); // Create an array of promises for fetching HTML content
      const contents = await Promise.all(fetchPromises); // Use Promise.all to fetch all HTML content concurrently
      items.forEach((item, index) => (item.body = contents[index])); // Assign the fetched content back to the items
    }

    buildHTML(el, data);
  }
  function formatDate(dateNumber, options = {}) {
    // Use the user's current locale, or you can allow passing a specific locale as an argument
    const userLocale = navigator.language;

    // Default options if none are provided
    const defaultOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    };

    // Merge default options with user provided options
    const formatOptions = {...defaultOptions, ...options};

    // Create a new Date object from the dateNumber
    const date = new Date(dateNumber);

    // Format the date using Intl.DateTimeFormat
    return new Intl.DateTimeFormat(userLocale, formatOptions).format(date);
  }
  async function duplicateRootCssRule() {
    const hasStyle = document.querySelector('style#wm-root-theme-duplicate');
    if (hasStyle) return;
    
    try {
      // Fetch the CSS file
      const response = await fetch('/site.css');
      const cssText = await response.text();
  
      // Parse the CSS to find the second :root rule
      const cssRules = cssText.split('}').map(rule => rule.trim() + '}'); // Split and reassemble CSS rules
      const rootRules = cssRules.filter(rule => rule.startsWith(':root'));
      if (rootRules.length < 2) {
        console.error('Second :root rule not found');
        return;
      }
  
      // Duplicate and modify the rule
      const newRuleText = rootRules[1].replace(':root', '[data-section-theme="white"]');
      
      // Append the new rule as an internal style sheet
      const styleTag = document.createElement('style');
      styleTag.textContent += newRuleText; // Use += in case you want to append multiple rules
      styleTag.dataset.description = "Duplicated of the :root Color Theme styles"
      styleTag.id = "wm-root-theme-duplicate"
      document.head.prepend(styleTag);
    } catch (error) {
      console.error('Error fetching or duplicated :root CSS rule', error);
    }
  }
  function emitEvent(type, detail = {}, elem = document) {
    // Make sure there's an event type
    if (!type) return;

    // Create a new event
    let event = new CustomEvent(type, {
      bubbles: true,
      cancelable: true,
      detail: detail,
    });

    // Dispatch the event
    return elem.dispatchEvent(event);
  };
  function buildHTML(el, data) {

    // Get Data Attributes
    let panelCount = el.getAttribute('data-count') || '4';
    panelCount = panelCount.trim();
    panelCount = parseInt(panelCount);

    let maxPanels = parseInt(8);

    if (panelCount > maxPanels) {
      panelCount = maxPanels;
    }
    
    const items = data.items;
 
      el.innerHTML = `
        <div class="vertical-accordions">
          ${items
            .slice(0, panelCount)
          .map(
            item => `
              <div class="accordion-panel">
                <button class="accordion-title">
                  <${mergedSettings.titleTag} class="text">${(item.title)}</${mergedSettings.titleTag}>
                  <div class="icon-wrapper">${(mergedSettings.icon)}</div>
                </button>
                <div class="accordion-content-wrapper">
                  <div class="accordion-content">${(item.body)}</div>
                </div>
              </div>
            `
          )
          .join("")}
        </div>
         `;
    

    el.wmVerticalAccordion = new WMVerticalAccordion(el);
  }


  window.addEventListener('wmVerticalAccordions:ready', () => {
    reloadSquarespaceScripts();
  })
  window.wmVerticalAccordionsInit = async () => {
    let pluginEls = document.querySelectorAll('[data-wm-plugin="vertical-accordions"]:not(.loaded)');
    if (!pluginEls.length) return;
    duplicateRootCssRule();

    const buildPromises = Array.from(pluginEls).map(async (el) => {
      el.classList.add('loaded');
      if (el.dataset.source) {
        await PluginBuilderFromSource(el); // Ensure we await each build process
      }
    });

    // Wait for all PluginBuilderFromSource promises to resolve
    await Promise.all(buildPromises);

    emitEvent('wmVerticalAccordions:ready');
  }

  window.wmVerticalAccordionsInit();
})();
