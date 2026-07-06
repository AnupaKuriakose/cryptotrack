import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Coin, CoinDetail, PricePoint } from '../../models/coin.model';

export const MarketActions = createActionGroup({
  source: 'Market',
  events: {
    // Market list
    'Load Coins': emptyProps(),
    'Load Coins Success': props<{ coins: Coin[] }>(),
    'Load Coins Failure': props<{ error: string }>(),
    'Set Search': props<{ search: string }>(),

    // Coin detail
    'Load Coin Detail': props<{ coinId: string }>(),
    'Load Coin Detail Success': props<{ coin: CoinDetail }>(),
    'Load Coin Detail Failure': props<{ error: string }>(),

    // Price history
    'Load Price History': props<{ coinId: string; days: number }>(),
    'Load Price History Success': props<{ history: PricePoint[] }>(),
    'Load Price History Failure': props<{ error: string }>(),
  },
});