// ===== HERO COMPONENT =====

class HeroComponent {
  constructor() {
    this.element = null;
    this.fullscreenOverlay = null;
  }

  render(data = {}) {
    const {
      badge = '',
      title = '',
      description = '',
      specs = [],
      ctas = [],
      highlight = '',
      images = []
    } = data;

    const specsHtml = specs.map(spec => `
      <div class="hero-spec">
        <span class="hero-spec-value">${spec.value}</span>
        <span class="hero-spec-label">${spec.label}</span>
      </div>
    `).join('');

    const ctasHtml = ctas.map(cta => {
      const href = this.generateCtaHref(cta);
      return `
        <a href="${href}" 
           class="hero-cta ${cta.type || 'primary'}"
           ${cta.target ? `target="${cta.target}"` : ''}
           data-action="${cta.action || ''}"
           data-template="${cta.template || ''}">
          ${cta.icon ? `<ion-icon name="${cta.icon}"></ion-icon>` : ''}
          ${cta.text}
        </a>
      `;
    }).join('');

    const imagesHtml = this.renderImages(images);

    return `
      <div class="container">
        <div class="hero-container">
          <div class="hero-content">
            ${badge ? `<span class="hero-badge">${badge}</span>` : ''}
            
            <h1 class="hero-title">${title}</h1>
            
            <p class="hero-description">${description}</p>
            
            ${specs.length > 0 ? `
              <div class="hero-specs">
                ${specsHtml}
              </div>
            ` : ''}
            
            ${ctas.length > 0 ? `
              <div class="hero-ctas">
                ${ctasHtml}
              </div>
            ` : ''}
            
            ${highlight ? `
              <div class="hero-highlight">
                ${this.parseHighlight(highlight)}
              </div>
            ` : ''}
          </div>
          
          ${images.length > 0 ? `
            <div class="hero-images">
              ${imagesHtml}
            </div>
          ` : ''}
        </div>
      </div>
      
      <!-- Background Elements -->
      <div class="hero-bg-elements">
        <div class="hero-bg-shape shape-1"></div>
        <div class="hero-bg-shape shape-2"></div>
      </div>
      
      <!-- Fullscreen Overlay -->
      <div class="hero-fullscreen-overlay" id="hero-fullscreen">
        <div class="hero-fullscreen-content">
          <button class="hero-fullscreen-close" aria-label="Fechar">
            <ion-icon name="close-outline"></ion-icon>
          </button>
          <img src="" alt="" class="hero-fullscreen-image" id="hero-fullscreen-image">
        </div>
      </div>
    `;
  }

