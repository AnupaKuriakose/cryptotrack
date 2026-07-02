import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule, CurrencyPipe, DatePipe, UpperCasePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MarketFacade } from '../../store/market/market.facade';
import { Coin } from '../../models/coin.model';

@Component({
  selector: 'app-market',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressBarModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatChipsModule,
    CurrencyPipe,
    DatePipe,
    UpperCasePipe,
  ],
 templateUrl: './market.component.html',
  
  styles: [`
    .page { max-width: 1200px; }

    /* Header */
    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 12px;
    }
    .page-header h2 {
      margin: 0 0 2px;
      font-size: 22px;
      font-weight: 600;
    }
    .subtitle {
      margin: 0;
      font-size: 12px;
      color: #888;
    }
    .header-right {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .updated {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #888;
    }
    .clock-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }
    .refresh-btn { font-size: 12px; }

    /* Search */
    .search { width: 100%; max-width: 400px; margin-bottom: 8px; }

    /* Progress */
    .progress { margin-bottom: 12px; border-radius: 4px; }

    /* Error */
    .error-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #ffebee;
      color: #c62828;
      padding: 10px 14px;
      border-radius: 6px;
      margin-bottom: 12px;
      font-size: 13px;
    }

    /* Coin count */
    .coin-count {
      font-size: 12px;
      color: #888;
      margin: 0 0 10px;
    }

    /* Table */
    .table-card {
      border: 1px solid #e0e0e0;
      border-radius: 10px;
      overflow: hidden;
      background: #fff;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    }
    .coin-table { width: 100%; }

    /* Column widths */
    .col-rank { width: 56px; }
    .text-right { text-align: right !important; }

    /* Cells */
    .rank-cell { color: #999; font-size: 13px; }
    .coin-cell { display: flex; align-items: center; gap: 10px; padding: 4px 0; }
    .coin-img { border-radius: 50%; }
    .coin-name { font-weight: 500; font-size: 14px; }
    .coin-sym { color: #999; font-size: 11px; text-transform: uppercase; }
    .mono { font-family: 'Roboto Mono', monospace; font-size: 13px; }
    .price-cell { font-weight: 500; font-size: 14px; }
    .muted { color: #666; }

    /* Change pill */
    .change-pill {
      display: inline-flex;
      align-items: center;
      padding: 3px 8px 3px 4px;
      border-radius: 20px;
      font-size: 12px;
      font-family: 'Roboto Mono', monospace;
      font-weight: 500;
      white-space: nowrap;
    }
    .arrow-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      line-height: 16px;
    }
    .up { background: rgba(22,199,132,0.12); color: #16C784; }
    .down { background: rgba(234,57,67,0.10); color: #EA3943; }
    .neutral { background: rgba(0,0,0,0.06); color: #888; }

    /* Row hover */
    .coin-row { cursor: pointer; transition: background 0.15s; }
    .coin-row:hover td { background: #f8f9ff; }

    /* Header row */
    th.mat-header-cell {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #999;
      background: #fafafa;
    }

    td.mat-cell { border-bottom-color: #f0f0f0; padding: 10px 16px; }
    th.mat-header-cell { padding: 10px 16px; border-bottom: 1px solid #e8e8e8; }

    /* Empty state */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px;
      color: #bbb;
      gap: 8px;
    }
    .empty-state mat-icon { font-size: 40px; width: 40px; height: 40px; }
    .empty-state p { margin: 0; font-size: 14px; }
  `],
})
export class MarketComponent implements OnInit, OnDestroy {
  private facade = inject(MarketFacade);

  coins = toSignal(this.facade.coins$, { initialValue: [] as Coin[] });
  loading = toSignal(this.facade.loading$, { initialValue: false });
  error = toSignal(this.facade.error$, { initialValue: null });
  lastUpdated = toSignal(this.facade.lastUpdated$, { initialValue: null });

  displayedColumns = ['rank', 'name', 'price', 'change24h', 'marketCap', 'volume'];

  private pollInterval: any;

  ngOnInit() {
    this.facade.loadCoins();
    this.pollInterval = setInterval(() => this.facade.loadCoins(), 60000);
  }

  ngOnDestroy() {
    clearInterval(this.pollInterval);
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.facade.setSearch(value);
  }

  refresh() {
    this.facade.loadCoins();
  }

  formatLargeNumber(value: number): string {
    if (!value) return '-';
    if (value >= 1_000_000_000_000) return `$${(value / 1_000_000_000_000).toFixed(2)}T`;
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
    return `$${value.toLocaleString()}`;
  }
}