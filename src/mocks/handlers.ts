import { http, HttpResponse, delay, ws } from 'msw'
import { toSocketIo } from '@mswjs/socket.io-binding'

export interface MockNFT {
  id: string
  title: string
  price: string
  available: number
  totalEditions: number
  category: 'Arte digital' | 'Fotografia' | 'Música' | 'Arte 3D'
  network: 'Ethereum' | 'Polygon' | 'Solana'
  creator: {
    name: string
    avatar: string
    verified: boolean
  }
  collection: string
  editionType: '1/1' | '1/10' | '1/50' | 'ABERTA'
  rating: number
  reviewsCount: number
  description: string
  attributes: Array<{ trait_type: string; value: string }>
  image: string
}

const INITIAL_NFTS: MockNFT[] = [
  {
    id: '1',
    title: 'Cosmic Perspective',
    price: '0.05',
    available: 10,
    totalEditions: 50,
    category: 'Arte digital',
    network: 'Ethereum',
    creator: {
      name: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
      verified: true
    },
    collection: 'Kurio Editions',
    editionType: '1/50',
    rating: 4.9,
    reviewsCount: 32,
    description: 'Exploração visual sobre as profundezas do cosmos e a pequenez da percepção humana diante da imensidão estelar.',
    attributes: [
      { trait_type: 'Raridade', value: 'Lendário' },
      { trait_type: 'Paleta', value: 'Nebula Violet' },
      { trait_type: 'Geração', value: 'Gen-0' }
    ],
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: '2',
    title: 'Digital Horizon',
    price: '0.12',
    available: 5,
    totalEditions: 10,
    category: 'Fotografia',
    network: 'Polygon',
    creator: {
      name: 'Marcus Vance',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
      verified: true
    },
    collection: 'Cyber Landscapes',
    editionType: '1/10',
    rating: 4.8,
    reviewsCount: 19,
    description: 'Fotografia de longa exposição capturada em Tóquio, pós-processada digitalmente com luzes volumétricas e shaders dinâmicos.',
    attributes: [
      { trait_type: 'Raridade', value: 'Raro' },
      { trait_type: 'Localização', value: 'Shibuya Cyber' },
      { trait_type: 'Exposição', value: '30s f/2.8' }
    ],
    image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: '3',
    title: 'Emerald Ape #042',
    price: '1.19',
    available: 1,
    totalEditions: 1,
    category: 'Arte digital',
    network: 'Ethereum',
    creator: {
      name: 'Kurio Labs',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      verified: true
    },
    collection: 'Kurio Apes',
    editionType: '1/1',
    rating: 5.0,
    reviewsCount: 44,
    description: 'O guardião esmeralda da coleção Kurio. Arte exclusiva 1/1 com direito a voto de governança no DAO de criadores da plataforma.',
    attributes: [
      { trait_type: 'Espécie', value: 'Cyber Ape' },
      { trait_type: 'Acessório', value: 'Óculos Holográficos' },
      { trait_type: 'Armadura', value: 'Nano Esmeralda' }
    ],
    image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: '4',
    title: 'Sage Nomad #009',
    price: '1.69',
    available: 2,
    totalEditions: 10,
    category: 'Arte 3D',
    network: 'Solana',
    creator: {
      name: 'Zephyr Studio',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
      verified: false
    },
    collection: 'Nomads of Void',
    editionType: '1/10',
    rating: 4.7,
    reviewsCount: 15,
    description: 'Modelo 3D procedural texturizado com substâncias reflexivas, pronto para renderização em Unreal Engine 5 e Metaverse.',
    attributes: [
      { trait_type: 'Dimensão', value: '4K Hi-Res' },
      { trait_type: 'Rigging', value: 'Incluído (.glb)' },
      { trait_type: 'Elemento', value: 'Sage Energy' }
    ],
    image: 'https://images.unsplash.com/photo-1633167606207-d840b5070fc2?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: '5',
    title: 'Echoes of Neon Synth',
    price: '0.08',
    available: 15,
    totalEditions: 100,
    category: 'Música',
    network: 'Ethereum',
    creator: {
      name: 'Kavinsky Wave',
      avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=120&auto=format&fit=crop&q=80',
      verified: true
    },
    collection: 'Audio Spectrum',
    editionType: '1/50',
    rating: 4.9,
    reviewsCount: 61,
    description: 'Faixa de synthwave original masterizada em estúdio analógico com visualizador responsivo de frequências de áudio em tempo real.',
    attributes: [
      { trait_type: 'BPM', value: '118' },
      { trait_type: 'Tonalidade', value: 'F Minor' },
      { trait_type: 'Áudio', value: 'FLAC 24-bit 96kHz' }
    ],
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: '6',
    title: 'Quantum Genesis',
    price: '0.35',
    available: 4,
    totalEditions: 10,
    category: 'Arte digital',
    network: 'Polygon',
    creator: {
      name: 'Vortex Visuals',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
      verified: true
    },
    collection: 'Quantum Realms',
    editionType: '1/10',
    rating: 4.8,
    reviewsCount: 27,
    description: 'Representação matemática de estados quânticos superpostos sintetizados em arte vetorial com gradientes dinâmicos.',
    attributes: [
      { trait_type: 'Complexidade', value: '10^6 Nós' },
      { trait_type: 'Filtro', value: 'Quantum Entanglement' }
    ],
    image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: '7',
    title: 'Cyber Solitude',
    price: '0.22',
    available: 8,
    totalEditions: 25,
    category: 'Fotografia',
    network: 'Ethereum',
    creator: {
      name: 'Marcus Vance',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
      verified: true
    },
    collection: 'Cyber Landscapes',
    editionType: '1/50',
    rating: 4.6,
    reviewsCount: 14,
    description: 'Um viajante solitário sob os anúncios holográficos de Neo-Berlim em uma noite chuvosa do outono de 2084.',
    attributes: [
      { trait_type: 'Atmosfera', value: 'Chuva Ácida' },
      { trait_type: 'Câmera', value: 'Leica M11 Cyber' }
    ],
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: '8',
    title: 'Sonic Artifact #303',
    price: '0.15',
    available: 12,
    totalEditions: 50,
    category: 'Música',
    network: 'Solana',
    creator: {
      name: 'Acid Modular',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      verified: false
    },
    collection: 'Audio Spectrum',
    editionType: '1/50',
    rating: 4.7,
    reviewsCount: 22,
    description: 'Loop clássico de Roland TB-303 distorcido através de racks de pedais valvulados analógicos, com direitos de sample comercial.',
    attributes: [
      { trait_type: 'Instrumento', value: 'TB-303 Clone' },
      { trait_type: 'Licença', value: 'Royalty-Free Comercial' }
    ],
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80'
  }
]

