// ===== THEME SWITCHER =====

class ThemeSwitcher {
  constructor() {
    this.currentTheme = 'light';
    this.storageKey = 'preferred-theme';
    this.init();
  }

  init() {
    // Verificar preferência salva ou preferência do sistema
    const savedTheme = localStorage.getItem(this.storageKey);
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    this.currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    this.applyTheme(this.currentTheme);
    
    // Escutar mudanças na preferência do sistema
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(this.storageKey)) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
    
    // Criar botão de alternância se não existir
    this.createToggleButton();
  }

  setTheme(theme) {
    if (theme !== 'light' && theme !== 'dark') {
      console.warn('Tema inválido:', theme);
      return;
    }

    this.currentTheme = theme;
    this.applyTheme(theme);
    localStorage.setItem(this.storageKey, theme);
    
    // Disparar evento customizado
    document.dispatchEvent(new CustomEvent('theme-changed', {
      detail: { theme }
    }));
  }

  applyTheme(theme) {
    // Adicionar classe para prevenir transições durante a mudança
    document.documentElement.classList.add('theme-switching');
    
    // Aplicar o tema
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      this.loadThemeCSS('dark-theme');
    } else {
      document.documentElement.removeAttribute('data-theme');
      this.loadThemeCSS('light-theme');
    }
    
    // Remover classe de transição após um frame
    requestAnimationFrame(() => {
      document.documentElement.classList.remove('theme-switching');
    });
    
    // Atualizar meta theme-color
    this.updateMetaThemeColor(theme);
    
    // Atualizar botões de alternância
    this.updateToggleButtons();
  }

  loadThemeCSS(themeName) {
    // Remover CSS do tema anterior
    const existingThemeLink = document.querySelector('link[data-theme-css]');
    if (existingThemeLink) {
      existingThemeLink.remove();
    }
    
    // Adicionar CSS do novo tema
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `themes/${themeName}.css`;
    link.setAttribute('data-theme-css', themeName);
    document.head.appendChild(link);
  }

  updateMetaThemeColor(theme) {
    let themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.name = 'theme-color';
      document.head.appendChild(themeColorMeta);
    }
    
    themeColorMeta.content = theme === 'dark' ? '#0F172A' : '#FFFFFF';
  }

  toggle() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  createToggleButton() {
    // Verificar se já existe um botão
    if (document.querySelector('.theme-toggle-btn')) {
      return;
    }

    // Criar botão de alternância
    const button = document.createElement('button');
    button.className = 'theme-toggle-btn';
    button.setAttribute('aria-label', 'Alternar tema');
    button.innerHTML = `
      <span class="theme-toggle-icon light-icon">
        <ion-icon name="sunny-outline"></ion-icon>
      </span>
      <span class="theme-toggle-icon dark-icon">
        <ion-icon name="moon-outline"></ion-icon>
      </span>
    `;
    
    button.addEventListener('click', () => this.toggle());
    
    // Adicionar ao header se existir
    const header = document.querySelector('.site-header .container');
    if (header) {
      header.appendChild(button);
    }
  }

  updateToggleButtons() {
    const toggleButtons = document.querySelectorAll('.theme-toggle-btn');
    toggleButtons.forEach(button => {
      if (this.currentTheme === 'dark') {
        button.classList.add('dark-active');
      } else {
        button.classList.remove('dark-active');
      }
    });
  }

  // Método público para obter o tema atual
  getCurrentTheme() {
    return this.currentTheme;
  }

  // Método público para verificar se é tema escuro
  isDark() {
    return this.currentTheme === 'dark';
  }

  // Método público para verificar se é tema claro
  isLight() {
    return this.currentTheme === 'light';
  }
}

// CSS para o botão de alternância
const themeSwitcherCSS = `
.theme-toggle-btn {
  position: relative;
  width: 48px;
  height: 48px;
  border: var(--border-width-thin) solid var(--color-border);
  border-radius: var(--border-radius-full);
  background: var(--color-surface);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.theme-toggle-btn:hover {
  box-shadow: var(--shadow-md);
  transform: scale(1.05);
  border-color: var(--color-accent);
}

.theme-toggle-btn:focus {
  outline: none;
  box-shadow: var(--shadow-focus);
}

.theme-toggle-icon {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-normal);
  color: var(--color-text-secondary);
}

.theme-toggle-icon ion-icon {
  font-size: 20px;
}

.theme-toggle-btn .light-icon {
  opacity: 1;
  transform: rotate(0deg) scale(1);
}

.theme-toggle-btn .dark-icon {
  opacity: 0;
  transform: rotate(180deg) scale(0.5);
}

.theme-toggle-btn.dark-active .light-icon {
  opacity: 0;
  transform: rotate(-180deg) scale(0.5);
}

.theme-toggle-btn.dark-active .dark-icon {
  opacity: 1;
  transform: rotate(0deg) scale(1);
  color: var(--color-accent);
}

/* Dark theme specific styles */
[data-theme="dark"] .theme-toggle-btn {
  background: var(--color-surface-elevated);
  border-color: var(--color-border-strong);
}

[data-theme="dark"] .theme-toggle-btn:hover {
  box-shadow: var(--shadow-lg), var(--glow-accent);
  border-color: var(--color-accent);
}

/* Responsive positioning */
@media (max-width: 768px) {
  .theme-toggle-btn {
    width: 44px;
    height: 44px;
  }
  
  .theme-toggle-icon ion-icon {
    font-size: 18px;
  }
}

/* Animation for theme switching */
.theme-switching .theme-toggle-btn {
  pointer-events: none;
}

.theme-switching .theme-toggle-icon {
  animation: themeSwitch 0.3s ease-in-out;
}

@keyframes themeSwitch {
  0% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(0.8) rotate(180deg); }
  100% { transform: scale(1) rotate(360deg); }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .theme-toggle-btn,
  .theme-toggle-icon {
    transition: none;
  }
  
  .theme-switching .theme-toggle-icon {
    animation: none;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .theme-toggle-btn {
    border-width: var(--border-width-medium);
  }
}
`;

// Adicionar CSS ao documento
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = themeSwitcherCSS;
  document.head.appendChild(style);
}

// Instância global
let themeSwitcher;

// Inicializar quando o DOM estiver pronto
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      themeSwitcher = new ThemeSwitcher();
    });
  } else {
    themeSwitcher = new ThemeSwitcher();
  }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.ThemeSwitcher = ThemeSwitcher;
  window.themeSwitcher = themeSwitcher;
}

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThemeSwitcher;
}

