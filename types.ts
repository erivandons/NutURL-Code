
export enum AccountType {
  GUEST = 'GUEST',
  FREE = 'FREE',
  PREMIUM = 'PREMIUM',
}

export interface User {
  id: string;
  email: string;
  name: string;
  accountType: AccountType;
  subscriptionEndDate?: string;
}

export interface ShortLink {
  id: string;
  originalUrl: string;
  slug: string;
  clicks: number;
  createdAt: string;
  expiresAt?: string;
  userId?: string;
  user?: User;
}

export interface AppState {
  currentUser: User | null;
  links: ShortLink[];
}