// Base de Usuários Mockados (Isolamento estrito de dados e sessão)
export interface MockUser {
  id: string
  name: string
  username: string
  email: string
  avatar: string
  bio: string
  wallets: Array<{
    id: string
    address: string
    network: string
    isPrimary: boolean
    label: string
  }>
  favorites: string[]
}

const INITIAL_USERS: Record<string, MockUser> = {
  'usr-1': {
    id: 'usr-1',
    name: 'Alex Nomad',
    username: 'alexnomad',
    email: 'alex@kurio.art',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Colecionador de arte digital desde 2021. Apaixonado por cyberpunk e estética retrofuturista.',
    wallets: [
      { id: 'w1', address: '0x71C84982a17D9eC9b840132bFa3d', network: 'Ethereum', isPrimary: true, label: 'MetaMask Principal' },
      { id: 'w2', address: '0x32A881F4e44Cb07629A102B8dcE1', network: 'Polygon', isPrimary: false, label: 'Vault Secundário' }
    ],
    favorites: ['1', '3']
  },
  'usr-2': {
    id: 'usr-2',
    name: 'Sara Nova',
    username: 'saranova',
    email: 'sara@kurio.art',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Curadora e entusiasta Web3. Explorando novas fronteiras audiovisuais.',
    wallets: [
      { id: 'w3', address: '0x99B12C4Fa73B5192Ac59E8108422', network: 'Ethereum', isPrimary: true, label: 'Ledger Cold' }
    ],
    favorites: ['2', '5']
  }
}

