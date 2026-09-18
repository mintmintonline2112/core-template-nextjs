/**
 * Thị trường xuất khẩu trên bản đồ thế giới — dùng chung cho WorldMap (about-map)
 * và danh sách khu vực (about-map bố cục regions). Tọa độ theo kinh/vĩ độ thật.
 */

export type MarketPoint = { r: string; n: string; lat: number; lon: number };

export type MapRegion = { key: string; label: string };

export const ORIGIN: MarketPoint = { r: "us", n: "Trụ sở chính", lat: 36.8, lon: -119.8 };

export const MARKETS: MarketPoint[] = [
  { r: "us", n: "United States", lat: 39.8, lon: -98.6 },
  { r: "na", n: "Canada", lat: 53.9, lon: -106.3 },
  { r: "na", n: "Mexico", lat: 23.6, lon: -102.5 },
  { r: "ap", n: "Vietnam", lat: 16.2, lon: 106.0 },
  { r: "ap", n: "China", lat: 34.5, lon: 104.0 },
  { r: "ap", n: "Hong Kong", lat: 22.3, lon: 114.2 },
  { r: "ap", n: "Japan", lat: 36.2, lon: 138.3 },
  { r: "ap", n: "South Korea", lat: 36.5, lon: 127.9 },
  { r: "ap", n: "Taiwan", lat: 23.7, lon: 121.0 },
  { r: "ap", n: "Singapore", lat: 1.35, lon: 103.8 },
  { r: "ap", n: "Malaysia", lat: 3.9, lon: 102.0 },
  { r: "ap", n: "Indonesia", lat: -2.5, lon: 117.9 },
  { r: "ap", n: "Thailand", lat: 15.0, lon: 101.0 },
  { r: "ap", n: "Philippines", lat: 12.9, lon: 122.0 },
  { r: "sa", n: "India", lat: 21.0, lon: 78.0 },
  { r: "sa", n: "Pakistan", lat: 29.9, lon: 69.4 },
  { r: "sa", n: "Bangladesh", lat: 23.7, lon: 90.4 },
  { r: "sa", n: "Sri Lanka", lat: 7.9, lon: 80.8 },
  { r: "me", n: "United Arab Emirates", lat: 24.3, lon: 54.4 },
  { r: "me", n: "Saudi Arabia", lat: 23.9, lon: 45.1 },
  { r: "me", n: "Qatar", lat: 25.3, lon: 51.2 },
  { r: "me", n: "Kuwait", lat: 29.3, lon: 47.5 },
  { r: "me", n: "Bahrain", lat: 26.0, lon: 50.5 },
  { r: "me", n: "Oman", lat: 21.5, lon: 57.0 },
  { r: "me", n: "Jordan", lat: 31.3, lon: 36.4 },
  { r: "eu", n: "Germany", lat: 51.1, lon: 10.4 },
  { r: "eu", n: "Netherlands", lat: 52.2, lon: 5.3 },
  { r: "eu", n: "Spain", lat: 40.2, lon: -3.7 },
  { r: "eu", n: "Italy", lat: 42.8, lon: 12.5 },
  { r: "eu", n: "France", lat: 46.6, lon: 2.5 },
  { r: "eu", n: "United Kingdom", lat: 53.0, lon: -1.5 },
];

/** Điểm đến của đường nối từ trụ sở tới từng khu vực. */
export const HUBS: Record<string, { lat: number; lon: number }> = {
  na: { lat: 23.6, lon: -102.5 },
  ap: { lat: 16.2, lon: 106.0 },
  sa: { lat: 21.0, lon: 78.0 },
  me: { lat: 24.3, lon: 54.4 },
  eu: { lat: 51.1, lon: 10.4 },
};

export const DEFAULT_MAP_REGIONS: MapRegion[] = [
  { key: "us", label: "Trong nước" },
  { key: "na", label: "Bắc Mỹ" },
  { key: "ap", label: "Châu Á - Thái Bình Dương" },
  { key: "sa", label: "Nam Á" },
  { key: "me", label: "Trung Đông" },
  { key: "eu", label: "Châu Âu" },
];

/** Tên các nước có ghim trên bản đồ thuộc một khu vực. */
export function countriesInRegion(regionKey: string): string[] {
  return MARKETS.filter((market) => market.r === regionKey).map((market) => market.n);
}
