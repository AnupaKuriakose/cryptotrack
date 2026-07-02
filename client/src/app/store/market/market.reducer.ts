import { createFeature, createReducer, on } from '@ngrx/store';
import { Coin } from '../../models/coin.model';
import { MarketActions } from './market.actions';

export interface MarketState {
  coins: Coin[];
  loading: boolean;
  error: string | null;
  search: string;
  lastUpdated: Date | null;
}

const initialState: MarketState = {
  coins: [],
  loading: false,
  error: null,
  search: '',
  lastUpdated: null,
};

export const marketFeature = createFeature({
  name: 'market',
  reducer: createReducer(
    initialState,
    on(MarketActions.loadCoins, (state) => ({
      ...state,
      loading: true,
      error: null,
    })),
    on(MarketActions.loadCoinsSuccess, (state, { coins }) => ({
      ...state,
      coins,
      loading: false,
      lastUpdated: new Date(),
    })),
    on(MarketActions.loadCoinsFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error,
    })),
    on(MarketActions.setSearch, (state, { search }) => ({
      ...state,
      search,
    }))
  ),
});

export const marketReducer = marketFeature.reducer;