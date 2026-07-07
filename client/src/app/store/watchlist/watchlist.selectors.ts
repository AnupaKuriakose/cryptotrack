import { createSelector } from '@ngrx/store';
import { watchlistFeature } from './watchlist.reducer';
import { selectCoins } from '../market/market.selectors';

export const {
  selectItems,
  selectLoading,
  selectError,
} = watchlistFeature;

// Enriched watchlist — adds live price + 24h change from market store
export const selectEnrichedWatchlist = createSelector(
  selectItems,
  selectCoins,
  (items, coins) =>
    items.map((item) => {
      const live = coins.find((c) => c.id === item.coin_id);
      return {
        ...item,
        current_price: live?.current_price,
        price_change_percentage_24h: live?.price_change_percentage_24h,
      };
    })
);

// Set of coin IDs in watchlist — for fast star button lookup
export const selectWatchlistIds = createSelector(
  selectItems,
  (items) => new Set(items.map((i) => i.coin_id))
);