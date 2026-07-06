import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { MarketActions } from './market.actions';
import {
  selectFilteredCoins,
  selectLoading,
  selectError,
  selectLastUpdated,
  selectSelectedCoin,
  selectPriceHistory,
  selectDetailLoading,
  selectHistoryLoading,
} from './market.selectors';

@Injectable({ providedIn: 'root' })
export class MarketFacade {
  private store = inject(Store);

  // Market list
  coins$ = this.store.select(selectFilteredCoins);
  loading$ = this.store.select(selectLoading);
  error$ = this.store.select(selectError);
  lastUpdated$ = this.store.select(selectLastUpdated);

  // Coin detail
  selectedCoin$ = this.store.select(selectSelectedCoin);
  priceHistory$ = this.store.select(selectPriceHistory);
  detailLoading$ = this.store.select(selectDetailLoading);
  historyLoading$ = this.store.select(selectHistoryLoading);

  loadCoins() {
    this.store.dispatch(MarketActions.loadCoins());
  }

  setSearch(search: string) {
    this.store.dispatch(MarketActions.setSearch({ search }));
  }

  loadCoinDetail(coinId: string) {
    this.store.dispatch(MarketActions.loadCoinDetail({ coinId }));
  }

  loadPriceHistory(coinId: string, days: number) {
    this.store.dispatch(MarketActions.loadPriceHistory({ coinId, days }));
  }
}