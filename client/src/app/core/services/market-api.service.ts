import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Coin, CoinDetail, PricePoint } from '../../models/coin.model';

@Injectable({ providedIn: 'root' })
export class MarketApiService {
  private http = inject(HttpClient);
  private base = environment.apiBaseUrl;

  getMarketCoins(): Observable<Coin[]> {
    return this.http.get<Coin[]>(`${this.base}/market/coins`);
  }

  getCoinDetail(coinId: string): Observable<CoinDetail> {
    return this.http.get<CoinDetail>(`${this.base}/market/coins/${coinId}`);
  }

  getPriceHistory(coinId: string, days: number): Observable<PricePoint[]> {
    return this.http.get<any>(
      `${this.base}/market/coins/${coinId}/history?days=${days}`
    ).pipe(
      map((res) =>
        res.prices.map(([timestamp, price]: [number, number]) => ({
          timestamp,
          price,
        }))
      )
    );
  }
}