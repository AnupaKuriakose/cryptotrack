
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WatchlistItem } from '../../models/watchlist.model';

@Injectable({ providedIn: 'root' })
export class WatchlistApiService {
    private http = inject(HttpClient);
    private base = environment.apiBaseUrl;

    getAll(): Observable<WatchlistItem[]> {
        return this.http.get<WatchlistItem[]>(`${this.base}/watchlist`);
    }

    addCoin(coin: {
        coin_id: string;
        coin_name: string;
        coin_symbol: string;
        coin_image: string;
    }): Observable<WatchlistItem> {
        return this.http.post<WatchlistItem>(`${this.base}/watchlist`, coin);
    }

    removeCoin(coinId: string): Observable<void> {
        return this.http.delete<void>(`${this.base}/watchlist/${coinId}`);
    }
}