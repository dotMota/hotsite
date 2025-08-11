// ===== PRODUCT CARD COMPONENT =====

class ProductCardComponent {
  constructor() {
    this.cards = new Map();
  }

  render(product, agent = null) {
    if (!product) {
      return this.renderSkeleton();
    }

    const {
      id,
      active,
      featured,
      card,
      basic
    } = product;

    if (!active) {
      return this.renderUnavailable(card);
    }

    const badgeClass = featured ? 'featured' : 
                      card.badge?.toLowerCase().includes('lançamento') ? 'launch' : '';

    const specsHtml = card.specs?.map(spec => `
      <span class="card-spec">${spec}</span>
    `).join('') || '';

    const highlightsHtml = card.highlights?.length > 0 ? `
      <div class="card-highlights">
        <h4 class="card-highlights-title">Destaques</h4>
        <div class="card-highlights-list">
          ${card.highlights.map(highlight => `
            <span class="card-highlight">
              <ion-icon name="checkmark-circle-outline"></ion-icon>
              ${highlight}
            </span>
          `).join('')}
        </div>
      </div>
    ` : '';

    const agentInfo = agent ? `
      <div class="card-agent">
        <span class="card-agent-name">${agent.name}</span>
        <span class="card-agent-company">${agent.company}</span>
      </div>
    ` : '';

    return `
      <article class="product-card animate-in" data-product-id="${id}" data-featured="${featured}">
        <div class="card-image-container">
          <img 
            src="${card.image || 'media/placeholder-property.jpg'}" 
            alt="${card.title} - ${card.subtitle}"
            class="card-image"
            loading="lazy"
            onerror="this.src='media/placeholder-property.jpg'"
          >
          ${card.badge ? `<span class="card-badge ${badgeClass}">${card.badge}</span>` : ''}
        </div>
        
        <div class="card-content">
          <header class="card-header">
            <h3 class="card-title">${card.title}</h3>
            <p class="card-subtitle">
              <ion-icon name="location-outline"></ion-icon>
              ${card.subtitle}
            </p>
            <p class="card-description">${card.description}</p>
          </header>

          ${card.specs?.length > 0 ? `
            <div class="card-specs">
              ${specsHtml}
            </div>
          ` : ''}

          ${highlightsHtml}

          <footer class="card-footer">
            <div class="card-price">
              <span class="card-price-label">Valores</span>
              <span class="card-price-value">${card.priceRange || 'Consulte'}</span>
            </div>
            
            <div class="card-actions">
              <a href="product.html?id=${id}" class="card-btn card-btn-primary">
                <ion-icon name="eye-outline"></ion-icon>
                Ver Detalhes
              </a>
              <a href="#" class="card-btn card-btn-secondary" data-action="contact" data-product-id="${id}">
                <ion-icon name="chatbubble-outline"></ion-icon>
                Contato
              </a>
            </div>

            ${agentInfo}
          </footer>
        </div>
      </article>
    `;
  }

  renderSkeleton() {
    return `
      <div class="card-skeleton">
        <div class="skeleton-image skeleton"></div>
        <div class="skeleton-content">
          <div class="skeleton-line skeleton"></div>
          <div class="skeleton-line short skeleton"></div>
          <div class="skeleton-line medium skeleton"></div>
          <div class="skeleton-line short skeleton"></div>
        </div>
      </div>
    `;
  }

  renderUnavailable(card = {}) {
    return `
      <article class="product-card unavailable">
        <div class="card-image-container">
          <img 
            src="${card.image || 'media/placeholder-property.jpg'}" 
            alt="${card.title || 'Empreendimento'}"
            class="card-image"
            loading="lazy"
          >
        </div>
        
        <div class="card-content">
          <header class="card-header">
            <h3 class="card-title">${card.title || 'Novo Empreendimento'}</h3>
            <p class="card-subtitle">
              <ion-icon name="location-outline"></ion-icon>
              ${card.subtitle || 'Localização em breve'}
            </p>
            <p class="card-description">${card.description || 'Mais informações em breve.'}</p>
          </header>
        </div>
      </article>
    `;
  }

  mount(container, products = [], agents = {}) {
    if (typeof container === 'string') {
      container = document.querySelector(container);
    }

    if (!container) {
      console.error('Product cards container not found');
      return;
    }

    // Limpar container
    container.innerHTML = '';

    // Renderizar cards
    products.forEach((product, index) => {
      const agent = agents[product.agentId];
      const cardHtml = this.render(product, agent);
      
      // Criar elemento temporário para inserir o HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = cardHtml;
      const cardElement = tempDiv.firstElementChild;
      
      if (cardElement) {
        // Adicionar delay na animação
        cardElement.style.animationDelay = `${index * 0.1}s`;
        container.appendChild(cardElement);
        
        // Armazenar referência
        this.cards.set(product.id, cardElement);
      }
    });

    // Configurar event listeners
    this.setupEventListeners(container);
  }

