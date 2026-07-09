import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Holding, HoldingFormData } from '../../models/portfolio.model';

@Injectable({ providedIn: 'root' })
export class PortfolioApiService {
  private http = inject(HttpClient);
  private base = environment.apiBaseUrl;

  getAll(): Observable<Holding[]> {
    return this.http.get<Holding[]>(`${this.base}/portfolio`);
  }

  addHolding(data: HoldingFormData): Observable<Holding> {
    return this.http.post<Holding>(`${this.base}/portfolio`, data);
  }

  updateHolding(id: number, data: Partial<HoldingFormData>): Observable<Holding> {
    return this.http.put<Holding>(`${this.base}/portfolio/${id}`, data);
  }

  deleteHolding(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/portfolio/${id}`);
  }
}