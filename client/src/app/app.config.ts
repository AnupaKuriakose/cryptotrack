import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { routes } from './app.routes';
import { marketReducer } from './store/market/market.reducer';
import { MarketEffects } from './store/market/market.effects';
import { watchlistReducer } from './store/watchlist/watchlist.reducer';
import { WatchlistEffects } from './store/watchlist/watchlist.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideStore({ market: marketReducer, watchlist: watchlistReducer }),
    provideEffects([MarketEffects, WatchlistEffects]),
    provideStoreDevtools({ maxAge: 25 }),
  ],
};