  setupEventListeners(container) {
    // Click nos cards para navegar
    container.addEventListener('click', (e) => {
      const card = e.target.closest('.product-card');
      if (!card || card.classList.contains('unavailable')) return;

      const productId = card.dataset.productId;
      
      // Se clicou em um botão específico, não navegar
      if (e.target.closest('.card-btn')) {
        this.handleButtonClick(e, productId);
        return;
      }

      // Navegar para a página do produto
      if (productId) {
        window.location.href = `product.html?id=${productId}`;
      }
    });

    // Hover effects
    container.addEventListener('mouseenter', (e) => {
      const card = e.target.closest('.product-card');
      if (card && !card.classList.contains('unavailable')) {
        this.animateCardHover(card, true);
      }
    }, true);

    container.addEventListener('mouseleave', (e) => {
      const card = e.target.closest('.product-card');
      if (card && !card.classList.contains('unavailable')) {
        this.animateCardHover(card, false);
      }
    }, true);
  }

  handleButtonClick(e, productId) {
    e.preventDefault();
    e.stopPropagation();

    const button = e.target.closest('.card-btn');
    if (!button) return;

    const action = button.dataset.action;

    switch (action) {
      case 'contact':
        this.handleContactClick(productId);
        break;
      case 'favorite':
        this.handleFavoriteClick(productId);
        break;
      default:
        // Para outros botões (como "Ver Detalhes"), deixar o comportamento padrão
        break;
    }
  }

  handleContactClick(productId) {
    // Disparar evento customizado para o app principal
    const event = new CustomEvent('product-contact', {
      detail: { productId }
    });
    document.dispatchEvent(event);
  }

  handleFavoriteClick(productId) {
    // Implementar lógica de favoritos se necessário
    console.log('Favoritar produto:', productId);
  }

  animateCardHover(card, isHovering) {
    const image = card.querySelector('.card-image');
    const badge = card.querySelector('.card-badge');

    if (isHovering) {
      if (image) {
        image.style.transform = 'scale(1.05)';
      }
      if (badge) {
        badge.style.transform = 'scale(1.1)';
      }
    } else {
      if (image) {
        image.style.transform = 'scale(1)';
      }
      if (badge) {
        badge.style.transform = 'scale(1)';
      }
    }
  }

  // Filtrar cards por critério
  filter(criteria) {
    this.cards.forEach((cardElement, productId) => {
      const shouldShow = this.matchesCriteria(cardElement, criteria);
      
      if (shouldShow) {
        cardElement.style.display = '';
        cardElement.classList.add('animate-in');
      } else {
        cardElement.style.display = 'none';
        cardElement.classList.remove('animate-in');
      }
    });
  }

  matchesCriteria(cardElement, criteria) {
    if (!criteria || criteria === 'all') return true;

    switch (criteria) {
      case 'featured':
        return cardElement.dataset.featured === 'true';
      case 'launch':
        return cardElement.querySelector('.card-badge.launch') !== null;
      default:
        return true;
    }
  }

  // Atualizar um card específico
  updateCard(productId, product, agent) {
    const cardElement = this.cards.get(productId);
    if (cardElement) {
      const newHtml = this.render(product, agent);
      cardElement.outerHTML = newHtml;
      
      // Atualizar referência
      const newElement = document.querySelector(`[data-product-id="${productId}"]`);
      if (newElement) {
        this.cards.set(productId, newElement);
      }
    }
  }

  // Remover um card
  removeCard(productId) {
    const cardElement = this.cards.get(productId);
    if (cardElement) {
      cardElement.style.animation = 'cardSlideOut 0.3s ease-in forwards';
      setTimeout(() => {
        cardElement.remove();
        this.cards.delete(productId);
      }, 300);
    }
  }

  // Limpar todos os cards
  clear() {
    this.cards.clear();
  }

  // Obter estatísticas dos cards
  getStats() {
    return {
      total: this.cards.size,
      featured: Array.from(this.cards.values()).filter(card => 
        card.dataset.featured === 'true'
      ).length
    };
  }
}

// Instância global do componente
window.ProductCardComponent = ProductCardComponent;

// CSS adicional para animação de saída
const additionalCSS = `
@keyframes cardSlideOut {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
}
`;

// Adicionar CSS adicional
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = additionalCSS;
  document.head.appendChild(style);
}

