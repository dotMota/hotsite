// ===== PRODUCT APP - INDIVIDUAL PRODUCT PAGE =====

class ProductApp {
  constructor() {
    this.config = null;
    this.product = null;
    this.agent = null;
    this.company = null;
    this.whatsappTemplates = {};
    this.productId = null;
    
    // Componentes
    this.headerComponent = null;
    this.heroComponent = null;
    
    this.init();
  }

  async init() {
    try {
      // Mostrar loading
      this.showLoading();
      
      // Obter ID do produto da URL
      this.productId = Utils.getUrlParameter('id');
      
      if (!this.productId) {
        throw new Error('ID do produto não encontrado na URL');
      }
      
      // Carregar dados
      await this.loadData();
      
      // Validar produto
      if (!this.product) {
        throw new Error(`Produto com ID "${this.productId}" não encontrado`);
      }
      
      if (!this.product.active) {
        throw new Error('Este produto não está mais disponível');
      }
      
      // Inicializar componentes
      this.initComponents();
      
      // Renderizar página
      await this.render();
      
      // Configurar funcionalidades
      this.setupFeatures();
      
      // Esconder loading
      this.hideLoading();
      
      console.log('Product App inicializada com sucesso para:', this.product.basic.name);
      
    } catch (error) {
      console.error('Erro ao inicializar a aplicação:', error);
      this.showError(error.message);
    }
  }

  async loadData() {
    const dataUrls = [
      'data/config.json',
      'data/products.json',
      'data/links.json'
    ];

    const [config, productsData, linksData] = await Promise.all(
      dataUrls.map(url => Utils.loadJSON(url))
    );

    if (!config || !productsData || !linksData) {
      throw new Error('Falha ao carregar dados essenciais');
    }

    this.config = config;
    this.whatsappTemplates = linksData.whatsappTemplates || {};

    // Encontrar produto específico
    this.product = Utils.findById(productsData.products, this.productId);
    
    if (this.product) {
      // Carregar dados do agente e empresa
      this.agent = linksData.agents[this.product.agentId];
      this.company = linksData.companies[this.product.companyId];
      
      // Atualizar meta tags
      this.updateSEO();
      
      // Carregar tema específico se definido
      if (this.product.branding?.theme) {
        Utils.loadTheme(this.product.branding.theme);
      }
    }
  }

  updateSEO() {
    if (!this.product.seo) return;

    Utils.updateMetaTags(this.product.seo);
    
    // Structured data
    if (this.product.seo.structuredData) {
      Utils.updateStructuredData(this.product.seo.structuredData);
    }
  }

  initComponents() {
    this.headerComponent = new HeaderComponent();
    this.heroComponent = new HeroComponent();
    
    // Outros componentes serão inicializados conforme necessário
  }

  async render() {
    // Renderizar header
    this.renderHeader();
    
    // Renderizar hero
    this.renderHero();
    
    // Renderizar features (placeholder)
    this.renderFeatures();
    
    // Renderizar location (placeholder)
    this.renderLocation();
    
    // Renderizar agent
    this.renderAgent();
    
    // Renderizar footer
    this.renderFooter();
    
    // Renderizar contatos flutuantes
    this.renderFloatingContact();
  }

  renderHeader() {
    const headerData = {
      brand: {
        logo: this.product.branding?.logo || this.product.basic.name.substring(0, 2).toUpperCase(),
        title: this.product.branding?.title || this.product.basic.name,
        subtitle: this.product.branding?.subtitle || `${this.product.basic.location.neighborhood}, ${this.product.basic.location.city}`
      },
      navigation: this.product.navigation || [],
      cta: {
        text: 'Falar no WhatsApp',
        href: this.getWhatsAppLink('interesse'),
        icon: 'logo-whatsapp',
        target: '_blank'
      },
      showBackButton: true
    };

    this.headerComponent.mount('#header-component', headerData);
  }

  renderHero() {
    if (!this.product.hero) return;

    this.heroComponent.mount('#hero-component', this.product.hero);
  }

  renderFeatures() {
    const featuresContainer = Utils.getElement('#features-component');
    if (!featuresContainer || !this.product.features) return;

    const { title, description, items } = this.product.features;

    const featuresHtml = `
      <div class="container">
        <div class="section-header text-center">
          <h2>${title}</h2>
          <p>${description}</p>
        </div>
        
        <div class="features-grid">
          ${items.map(item => `
            <div class="feature-item">
              <div class="feature-icon">
                <ion-icon name="${item.icon}"></ion-icon>
              </div>
              <h3 class="feature-title">${item.title}</h3>
              <p class="feature-description">${item.description}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    featuresContainer.innerHTML = featuresHtml;
  }