  renderImages(images) {
    if (!images || images.length === 0) return '';

    const mainImage = images.find(img => img.size === 'large') || images[0];
    const smallImages = images.filter(img => img.size === 'small');

    return `
      <div class="hero-gallery">
        <div class="hero-image large" data-image-src="${mainImage.src}">
          <img src="${mainImage.src}" 
               alt="${mainImage.alt}" 
               loading="lazy"
               onerror="this.src='media/placeholder-property.jpg'">
          <div class="hero-image-overlay">
            <h3 class="hero-image-title">${mainImage.title || mainImage.alt}</h3>
          </div>
        </div>
        
        ${smallImages.map(img => `
          <div class="hero-image" data-image-src="${img.src}">
            <img src="${img.src}" 
                 alt="${img.alt}" 
                 loading="lazy"
                 onerror="this.src='media/placeholder-property.jpg'">
            <div class="hero-image-overlay">
              <h3 class="hero-image-title">${img.title || img.alt}</h3>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  generateCtaHref(cta) {
    if (cta.href) {
      return cta.href;
    }

    // Para CTAs que precisam ser gerados dinamicamente
    if (cta.action === 'whatsapp' || cta.action === 'contact') {
      return '#'; // Será tratado pelo event listener
    }

    return '#';
  }

  parseHighlight(highlight) {
    // Converter markdown simples para HTML
    return highlight
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  }

  mount(container, data) {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }

    if (!container) {
      console.error('Hero container not found');
      return;
    }

    container.innerHTML = this.render(data);
    this.element = container;
    this.fullscreenOverlay = container.querySelector('#hero-fullscreen');
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    if (!this.element) return;

    // Image gallery clicks
    const imageElements = this.element.querySelectorAll('.hero-image');
    imageElements.forEach(imageEl => {
      imageEl.addEventListener('click', () => {
        const imageSrc = imageEl.dataset.imageSrc;
        const img = imageEl.querySelector('img');
        this.openFullscreen(imageSrc, img.alt);
      });
    });

    // Fullscreen overlay
    if (this.fullscreenOverlay) {
      const closeBtn = this.fullscreenOverlay.querySelector('.hero-fullscreen-close');
      
      closeBtn?.addEventListener('click', () => {
        this.closeFullscreen();
      });

      this.fullscreenOverlay.addEventListener('click', (e) => {
        if (e.target === this.fullscreenOverlay) {
          this.closeFullscreen();
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.fullscreenOverlay.classList.contains('open')) {
          this.closeFullscreen();
        }
      });
    }

    // CTA clicks
    const ctaButtons = this.element.querySelectorAll('.hero-cta');
    ctaButtons.forEach(cta => {
      const action = cta.dataset.action;
      
      if (action === 'whatsapp' || action === 'contact') {
        cta.addEventListener('click', (e) => {
          e.preventDefault();
          this.handleCtaClick(cta);
        });
      }
    });

    // Smooth scroll para CTAs internas
    const internalLinks = this.element.querySelectorAll('a[href^="#"]');
    internalLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href !== '#') {
          e.preventDefault();
          this.scrollToSection(href.substring(1));
        }
      });
    });
  }

  openFullscreen(imageSrc, imageAlt) {
    if (!this.fullscreenOverlay) return;

    const fullscreenImage = this.fullscreenOverlay.querySelector('#hero-fullscreen-image');
    if (fullscreenImage) {
      fullscreenImage.src = imageSrc;
      fullscreenImage.alt = imageAlt;
    }

    this.fullscreenOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  closeFullscreen() {
    if (!this.fullscreenOverlay) return;

    this.fullscreenOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  handleCtaClick(cta) {
    const action = cta.dataset.action;
    const template = cta.dataset.template;

    // Disparar evento customizado para o app principal
    const event = new CustomEvent('hero-cta-click', {
      detail: {
        action,
        template,
        text: cta.textContent.trim(),
        element: cta
      }
    });

    document.dispatchEvent(event);
  }

  scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
      const headerHeight = document.querySelector('.site-header')?.offsetHeight || 80;
      const targetPosition = section.offsetTop - headerHeight - 20;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  }

  // Método para atualizar dados dinamicamente
  update(data) {
    if (this.element) {
      this.mount(this.element, data);
    }
  }

  // Método para mostrar loading
  showLoading() {
    if (this.element) {
      this.element.classList.add('loading');
    }
  }

  // Método para esconder loading
  hideLoading() {
    if (this.element) {
      this.element.classList.remove('loading');
    }
  }

  // Método para animar entrada
  animateIn() {
    if (!this.element) return;

    const animatedElements = this.element.querySelectorAll('.hero-badge, .hero-title, .hero-description, .hero-specs, .hero-ctas, .hero-highlight');
    
    animatedElements.forEach((el, index) => {
      el.style.animationDelay = `${index * 0.1}s`;
      el.classList.add('animate-in');
    });
  }

  // Método para destruir o componente
  destroy() {
    if (this.fullscreenOverlay) {
      this.closeFullscreen();
    }
    
    if (this.element) {
      this.element.innerHTML = '';
      this.element = null;
    }
  }
}

// Instância global do componente
window.HeroComponent = HeroComponent;

// CSS adicional para animações
const heroAdditionalCSS = `
.animate-in {
  animation: fadeInUp 0.6s ease-out both;
}

.hero-image {
  animation: fadeInScale 0.8s ease-out both;
}

.hero-image:nth-child(1) { animation-delay: 0.6s; }
.hero-image:nth-child(2) { animation-delay: 0.7s; }
.hero-image:nth-child(3) { animation-delay: 0.8s; }

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
`;

// Adicionar CSS adicional
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = heroAdditionalCSS;
  document.head.appendChild(style);
}

