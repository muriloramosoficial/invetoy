# 🎨 INVENTOY — Design System

> **Propósito:** Documentação oficial do design system da INVENTOY para garantir consistência entre Web (Next.js) e Mobile (futuro app React Native/Expo).
>
> **Última atualização:** 26 de junho de 2026
> **Versão:** 1.0

---

## 📋 Índice

1. [Filosofia de Design](#1-filosofia-de-design)
2. [Paleta de Cores](#2-paleta-de-cores)
3. [Tipografia](#3-tipografia)
4. [Espaçamento e Grid](#4-espaçamento-e-grid)
5. [Componentes](#5-componentes)
6. [Ícones](#6-ícones)
7. [Animações e Transições](#7-animações-e-transições)
8. [Acessibilidade](#8-acessibilidade)
9. [Mobile First](#9-mobile-first)
10. [Tokens (Tailwind v4)](#10-tokens-tailwind-v4)
11. [Recursos para App Mobile](#11-recursos-para-app-mobile)

---

## 1. Filosofia de Design

### Princípios

| Princípio | Descrição |
|-----------|-----------|
| **Dark First** | Dark mode nativo como único tema. Fundo `#121212` + verde neon `#3ECF8E` |
| **Técnico** | Estética inspirada em terminais e dashboards. Monospace para dados, sans-serif para UI |
| **Sutil** | Textura de ruído no fundo, bordas frias, sem sombras exageradas |
| **Funcional** | Cada elemento tem um propósito. Sem decoração gratuita |
| **Mobile-first** | Todo design começa pelo mobile (320px+), escala para tablet/desktop |

### Inspiração Visual

- Supabase Dashboard (dark mode, verde neon)
- Vercel (clean, tipografia, espaçamento)
- Terminal/CLI (monospace, grids de dados)
- shadcn/ui (componentes base)

---

## 2. Paleta de Cores

### Cores Base (Dark Mode)

```css
/* Backgrounds - escuros frios */
--color-bg-primary:     #121212;  /* Fundo principal */
--color-bg-secondary:   #1c1c1c;  /* Fundo secundário (navbars, headers) */
--color-bg-surface:     #242424;  /* Cards, inputs, superfícies elevadas */
--color-bg-surface-hover: #2a2a2a; /* Hover de superfícies */
--color-bg-elevated:    #2e2e2e;  /* Elementos ainda mais elevados */

/* Brand - verde neon */
--color-brand:          #3ECF8E;  /* Verde principal (CTA, links, acentos) */
--color-brand-hover:    #45d99a;  /* Hover do brand */
--color-brand-dim:      rgba(62, 207, 142, 0.12); /* Fundo translúcido brand */

/* Semântica */
--color-brand-info:     #53B1E5;  /* Info / azul */
--color-brand-warning:  #F5A623;  /* Warning / amarelo */
--color-brand-danger:   #E5484D;  /* Erro / vermelho */
--color-brand-danger-dim: rgba(229, 72, 77, 0.12); /* Fundo translúcido erro */

/* Bordas */
--color-border-default: #333333;  /* Borda padrão */
--color-border-muted:   #2a2a2a;  /* Borda sutil */
--color-border-brand:   rgba(62, 207, 142, 0.3); /* Borda brand */

/* Texto */
--color-text-primary:   #EDEDED;  /* Texto principal (branco sujo) */
--color-text-secondary: #A1A1AA;  /* Texto secundário */
--color-text-muted:     #52525B;  /* Texto muted / placeholders */
--color-text-brand:     #3ECF8E;  /* Texto na cor brand */

/* Badges */
--color-badge-bg:       rgba(62, 207, 142, 0.08);
--color-badge-border:   rgba(62, 207, 142, 0.2);

/* Chart */
--color-chart-line:     #3ECF8E;
--color-chart-area:     rgba(62, 207, 142, 0.08);
--color-chart-grid:     #2a2a2a;
```

### Uso de Cores

```tsx
// ✅ CORRETO - Usar tokens do Tailwind
<button className="bg-brand text-black">Ação</button>
<div className="bg-bg-surface border border-border-default">
  <p className="text-text-primary">Título</p>
  <p className="text-text-secondary">Descrição</p>
</div>

// ❌ ERRADO - Cores hardcoded
<button style={{ backgroundColor: '#3ECF8E' }}>Ação</button>
```

### Contraste e Acessibilidade

| Combinação | Ratio | Nível |
|------------|-------|-------|
| `brand` (#3ECF8E) sobre `bg-primary` (#121212) | 8.5:1 | ✅ AAA |
| `text-primary` (#EDEDED) sobre `bg-primary` (#121212) | 15.4:1 | ✅ AAA |
| `text-secondary` (#A1A1AA) sobre `bg-primary` (#121212) | 8.1:1 | ✅ AAA |
| `text-muted` (#52525B) sobre `bg-primary` (#121212) | 3.5:1 | ⚠️ AA (apenas para texto grande) |
| `brand` (#3ECF8E) sobre `black` (#000000) | 2.3:1 | ❌ Usar apenas para ícones/gráficos |

> **⚠️ Importante:** Não use `text-muted` para textos informativos essenciais. Reserve para placeholders, metadados secundários e textos decorativos.

---

## 3. Tipografia

### Fontes

| Uso | Fonte | Weight | Classe Tailwind |
|-----|-------|--------|-----------------|
| UI / Body | Inter | 400, 500, 600, 700 | `font-sans` |
| Dados / Código | JetBrains Mono | 400, 500, 600 | `font-mono` |

### Escala Tipográfica

```css
/* Mobile-first - tamanhos menores, crescem em desktop */
h1: text-4xl (36px) → sm:text-5xl (48px) → lg:text-6xl (60px)
h2: text-3xl (30px) → sm:text-4xl (36px)
h3: text-lg (18px)  /* títulos de card */
body: text-sm (14px) /* texto padrão */
caption: text-xs (12px) /* metadados */
small: text-[10px] /* badges, tags */
```

### Regras de Tipografia

```tsx
// Títulos
<h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
  Gestão de Estoque <span className="text-brand">Inteligente</span>
</h1>

// Subtítulos
<h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
  Seção
</h2>

// Cards / Blocos
<h3 className="text-base font-medium text-text-primary">Título do Card</h3>
<p className="text-sm text-text-secondary leading-relaxed">Descrição do card</p>

// Dados tabulares / código
<span className="text-sm font-mono tracking-tight">SKU-001</span>

// Labels de formulário
<label className="text-xs font-medium text-text-secondary uppercase tracking-wide">
  Email
</label>
```

### Line-height

```css
/* Padrões */
títulos:    leading-[1.1]  /* tight */
body:       leading-relaxed  ~1.625
dados:      leading-none  /* monospace data */
```

---

## 4. Espaçamento e Grid

### Sistema de Espaçamento

Usamos o sistema nativo do Tailwind (base 4px):

```css
/* Mobile-first padding */
px-4 (16px) → sm:px-6 (24px) → lg:px-8 (32px)

/* Section spacing */
py-20 (80px) → sm:py-28 (112px)

/* Card interno */
p-6 (24px)

/* Gaps entre elementos */
gap-2 (8px)  /* elementos inline */
gap-3 (12px) /* elementos de form */
gap-4 (16px) /* grid cards */
gap-6 (24px) /* seções internas */
gap-8 (32px) /* nav items */
```

### Grid Layout

```tsx
// Landing page - Features
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards */}
</div>

// Plans
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  {/* Plan cards */}
</div>

// Dashboard metrics
<div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
  {/* Metric cards */}
</div>

// Dashboard main
<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
  <div className="lg:col-span-2">{/* Main content */}</div>
  <div>{/* Sidebar */}</div>
</div>
```

### Max Widths

```css
/* Content containers */
max-w-7xl (1280px) /* Landing page sections */
max-w-6xl (1152px) /* Feature grids */
max-w-5xl (1024px) /* Pricing */
max-w-4xl (896px)  /* Hero text */
max-w-3xl (768px)  /* Legal pages, Settings */
max-w-sm  (384px)  /* Login/Register forms */
```

---

## 5. Componentes

### 5.1 Button

```tsx
import { Button } from "@/components/ui/button";

// Variants
<Button variant="primary">   {/* Brand verde - ação principal */}
<Button variant="secondary"> {/* Borda + fundo surface */}
<Button variant="outline">   {/* Borda transparente com hover brand */}
<Button variant="ghost">     {/* Apenas texto */}
<Button variant="danger">    {/* Vermelho - ações destrutivas */}
<Button variant="link">      {/* Link estilizado como texto */}

// Sizes
<Button size="sm">    {/* h-8 px-3 text-xs */}
<Button size="md">    {/* h-10 px-4 text-sm — PADRÃO */}
<Button size="lg">    {/* h-12 px-6 text-base */}
<Button size="icon">  {/* h-10 w-10 */}
<Button size="icon-sm">{/* h-8 w-8 */}

// States
<Button loading>      {/* Mostra spinner + desabilita */}
<Button disabled>     {/* opacity-50 cursor-not-allowed */}
```

```css
/* CSS equivalents for mobile */
.btn-primary {
  background-color: #3ECF8E;
  color: #000000;
  border-radius: 4px;
  /* hover: brightness increase + shadow glow */
}
.btn-primary:active {
  transform: scale(0.98);
}

.btn-outline {
  border: 1px solid #333333;
  background: transparent;
  color: #EDEDED;
  /* hover: border brand */
}
```

### 5.2 Input

```tsx
import { Input } from "@/components/ui/input";

<Input
  label="Email"               {/* Label opcional */}
  type="email"                {/* Tipo HTML */}
  placeholder="seu@email.com"
  value={value}
  onChange={setValue}
  required
  error="Campo obrigatório"   {/* Mensagem de erro */}
  icon={<Mail className="h-4 w-4" />}  {/* Ícone à esquerda */}
/>
```

```css
/* Mobile */
.input {
  height: 40px;
  border: 1px solid #333;
  border-radius: 4px;
  background: #242424;
  color: #EDEDED;
  font-size: 14px;
  padding: 0 12px;
  transition: border-color 150ms;
}
.input:focus {
  border-color: rgba(62, 207, 142, 0.4);
  box-shadow: 0 0 0 1px rgba(62, 207, 142, 0.2);
}
.input--error {
  border-color: #E5484D;
}
.input--with-icon {
  padding-left: 40px;
}
```

### 5.3 Card

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

<Card accent="brand">   {/* brand | info | warning | danger | none */}
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descrição do card</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Conteúdo */}
  </CardContent>
  <CardFooter>
    {/* Ações */}
  </CardFooter>
</Card>
```

```css
/* Mobile */
.card {
  background: #242424;
  border: 1px solid #333;
  border-radius: 6px;
  padding: 20px;
  border-top: 2px solid transparent;
}
.card--brand { border-top-color: #3ECF8E; }
.card--info { border-top-color: #53B1E5; }
.card--warning { border-top-color: #F5A623; }
.card--danger { border-top-color: #E5484D; }
```

### 5.4 Badge / TechBadge

```tsx
<TechBadge variant="green">Ativo</TechBadge>
<TechBadge variant="yellow">Pendente</TechBadge>
<TechBadge variant="red">Inativo</TechBadge>
<TechBadge variant="gray">Rascunho</TechBadge>
```

```css
/* Mobile */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.02em;
}
.badge--green {
  background: rgba(62, 207, 142, 0.08);
  border: 1px solid rgba(62, 207, 142, 0.2);
  color: #3ECF8E;
}
```

### 5.5 CookieConsent

```tsx
// Adicionado automaticamente em app/layout.tsx
// Gerencia consentimento LGPD via localStorage
// Chave: "invetoy-cookie-consent"

// Estados:
// 1. First visit → Banner com Accept/Reject/Customize
// 2. Customize → Preference center com granular control
// 3. After consent → Floating manage button (gear icon)
```

```css
/* Mobile - bottom sheet full width */
.cookie-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: #1c1c1c;
  border-top: 1px solid #333;
  z-index: 50;
}
```

### 5.6 Layout Components (Dashboard)

```tsx
// Sidebar
<Sidebar />           // Desktop: fixed left, lg:w-64
                      // Mobile: hidden, drawer via hamburger

// Topbar
<Topbar />            // Fixed top, h-16, mobile: hamburger menu

// Page Container
<div className="space-y-6 max-w-3xl">  {/* Content pages */}
<div className="space-y-4">            {/* Dashboard */}

// Loading Skeleton
<div className="animate-pulse bg-bg-surface rounded" />
```

---

## 6. Ícones

Usamos [Lucide React](https://lucide.dev/) v1.21+.

```tsx
import { Box, Search, User, Settings } from "lucide-react";

// Padrão
<Icon className="h-4 w-4" />          {/* Inline com texto */}
<Icon className="h-5 w-5 text-brand" /> {/* Em boxes/destaques */}
<Icon className="h-8 w-8 text-brand" /> {/* Em logos grandes */}
```

### Ícones Comuns

| Contexto | Ícone |
|----------|-------|
| Logo / Brand | `Box` |
| Menu | `Menu`, `X` |
| Usuário | `User` |
| Email | `Mail` |
| Senha | `Lock`, `Eye`, `EyeOff` |
| Empresa | `Building2` |
| Pagamento | `CreditCard`, `QrCode` |
| Estoque | `Package`, `ScanLine`, `Barcode` |
| Dashboard | `BarChart3` |
| Segurança | `Shield` |
| Config | `Settings`, `Bell` |
| Seta | `ArrowRight`, `ChevronRight` |
| Check | `Check`, `CheckCircle` |
| Ações | `Plus`, `Trash2`, `Edit`, `Copy`, `MoreHorizontal` |

---

## 7. Animações e Transições

### Padrões

```css
/* Transição suave - hover/focus genérico */
transition-all duration-200

/* Hover de cards/elevação */
transition-all duration-300

/* Opacity fade */
transition-opacity duration-300

/* Entrada suave (ex: footer, modais) */
transition-all duration-300 ease-out
```

### Micro-interações

```css
/* Botão click */
active:scale-[0.98]

/* Card hover */
hover:border-brand/20

/* Neon glow em outline */
.hover\:neon-glow-hover {
  box-shadow: 0 0 0 1px rgba(62, 207, 142, 0.3), 0 0 20px rgba(62, 207, 142, 0.1);
}

/* Loading spinner */
.animate-spin  /* SVG spinner em botões */

/* Pulse para indicadores ao vivo */
.animate-pulse /* Pontos verdes pulsantes */

/* Smooth scroll */
html { scroll-behavior: smooth; }

/* Stagger (futuro) */
.animate-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### Mobile-specific

```tsx
// Gestures (React Native)
// Swipe to dismiss modals
// Pull to refresh on lists
// Tap feedback (opacity or scale)
// Bottom sheet animations (spring)
```

---

## 8. Acessibilidade

### Práticas Obrigatórias

```tsx
// 1. ARIA labels em botões de ícone
<button aria-label="Fechar menu">
  <X className="h-5 w-5" />
</button>

// 2. Role em diálogos/modais
<div role="dialog" aria-label="Preferências" aria-modal="true">

// 3. Switch role em toggles
<button
  role="switch"
  aria-checked={enabled}
  aria-label="Notificações ativadas"
>

// 4. Focus ring visível (já configurado no globals.css)
*:focus-visible {
  box-shadow: 0 0 0 2px #121212, 0 0 0 4px #3ECF8E;
}

// 5. Labels em inputs
<label htmlFor="email">Email</label>
<input id="email" />

// 6. Skip to content (para mobile/desktop)
// Futuro: adicionar link "Pular para conteúdo" no topo

// 7. Texto descritivo em links
<Link href="/termos">Termos de Serviço</Link> {/* ✅ */}
<Link href="/termos">Clique aqui</Link>          {/* ❌ */}
```

### Contraste

- Nunca use `text-muted` (#52525B) para conteúdo essencial
- Sempre mantenha ratio de contraste mínimo de 4.5:1 (AA)
- Links devem ser distinguíveis por cor E sublinhado (ou ícone)

### Touch Targets (Mobile)

```css
/* Mínimo 44x44px para alvos de toque */
/* Botões e inputs já têm h-10 (40px) + padding */
/* Caso necessário, adicionar p-2 extra */
.minimum-touch-target {
  min-width: 44px;
  min-height: 44px;
}
```

---

## 9. Mobile First

### Breakpoints

```css
/* Tailwind v4 */
sm:  640px  /* Tablets pequenos */
md:  768px  /* Tablets */
lg:  1024px /* Desktop */
xl:  1280px /* Desktop wide */
2xl: 1536px /* Desktop超大 */
```

### Regras Mobile-first

```tsx
// 1. Layout começa empilhado (mobile)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// 2. Padding começa menor
<div className="px-4 sm:px-6 lg:px-8">

// 3. Texto começa menor
<h1 className="text-4xl sm:text-5xl lg:text-6xl">

// 4. Botões full width em mobile
<Button className="w-full sm:w-auto">

// 5. Footer empilhado em mobile
<footer className="flex flex-col sm:flex-row items-center gap-4">

// 6. Navegação hamburger em mobile
<nav className="hidden md:flex"> {/* Desktop */}
<div className="md:hidden">        {/* Mobile hamburger */}
```

### Padrões Mobile

```tsx
// ✅ Navigation Drawer
// Sidebar vira overlay fixed + backdrop
// Topbar ganha hamburger button

// ✅ Bottom Sheets (futuro mobile)
// Modais viram bottom sheets em mobile
// Full width, rounded top corners

// ✅ Infinite Scroll (futuro)
// Paginação substituída por scroll infinito
// Pull-to-refresh para recarregar

// ✅ Tab Bar (futuro mobile app)
// Navigation inferior com 4-5 tabs principais
// Dashboard, Inventory, Movements, Settings
```

---

## 10. Tokens (Tailwind v4)

### Configuração (`globals.css`)

```css
@theme inline {
  /* Backgrounds */
  --color-bg-primary: #121212;
  --color-bg-secondary: #1c1c1c;
  --color-bg-surface: #242424;
  --color-bg-surface-hover: #2a2a2a;
  --color-bg-elevated: #2e2e2e;

  /* Brand */
  --color-brand: #3ECF8E;
  --color-brand-hover: #45d99a;
  --color-brand-dim: rgba(62, 207, 142, 0.12);

  /* Semantic */
  --color-brand-info: #53B1E5;
  --color-brand-warning: #F5A623;
  --color-brand-danger: #E5484D;
  --color-brand-danger-dim: rgba(229, 72, 77, 0.12);

  /* Borders */
  --color-border-default: #333333;
  --color-border-muted: #2a2a2a;
  --color-border-brand: rgba(62, 207, 142, 0.3);

  /* Text */
  --color-text-primary: #EDEDED;
  --color-text-secondary: #A1A1AA;
  --color-text-muted: #52525B;
  --color-text-brand: #3ECF8E;

  /* Badges */
  --color-badge-bg: rgba(62, 207, 142, 0.08);
  --color-badge-border: rgba(62, 207, 142, 0.2);

  /* Chart */
  --color-chart-line: #3ECF8E;
  --color-chart-area: rgba(62, 207, 142, 0.08);
  --color-chart-grid: #2a2a2a;

  /* Fonts */
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, "SF Mono", monospace;

  /* Radius */
  --radius-button: 4px;
  --radius-card: 6px;
  --radius-modal: 8px;
}
```

### Custom Utilities

```css
@utility neon-glow {
  box-shadow: 0 0 0 1px rgba(62, 207, 142, 0.15), 0 0 20px rgba(62, 207, 142, 0.05);
}

@utility neon-glow-hover {
  transition: box-shadow 0.2s ease;
  &:hover {
    box-shadow: 0 0 0 1px rgba(62, 207, 142, 0.3), 0 0 20px rgba(62, 207, 142, 0.1);
  }
}

@utility terminal-divider {
  border-bottom: 1px solid #333333;
}

@utility mono {
  font-family: "JetBrains Mono", ui-monospace, "SF Mono", monospace;
  letter-spacing: -0.02em;
}

@utility command-overlay {
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(4px);
}
```

---

## 11. Recursos para App Mobile

### Stack Sugerido

| Tecnologia | Escolha | Motivo |
|------------|---------|--------|
| Framework | React Native + Expo | Compatibilidade com web, OTA updates |
| Navegação | expo-router | File-based routing (similar Next.js) |
| Estilização | NativeWind (Tailwind CSS) | Reaproveitar tokens do design system |
| Ícones | lucide-react-native | Mesmo conjunto de ícones |
| Gráficos | react-native-chart-kit ou victory-native | Dashboards |
| Scanner | expo-camera + expo-barcode-scanner | Leitura de código de barras |
| Offline | expo-sqlite + expo-file-system | Modo offline |
| Auth | @supabase/supabase-js (SSR) | Mesmo backend |
| Animações | react-native-reanimated | Gestures e transições nativas |
| Formulários | react-hook-form + zod | Validação de dados |

### Mapeamento de Componentes Web → Mobile

| Web (Next.js) | Mobile (React Native) | Observação |
|---------------|----------------------|------------|
| `div` | `View` | Container |
| `span`, `p` | `Text` | Texto |
| `button` | `TouchableOpacity` / `Pressable` | Botão. Usar `activeOpacity={0.8}` |
| `input` | `TextInput` | Input |
| `img` | `Image` | Imagem |
| `Link` | `Link` (expo-router) | Navegação |
| `nav` | Não existe | Usar `View` com `flexDirection: 'row'` |
| `h1-h6` | `Text` com `style` | Ajustar fontSize |
| `footer` | Não existe | Usar `View` |
| `grid` | `View` com `flexWrap: 'wrap'` + `gap` | Grid |
| `section` | `View` | Seção |
| `header` | `View` | Header |
| `main` | `View` | Container principal |
| `aside` | `View` | Sidebar |
| Modal | `Modal` (RN) ou Bottom Sheet | Modais |
| Loading | `ActivityIndicator` | Loading spinner |
| Scroll | `ScrollView` / `FlatList` | Scroll |
| Toggle | `Switch` (RN) | Switch |

### Tokens RN (NativeWind)

```ts
// tailwind.config.js para NativeWind
// Copiar CSS variables do globals.css para o config:
export default {
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#121212',
          secondary: '#1c1c1c',
          surface: '#242424',
          'surface-hover': '#2a2a2a',
          elevated: '#2e2e2e',
        },
        brand: {
          DEFAULT: '#3ECF8E',
          hover: '#45d99a',
          dim: 'rgba(62, 207, 142, 0.12)',
          info: '#53B1E5',
          warning: '#F5A623',
          danger: '#E5484D',
          'danger-dim': 'rgba(229, 72, 77, 0.12)',
        },
        border: {
          DEFAULT: '#333333',
          muted: '#2a2a2a',
          brand: 'rgba(62, 207, 142, 0.3)',
        },
        text: {
          primary: '#EDEDED',
          secondary: '#A1A1AA',
          muted: '#52525B',
          brand: '#3ECF8E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        button: '4px',
        card: '6px',
        modal: '8px',
      },
    },
  },
};
```

### Estrutura de Telas Mobile (Sugerida)

```
app/
├── (auth)/
│   ├── login.tsx
│   └── register.tsx
├── (tabs)/
│   ├── _layout.tsx          # Tab navigator (4 tabs)
│   ├── dashboard.tsx
│   ├── inventory.tsx
│   ├── movements.tsx
│   └── settings.tsx
├── (modals)/
│   ├── product/[id].tsx
│   ├── adjustment.tsx
│   └── transfer.tsx
├── _layout.tsx              # Root layout + Providers
└── index.tsx                # Dashboard (redirect)
```

### Mobile-specific Components (Futuro)

```tsx
// Bottom Sheet Modal
<BottomSheet>
  {/* Formulário de ajuste de estoque */}
</BottomSheet>

// Barcode Scanner (fullscreen)
<BarcodeScanner onScan={handleScan} />

// Pull to Refresh
<RefreshControl onRefresh={handleRefresh} />

// Empty State
<EmptyState icon={Package} title="Nenhum produto" />

// Toast / Snackbar
<Toast message="Produto atualizado" variant="success" />

// Floating Action Button
<FAB icon={Plus} onPress={handleAdd} />
```

---

## Histórico de Versões

| Data | Versão | Mudanças |
|------|--------|----------|
| 26/06/2026 | 1.0 | Versão inicial do design system |
