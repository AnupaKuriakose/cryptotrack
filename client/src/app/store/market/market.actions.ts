import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Coin } from '../../models/coin.model';

export const MarketActions = createActionGroup({
  source: 'Market',
  events: {
    'Load Coins': emptyProps(),
    'Load Coins Success': props<{ coins: Coin[] }>(),
    'Load Coins Failure': props<{ error: string }>(),
    'Set Search': props<{ search: string }>(),
  },
});