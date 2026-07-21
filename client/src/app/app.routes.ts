import { Routes } from '@angular/router';

export const routes: Routes = [
     {
    path: '',
    redirectTo: 'market',
    pathMatch: 'full',
  },
  {
    path: 'market',
    loadComponent: () =>
      import('./features/market/market.component').then((m) => m.MarketComponent),
  },
   {
    path: 'coins/:id',
    loadComponent: () =>
      import('./features/coin-detail/coin-detail.component').then((m) => m.CoinDetailComponent),
  },
   {
    path: 'watchlist',
    loadComponent: () =>
      import('./features/watchlist/watchlist.component').then((m) => m.WatchlistComponent),
  },
  {
  path: 'portfolio',
  loadComponent: () =>
    import('./features/portfolio/portfolio.component').then((m) => m.PortfolioComponent),
},
{
  path: 'alerts',
  loadComponent: () =>
    import('./features/alerts/alerts.component').then((m) => m.AlertsComponent),
},
];
