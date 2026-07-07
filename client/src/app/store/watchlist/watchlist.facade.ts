import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { WatchlistActions } from './watchlist.actions';
import {
  selectEnrichedWatchlist,
  selectLoading,
  selectWatchlistIds,
} from './watchlist.selectors';

@Injectable({ providedIn: 'root' })
export class WatchlistFacade {
  private store = inject(Store);

  items$ = this.store.select(selectEnrichedWatchlist);
  loading$ = this.store.select(selectLoading);
  watchlistIds$ = this.store.select(selectWatchlistIds);

  loadWatchlist() {
    this.store.dispatch(WatchlistActions.loadWatchlist());
  }

  addCoin(coin: {
    coin_id: string;
    coin_name: string;
    coin_symbol: string;
    coin_image: string;
  }) {
    this.store.dispatch(WatchlistActions.addCoin(coin));
  }

  removeCoin(coinId: string) {
    this.store.dispatch(WatchlistActions.removeCoin({ coinId }));
  }
}