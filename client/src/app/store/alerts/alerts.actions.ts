import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { PriceAlert, AlertFormData } from '../../models/alert.model';

export const AlertsActions = createActionGroup({
  source: 'Alerts',
  events: {
    // Load
    'Load Alerts': emptyProps(),
    'Load Alerts Success': props<{ alerts: PriceAlert[] }>(),
    'Load Alerts Failure': props<{ error: string }>(),

    // Create
    'Create Alert': props<{ data: AlertFormData }>(),
    'Create Alert Success': props<{ alert: PriceAlert }>(),
    'Create Alert Failure': props<{ error: string }>(),

    // Trigger
    'Trigger Alert': props<{ id: number }>(),
    'Trigger Alert Success': props<{ alert: PriceAlert }>(),
    'Trigger Alert Failure': props<{ error: string }>(),

    // Delete
    'Delete Alert': props<{ id: number }>(),
    'Delete Alert Success': props<{ id: number }>(),
    'Delete Alert Failure': props<{ error: string }>(),
  },
});