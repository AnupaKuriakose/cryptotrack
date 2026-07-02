import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { MarketActions } from './market.actions';
import {
  selectFilteredCoins,
  selectLoading,
  selectError,
  selectLastUpdated,
} from './market.selectors';

@Injectable({ providedIn: 'root' })
export class MarketFacade {
  private store = inject(Store);

  coins$ = this.store.select(selectFilteredCoins);
  loading$ = this.store.select(selectLoading);
  error$ = this.store.select(selectError);
  lastUpdated$ = this.store.select(selectLastUpdated);

  loadCoins() {
    this.store.dispatch(MarketActions.loadCoins());
  }

  setSearch(search: string) {
    this.store.dispatch(MarketActions.setSearch({ search }));
  }
}