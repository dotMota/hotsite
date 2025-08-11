# 🏠 Sistema de Landing Pages - Guia de Implementação

## 📋 Visão Geral

Este sistema foi completamente refatorado para ser **mobile first**, **componentizado** e **facilmente escalável**. Agora você pode criar landing pages para múltiplos produtos imobiliários usando uma única base de código.

## 🎯 Principais Melhorias

### ✨ Design Mobile First
- Homepage completamente redesenhada com foco em dispositivos móveis
- Hero section impactante com gradientes e animações
- Hierarquia visual melhorada com badges, ícones e cards
- Botões touch-friendly e responsivos
- Layout adaptativo para todas as telas

### 🧩 Arquitetura Componentizada
- Cada componente tem seu próprio HTML, CSS e JS
- Fácil manutenção e reutilização
- Carregamento modular e otimizado

### 🎨 Sistema de Temas
- Cores e fontes centralizadas em variáveis CSS
- Fácil personalização visual
- Tema "luxury-gold" já implementado

### 📊 Dados Centralizados
- Informações de corretores em `links.json`
- Produtos referenciam corretores por ID
- Templates de WhatsApp centralizados

## 📁 Estrutura do Projeto

```
sistema-landing-pages-v2/
├── index.html              # Homepage com indexação de produtos
├── product.html            # Template para produtos individuais
├── data/
│   ├── products.json       # Dados dos produtos
│   ├── links.json          # Corretores e links centralizados
│   └── config.json         # Configurações globais
├── components/
│   ├── header/             # Componente de cabeçalho
│   ├── hero/               # Componente hero
│   ├── product-card/       # Componente de card de produto
│   └── footer/             # Componente de rodapé
├── themes/
│   ├── variables.css       # Variáveis CSS base
│   └── luxury-gold.css     # Tema luxury-gold
├── styles/
│   └── main.css           # Estilos principais
├── scripts/
│   ├── utils.js           # Funções utilitárias
│   ├── app.js             # App da homepage
│   └── product-app.js     # App da página de produto
└── media/                 # Imagens e assets
    ├── products/          # Imagens dos produtos
    ├── agents/            # Fotos dos corretores
    └── companies/         # Logos das empresas
```

## 🚀 Como Usar

### 1. Adicionar Novo Corretor

Edite `data/links.json`:

```json
{
  "agents": {
    "novo-corretor": {
      "name": "Nome do Corretor",
      "creci": "CRECI 123456",
      "company": "Imobiliária XYZ",
      "bio": "Especialista em imóveis de alto padrão...",
      "photo": "media/agents/novo-corretor.jpg",
      "contacts": {
        "whatsapp": {
          "number": "5511999999999",
          "display": "(11) 99999-9999"
        },
        "email": "corretor@email.com"
      },
      "social": {
        "instagram": "https://instagram.com/corretor"
      }
    }
  }
}
```

### 2. Adicionar Novo Produto

Edite `data/products.json`:

```json
{
  "products": [
    {
      "id": "novo-produto",
      "active": true,
      "featured": true,
      "category": "launch",
      "agentId": "novo-corretor",
      "companyId": "empresa-1",
      "basic": {
        "name": "Nome do Empreendimento",
        "description": "Descrição do produto...",
        "location": {
          "neighborhood": "Bairro",
          "city": "Cidade",
          "state": "Estado",
          "address": "Endereço completo"
        }
      },
      "branding": {
        "theme": "luxury-gold",
        "logo": "media/products/novo-produto/logo.png"
      },
      "hero": {
        "badge": "Lançamento Exclusivo",
        "title": "Nome do Empreendimento",
        "description": "Descrição detalhada...",
        "specs": [
          {"value": "120-200m²", "label": "Área"},
          {"value": "3-4", "label": "Quartos"},
          {"value": "2-3", "label": "Vagas"}
        ],
        "ctas": [
          {
            "text": "Ver Detalhes",
            "type": "primary",
            "action": "whatsapp",
            "template": "interesse"
          }
        ],
        "images": [
          {
            "src": "media/products/novo-produto/hero-1.jpg",
            "alt": "Fachada do empreendimento",
            "size": "large"
          }
        ]
      },
      "seo": {
        "title": "Nome do Empreendimento - Cidade",
        "description": "Descrição para SEO...",
        "keywords": ["imóvel", "alto padrão", "cidade"]
      }
    }
  ]
}
```

