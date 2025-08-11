// ===== UTILITIES =====

const Utils = {
  // ===== URL & NAVIGATION =====
  
  getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  },

  setUrlParameter(name, value) {
    const url = new URL(window.location);
    url.searchParams.set(name, value);
    window.history.pushState({}, '', url);
  },

  removeUrlParameter(name) {
    const url = new URL(window.location);
    url.searchParams.delete(name);
    window.history.pushState({}, '', url);
  },

  // ===== DATA LOADING =====
  
  async loadJSON(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Erro ao carregar JSON de ${url}:`, error);
      return null;
    }
  },

  async loadMultipleJSON(urls) {
    try {
      const promises = urls.map(url => this.loadJSON(url));
      const results = await Promise.all(promises);
      return results.reduce((acc, result, index) => {
        const key = urls[index].split('/').pop().replace('.json', '');
        acc[key] = result;
        return acc;
      }, {});
    } catch (error) {
      console.error('Erro ao carregar múltiplos JSONs:', error);
      return {};
    }
  },

  // ===== DATA PROCESSING =====
  
  findById(array, id) {
    return array?.find(item => item.id === id);
  },

  findByProperty(array, property, value) {
    return array?.find(item => item[property] === value);
  },

  filterByProperty(array, property, value) {
    return array?.filter(item => item[property] === value) || [];
  },

  sortBy(array, property, direction = 'asc') {
    if (!array) return [];
    
    return [...array].sort((a, b) => {
      const aVal = a[property];
      const bVal = b[property];
      
      if (direction === 'desc') {
        return bVal > aVal ? 1 : -1;
      }
      return aVal > bVal ? 1 : -1;
    });
  },

  // ===== STRING UTILITIES =====
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  slugify(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },

  truncate(text, length = 100, suffix = '...') {
    if (!text || text.length <= length) return text;
    return text.substring(0, length).trim() + suffix;
  },

  formatCurrency(value, currency = 'BRL') {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(value);
  },

  formatNumber(value) {
    return new Intl.NumberFormat('pt-BR').format(value);
  },

  // ===== DOM UTILITIES =====
  
  createElement(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);
    
    Object.keys(attributes).forEach(key => {
      if (key === 'className') {
        element.className = attributes[key];
      } else if (key === 'innerHTML') {
        element.innerHTML = attributes[key];
      } else if (key === 'textContent') {
        element.textContent = attributes[key];
      } else if (key.startsWith('data-')) {
        element.setAttribute(key, attributes[key]);
      } else {
        element[key] = attributes[key];
      }
    });
    
    if (content) {
      element.textContent = content;
    }
    
    return element;
  },

  getElement(selector) {
    return document.querySelector(selector);
  },

  getElements(selector) {
    return document.querySelectorAll(selector);
  },

  show(element) {
    if (typeof element === 'string') {
      element = this.getElement(element);
    }
    if (element) {
      element.style.display = '';
      element.classList.remove('hidden');
    }
  },

  hide(element) {
    if (typeof element === 'string') {
      element = this.getElement(element);
    }
    if (element) {
      element.style.display = 'none';
      element.classList.add('hidden');
    }
  },

  toggle(element) {
    if (typeof element === 'string') {
      element = this.getElement(element);
    }
    if (element) {
      if (element.style.display === 'none' || element.classList.contains('hidden')) {
        this.show(element);
      } else {
        this.hide(element);
      }
    }
  },

  // ===== SEO & META TAGS =====
  
  updateMetaTags(seo) {
    const metaUpdates = [
      { selector: '#page-title', property: 'textContent', value: seo.title },
      { selector: 'title', property: 'textContent', value: seo.title },
      { selector: '#page-description', property: 'content', value: seo.description },
      { selector: '#page-keywords', property: 'content', value: seo.keywords },
      { selector: '#page-author', property: 'content', value: seo.author },
      { selector: '#page-canonical', property: 'href', value: seo.canonical || window.location.href },
      { selector: '#og-title', property: 'content', value: seo.title },
      { selector: '#og-description', property: 'content', value: seo.description },
      { selector: '#og-url', property: 'content', value: seo.canonical || window.location.href },
      { selector: '#og-image', property: 'content', value: seo.ogImage },
      { selector: '#twitter-title', property: 'content', value: seo.title },
      { selector: '#twitter-description', property: 'content', value: seo.description },
      { selector: '#twitter-image', property: 'content', value: seo.ogImage }
    ];

    metaUpdates.forEach(({ selector, property, value }) => {
      const element = document.querySelector(selector);
      if (element && value) {
        if (property === 'content') {
          element.setAttribute('content', value);
        } else {
          element[property] = value;
        }
      }
    });
  },

  updateStructuredData(data) {
    const structuredDataElement = document.querySelector('#structured-data');
    if (structuredDataElement && data) {
      structuredDataElement.textContent = JSON.stringify(data);
    }
  },

  // ===== THEME & CSS =====
  
  updateCSSVariables(variables) {
    const root = document.documentElement;
    Object.keys(variables).forEach(key => {
      const cssVar = key.startsWith('--') ? key : `--${key}`;
      root.style.setProperty(cssVar, variables[key]);
    });
  },

  loadTheme(themeName) {
    const themeLink = document.querySelector('#theme-css');
    if (themeLink) {
      themeLink.href = `themes/${themeName}.css`;
    }
  },

  // ===== ANIMATIONS =====
  
  fadeIn(element, duration = 300) {
    if (typeof element === 'string') {
      element = this.getElement(element);
    }
    
    if (!element) return;
    
    element.style.opacity = '0';
    element.style.display = '';
    
    const start = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      
      element.style.opacity = progress;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  },

  fadeOut(element, duration = 300) {
    if (typeof element === 'string') {
      element = this.getElement(element);
    }
    
    if (!element) return;
    
    const start = performance.now();
    const startOpacity = parseFloat(getComputedStyle(element).opacity);
    
    const animate = (currentTime) => {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      
      element.style.opacity = startOpacity * (1 - progress);
      
      if (progress >= 1) {
        element.style.display = 'none';
      } else {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  },

  // ===== WHATSAPP INTEGRATION =====
  
  generateWhatsAppLink(phone, message, productName = '') {
    const formattedMessage = message.replace('{PRODUCT_NAME}', productName);
    const encodedMessage = encodeURIComponent(formattedMessage);
    return `https://wa.me/${phone}?text=${encodedMessage}`;
  },

  openWhatsApp(phone, message, productName = '') {
    const link = this.generateWhatsAppLink(phone, message, productName);
    window.open(link, '_blank');
  },

  // ===== STORAGE =====
  
  setStorage(key, value, type = 'localStorage') {
    try {
      const storage = type === 'sessionStorage' ? sessionStorage : localStorage;
      storage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Erro ao salvar no storage:', error);
      return false;
    }
  },

  getStorage(key, defaultValue = null, type = 'localStorage') {
    try {
      const storage = type === 'sessionStorage' ? sessionStorage : localStorage;
      const item = storage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Erro ao ler do storage:', error);
      return defaultValue;
    }
  },

  removeStorage(key, type = 'localStorage') {
    try {
      const storage = type === 'sessionStorage' ? sessionStorage : localStorage;
      storage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Erro ao remover do storage:', error);
      return false;
    }
  },

  // ===== VALIDATION =====
  
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidPhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  },

  // ===== DEBOUNCE & THROTTLE =====
  
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // ===== LOADING STATES =====
  
  showLoading(element, text = 'Carregando...') {
    if (typeof element === 'string') {
      element = this.getElement(element);
    }
    
    if (element) {
      element.classList.add('loading');
      element.setAttribute('aria-busy', 'true');
      
      if (text) {
        element.setAttribute('data-loading-text', text);
      }
    }
  },

  hideLoading(element) {
    if (typeof element === 'string') {
      element = this.getElement(element);
    }
    
    if (element) {
      element.classList.remove('loading');
      element.removeAttribute('aria-busy');
      element.removeAttribute('data-loading-text');
    }
  }
};

// Exportar para uso global
window.Utils = Utils;

// Polyfills para navegadores mais antigos
if (!String.prototype.replaceAll) {
  String.prototype.replaceAll = function(search, replace) {
    return this.split(search).join(replace);
  };
}

