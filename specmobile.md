# INVENTOY Mobile — Especificação Técnica

> **Status:** ⏳ Planejamento  
> **Stack:** React Native (Expo) + Supabase Realtime  
> **Público:** Operador de chão de fábrica / almoxarife  
> **Foco:** Velocidade, scanner, grandes áreas de toque, modo offline

---

## 1. Stack & Arquitetura

| Camada | Tecnologia |
|--------|-----------|
| Framework | React Native com Expo SDK 52+ |
| Navegação | Expo Router (file-based routing) |
| Database | Supabase Client (compartilhado com Web) |
| Auth | Supabase Auth (Magic Link, mesmo login do Web) |
| Scanner | `expo-camera` + `expo-barcode-scanner` |
| Offline | `AsyncStorage` + NetInfo |
| Haptics | `expo-haptics` |
| Ícones | `lucide-react-native` |
| Gráficos | `react-native-chart-kit` (simplificado) |
| Toast/Snackbar | `react-native-toast-message` |

### 1.1 Compartilhamento com Web

- **Database:** Mesmas tabelas Supabase (`products`, `inventory_items`, `movements`, etc.)
- **Auth:** Mesma sessão Supabase Auth. Login por Magic Link funciona em ambos.
- **RLS:** Mesmas políticas de Row Level Security. O operador só vê dados do seu tenant.
- **Realtime:** Mesmas subscriptions Supabase Realtime. Alterações no Mobile aparecem instantaneamente no Web.

### 1.2 Modo Offline

```
AsyncStorage
├── pending_movements[]    # Movimentações pendentes de sync
├── cached_products[]      # Cache de produtos para busca offline
└── last_sync_at           # Timestamp da última sincronização
```

- **Indicador:** Barra amarela no topo "Modo Offline" quando sem conexão
- **Enqueue:** Movimentações são salvas no AsyncStorage com timestamp
- **Sync:** Ao reconectar, um background job envia em lote na ordem cronológica
- **Resolução:** Última escrita vence (LWW) para evitar conflitos complexos

---

## 2. Design System Mobile

### 2.1 Tokens (compartilhados com Web)

```typescript
// theme.ts
export const theme = {
  colors: {
    bg: '#121212',
    surface: '#1c1c1c',
    card: '#242424',
    brand: '#3ECF8E',
    danger: '#E5484D',
    warning: '#F5A623',
    info: '#53B1E5',
    text: {
      primary: '#EDEDED',
      secondary: '#A1A1AA',
      muted: '#52525B',
    },
    border: '#333333',
  },
  fonts: {
    sans: 'Inter_400Regular',
    sansBold: 'Inter_600SemiBold',
    mono: 'JetBrainsMono_400Regular',
  },
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
  },
};
```

### 2.2 Componentes Mobile Específicos

| Componente | Descrição |
|-----------|-----------|
| `ScannerOverlay` | Tela preta total com moldura verde no centro |
| `BottomSheet` | Meia-tela deslizante para confirmação |
| `ActionCard` | Card vertical full-width com ícone grande |
| `SkeletonLoader` | Efeito skeleton durante loading |
| `OfflineBanner` | Barra amarela de modo offline |
| `SwipeActions` | Ações rápidas ao deslizar card |

---

## 3. Navegação (Expo Router)

```
app/
├── _layout.tsx            # Root layout (Auth guard, Providers)
├── index.tsx              # Redirect para tabs
│
├── (auth)/
│   ├── _layout.tsx        # Auth layout
│   └── login.tsx          # Tela de login
│
├── (tabs)/
│   ├── _layout.tsx        # Bottom Tab Navigator
│   │
│   ├── index.tsx          # Início (Hub do Operador)
│   ├── scanner.tsx        # Scanner (câmera fullscreen)
│   ├── search.tsx         # Buscar (lista + search)
│   └── profile.tsx        # Perfil + Configurações
│
└── (flows)/
    ├── transfer/
    │   ├── step1.tsx      # Escanear origem
    │   ├── step2.tsx      # Escanear destino
    │   └── step3.tsx      # Quantidade + Confirmar
    └── adjustment/
        └── index.tsx      # Ajuste rápido
```

### 3.1 Bottom Navigation Bar

| Ícone | Rótulo | Tela |
|-------|--------|------|
| `LayoutDashboard` | Início | Hub do Operador |
| `ScanLine` | Scanner | Leitor de código de barras |
| `Search` | Buscar | Lista + pesquisa |
| `User` | Perfil | Perfil e configurações |