### 3. Personalizar Tema

Edite `themes/luxury-gold.css` ou crie um novo tema:

```css
:root {
  /* Cores principais */
  --color-accent: #d4af37;
  --color-accent-hover: #b8941f;
  --color-accent-light: #f5f0e6;
  
  /* Gradientes */
  --gradient-primary: linear-gradient(135deg, #d4af37 0%, #f4e4a6 100%);
  
  /* Tipografia */
  --font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}
```

### 4. Configurar WhatsApp

Edite os templates em `data/links.json`:

```json
{
  "whatsappTemplates": {
    "interesse": "Olá! Tenho interesse no empreendimento {PRODUCT_NAME}. Gostaria de mais informações.",
    "visita": "Olá! Gostaria de agendar uma visita ao {PRODUCT_NAME}.",
    "valores": "Olá! Gostaria de saber os valores do {PRODUCT_NAME}."
  }
}
```

## 📱 URLs do Sistema

- **Homepage:** `index.html`
- **Produto específico:** `product.html?id=gran-oscar`
- **Com filtro:** `index.html#featured` (produtos em destaque)

## 🎨 Customização Visual

### Cores do Tema
Todas as cores estão centralizadas em variáveis CSS. Para mudar o tema:

1. Duplique `themes/luxury-gold.css`
2. Renomeie para seu novo tema (ex: `modern-blue.css`)
3. Altere as variáveis de cor
4. Referencie o novo tema no produto

### Componentes
Cada componente pode ser personalizado individualmente:

- **Header:** `components/header/header.css`
- **Hero:** `components/hero/hero.css`
- **Product Card:** `components/product-card/product-card.css`
- **Footer:** `components/footer/footer.css`

## 🔧 Funcionalidades Técnicas

### Carregamento Dinâmico
- Produtos carregados via JavaScript
- SEO dinâmico com meta tags
- Lazy loading de imagens

### Responsividade
- Mobile first design
- Breakpoints: 768px (tablet), 1024px (desktop)
- Touch targets otimizados

### Performance
- CSS e JS modulares
- Imagens otimizadas
- Carregamento assíncrono

## 📞 Integração WhatsApp

O sistema gera automaticamente links do WhatsApp com mensagens personalizadas:

```javascript
// Exemplo de uso
const whatsappLink = Utils.generateWhatsAppLink(
  '5511999999999',
  'Olá! Tenho interesse no {PRODUCT_NAME}',
  'Gran Oscar'
);
```

## 🚀 Deploy

### Opção 1: Servidor Web Simples
```bash
# Navegue até a pasta do projeto
cd sistema-landing-pages-v2

# Inicie um servidor local
python3 -m http.server 8000

# Acesse: http://localhost:8000
```

### Opção 2: Hospedagem
1. Faça upload de todos os arquivos para seu servidor
2. Configure o domínio para apontar para `index.html`
3. Certifique-se de que o servidor suporta URLs amigáveis

## 📊 Monitoramento

### Analytics
Adicione seu código do Google Analytics em `index.html` e `product.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Eventos Personalizados
O sistema já dispara eventos para tracking:

- `product-card-click`: Clique em card de produto
- `hero-cta-click`: Clique em CTA do hero
- `whatsapp-click`: Clique em botão WhatsApp

## 🛠️ Manutenção

### Backup
Sempre faça backup dos arquivos JSON antes de editar:
- `data/products.json`
- `data/links.json`
- `data/config.json`

### Atualizações
Para adicionar novos recursos:
1. Edite os componentes necessários
2. Atualize os dados JSON
3. Teste em ambiente local
4. Faça deploy das alterações

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do console do navegador
2. Confirme se todos os arquivos JSON estão válidos
3. Teste em ambiente local antes do deploy

---

**🎉 Parabéns!** Seu sistema de landing pages está pronto para produção com design mobile first e arquitetura profissional!

