import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PriceAlert, AlertFormData } from '../../models/alert.model';

@Injectable({ providedIn: 'root' })
export class AlertsApiService {
  private http = inject(HttpClient);
  private base = environment.apiBaseUrl;

  getAll(): Observable<PriceAlert[]> {
    return this.http.get<PriceAlert[]>(`${this.base}/alerts`);
  }

  createAlert(data: AlertFormData): Observable<PriceAlert> {
    return this.http.post<PriceAlert>(`${this.base}/alerts`, data);
  }

  triggerAlert(id: number): Observable<PriceAlert> {
    return this.http.patch<PriceAlert>(`${this.base}/alerts/${id}/trigger`, {});
  }

  deleteAlert(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/alerts/${id}`);
  }
}