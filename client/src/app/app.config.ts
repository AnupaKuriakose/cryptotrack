import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { routes } from './app.routes';
import { marketReducer } from './store/market/market.reducer';
import { MarketEffects } from './store/market/market.effects';
import { watchlistReducer } from './store/watchlist/watchlist.reducer';
import { WatchlistEffects } from './store/watchlist/watchlist.effects';
import { portfolioReducer } from './store/portfolio/portfolio.reducer';
import { PortfolioEffects } from './store/portfolio/portfolio.effects';
import { alertsReducer } from './store/alerts/alerts.reducer';
import { AlertsEffects } from './store/alerts/alerts.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimationsAsync(),
    provideStore({
      market: marketReducer,
      watchlist: watchlistReducer,
      portfolio: portfolioReducer,
      alerts: alertsReducer,
    }),
    provideEffects([
      MarketEffects,
      WatchlistEffects,
      PortfolioEffects,
      AlertsEffects,
    ]),
    provideStoreDevtools({ maxAge: 25 }),
  ],
};