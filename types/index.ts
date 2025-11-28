// ============================================
// USER
// ============================================
export interface User {
  id: number;
  name: string;
  lastName?: string;
  email: string;
  cpf: string;
  phone: string;
  banned: boolean;
  isAdmin: boolean;
  createdAt: string;
  wallet?: Wallet;
}

// ============================================
// WALLET
// ============================================
export interface Wallet {
  id: number;
  userId: number;
  currency: string;
  symbol: string;
  balance: number;
  balanceWithdrawal: number;
  balanceBonus: number;
  active: boolean;
  vipLevel: number;
  vipPoints: number;
}

// ============================================
// DEPOSITS & WITHDRAWALS
// ============================================
export interface Deposit {
  id: number;
  userId: number;
  amount: number;
  type?: string;
  currency: string;
  symbol: string;
  status: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    name: string;
    lastName?: string;
    email: string;
    cpf: string;
  };
}

export interface Withdrawal {
  id: number;
  userId: number;
  amount: number;
  type?: string;
  proof?: string;
  currency: string;
  symbol: string;
  status: number;
  pixKey?: string;
  pixType?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    name: string;
    lastName?: string;
    email: string;
    cpf: string;
  };
}

// ============================================
// GAMES
// ============================================
export interface Game {
  id: number;
  providerId: number;
  gameServerUrl?: string;
  gameId?: string;
  gameName: string;
  gameCode: string;
  gameType?: string;
  description?: string;
  cover?: string;
  status: number;
  technology?: string;
  hasLobby: number;
  isMobile: number;
  hasFreespins: number;
  hasTables: number;
  onlyDemo: number;
  rtp?: number;
  distribution?: string;
  views: number;
  isFeatured: number;
  showHome: number;
  createdAt: string;
  updatedAt: string;
  provider?: Provider;
  categories?: any[];
}

export interface Provider {
  id: number;
  code: string;
  name: string;
  rtp?: number;
  status: number;
  distribution?: string;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  image?: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// BANNERS
// ============================================
export interface Banner {
  id: number;
  title: string;
  description?: string;
  image: string;
  link?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// MISSIONS
// ============================================
export interface Mission {
  id: number;
  challengeName: string;
  challengeDescription?: string;
  challengeRules?: string;
  challengeType: string;
  challengeLink?: string;
  challengeStartDate: string;
  challengeEndDate: string;
  challengeBonus: number;
  challengeTotal: number;
  influencerWinLength?: number;
  influencerLoseLength?: number;
  challengeCurrency: string;
  challengeProvider?: string;
  challengeGameid?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// VIP
// ============================================
export interface Vip {
  id: number;
  level: number;
  name: string;
  minPoints: number;
  maxPoints: number;
  benefits?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// SETTINGS
// ============================================
export interface Settings {
  id: number;
  softwareName?: string;
  softwareDescription?: string;
  softwareLogo?: string;
  softwareFavicon?: string;
  currencyCode: string;
  prefix: string;
  minDeposit: number;
  maxDeposit: number;
  minWithdrawal: number;
  maxWithdrawal: number;
  depositBonus: number;
  depositBonusRollover: number;
  rolloverProtection: boolean;
  disableSpin: boolean;
  asaasIsEnable: boolean;
  affiliateBaseline: number;
  createdAt: string;
  updatedAt: string;
}

export interface Gateway {
  id: number;
  name: string;
  code: string;
  apiKey?: string;
  apiSecret?: string;
  apiUrl?: string;
  walletId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// DASHBOARD
// ============================================
export interface DashboardStats {
  users: {
    total: number;
    activeToday: number;
  };
  deposits: {
    total: {
      value: number;
      count: number;
    };
    pending: number;
    today: {
      value: number;
      count: number;
    };
  };
  withdrawals: {
    total: {
      value: number;
      count: number;
    };
    pending: number;
    today: {
      value: number;
      count: number;
    };
  };
  systemBalance: number;
  revenue: number;
}

// ============================================
// PAGINATION
// ============================================
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

