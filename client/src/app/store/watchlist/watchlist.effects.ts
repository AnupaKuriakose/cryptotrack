import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, map, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WatchlistActions } from './watchlist.actions';
import { WatchlistApiService } from '../../core/services/watchlist-api.service';

@Injectable()
export class WatchlistEffects {
  private actions$ = inject(Actions);
  private api = inject(WatchlistApiService);
  private snackbar = inject(MatSnackBar);

  loadWatchlist$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WatchlistActions.loadWatchlist),
      switchMap(() =>
        this.api.getAll().pipe(
          map((items) => WatchlistActions.loadWatchlistSuccess({ items })),
          catchError((error) =>
            of(WatchlistActions.loadWatchlistFailure({ error: error.message }))
          )
        )
      )
    )
  );

  addCoin$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WatchlistActions.addCoin),
      switchMap(({ coin_id, coin_name, coin_symbol, coin_image }) =>
        this.api.addCoin({ coin_id, coin_name, coin_symbol, coin_image }).pipe(
          map((item) => WatchlistActions.addCoinSuccess({ item })),
          catchError((error) =>
            of(WatchlistActions.addCoinFailure({ error: error.message }))
          )
        )
      )
    )
  );

  addCoinSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(WatchlistActions.addCoinSuccess),
        tap(({ item }) => {
          this.snackbar.open(
            `${item.coin_name} added to watchlist`,
            'OK',
            { duration: 3000, panelClass: 'snack-success' }
          );
        })
      ),
    { dispatch: false }
  );

  removeCoin$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WatchlistActions.removeCoin),
      switchMap(({ coinId }) =>
        this.api.removeCoin(coinId).pipe(
          map(() => WatchlistActions.removeCoinSuccess({ coinId })),
          catchError((error) =>
            of(WatchlistActions.removeCoinFailure({ error: error.message }))
          )
        )
      )
    )
  );

  removeCoinSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(WatchlistActions.removeCoinSuccess),
        tap(() => {
          this.snackbar.open('Removed from watchlist', 'OK', {
            duration: 3000,
          });
        })
      ),
    { dispatch: false }
  );
}