import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AlertsActions } from './alerts.actions';
import {
  selectEnrichedAlerts,
  selectActiveAlerts,
  selectActiveAlertsCount,
  selectLoading,
} from './alerts.selectors';
import { AlertFormData } from '../../models/alert.model';

@Injectable({ providedIn: 'root' })
export class AlertsFacade {
  private store = inject(Store);

  alerts$ = this.store.select(selectEnrichedAlerts);
  activeAlerts$ = this.store.select(selectActiveAlerts);
  activeAlertsCount$ = this.store.select(selectActiveAlertsCount);
  loading$ = this.store.select(selectLoading);

  loadAlerts() {
    this.store.dispatch(AlertsActions.loadAlerts());
  }

  createAlert(data: AlertFormData) {
    this.store.dispatch(AlertsActions.createAlert({ data }));
  }

  triggerAlert(id: number) {
    this.store.dispatch(AlertsActions.triggerAlert({ id }));
  }

  deleteAlert(id: number) {
    this.store.dispatch(AlertsActions.deleteAlert({ id }));
  }
}