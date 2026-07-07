export interface WatchlistItem {
  id: number;
  coin_id: string;
  coin_name: string;
  coin_symbol: string;
  coin_image: string;
  added_at: string;
  // enriched on frontend from market store
  current_price?: number;
  price_change_percentage_24h?: number;
}