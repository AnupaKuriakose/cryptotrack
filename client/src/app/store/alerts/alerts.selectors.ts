import { createSelector } from '@ngrx/store';
import { alertsFeature } from './alerts.reducer';
import { selectCoins } from '../market/market.selectors';

export const {
  selectAlerts,
  selectLoading,
  selectError,
} = alertsFeature;

// Active alerts only — for the checker effect
export const selectActiveAlerts = createSelector(
  selectAlerts,
  (alerts) => alerts.filter((a) => a.status === 'active')
);

// Enrich with current price from market store
export const selectEnrichedAlerts = createSelector(
  selectAlerts,
  selectCoins,
  (alerts, coins) =>
    alerts.map((alert) => {
      const live = coins.find((c) => c.id === alert.coin_id);
      return { ...alert, current_price: live?.current_price };
    })
);

// Count of active alerts — for dashboard badge
export const selectActiveAlertsCount = createSelector(
  selectActiveAlerts,
  (alerts) => alerts.length
);