import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { WatchlistItem } from '../../models/watchlist.model';

export const WatchlistActions = createActionGroup({
  source: 'Watchlist',
  events: {
    // Load
    'Load Watchlist': emptyProps(),
    'Load Watchlist Success': props<{ items: WatchlistItem[] }>(),
    'Load Watchlist Failure': props<{ error: string }>(),

    // Add
    'Add Coin': props<{ coin_id: string; coin_name: string; coin_symbol: string; coin_image: string }>(),
    'Add Coin Success': props<{ item: WatchlistItem }>(),
    'Add Coin Failure': props<{ error: string }>(),

    // Remove
    'Remove Coin': props<{ coinId: string }>(),
    'Remove Coin Success': props<{ coinId: string }>(),
    'Remove Coin Failure': props<{ error: string }>(),
  },
});