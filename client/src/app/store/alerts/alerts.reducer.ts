import { createFeature, createReducer, on } from '@ngrx/store';
import { PriceAlert } from '../../models/alert.model';
import { AlertsActions } from './alerts.actions';

export interface AlertsState {
  alerts: PriceAlert[];
  loading: boolean;
  error: string | null;
}

const initialState: AlertsState = {
  alerts: [],
  loading: false,
  error: null,
};

export const alertsFeature = createFeature({
  name: 'alerts',
  reducer: createReducer(
    initialState,
    on(AlertsActions.loadAlerts, (state) => ({
      ...state, loading: true, error: null,
    })),
    on(AlertsActions.loadAlertsSuccess, (state, { alerts }) => ({
      ...state, alerts, loading: false,
    })),
    on(AlertsActions.loadAlertsFailure, (state, { error }) => ({
      ...state, loading: false, error,
    })),

    // Create
    on(AlertsActions.createAlertSuccess, (state, { alert }) => ({
      ...state, alerts: [alert, ...state.alerts],
    })),

    // Trigger — update status in store
    on(AlertsActions.triggerAlertSuccess, (state, { alert }) => ({
      ...state,
      alerts: state.alerts.map((a) =>
        a.id === alert.id ? { ...a, status: 'triggered' as const, triggered_at: alert.triggered_at } : a
      ),
    })),

    // Delete — optimistic
    on(AlertsActions.deleteAlert, (state, { id }) => ({
      ...state,
      alerts: state.alerts.filter((a) => a.id !== id),
    })),
  ),
});

export const alertsReducer = alertsFeature.reducer;