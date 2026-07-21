import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, map, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AlertsActions } from './alerts.actions';
import { AlertsApiService } from '../../core/services/alerts-api.service';

@Injectable()
export class AlertsEffects {
  private actions$ = inject(Actions);
  private api = inject(AlertsApiService);
  private snackbar = inject(MatSnackBar);

  loadAlerts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AlertsActions.loadAlerts),
      switchMap(() =>
        this.api.getAll().pipe(
          map((alerts) => AlertsActions.loadAlertsSuccess({ alerts })),
          catchError((error) =>
            of(AlertsActions.loadAlertsFailure({ error: error.message }))
          )
        )
      )
    )
  );

  createAlert$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AlertsActions.createAlert),
      switchMap(({ data }) =>
        this.api.createAlert(data).pipe(
          map((alert) => AlertsActions.createAlertSuccess({ alert })),
          catchError((error) =>
            of(AlertsActions.createAlertFailure({ error: error.message }))
          )
        )
      )
    )
  );

  createAlertSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AlertsActions.createAlertSuccess),
        tap(({ alert }) => {
          this.snackbar.open(
            `Alert set for ${alert.coin_name} ${alert.condition} $${alert.target_price.toLocaleString()}`,
            'OK',
            { duration: 3000, panelClass: 'snack-success' }
          );
        })
      ),
    { dispatch: false }
  );

  triggerAlert$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AlertsActions.triggerAlert),
      switchMap(({ id }) =>
        this.api.triggerAlert(id).pipe(
          map((alert) => AlertsActions.triggerAlertSuccess({ alert })),
          catchError((error) =>
            of(AlertsActions.triggerAlertFailure({ error: error.message }))
          )
        )
      )
    )
  );

  deleteAlert$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AlertsActions.deleteAlert),
      switchMap(({ id }) =>
        this.api.deleteAlert(id).pipe(
          map(() => AlertsActions.deleteAlertSuccess({ id })),
          catchError((error) =>
            of(AlertsActions.deleteAlertFailure({ error: error.message }))
          )
        )
      )
    )
  );

  deleteAlertSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AlertsActions.deleteAlertSuccess),
        tap(() => {
          this.snackbar.open('Alert deleted', 'OK', { duration: 2000 });
        })
      ),
    { dispatch: false }
  );
}