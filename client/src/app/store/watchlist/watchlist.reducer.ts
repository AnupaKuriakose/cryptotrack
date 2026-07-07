import { createFeature, createReducer, on } from '@ngrx/store';
import { WatchlistItem } from '../../models/watchlist.model';
import { WatchlistActions } from './watchlist.actions';

export interface WatchlistState {
  items: WatchlistItem[];
  loading: boolean;
  error: string | null;
}

const initialState: WatchlistState = {
  items: [],
  loading: false,
  error: null,
};

export const watchlistFeature = createFeature({
  name: 'watchlist',
  reducer: createReducer(
    initialState,
    on(WatchlistActions.loadWatchlist, (state) => ({
      ...state, loading: true, error: null,
    })),
    on(WatchlistActions.loadWatchlistSuccess, (state, { items }) => ({
      ...state, items, loading: false,
    })),
    on(WatchlistActions.loadWatchlistFailure, (state, { error }) => ({
      ...state, loading: false, error,
    })),

    // Add — optimistic update not needed, wait for API
    on(WatchlistActions.addCoinSuccess, (state, { item }) => ({
      ...state, items: [item, ...state.items],
    })),

    // Remove — remove immediately from UI (optimistic)
    on(WatchlistActions.removeCoin, (state, { coinId }) => ({
      ...state,
      items: state.items.filter((i) => i.coin_id !== coinId),
    })),
    on(WatchlistActions.removeCoinFailure, (state, { error }) => ({
      ...state, error,
    })),
  ),
});

export const watchlistReducer = watchlistFeature.reducer;