// ===== MAIN APP - INDEX PAGE =====

class LandingPageApp {
  constructor() {
    this.config = null;
    this.products = [];
    this.agents = {};
    this.companies = {};
    this.whatsappTemplates = {};
    this.currentFilter = 'all';
    
    // Componentes
    this.headerComponent = null;
    this.productCardComponent = null;
    this.footerComponent = null;
    
    this.init();
  }

  async init() {
    try {
      // Mostrar loading
      this.showLoading();
      
      // Carregar dados
      await this.loadData();
      
      // Inicializar componentes
      this.initComponents();
      
      // Renderizar página
      await this.render();
      
      // Configurar funcionalidades
      this.setupFeatures();
      
      // Esconder loading
      this.hideLoading();
      
      console.log('Landing Page App inicializada com sucesso');
      
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
    this.products = productsData.products?.filter(p => p.active) || [];
    this.agents = linksData.agents || {};
    this.companies = linksData.companies || {};
    this.whatsappTemplates = linksData.whatsappTemplates || {};

    // Atualizar meta tags globais
    Utils.updateMetaTags({
      title: this.config.site.title,
      description: this.config.site.description,
      canonical: this.config.site.url,
      ogImage: this.config.site.url + '/media/og-image.jpg'
    });
  }

  initComponents() {
    this.headerComponent = new HeaderComponent();
    this.productCardComponent = new ProductCardComponent();
    
    // Footer será implementado posteriormente
    // this.footerComponent = new FooterComponent();
  }

  async render() {
    // Renderizar header
    this.renderHeader();
    
    // Renderizar estatísticas
    this.renderStats();
    
    // Renderizar produtos
    this.renderProducts();
    
    // Renderizar contatos flutuantes
    this.renderFloatingContact();
    
    // Renderizar footer
    this.renderFooter();
  }

  renderHeader() {
    const headerData = {
      brand: {
        logo: 'LP',
        title: this.config.site.title,
        subtitle: this.config.site.description
      },
      navigation: [
        { label: 'Início', href: '#hero' },
        { label: 'Empreendimentos', href: '#products' },
        { label: 'Contato', href: '#contact' }
      ],
      cta: {
        text: 'Falar Conosco',
        href: this.getDefaultWhatsAppLink(),
        icon: 'logo-whatsapp',
        target: '_blank'
      }
    };

    this.headerComponent.mount('#header-component', headerData);
  }

  renderStats() {
    const totalProducts = this.products.length;
    const totalAgents = Object.keys(this.agents).length;

    Utils.getElement('#total-products').textContent = totalProducts;
    Utils.getElement('#total-agents').textContent = totalAgents;
  }

  renderProducts() {
    this.productCardComponent.mount('#products-grid', this.products, this.agents);
    
    // Verificar se há produtos
    const isEmpty = this.products.length === 0;
    const emptyState = Utils.getElement('#empty-state');
    
    if (isEmpty) {
      Utils.show(emptyState);
    } else {
      Utils.hide(emptyState);
    }
  }

  renderFloatingContact() {
    const defaultAgent = this.agents[this.config.app.defaultAgent];
    if (!defaultAgent) return;

    const floatingHtml = `
      <a href="${this.getWhatsAppLink(defaultAgent, 'interesse')}" 
         class="floating-btn whatsapp" 
         target="_blank"
         aria-label="Falar no WhatsApp">
        <ion-icon name="logo-whatsapp"></ion-icon>
        WhatsApp
      </a>
      <a href="mailto:${defaultAgent.contacts.email}" 
         class="floating-btn email"
         aria-label="Enviar email">
        <ion-icon name="mail-outline"></ion-icon>
        Email
      </a>
    `;

    const floatingContainer = Utils.getElement('#floating-contact');
    if (floatingContainer) {
      floatingContainer.innerHTML = floatingHtml;
    }
  }

  renderFooter() {
    const defaultAgent = this.agents[this.config.app.defaultAgent];
    const footerHtml = `
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <h3>${this.config.site.title}</h3>
            <p>${this.config.site.description}</p>
          </div>
          
          ${defaultAgent ? `
            <div class="footer-section">
              <h4>Contato</h4>
              <p>${defaultAgent.name}</p>
              <p>${defaultAgent.creci} • ${defaultAgent.company}</p>
              <p>
                <a href="mailto:${defaultAgent.contacts.email}">${defaultAgent.contacts.email}</a>
              </p>
              <p>
                <a href="tel:${defaultAgent.contacts.whatsapp.number}">${defaultAgent.contacts.whatsapp.display}</a>
              </p>
            </div>
          ` : ''}
          
          <div class="footer-section">
            <h4>Redes Sociais</h4>
            ${defaultAgent?.social ? Object.entries(defaultAgent.social)
              .filter(([key, url]) => url)
              .map(([key, url]) => `
                <a href="${url}" target="_blank" rel="noopener">
                  <ion-icon name="logo-${key}"></ion-icon>
                  ${key.charAt(0).toUpperCase() + key.slice(1)}
                </a>
              `).join('') : ''}
          </div>
        </div>
        
        <div class="footer-bottom">
          <p>&copy; ${new Date().getFullYear()} ${this.config.site.title}. Todos os direitos reservados.</p>
        </div>
      </div>
    `;

    const footerContainer = Utils.getElement('#footer-component');
    if (footerContainer) {
      footerContainer.innerHTML = footerHtml;
    }
  }

  setupFeatures() {
    // Configurar filtros
    this.setupFilters();
    
    // Configurar eventos de contato
    this.setupContactEvents();
    
    // Configurar smooth scroll
    this.setupSmoothScroll();
    
    // Configurar lazy loading
    this.setupLazyLoading();
  }

  setupFilters() {
    const filterButtons = Utils.getElements('.filter-btn');
    
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Remover classe active de todos os botões
        filterButtons.forEach(btn => btn.classList.remove('active'));
        
        // Adicionar classe active ao botão clicado
        button.classList.add('active');
        
        // Aplicar filtro
        const filter = button.dataset.filter;
        this.applyFilter(filter);
      });
    });
  }

  applyFilter(filter) {
    this.currentFilter = filter;
    this.productCardComponent.filter(filter);
    
    // Atualizar URL
    if (filter !== 'all') {
      Utils.setUrlParameter('filter', filter);
    } else {
      Utils.removeUrlParameter('filter');
    }
  }

  setupContactEvents() {
    // Evento customizado para contato de produto
    document.addEventListener('product-contact', (e) => {
      const { productId } = e.detail;
      this.handleProductContact(productId);
    });

    // Botões de CTA
    const ctaWhatsApp = Utils.getElement('#contact-whatsapp');
    const ctaEmail = Utils.getElement('#contact-email');

    if (ctaWhatsApp) {
      ctaWhatsApp.href = this.getDefaultWhatsAppLink();
    }

    if (ctaEmail) {
      const defaultAgent = this.agents[this.config.app.defaultAgent];
      if (defaultAgent) {
        ctaEmail.href = `mailto:${defaultAgent.contacts.email}`;
      }
    }
  }

  handleProductContact(productId) {
    const product = Utils.findById(this.products, productId);
    const agent = this.agents[product?.agentId];
    
    if (product && agent) {
      const whatsappLink = this.getWhatsAppLink(agent, 'interesse', product.card.title);
      window.open(whatsappLink, '_blank');
    }
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

      // Observar imagens com data-src
      Utils.getElements('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }

  getWhatsAppLink(agent, template, productName = '') {
    const message = this.whatsappTemplates[template] || this.whatsappTemplates.interesse;
    return Utils.generateWhatsAppLink(
      agent.contacts.whatsapp.number,
      message,
      productName
    );
  }

  getDefaultWhatsAppLink() {
    const defaultAgent = this.agents[this.config.app.defaultAgent];
    if (defaultAgent) {
      return this.getWhatsAppLink(defaultAgent, 'interesse');
    }
    return '#';
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
    
    // Implementar UI de erro se necessário
    const errorHtml = `
      <div class="error-container">
        <div class="error-content">
          <ion-icon name="alert-circle-outline"></ion-icon>
          <h2>Ops! Algo deu errado</h2>
          <p>${message}</p>
          <button onclick="window.location.reload()" class="btn btn-primary">
            Tentar Novamente
          </button>
        </div>
      </div>
    `;

    document.body.innerHTML = errorHtml;
  }

  // Métodos públicos para debug
  getProducts() {
    return this.products;
  }

  getAgents() {
    return this.agents;
  }

  getCurrentFilter() {
    return this.currentFilter;
  }
}

// Inicializar aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.app = new LandingPageApp();
});

// Exportar para uso global
window.LandingPageApp = LandingPageApp;

