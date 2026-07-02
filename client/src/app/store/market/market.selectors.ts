import { createSelector } from '@ngrx/store';
import { marketFeature } from './market.reducer';

export const {
  selectCoins,
  selectLoading,
  selectError,
  selectSearch,
  selectLastUpdated,
} = marketFeature;

export const selectFilteredCoins = createSelector(
  selectCoins,
  selectSearch,
  (coins, search) => {
    if (!search) return coins;
    const q = search.toLowerCase();
    return coins.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q)
    );
  }
);