  renderLocation() {
    const locationContainer = Utils.getElement('#location-component');
    if (!locationContainer || !this.product.location) return;

    const { title, description, subtitle, mapUrl, nearby } = this.product.location;

    const nearbyHtml = nearby ? `
      <div class="location-nearby">
        <h4>Pontos de Interesse</h4>
        <ul class="nearby-list">
          ${nearby.map(point => `
            <li class="nearby-item">
              <span class="nearby-name">${point.name}</span>
              <span class="nearby-distance">${point.distance}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    ` : '';

    const locationHtml = `
      <div class="container">
        <div class="location-content">
          <div class="location-info">
            <h2>${title}</h2>
            <p>${description}</p>
            ${subtitle ? `<h3>${subtitle}</h3>` : ''}
            <p class="location-address">${this.product.basic.location.address}</p>
            ${nearbyHtml}
          </div>
          
          <div class="location-map">
            ${mapUrl ? `
              <iframe 
                src="${mapUrl}"
                width="100%" 
                height="400"
                style="border:0; border-radius: var(--border-radius-lg);"
                allowfullscreen=""
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade">
              </iframe>
            ` : `
              <div class="map-placeholder">
                <ion-icon name="location-outline"></ion-icon>
                <p>Mapa em breve</p>
              </div>
            `}
          </div>
        </div>
      </div>
    `;

    locationContainer.innerHTML = locationHtml;
  }

  renderAgent() {
    const agentContainer = Utils.getElement('#agent-component');
    if (!agentContainer || !this.agent) return;

    const agentHtml = `
      <div class="container">
        <div class="agent-content">
          <div class="agent-info">
            <div class="agent-photo">
              <img src="${this.agent.photo}" alt="${this.agent.name}" onerror="this.src='media/placeholder-agent.jpg'">
            </div>
            <div class="agent-details">
              <h3>${this.agent.name}</h3>
              <p class="agent-creci">${this.agent.creci}</p>
              <p class="agent-company">${this.agent.company}</p>
              ${this.agent.bio ? `<p class="agent-bio">${this.agent.bio}</p>` : ''}
            </div>
          </div>
          
          <div class="agent-contacts">
            <h4>Entre em contato</h4>
            <div class="contact-buttons">
              <a href="${this.getWhatsAppLink('interesse')}" class="contact-btn whatsapp" target="_blank">
                <ion-icon name="logo-whatsapp"></ion-icon>
                WhatsApp
              </a>
              <a href="mailto:${this.agent.contacts.email}" class="contact-btn email">
                <ion-icon name="mail-outline"></ion-icon>
                Email
              </a>
              ${this.agent.social?.instagram ? `
                <a href="${this.agent.social.instagram}" class="contact-btn instagram" target="_blank">
                  <ion-icon name="logo-instagram"></ion-icon>
                  Instagram
                </a>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;

    agentContainer.innerHTML = agentHtml;
  }

  renderFooter() {
    const footerContainer = Utils.getElement('#footer-component');
    if (!footerContainer) return;

    const footerData = this.product.footer || {};

    const footerHtml = `
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <h3>${this.product.basic.name}</h3>
            <p>${this.product.basic.location.address}</p>
            <p>${footerData.copyright || `© ${new Date().getFullYear()} ${this.product.basic.name}`}</p>
            ${footerData.disclaimer ? `<p class="footer-disclaimer">${footerData.disclaimer}</p>` : ''}
          </div>
          
          <div class="footer-section">
            <h4>Contato</h4>
            <p>${this.agent?.name}</p>
            <p>${this.agent?.creci} • ${this.agent?.company}</p>
            <p>
              <a href="mailto:${this.agent?.contacts.email}">${this.agent?.contacts.email}</a>
            </p>
            <p>
              <a href="tel:${this.agent?.contacts.whatsapp.number}">${this.agent?.contacts.whatsapp.display}</a>
            </p>
          </div>
        </div>
      </div>
    `;

    footerContainer.innerHTML = footerHtml;
  }

  renderFloatingContact() {
    const floatingContainer = Utils.getElement('#floating-contact');
    if (!floatingContainer || !this.agent) return;

    const floatingHtml = `
      <a href="${this.getWhatsAppLink('interesse')}" 
         class="floating-btn whatsapp" 
         target="_blank"
         aria-label="Falar no WhatsApp">
        <ion-icon name="logo-whatsapp"></ion-icon>
        WhatsApp
      </a>
      <a href="mailto:${this.agent.contacts.email}" 
         class="floating-btn email"
         aria-label="Enviar email">
        <ion-icon name="mail-outline"></ion-icon>
        Email
      </a>
    `;

    floatingContainer.innerHTML = floatingHtml;
  }

  setupFeatures() {
    // Configurar eventos de CTA do hero
    this.setupHeroEvents();
    
    // Configurar smooth scroll
    this.setupSmoothScroll();
    
    // Configurar lazy loading
    this.setupLazyLoading();
  }

  setupHeroEvents() {
    document.addEventListener('hero-cta-click', (e) => {
      const { action, template } = e.detail;
      
      if (action === 'whatsapp' || action === 'contact') {
        const whatsappLink = this.getWhatsAppLink(template || 'interesse');
        window.open(whatsappLink, '_blank');
      }
    });
  }

  setupSmoothScroll() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (link) {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = Utils.getElement(`#${targetId}`);
        
        if (targetElement) {
          const headerHeight = Utils.getElement('.site-header')?.offsetHeight || 80;
          const targetPosition = targetElement.offsetTop - headerHeight - 20;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  }

  setupLazyLoading() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          }
        });
      });

      Utils.getElements('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }

  getWhatsAppLink(template) {
    if (!this.agent) return '#';
    
    const message = this.whatsappTemplates[template] || this.whatsappTemplates.interesse;
    return Utils.generateWhatsAppLink(
      this.agent.contacts.whatsapp.number,
      message,
      this.product.basic.name
    );
  }

  showLoading() {
    const overlay = Utils.getElement('#loading-overlay');
    if (overlay) {
      overlay.classList.remove('hidden');
    }
  }

  hideLoading() {
    const overlay = Utils.getElement('#loading-overlay');
    if (overlay) {
      overlay.classList.add('hidden');
    }
  }

  showError(message) {
    console.error('Erro na aplicação:', message);
    
    const errorHtml = `
      <div class="error-container">
        <div class="error-content">
          <ion-icon name="alert-circle-outline"></ion-icon>
          <h2>Ops! Algo deu errado</h2>
          <p>${message}</p>
          <div class="error-actions">
            <a href="index.html" class="btn btn-primary">
              <ion-icon name="home-outline"></ion-icon>
              Voltar ao Início
            </a>
            <button onclick="window.location.reload()" class="btn btn-secondary">
              <ion-icon name="refresh-outline"></ion-icon>
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.innerHTML = errorHtml;
  }

  // Métodos públicos para debug
  getProduct() {
    return this.product;
  }

  getAgent() {
    return this.agent;
  }

  getProductId() {
    return this.productId;
  }
}

// Inicializar aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.productApp = new ProductApp();
});

// Exportar para uso global
window.ProductApp = ProductApp;

// CSS adicional para a página de produto
const productPageCSS = `
.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: var(--spacing-xl);
  background: var(--color-background);
}

.error-content {
  text-align: center;
  max-width: 500px;
}

.error-content ion-icon {
  font-size: 4rem;
  color: var(--color-error);
  margin-bottom: var(--spacing-lg);
}

.error-content h2 {
  margin-bottom: var(--spacing-md);
  color: var(--color-text-primary);
}

.error-content p {
  margin-bottom: var(--spacing-xl);
  color: var(--color-text-secondary);
}

.error-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  flex-wrap: wrap;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-xl);
  margin-top: var(--spacing-3xl);
}

