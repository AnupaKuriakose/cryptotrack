export type AlertCondition = 'above' | 'below';
export type AlertStatus = 'active' | 'triggered';

export interface PriceAlert {
  id: number;
  coin_id: string;
  coin_name: string;
  coin_symbol: string;
  condition: AlertCondition;
  target_price: number;
  status: AlertStatus;
  created_at: string;
  triggered_at: string | null;
  // enriched on frontend
  current_price?: number;
}

export interface AlertFormData {
  coin_id: string;
  coin_name: string;
  coin_symbol: string;
  condition: AlertCondition;
  target_price: number;
}