export type Rarity = 'N' | 'R' | 'SR' | 'SSR' | 'UR';

export interface Card {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
  emoji: string;
  imageUrl?: string;
  /** 切り抜きPNG（alpha付き）。将来の subject レイヤー用 */
  subjectImageUrl?: string;
  shopName: string;
  area: string;
  /** 地区表示（バッジ用）: 例 "熱田" */
  districtJa?: string;
  /** 地区ローマ字: 例 "ATSUTA" */
  districtEn?: string;
  address: string;
  priceRange: string;
  googleMapUrl: string;
  articleUrl?: string;
  tosharComment: string;
}