// Estados mutáveis mantidos em memória e sincronizados em localStorage para sustentar refresh (F5)
const MOCK_STATE_KEY = 'KURIO_MOCK_STATE_V1'

export interface ProcessedOrder {
  id: string
  idempotencyKey: string
  payloadHash?: string
  userId?: string
  items: Array<{ nftId: string; quantity: number; title: string; price: string }>
  subtotal: string
  discount: string
  gasFee: string
  total: string
  network: string
  walletAddress: string
  transactionHash: string
  blockExplorerUrl: string
  createdAt: string
  status: 'confirmed' | 'pending' | 'rejected'
}

let nfts: MockNFT[] = JSON.parse(JSON.stringify(INITIAL_NFTS))
let users: Record<string, MockUser> = JSON.parse(JSON.stringify(INITIAL_USERS))
let passwords: Record<string, string> = {
  'alex@kurio.art': 'password123',
  'sara@kurio.art': 'password123'
}
let visitorCart: Array<{ nftId: string; quantity: number }> = []
let userCarts: Record<string, Array<{ nftId: string; quantity: number }>> = {
  'usr-1': [],
  'usr-2': []
}
const processedOrders = new Map<string, ProcessedOrder>()

function saveMockState() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const state = {
        nfts,
        users,
        passwords,
        visitorCart,
        userCarts,
        processedOrders: Array.from(processedOrders.entries())
      }
      window.localStorage.setItem(MOCK_STATE_KEY, JSON.stringify(state))
    }
  } catch {
    // Ignora falha de quota
  }
}

function loadMockState() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(MOCK_STATE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (parsed.nfts) nfts = parsed.nfts
      if (parsed.users) users = parsed.users
      if (parsed.passwords) passwords = parsed.passwords
      if (parsed.visitorCart) visitorCart = parsed.visitorCart
      if (parsed.userCarts) userCarts = parsed.userCarts
      if (Array.isArray(parsed.processedOrders)) {
        processedOrders.clear()
        parsed.processedOrders.forEach(([k, v]: [string, ProcessedOrder]) => {
          processedOrders.set(k, v)
        })
      }
    }
  } catch {
    // Ignora erro de parse
  }
}

loadMockState()

// Auxiliar para obter usuário autenticado pelo token Bearer
function getAuthenticatedUser(request: Request): MockUser | null {
  if (typeof window !== 'undefined' && window.localStorage?.getItem('MSW_SCENARIO') === 'session_expired') {
    return null
  }
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  const token = authHeader.replace('Bearer ', '').trim()
  const match = token.match(/^mock-token-(usr-\d+|usr-[a-z0-9]+)$/)
  if (!match) return null
  const userId = match[1]
  return users[userId] || null
}

function getActiveCart(userId: string | null) {
  if (userId && userCarts[userId]) {
    return userCarts[userId]
  }
  return visitorCart
}

function setActiveCart(userId: string | null, newCart: Array<{ nftId: string; quantity: number }>) {
  if (userId) {
    userCarts[userId] = newCart
  } else {
    visitorCart = newCart
  }
  saveMockState()
}

// 1. Intercepta conexões WebSocket
const socketLink = ws.link('*')