---

## 4. Telas Detalhadas

### 4.1 Início (Hub do Operador)

```
┌──────────────────────────────┐
│  09:41                  📶   │
├──────────────────────────────┤
│                              │
│  ┌────────────────────────┐  │
│  │ 📦  Entrada de         │  │
│  │     Mercadoria         │  │
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │ 🚚  Saída/Expedição    │  │
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │ ↔️  Transferência      │  │
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │ 📋  Contagem Cega      │  │
│  └────────────────────────┘  │
│                              │
│  Última atividade: 2min atrás│
└──────────────────────────────┘
```

### 4.2 Scanner (Tela Principal)

```
┌──────────────────────────────┐
│         ● Scanner            │
├──────────────────────────────┤
│                              │
│         ┌──────────┐         │
│         │ ┌──────┐ │         │
│         │ │      │ │         │
│         │ │  ◻️  │ │         │
│         │ │      │ │         │
│         │ └──────┘ │         │
│         └──────────┘         │
│                              │
│    [Digitar SKU manualmente] │
│                              │
├──────────────────────────────┤
│  Último scan: 45s atrás      │
│  → Parafuso M8 x 30mm        │
└──────────────────────────────┘
```

**Funcionalidades:**
- Câmera 100% da tela
- Overlay: moldura verde com cantos marcados
- Haptic feedback ao ler código
- Flash verde na tela ao scan bem-sucedido
- BottomSheet sobe automaticamente com dados do produto
- Input grande para quantidade
- Botão "Confirmar" verde gigante

### 4.3 BottomSheet de Confirmação

```
┌──────────────────────────────┐
│                              │
│        ─ ─ ─ ─ ─ ─          │
│                              │
│   📦 Parafuso M8 x 30mm     │
│   SKU: MEC-042               │
│                              │
│   Localização: A2-S1         │
│   Estoque atual: 12 un       │
│                              │
│   ┌────────────────────┐     │
│   │  Quantidade         │     │
│   │       [  5  ]       │     │
│   └────────────────────┘     │
│                              │
│   ┌────────────────────────┐ │
│   │     ✅  Confirmar      │ │
│   └────────────────────────┘ │
│                              │
└──────────────────────────────┘
```

### 4.4 Buscar (Lista + Search)

```
┌──────────────────────────────┐
│  🔍  Buscar produtos...      │
├──────────────────────────────┤
│                              │
│  ┌────────────────────────┐  │
│  │ SKU: ELT-001           │  │
│  │ Resistor 10kΩ          │  │
│  │ A1-S3 · Estoque: 150   │  │
│  └─── ← swipe para ações ─┘  │
│                              │
│  ┌────────────────────────┐  │
│  │ SKU: MEC-042           │  │
│  │ Parafuso M8 x 30mm     │  │
│  │ A2-S1 · Estoque: 12    │  │
│  └─── ← swipe para ações ─┘  │
│                              │
│  ┌────────────────────────┐  │
│  │ SKU: HID-007           │  │
│  │ Óleo Hidráulico AW68   │  │
│  │ A3-S2 · Estoque: 2     │  │
│  └─── ← swipe para ações ─┘  │
│                              │
└──────────────────────────────┘
```

**Swipe Actions (deslizar para esquerda):**
- **Mover** (ícone de setas) — inicia fluxo de transferência
- **Ajustar** (ícone de lápis) — abre modal de ajuste rápido

### 4.5 Transferência (Fluxo em 3 Passos)

**Passo 1 — Origem:**
```
┌──────────────────────────────┐
│  Transferência · Passo 1/3  │
├──────────────────────────────┤
│                              │
│   Escaneie o produto de      │
│   origem                     │
│                              │
│   ┌──────────────────────┐   │
│   │  [ Scanner ]         │   │
│   └──────────────────────┘   │
│                              │
│   ─── ou digite o SKU ───   │
│   [___________________]      │
│                              │
└──────────────────────────────┘
```

**Passo 2 — Destino:**
```
┌──────────────────────────────┐
│  Transferência · Passo 2/3  │
├──────────────────────────────┤
│                              │
│   Escaneie a prateleira de   │
│   destino                    │
│                              │
│   ┌──────────────────────┐   │
│   │  [ Scanner ]         │   │
│   └──────────────────────┘   │
│                              │
│   Produto: Parafuso M8       │
│   Origem:  A2-S1             │
│   ─────────────────────      │
│   Destino: [______]          │
│                              │
└──────────────────────────────┘
```