.feature-item {
  text-align: center;
  padding: var(--spacing-xl);
  background: var(--color-surface);
  border-radius: var(--border-radius-xl);
  border: var(--border-width-thin) solid var(--color-border);
  transition: all var(--transition-normal);
}

.feature-item:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.feature-icon {
  width: 60px;
  height: 60px;
  background: var(--gradient-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--spacing-lg);
}

.feature-icon ion-icon {
  font-size: 24px;
  color: white;
}

.feature-title {
  margin-bottom: var(--spacing-md);
  color: var(--color-text-primary);
}

.feature-description {
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
}

.location-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-4xl);
  align-items: start;
}

.location-info h2 {
  margin-bottom: var(--spacing-md);
}

.location-address {
  font-weight: var(--font-weight-semibold);
  color: var(--color-accent);
  margin: var(--spacing-lg) 0;
}

.nearby-list {
  list-style: none;
  padding: 0;
  margin: var(--spacing-lg) 0 0;
}

.nearby-item {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-sm) 0;
  border-bottom: var(--border-width-thin) solid var(--color-border-muted);
}

.nearby-distance {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.map-placeholder {
  height: 400px;
  background: var(--color-surface-elevated);
  border-radius: var(--border-radius-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
}

.map-placeholder ion-icon {
  font-size: 3rem;
  margin-bottom: var(--spacing-md);
}

.agent-content {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--spacing-4xl);
  align-items: center;
  background: var(--color-surface-elevated);
  padding: var(--spacing-4xl);
  border-radius: var(--border-radius-xl);
}

.agent-info {
  display: flex;
  gap: var(--spacing-xl);
  align-items: center;
}

.agent-photo {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.agent-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.agent-details h3 {
  margin-bottom: var(--spacing-xs);
  color: var(--color-text-primary);
}

.agent-creci,
.agent-company {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-xs);
}

.agent-bio {
  color: var(--color-text-secondary);
  margin-top: var(--spacing-md);
}

.contact-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.contact-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--border-radius-lg);
  text-decoration: none;
  font-weight: var(--font-weight-semibold);
  transition: all var(--transition-fast);
  min-width: 140px;
}

.contact-btn.whatsapp {
  background: #25d366;
  color: white;
}

.contact-btn.email {
  background: var(--color-accent);
  color: white;
}

.contact-btn.instagram {
  background: #e4405f;
  color: white;
}

.contact-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  color: white;
}

@media (max-width: 768px) {
  .location-content,
  .agent-content {
    grid-template-columns: 1fr;
    gap: var(--spacing-xl);
  }
  
  .agent-info {
    flex-direction: column;
    text-align: center;
  }
  
  .contact-buttons {
    flex-direction: row;
    justify-content: center;
    flex-wrap: wrap;
  }
}
`;

// Adicionar CSS adicional
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = productPageCSS;
  document.head.appendChild(style);
}

