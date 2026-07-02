import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap, map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { MarketActions } from './market.actions';
import { MarketApiService } from '../../core/services/market-api.service';

@Injectable()
export class MarketEffects {
  private actions$ = inject(Actions);
  private marketApi = inject(MarketApiService);

  loadCoins$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MarketActions.loadCoins),
      switchMap(() =>
        this.marketApi.getMarketCoins().pipe(
          map((coins) => MarketActions.loadCoinsSuccess({ coins })),
          catchError((error) =>
            of(MarketActions.loadCoinsFailure({ error: error.message }))
          )
        )
      )
    )
  );
}