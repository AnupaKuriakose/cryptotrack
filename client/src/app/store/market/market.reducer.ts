import { createFeature, createReducer, on } from '@ngrx/store';
import { Coin, CoinDetail, PricePoint } from '../../models/coin.model';
import { MarketActions } from './market.actions';

export interface MarketState {
  coins: Coin[];
  loading: boolean;
  error: string | null;
  search: string;
  lastUpdated: Date | null;
  selectedCoin: CoinDetail | null;
  priceHistory: PricePoint[];
  detailLoading: boolean;
  historyLoading: boolean;
}

const initialState: MarketState = {
  coins: [],
  loading: false,
  error: null,
  search: '',
  lastUpdated: null,
  selectedCoin: null,
  priceHistory: [],
  detailLoading: false,
  historyLoading: false,
};

export const marketFeature = createFeature({
  name: 'market',
  reducer: createReducer(
    initialState,
    on(MarketActions.loadCoins, (state) => ({
      ...state, loading: true, error: null,
    })),
    on(MarketActions.loadCoinsSuccess, (state, { coins }) => ({
      ...state, coins, loading: false, lastUpdated: new Date(),
    })),
    on(MarketActions.loadCoinsFailure, (state, { error }) => ({
      ...state, loading: false, error,
    })),
    on(MarketActions.setSearch, (state, { search }) => ({
      ...state, search,
    })),

    // Coin detail
    on(MarketActions.loadCoinDetail, (state) => ({
      ...state, detailLoading: true, selectedCoin: null,
    })),
    on(MarketActions.loadCoinDetailSuccess, (state, { coin }) => ({
      ...state, selectedCoin: coin, detailLoading: false,
    })),
    on(MarketActions.loadCoinDetailFailure, (state, { error }) => ({
      ...state, detailLoading: false, error,
    })),

    // Price history
    on(MarketActions.loadPriceHistory, (state) => ({
      ...state, historyLoading: true, priceHistory: [],
    })),
    on(MarketActions.loadPriceHistorySuccess, (state, { history }) => ({
      ...state, priceHistory: history, historyLoading: false,
    })),
    on(MarketActions.loadPriceHistoryFailure, (state, { error }) => ({
      ...state, historyLoading: false, error,
    })),
  ),
});

export const marketReducer = marketFeature.reducer;