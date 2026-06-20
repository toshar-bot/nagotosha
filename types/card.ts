export type Rarity = 'N' | 'R' | 'SR' | 'SSR' | 'UR';

export interface Card {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
  emoji: string;
  imageUrl?: string;
  shopName: string;
  area: string;
  address: string;
  priceRange: string;
  googleMapUrl: string;
  articleUrl?: string;
  tosharComment: string;
}
