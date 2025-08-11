// ===== HEADER COMPONENT =====

class HeaderComponent {
  constructor() {
    this.element = null;
    this.mobileNav = null;
    this.isScrolled = false;
    this.init();
  }

  init() {
    this.setupScrollListener();
  }

  render(data = {}) {
    const {
      brand = {},
      navigation = [],
      cta = null,
      showBackButton = false
    } = data;

    const backButtonHtml = showBackButton ? `
      <a href="index.html" class="back-to-home">
        <ion-icon name="arrow-back-outline"></ion-icon>
        Voltar ao início
      </a>
    ` : '';

    const navigationHtml = navigation.length > 0 ? `
      <nav class="header-nav">
        <ul class="nav-links">
          ${navigation.map(item => `
            <li>
              <a href="${item.href}" class="nav-link" data-section="${item.href.replace('#', '')}">
                ${item.label}
              </a>
            </li>
          `).join('')}
        </ul>
        ${cta ? `
          <div class="header-cta">
            <a href="${cta.href}" class="btn btn-primary" ${cta.target ? `target="${cta.target}"` : ''}>
              ${cta.icon ? `<ion-icon name="${cta.icon}"></ion-icon>` : ''}
              ${cta.text}
            </a>
          </div>
        ` : ''}
      </nav>
    ` : '';

    const mobileNavHtml = navigation.length > 0 ? `
      <div class="mobile-nav" id="mobile-nav">
        <div class="mobile-nav-header">
          <div class="header-brand">
            <div class="brand-logo">${brand.logo || 'LP'}</div>
            <div class="brand-info">
              <h1 class="brand-title">${brand.title || 'Landing Page'}</h1>
              <p class="brand-subtitle">${brand.subtitle || ''}</p>
            </div>
          </div>
          <button class="mobile-nav-close" id="mobile-nav-close" aria-label="Fechar menu">
            <ion-icon name="close-outline"></ion-icon>
          </button>
        </div>
        <ul class="mobile-nav-links">
          ${navigation.map(item => `
            <li>
              <a href="${item.href}" class="mobile-nav-link" data-section="${item.href.replace('#', '')}">
                ${item.label}
              </a>
            </li>
          `).join('')}
        </ul>
        ${cta ? `
          <div class="mobile-nav-cta">
            <a href="${cta.href}" class="btn btn-primary btn-block" ${cta.target ? `target="${cta.target}"` : ''}>
              ${cta.icon ? `<ion-icon name="${cta.icon}"></ion-icon>` : ''}
              ${cta.text}
            </a>
          </div>
        ` : ''}
      </div>
    ` : '';

    return `
      <div class="container">
        <div class="header-container">
          ${backButtonHtml}
          
          <a href="index.html" class="header-brand">
            <div class="brand-logo">${brand.logo || 'LP'}</div>
            <div class="brand-info">
              <h1 class="brand-title">${brand.title || 'Landing Page'}</h1>
              <p class="brand-subtitle">${brand.subtitle || ''}</p>
            </div>
          </a>

          ${navigationHtml}

          ${navigation.length > 0 ? `
            <button class="mobile-menu-toggle" id="mobile-menu-toggle" aria-label="Abrir menu">
              <ion-icon name="menu-outline"></ion-icon>
            </button>
          ` : ''}
        </div>
      </div>

      ${mobileNavHtml}
    `;
  }

  mount(container, data) {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }

    if (!container) {
      console.error('Header container not found');
      return;
    }

    container.innerHTML = this.render(data);
    this.element = container;
    this.setupEventListeners();
    this.setupActiveNavigation();
  }

  setupEventListeners() {
    if (!this.element) return;

    // Mobile menu toggle
    const mobileToggle = this.element.querySelector('#mobile-menu-toggle');
    const mobileNav = this.element.querySelector('#mobile-nav');
    const mobileClose = this.element.querySelector('#mobile-nav-close');

    if (mobileToggle && mobileNav) {
      this.mobileNav = mobileNav;

      mobileToggle.addEventListener('click', () => {
        this.openMobileMenu();
      });

      if (mobileClose) {
        mobileClose.addEventListener('click', () => {
          this.closeMobileMenu();
        });
      }

      // Close on backdrop click
      mobileNav.addEventListener('click', (e) => {
        if (e.target === mobileNav) {
          this.closeMobileMenu();
        }
      });

      // Close on escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
          this.closeMobileMenu();
        }
      });
    }

    // Smooth scroll for navigation links
    const navLinks = this.element.querySelectorAll('.nav-link, .mobile-nav-link');
    navLinks.forEach(link => {
      if (link.getAttribute('href').startsWith('#')) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const targetId = link.getAttribute('href').substring(1);
          this.scrollToSection(targetId);
          this.closeMobileMenu();
        });
      }
    });
  }

  openMobileMenu() {
    if (this.mobileNav) {
      this.mobileNav.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  closeMobileMenu() {
    if (this.mobileNav) {
      this.mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
      const headerHeight = this.element ? this.element.offsetHeight : 80;
      const targetPosition = section.offsetTop - headerHeight - 20;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  }

  setupActiveNavigation() {
    if (typeof window === 'undefined') return;

    const sections = document.querySelectorAll('section[id]');
    const navLinks = this.element?.querySelectorAll('.nav-link, .mobile-nav-link');

    if (!sections.length || !navLinks?.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === sectionId) {
              link.classList.add('active');
            }
          });
        }
      });
    }, {
      threshold: 0.3,
      rootMargin: '-80px 0px -80px 0px'
    });

    sections.forEach(section => observer.observe(section));
  }

  setupScrollListener() {
    if (typeof window === 'undefined') return;

    let ticking = false;

    const updateScrollState = () => {
      const scrolled = window.scrollY > 50;
      
      if (scrolled !== this.isScrolled) {
        this.isScrolled = scrolled;
        
        if (this.element) {
          this.element.classList.toggle('header-scrolled', scrolled);
        }
      }
      
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollState);
        ticking = true;
      }
    });
  }

  // Método público para atualizar dados
  update(data) {
    if (this.element) {
      this.mount(this.element, data);
    }
  }

  // Método público para destruir o componente
  destroy() {
    if (this.mobileNav) {
      this.closeMobileMenu();
    }
    
    if (this.element) {
      this.element.innerHTML = '';
      this.element = null;
    }
  }
}

// Instância global do componente
window.HeaderComponent = HeaderComponent;

// Auto-inicialização se o DOM já estiver carregado
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.headerComponent = new HeaderComponent();
  });
} else {
  window.headerComponent = new HeaderComponent();
}

