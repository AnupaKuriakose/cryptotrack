import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Coin } from '../../models/coin.model';

@Injectable({ providedIn: 'root' })
export class MarketApiService {
  private http = inject(HttpClient);
  private base = environment.apiBaseUrl;

  getMarketCoins(): Observable<Coin[]> {
    return this.http.get<Coin[]>(`${this.base}/market/coins`);
  }
}