**Passo 3 — Confirmar:**
```
┌──────────────────────────────┐
│  Transferência · Passo 3/3  │
├──────────────────────────────┤
│                              │
│   Parafuso M8 x 30mm        │
│   SKU: MEC-042               │
│                              │
│   A2-S1  →  B3-S2           │
│                              │
│   ┌────────────────────┐     │
│   │  Quantidade:  10   │     │
│   └────────────────────┘     │
│                              │
│   ┌────────────────────────┐ │
│   │     ✅  Confirmar      │ │
│   │      Transferência     │ │
│   └────────────────────────┘ │
│                              │
└──────────────────────────────┘
```

---

## 5. Componentes Mobile (React Native)

### 5.1 ScannerOverlay

```tsx
<View style={styles.container}>
  <CameraView style={StyleSheet.absoluteFill} facing="back">
    <View style={styles.overlay}>
      <View style={styles.scanFrame}>
        <View style={[styles.corner, styles.topLeft]} />
        <View style={[styles.corner, styles.topRight]} />
        <View style={[styles.corner, styles.bottomLeft]} />
        <View style={[styles.corner, styles.bottomRight]} />
      </View>
      <Text style={styles.hint}>Aproxime o código de barras</Text>
    </View>
  </CameraView>
</View>
```

### 5.2 BottomSheet

```tsx
<BottomSheet snapPoints={['50%']} index={0}>
  <View style={styles.sheetContent}>
    <View style={styles.handle} />
    <Text style={styles.productName}>{product.name}</Text>
    <Text style={styles.sku}>SKU: {product.sku}</Text>
    
    <Text style={styles.label}>Quantidade</Text>
    <TextInput
      style={styles.quantityInput}
      keyboardType="numeric"
      value={quantity}
      onChangeText={setQuantity}
    />
    
    <TouchableOpacity style={styles.confirmButton}>
      <Text style={styles.confirmText}>Confirmar</Text>
    </TouchableOpacity>
  </View>
</BottomSheet>
```

---

## 6. Integração com Web

### 6.1 Realtime em Ação

1. Operador no Mobile escaneia e confirma entrada de 50 unidades do SKU-123
2. Supabase atualiza `inventory_items` e insere em `movements`
3. **Web recebe a atualização instantaneamente** via Supabase Realtime
4. O card do Dashboard pisca em verde e o número atualiza de 10 para 60
5. A linha na tabela de Inventário reflete a nova quantidade

### 6.2 Código de Subscrição (compartilhado)

```typescript
// hooks/use-realtime.ts (mesmo hook usado no Web)
supabase
  .channel('inventory-changes')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'inventory_items', filter: `tenant_id=eq.${tenantId}` },
    (payload) => {
      // Atualiza UI no Mobile ou Web
    }
  )
  .subscribe();
```

---

## 7. Plano de Implementação Mobile

| Fase | Tarefa | Estimativa |
|------|--------|-----------|
| 1 | Setup Expo + Router + Tema | 2h |
| 2 | Auth + Login | 2h |
| 3 | Bottom Navigation + Layout Base | 2h |
| 4 | Tela Início (Hub do Operador) | 1h |
| 5 | Scanner (Camera + Overlay) | 4h |
| 6 | BottomSheet de Confirmação | 2h |
| 7 | Tela de Busca + SwipeActions | 3h |
| 8 | Fluxo de Transferência (3 passos) | 4h |
| 9 | Modal de Ajuste Rápido | 2h |
| 10 | Modo Offline (AsyncStorage + Sync) | 3h |
| 11 | Realtime Subscriptions | 1h |
| 12 | Testes + Ajustes | 3h |

**Total estimado:** ~29 horas de desenvolvimento

---

## 8. Telas Adicionais (Futuro)

- **Contagem Cega:** O sistema mostra um produto aleatório, operador conta e digita
- **Dashboard Mobile:** KPIs simplificados para o operador ver resumo do dia
- **Notificações Push:** Expo Push Notifications para alertas de estoque baixo
- **Scan em Lote:** Modo de scan contínuo para recebimento de mercadorias

---

## 9. Assets Necessários

- Ícone do app (formato exigido pela Play Store e App Store)
- Splash screen com logo INVENTOY
- Fontes: Inter (Google Fonts) e JetBrains Mono
- Sons de scan (sucesso/erro) para feedback auditivo
