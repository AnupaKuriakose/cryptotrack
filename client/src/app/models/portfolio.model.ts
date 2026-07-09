export interface Holding {
  id: number;
  coin_id: string;
  coin_name: string;
  coin_symbol: string;
  coin_image: string;
  quantity: number;
  buy_price: number;
  buy_date: string;
  created_at: string;
  updated_at: string;
  // enriched on frontend
  current_price?: number;
  current_value?: number;
  pnl?: number;
  pnl_percent?: number;
  invested?: number;
}

export interface PortfolioStats {
  totalInvested: number;
  currentValue: number;
  totalPnl: number;
  totalPnlPercent: number;
}

export interface HoldingFormData {
  coin_id: string;
  coin_name: string;
  coin_symbol: string;
  coin_image: string;
  quantity: number;
  buy_price: number;
  buy_date: string;
}