export const handlers = [
  // 2. Lida com a conexão Socket.IO para Tempo Real
  socketLink.addEventListener('connection', (connection) => {
    const io = toSocketIo(connection)

    io.client.on('admin.simulate_update', () => {
      // Simulação: altera o preço de um NFT e diminui estoque
      nfts.forEach((nft) => {
        const current = parseFloat(nft.price)
        const newPrice = (current + 0.05).toFixed(2)
        nft.price = newPrice
        nft.available = Math.max(0, nft.available - 1)

        io.client.emit('nft.updated', {
          id: nft.id,
          title: nft.title,
          price: nft.price,
          available: nft.available,
          version: Date.now()
        })
      })
      saveMockState()
    })
  }),

  // ==================== REST APIS ====================

  // --- Reset de Fixture (Exigência do Desafio) ---
  http.post('/api/admin/reset', () => {
    nfts = JSON.parse(JSON.stringify(INITIAL_NFTS))
    users = JSON.parse(JSON.stringify(INITIAL_USERS))
    passwords = {
      'alex@kurio.art': 'password123',
      'sara@kurio.art': 'password123'
    }
    visitorCart = []
    userCarts = { 'usr-1': [], 'usr-2': [] }
    processedOrders.clear()
    try {
      window.localStorage.removeItem(MOCK_STATE_KEY)
    } catch {
      // ignore
    }
    return HttpResponse.json({ success: true, message: 'Fixtures restauradas com sucesso' })
  }),

  // --- Autenticação & Sessão ---
  http.post('/api/auth/login', async ({ request }) => {
    const { email, password } = (await request.json()) as { email?: string; password?: string }
    if (!email || !password) {
      return HttpResponse.json({ message: 'E-mail e senha são obrigatórios' }, { status: 400 })
    }

    const expectedPass = passwords[email.toLowerCase()]
    const user = Object.values(users).find((u) => u.email.toLowerCase() === email.toLowerCase())

    if (!user || expectedPass !== password) {
      return HttpResponse.json({ message: 'Credenciais inválidas' }, { status: 401 })
    }

    if (typeof window !== 'undefined' && window.localStorage?.getItem('MSW_SCENARIO') === 'session_expired') {
      window.localStorage.setItem('MSW_SCENARIO', 'success')
    }

    const token = `mock-token-${user.id}`
    return HttpResponse.json({ token, user })
  }),

  http.post('/api/auth/register', async ({ request }) => {
    const { name, username, email, password } = (await request.json()) as {
      name?: string
      username?: string
      email?: string
      password?: string
    }

    if (!name || !username || !email || !password) {
      return HttpResponse.json({ message: 'Todos os campos são obrigatórios' }, { status: 400 })
    }

    const exists = Object.values(users).some((u) => u.email.toLowerCase() === email.toLowerCase())
    if (exists) {
      return HttpResponse.json({ message: 'Este e-mail já está em uso' }, { status: 409 })
    }

    const newId = `usr-${Date.now().toString(36)}`
    const newUser: MockUser = {
      id: newId,
      name,
      username,
      email,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      bio: 'Novo colecionador na plataforma Kurio.',
      wallets: [],
      favorites: []
    }

    users[newId] = newUser
    passwords[email.toLowerCase()] = password
    userCarts[newId] = []
    saveMockState()

    const token = `mock-token-${newId}`
    return HttpResponse.json({ token, user: newUser }, { status: 201 })
  }),

  http.get('/api/auth/me', ({ request }) => {
    const user = getAuthenticatedUser(request)
    if (!user) {
      return HttpResponse.json({ message: 'Sessão expirada ou não autenticado' }, { status: 401 })
    }
    return HttpResponse.json({ user })
  }),

  http.post('/api/auth/logout', () => {
    return HttpResponse.json({ success: true })
  }),

  // --- NFTs (Listagem com Busca, Filtros, Ordenação e Paginação) ---
  http.get('/api/nfts', ({ request }) => {
    const url = new URL(request.url)
    const q = url.searchParams.get('q')?.toLowerCase() || ''
    const category = url.searchParams.get('category') || ''
    const network = url.searchParams.get('network') || ''
    const sort = url.searchParams.get('sort') || 'recent'
    const page = parseInt(url.searchParams.get('page') || '1', 10)
    const limit = parseInt(url.searchParams.get('limit') || '8', 10)

    let filtered = [...nfts]

    if (q) {
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.description.toLowerCase().includes(q) ||
          n.collection.toLowerCase().includes(q) ||
          n.creator.name.toLowerCase().includes(q)
      )
    }

    if (category) {
      filtered = filtered.filter((n) => n.category.toLowerCase() === category.toLowerCase())
    }

    if (network) {
      filtered = filtered.filter((n) => n.network.toLowerCase() === network.toLowerCase())
    }

    if (sort === 'price_asc') {
      filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
    } else if (sort === 'price_desc') {
      filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
    } else if (sort === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating)
    } else {
      // 'recent' ou default
      filtered.sort((a, b) => parseInt(b.id, 10) - parseInt(a.id, 10))
    }

    const total = filtered.length
    const totalPages = Math.max(1, Math.ceil(total / limit))
    const validPage = Math.min(Math.max(1, page), totalPages)
    const start = (validPage - 1) * limit
    const items = filtered.slice(start, start + limit)

    return HttpResponse.json({
      items,
      total,
      page: validPage,
      limit,
      totalPages
    })
  }),

  http.get('/api/nfts/:id', ({ params }) => {
    const nft = nfts.find((n) => n.id === params.id)
    if (!nft) {
      return HttpResponse.json({ message: 'NFT não encontrado' }, { status: 404 })
    }
    return HttpResponse.json(nft)
  }),

  // --- Favoritos (Isolamento por Usuário com Suporte a Teste de Rollback Otimista) ---
  http.get('/api/favorites', ({ request }) => {
    const user = getAuthenticatedUser(request)
    if (!user) {
      return HttpResponse.json({ message: 'Requer autenticação' }, { status: 401 })
    }
    return HttpResponse.json({ favorites: user.favorites })
  }),

  http.post('/api/favorites/:id', async ({ request, params }) => {
    const user = getAuthenticatedUser(request)
    if (!user) {
      return HttpResponse.json({ message: 'Requer autenticação' }, { status: 401 })
    }

    const scenario = localStorage.getItem('MSW_SCENARIO')
    if (scenario === 'favorites_fail') {
      await delay(600)
      return HttpResponse.json({ message: 'Falha simulada ao favoritar item.' }, { status: 500 })
    }

    const nftId = params.id as string
    if (!user.favorites.includes(nftId)) {
      user.favorites.push(nftId)
    }
    saveMockState()
    return HttpResponse.json({ success: true, favorites: user.favorites })
  }),

  http.delete('/api/favorites/:id', async ({ request, params }) => {
    const user = getAuthenticatedUser(request)
    if (!user) {
      return HttpResponse.json({ message: 'Requer autenticação' }, { status: 401 })
    }

    const scenario = localStorage.getItem('MSW_SCENARIO')
    if (scenario === 'favorites_fail') {
      await delay(600)
      return HttpResponse.json({ message: 'Falha simulada ao desfavoritar item.' }, { status: 500 })
    }

    const nftId = params.id as string
    user.favorites = user.favorites.filter((id) => id !== nftId)
    saveMockState()
    return HttpResponse.json({ success: true, favorites: user.favorites })
  }),

  // --- Carrinho ---
  http.get('/api/cart', ({ request }) => {
    const user = getAuthenticatedUser(request)
    const currentCart = getActiveCart(user ? user.id : null)

    const populatedCart = currentCart.map((cartItem) => ({
      ...cartItem,
      nft: nfts.find((n) => n.id === cartItem.nftId)
    }))

    return HttpResponse.json({ items: populatedCart })
  }),

  http.post('/api/cart', async ({ request }) => {
    const user = getAuthenticatedUser(request)
    const currentCart = getActiveCart(user ? user.id : null)

    const { nftId, quantity } = (await request.json()) as { nftId: string; quantity: number }
    const nft = nfts.find((n) => n.id === nftId)
    if (!nft) {
      return HttpResponse.json({ message: 'NFT não encontrado' }, { status: 404 })
    }

    const existing = currentCart.find((item) => item.nftId === nftId)
    const newQty = existing ? existing.quantity + quantity : quantity

    if (newQty > nft.available) {
      return HttpResponse.json({ message: 'Quantidade excede o estoque disponível' }, { status: 400 })
    }

    if (existing) {
      existing.quantity = newQty
    } else {
      currentCart.push({ nftId, quantity })
    }
    saveMockState()

    return HttpResponse.json({ success: true, cartTotal: currentCart.length }, { status: 201 })
  }),

  http.patch('/api/cart/:nftId', async ({ request, params }) => {
    const user = getAuthenticatedUser(request)
    const currentCart = getActiveCart(user ? user.id : null)
    const { quantity } = (await request.json()) as { quantity: number }

    const item = currentCart.find((i) => i.nftId === params.nftId)
    if (!item) {
      return HttpResponse.json({ message: 'Item não encontrado no carrinho' }, { status: 404 })
    }

    const nft = nfts.find((n) => n.id === params.nftId)
    if (nft && quantity > nft.available) {
      return HttpResponse.json({ message: 'Quantidade solicitada excede estoque' }, { status: 400 })
    }

    item.quantity = quantity
    saveMockState()
    return HttpResponse.json({ success: true })
  }),

  http.delete('/api/cart/:nftId', ({ request, params }) => {
    const user = getAuthenticatedUser(request)
    const currentCart = getActiveCart(user ? user.id : null)
    const updated = currentCart.filter((i) => i.nftId !== params.nftId)
    setActiveCart(user ? user.id : null, updated)
    return HttpResponse.json({ success: true })
  }),

  // Mesclagem de Carrinho Visitante -> Usuário Logado
  http.post('/api/cart/merge', ({ request }) => {
    const user = getAuthenticatedUser(request)
    if (!user) {
      return HttpResponse.json({ message: 'Requer autenticação' }, { status: 401 })
    }

    const userCart = userCarts[user.id] || []
    visitorCart.forEach((vItem) => {
      const existing = userCart.find((uItem) => uItem.nftId === vItem.nftId)
      if (existing) {
        existing.quantity += vItem.quantity
      } else {
        userCart.push({ ...vItem })
      }
    })

    userCarts[user.id] = userCart
    visitorCart = []
    saveMockState()

    return HttpResponse.json({ success: true, itemsCount: userCart.length })
  }),

  // --- Cotação de Checkout (Quote) com Validação de Cupom e Gas Fee ---
  http.post('/api/checkout/quote', async ({ request }) => {
    const { couponCode } = (await request.json()) as { couponCode?: string }
    const user = getAuthenticatedUser(request)
    const currentCart = getActiveCart(user ? user.id : null)

    let subtotalNum = 0
    currentCart.forEach((item) => {
      const nft = nfts.find((n) => n.id === item.nftId)
      if (nft) {
        subtotalNum += parseFloat(nft.price) * item.quantity
      }
    })

    let discountPercentage = 0
    let validCoupon = false
    const cleanCoupon = couponCode?.trim().toUpperCase()

    if (cleanCoupon === 'KURIO10') {
      discountPercentage = 0.1
      validCoupon = true
    } else if (cleanCoupon === 'GREENMINT20') {
      discountPercentage = 0.2
      validCoupon = true
    } else if (cleanCoupon && cleanCoupon !== '') {
      return HttpResponse.json({ message: 'Cupom de desconto inválido ou expirado.' }, { status: 400 })
    }

    const discountNum = subtotalNum * discountPercentage
    const gasFeeNum = 0.0042 // Taxa de rede simulada em ETH
    const totalNum = Math.max(0, subtotalNum - discountNum + gasFeeNum)

    return HttpResponse.json({
      subtotal: subtotalNum.toFixed(4),
      discount: discountNum.toFixed(4),
      gasFee: gasFeeNum.toFixed(4),
      total: totalNum.toFixed(4),
      validCoupon,
      couponCode: validCoupon ? cleanCoupon : undefined
    })
  }),

  // --- Criação e Consulta de Pedidos (Orders & Recibos com Idempotência) ---
  http.post('/api/orders', async ({ request }) => {
    const idempotencyKey = request.headers.get('x-idempotency-key')
    const scenario = localStorage.getItem('MSW_SCENARIO') || 'success'

    if (!idempotencyKey) {
      return HttpResponse.json({ message: 'Chave de idempotência (x-idempotency-key) é obrigatória.' }, { status: 400 })
    }

    const body = (await request.json()) as any
    const payloadHash = JSON.stringify({
      total: body.total || '0.00',
      network: body.network || 'Ethereum',
      walletAddress: body.walletAddress || ''
    })

    // Se já foi processado com essa mesma chave, valida conflito de carga ou recupera o mesmo pedido (idempotente)
    if (processedOrders.has(idempotencyKey)) {
      await delay(600)
      const existing = processedOrders.get(idempotencyKey)!
      if (existing.payloadHash && existing.payloadHash !== payloadHash) {
        return HttpResponse.json(
          { message: 'Conflito de idempotência: chave reutilizada com conteúdo de pedido diferente.' },
          { status: 409 }
        )
      }
      return HttpResponse.json({ success: true, order: existing, recovered: true }, { status: 200 })
    }

    const user = getAuthenticatedUser(request)
    const currentCart = getActiveCart(user ? user.id : null)

    if (currentCart.length === 0) {
      return HttpResponse.json({ message: 'O carrinho está vazio' }, { status: 400 })
    }

    // Cenário: Falha de Pagamento
    if (scenario === 'payment_failed') {
      await delay(1200)
      return HttpResponse.json({ message: 'Pagamento recusado pela rede da carteira.' }, { status: 402 })
    }

    // Cenário: Timeout de Rede
    if (scenario === 'timeout') {
      // Registra o pedido como concluído nos bastidores antes do drop da conexão
      const orderId = `ORD-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
      const orderSnapshot: ProcessedOrder = {
        id: orderId,
        idempotencyKey,
        payloadHash,
        userId: user?.id,
        items: currentCart.map((c) => {
          const n = nfts.find((nft) => nft.id === c.nftId)
          return {
            nftId: c.nftId,
            quantity: c.quantity,
            title: n?.title || 'NFT',
            price: n?.price || '0.00'
          }
        }),
        subtotal: body.subtotal || '0.00',
        discount: body.discount || '0.00',
        gasFee: body.gasFee || '0.0042',
        total: body.total || '0.00',
        network: body.network || 'Ethereum',
        walletAddress: body.walletAddress || '0x71C84982a17D9eC9b840132bFa3d',
        transactionHash: `0x${Math.random().toString(16).substring(2, 42).padEnd(40, '0')}`,
        blockExplorerUrl: `https://etherscan.io/tx/simulated-${orderId}`,
        createdAt: new Date().toISOString(),
        status: 'confirmed'
      }
      processedOrders.set(idempotencyKey, orderSnapshot)
      setActiveCart(user ? user.id : null, [])
      await delay(4000)
      return HttpResponse.error()
    }

    await delay(1200)
    const orderId = `ORD-${Math.random().toString(36).substring(2, 9).toUpperCase()}`

    // Reduz o estoque dos NFTs comprados
    currentCart.forEach((item) => {
      const nft = nfts.find((n) => n.id === item.nftId)
      if (nft) {
        nft.available = Math.max(0, nft.available - item.quantity)
      }
    })

    const orderSnapshot: ProcessedOrder = {
      id: orderId,
      idempotencyKey,
      payloadHash,
      userId: user?.id,
      items: currentCart.map((c) => {
        const n = nfts.find((nft) => nft.id === c.nftId)
        return {
          nftId: c.nftId,
          quantity: c.quantity,
          title: n?.title || 'NFT',
          price: n?.price || '0.00'
        }
      }),
      subtotal: body.subtotal || '0.00',
      discount: body.discount || '0.00',
      gasFee: body.gasFee || '0.0042',
      total: body.total || '0.00',
      network: body.network || 'Ethereum',
      walletAddress: body.walletAddress || '0x71C84982a17D9eC9b840132bFa3d',
      transactionHash: `0x${Math.random().toString(16).substring(2, 42).padEnd(40, '0')}`,
      blockExplorerUrl: `https://etherscan.io/tx/simulated-${orderId}`,
      createdAt: new Date().toISOString(),
      status: 'confirmed'
    }

    processedOrders.set(idempotencyKey, orderSnapshot)
    setActiveCart(user ? user.id : null, [])

    return HttpResponse.json({ success: true, order: orderSnapshot }, { status: 201 })
  }),

  http.get('/api/orders/:id', ({ params }) => {
    const order = Array.from(processedOrders.values()).find((o) => o.id === params.id)
    if (!order) {
      return HttpResponse.json({ message: 'Pedido não encontrado' }, { status: 404 })
    }
    return HttpResponse.json({ order })
  }),

  // --- Perfil & Carteiras ---
  http.get('/api/profile', ({ request }) => {
    const user = getAuthenticatedUser(request)
    if (!user) {
      return HttpResponse.json({ message: 'Requer autenticação' }, { status: 401 })
    }
    return HttpResponse.json({ user })
  }),

  http.patch('/api/profile', async ({ request }) => {
    const user = getAuthenticatedUser(request)
    if (!user) {
      return HttpResponse.json({ message: 'Requer autenticação' }, { status: 401 })
    }

    const { name, username, bio, avatar } = (await request.json()) as Partial<MockUser>
    if (name) user.name = name
    if (username) user.username = username
    if (bio !== undefined) user.bio = bio
    if (avatar) user.avatar = avatar
    saveMockState()

    return HttpResponse.json({ user })
  }),

  http.put('/api/profile/password', async ({ request }) => {
    const user = getAuthenticatedUser(request)
    if (!user) {
      return HttpResponse.json({ message: 'Requer autenticação' }, { status: 401 })
    }

    const { oldPassword, newPassword } = (await request.json()) as { oldPassword?: string; newPassword?: string }
    if (passwords[user.email.toLowerCase()] !== oldPassword) {
      return HttpResponse.json({ message: 'Senha atual incorreta' }, { status: 400 })
    }

    if (!newPassword || newPassword.length < 6) {
      return HttpResponse.json({ message: 'Nova senha deve ter no mínimo 6 caracteres' }, { status: 400 })
    }

    passwords[user.email.toLowerCase()] = newPassword
    saveMockState()
    return HttpResponse.json({ success: true, message: 'Senha alterada com sucesso' })
  }),

  http.get('/api/wallets', ({ request }) => {
    const user = getAuthenticatedUser(request)
    if (!user) {
      return HttpResponse.json({ message: 'Requer autenticação' }, { status: 401 })
    }
    return HttpResponse.json({ wallets: user.wallets })
  }),

  http.post('/api/wallets', async ({ request }) => {
    const user = getAuthenticatedUser(request)
    if (!user) {
      return HttpResponse.json({ message: 'Requer autenticação' }, { status: 401 })
    }

    const { address, network, label, isPrimary } = (await request.json()) as {
      address: string
      network: string
      label: string
      isPrimary?: boolean
    }

    if (!address || !network) {
      return HttpResponse.json({ message: 'Endereço e rede são obrigatórios' }, { status: 400 })
    }

    if (isPrimary) {
      user.wallets.forEach((w) => (w.isPrimary = false))
    }

    const newWallet = {
      id: `w-${Date.now().toString(36)}`,
      address,
      network,
      label: label || 'Minha Carteira',
      isPrimary: isPrimary ?? user.wallets.length === 0
    }

    user.wallets.push(newWallet)
    saveMockState()
    return HttpResponse.json({ success: true, wallet: newWallet }, { status: 201 })
  }),

  http.patch('/api/wallets/:id', async ({ request, params }) => {
    const user = getAuthenticatedUser(request)
    if (!user) {
      return HttpResponse.json({ message: 'Requer autenticação' }, { status: 401 })
    }

    const wallet = user.wallets.find((w) => w.id === params.id)
    if (!wallet) {
      return HttpResponse.json({ message: 'Carteira não encontrada' }, { status: 404 })
    }

    const { label, isPrimary } = (await request.json()) as { label?: string; isPrimary?: boolean }
    if (label) wallet.label = label
    if (isPrimary) {
      user.wallets.forEach((w) => (w.isPrimary = false))
      wallet.isPrimary = true
    }
    saveMockState()

    return HttpResponse.json({ success: true, wallet })
  }),

  http.delete('/api/wallets/:id', ({ request, params }) => {
    const user = getAuthenticatedUser(request)
    if (!user) {
      return HttpResponse.json({ message: 'Requer autenticação' }, { status: 401 })
    }

    user.wallets = user.wallets.filter((w) => w.id !== params.id)
    saveMockState()
    return HttpResponse.json({ success: true })
  })
]
