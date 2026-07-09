import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, map, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PortfolioActions } from './portfolio.actions';
import { PortfolioApiService } from '../../core/services/portfolio-api.service';

@Injectable()
export class PortfolioEffects {
  private actions$ = inject(Actions);
  private api = inject(PortfolioApiService);
  private snackbar = inject(MatSnackBar);

  loadHoldings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PortfolioActions.loadHoldings),
      switchMap(() =>
        this.api.getAll().pipe(
          map((holdings) => PortfolioActions.loadHoldingsSuccess({ holdings })),
          catchError((error) =>
            of(PortfolioActions.loadHoldingsFailure({ error: error.message }))
          )
        )
      )
    )
  );

  addHolding$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PortfolioActions.addHolding),
      switchMap(({ data }) =>
        this.api.addHolding(data).pipe(
          map((holding) => PortfolioActions.addHoldingSuccess({ holding })),
          catchError((error) =>
            of(PortfolioActions.addHoldingFailure({ error: error.message }))
          )
        )
      )
    )
  );

  addHoldingSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(PortfolioActions.addHoldingSuccess),
        tap(({ holding }) => {
          this.snackbar.open(
            `${holding.coin_name} holding added!`,
            'OK',
            { duration: 3000, panelClass: 'snack-success' }
          );
        })
      ),
    { dispatch: false }
  );

  updateHolding$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PortfolioActions.updateHolding),
      switchMap(({ id, data }) =>
        this.api.updateHolding(id, data).pipe(
          map((holding) => PortfolioActions.updateHoldingSuccess({ holding })),
          catchError((error) =>
            of(PortfolioActions.updateHoldingFailure({ error: error.message }))
          )
        )
      )
    )
  );

  updateHoldingSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(PortfolioActions.updateHoldingSuccess),
        tap(() => {
          this.snackbar.open('Holding updated!', 'OK', { duration: 3000 });
        })
      ),
    { dispatch: false }
  );

  deleteHolding$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PortfolioActions.deleteHolding),
      switchMap(({ id }) =>
        this.api.deleteHolding(id).pipe(
          map(() => PortfolioActions.deleteHoldingSuccess({ id })),
          catchError((error) =>
            of(PortfolioActions.deleteHoldingFailure({ error: error.message }))
          )
        )
      )
    )
  );

  deleteHoldingSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(PortfolioActions.deleteHoldingSuccess),
        tap(() => {
          this.snackbar.open('Holding removed', 'OK', { duration: 3000 });
        })
      ),
    { dispatch: false }
  );
}