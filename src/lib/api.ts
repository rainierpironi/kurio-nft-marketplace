import axios from 'axios'

// Configuração base do cliente Axios
export const api = axios.create({
  baseURL: '/api',
})

// Interceptor para injetar o token de autenticação automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('KURIO_AUTH_TOKEN')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// === INTERFACES (Contratos Tipados) ===

export interface NFT {
  id: string
  tokenId: string
  title: string
  price: string
  oldPrice?: string
  badge?: string
  available: number
  totalEditions: number
  category: string
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

export interface GetNFTsParams {
  q?: string
  category?: string
  network?: string
  sort?: string
  minPrice?: string | number
  maxPrice?: string | number
  page?: number
  limit?: number
}

export interface GetNFTsResponse {
  items: NFT[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CartItem {
  nftId: string
  quantity: number
  nft?: NFT
}

export interface GetCartResponse {
  items: CartItem[]
}

export interface QuoteResponse {
  subtotal: string
  discount: string
  gasFee: string
  total: string
  validCoupon: boolean
  couponCode?: string
}

export interface ProcessedOrder {
  id: string
  idempotencyKey: string
  userId?: string
  items: Array<{ nftId: string; tokenId?: string; image?: string; quantity: number; title: string; price: string }>
  subtotal: string
  discount: string
  gasFee: string
  total: string
  network: string
  walletAddress: string
  walletType?: string
  transactionHash: string
  blockExplorerUrl: string
  createdAt: string
  status: 'confirmed' | 'pending' | 'rejected'
}

export interface CreateOrderResponse {
  success: boolean
  order: ProcessedOrder
  recovered?: boolean
}

export interface Wallet {
  id: string
  address: string
  network: string
  isPrimary: boolean
  label: string
  walletType?: string
  ensName?: string
}

export interface User {
  id: string
  name: string
  username: string
  email: string
  avatar: string
  bio: string
  ensName?: string
  walletNickname?: string
  wallets: Wallet[]
  favorites: string[]
}

export interface AuthResponse {
  token: string
  user: User
}

// === FUNÇÕES DA API ===

// NFTs
export const getNFTs = async (params?: GetNFTsParams): Promise<GetNFTsResponse> => {
  const { data } = await api.get<GetNFTsResponse>('/nfts', { params })
  return data
}

export const getNFTById = async (id: string): Promise<NFT> => {
  const { data } = await api.get<NFT>(`/nfts/${id}`)
  return data
}

// Favoritos
export const getFavorites = async (): Promise<{ favorites: string[] }> => {
  const { data } = await api.get<{ favorites: string[] }>('/favorites')
  return data
}

export const addFavorite = async (nftId: string) => {
  const { data } = await api.post(`/favorites/${nftId}`)
  return data
}

export const removeFavorite = async (nftId: string) => {
  const { data } = await api.delete(`/favorites/${nftId}`)
  return data
}

// Carrinho
export const getCart = async (): Promise<GetCartResponse> => {
  const { data } = await api.get<GetCartResponse>('/cart')
  return data
}

export const addToCart = async (nftId: string, quantity: number = 1) => {
  const { data } = await api.post('/cart', { nftId, quantity })
  return data
}

export const updateCartItem = async (nftId: string, quantity: number) => {
  const { data } = await api.patch(`/cart/${nftId}`, { quantity })
  return data
}

export const removeFromCart = async (nftId: string) => {
  const { data } = await api.delete(`/cart/${nftId}`)
  return data
}

export const mergeCart = async () => {
  const { data } = await api.post('/cart/merge')
  return data
}

// Cotação (Quote)
export const getCheckoutQuote = async (couponCode?: string): Promise<QuoteResponse> => {
  const { data } = await api.post<QuoteResponse>('/checkout/quote', { couponCode })
  return data
}

// Pedidos
export const createOrder = async (orderData: any, idempotencyKey: string): Promise<CreateOrderResponse> => {
  const { data } = await api.post<CreateOrderResponse>('/orders', orderData, {
    headers: {
      'x-idempotency-key': idempotencyKey,
    },
  })
  return data
}

export const getOrderById = async (orderId: string): Promise<{ order: ProcessedOrder }> => {
  const { data } = await api.get<{ order: ProcessedOrder }>(`/orders/${orderId}`)
  return data
}

// Autenticação
export const login = async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/auth/login', credentials)
  return data
}

export const register = async (userData: {
  name: string
  username: string
  email: string
  password: string
}): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>('/auth/register', userData)
  return data
}

export const getMe = async (): Promise<{ user: User }> => {
  const { data } = await api.get<{ user: User }>('/auth/me')
  return data
}

export const logout = async (): Promise<void> => {
  await api.post('/auth/logout')
}

// Perfil e Carteiras
export const updateProfile = async (profileData: Partial<User>): Promise<{ user: User }> => {
  const { data } = await api.patch<{ user: User }>('/profile', profileData)
  return data
}

export const updatePassword = async (passwords: { oldPassword: string; newPassword: string }) => {
  const { data } = await api.put('/profile/password', passwords)
  return data
}

export const getWallets = async (): Promise<{ wallets: Wallet[] }> => {
  const { data } = await api.get<{ wallets: Wallet[] }>('/wallets')
  return data
}

export const addWallet = async (walletData: {
  address: string
  network: string
  label: string
  isPrimary?: boolean
  walletType?: string
  ensName?: string
}): Promise<{ success: boolean; wallet: Wallet }> => {
  const { data } = await api.post('/wallets', walletData)
  return data
}

export const updateWallet = async (
  walletId: string,
  walletData: { label?: string; isPrimary?: boolean; address?: string; network?: string }
): Promise<{ success: boolean; wallet: Wallet }> => {
  const { data } = await api.patch(`/wallets/${walletId}`, walletData)
  return data
}

export const deleteWallet = async (walletId: string): Promise<{ success: boolean }> => {
  const { data } = await api.delete(`/wallets/${walletId}`)
  return data
}

export const resetFixture = async (): Promise<{ success: boolean; message: string }> => {
  const { data } = await api.post('/admin/reset')
  return data
}
