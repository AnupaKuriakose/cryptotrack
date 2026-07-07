import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { CommonModule, CurrencyPipe, DatePipe, UpperCasePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { WatchlistFacade } from '../../store/watchlist/watchlist.facade';
import { MarketFacade } from '../../store/market/market.facade';
import { WatchlistItem } from '../../models/watchlist.model';

@Component({
  selector: 'app-watchlist',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    UpperCasePipe,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatTooltipModule,
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h2>Watchlist</h2>
          <p class="subtitle">{{ items().length }} coins tracked</p>
        </div>
      </div>

      @if (loading()) {
        <mat-progress-bar mode="indeterminate" class="progress" />
      }

      <!-- Empty state -->
      @if (!loading() && items().length === 0) {
        <div class="empty-state">
          <mat-icon>star_border</mat-icon>
          <p>No coins in your watchlist</p>
          <span>Click the ⭐ star on any coin to add it here</span>
          <button mat-stroked-button (click)="goToMarket()">
            Browse Market
          </button>
        </div>
      }

      <!-- Table -->
      @if (items().length > 0) {
        <div class="table-card">
          <table mat-table [dataSource]="items()" class="watchlist-table">

            <!-- Coin -->
            <ng-container matColumnDef="coin">
              <th mat-header-cell *matHeaderCellDef>Coin</th>
              <td mat-cell *matCellDef="let item">
                <div class="coin-cell">
                  <img [src]="item.coin_image" [alt]="item.coin_name" width="28" height="28" class="coin-img" />
                  <div>
                    <div class="coin-name">{{ item.coin_name }}</div>
                    <div class="coin-sym">{{ item.coin_symbol | uppercase }}</div>
                  </div>
                </div>
              </td>
            </ng-container>

            <!-- Price -->
            <ng-container matColumnDef="price">
              <th mat-header-cell *matHeaderCellDef class="text-right">Price</th>
              <td mat-cell *matCellDef="let item" class="text-right mono">
                {{ item.current_price ? (item.current_price | currency:'USD':'symbol':'1.2-6') : '—' }}
              </td>
            </ng-container>

            <!-- 24h change -->
            <ng-container matColumnDef="change">
              <th mat-header-cell *matHeaderCellDef class="text-right">24h %</th>
              <td mat-cell *matCellDef="let item" class="text-right">
                @if (item.price_change_percentage_24h !== undefined) {
                  <span
                    class="change-pill"
                    [class.up]="item.price_change_percentage_24h > 0"
                    [class.down]="item.price_change_percentage_24h < 0"
                  >
                    {{ item.price_change_percentage_24h > 0 ? '+' : '' }}
                    {{ item.price_change_percentage_24h | number:'1.2-2' }}%
                  </span>
                } @else {
                  <span class="muted">—</span>
                }
              </td>
            </ng-container>

            <!-- Added date -->
            <ng-container matColumnDef="added">
              <th mat-header-cell *matHeaderCellDef class="text-right">Added</th>
              <td mat-cell *matCellDef="let item" class="text-right muted">
                {{ item.added_at | date:'mediumDate' }}
              </td>
            </ng-container>

            <!-- Remove -->
            <ng-container matColumnDef="remove">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let item">
                <button
                  mat-icon-button
                  color="warn"
                  matTooltip="Remove from watchlist"
                  (click)="remove(item)"
                >
                  <mat-icon>delete_outline</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
            <tr
              mat-row
              *matRowDef="let row; columns: displayedColumns;"
              class="watchlist-row"
              (click)="goToDetail(row)"
            ></tr>

          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 1000px; }
    .page-header { margin-bottom: 20px; }
    .page-header h2 { margin: 0 0 2px; font-size: 22px; font-weight: 600; }
    .subtitle { margin: 0; font-size: 12px; color: #888; }
    .progress { margin-bottom: 16px; }
    .table-card {
      border: 1px solid #e0e0e0; border-radius: 10px;
      overflow: hidden; background: #fff;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    }
    .watchlist-table { width: 100%; }
    .coin-cell { display: flex; align-items: center; gap: 10px; padding: 4px 0; }
    .coin-img { border-radius: 50%; }
    .coin-name { font-weight: 500; font-size: 14px; }
    .coin-sym { color: #999; font-size: 11px; }
    .mono { font-family: 'Roboto Mono', monospace; font-size: 13px; }
    .muted { color: #999; font-size: 12px; }
    .text-right { text-align: right !important; }
    .change-pill {
      display: inline-block; padding: 3px 8px;
      border-radius: 20px; font-size: 12px;
      font-family: 'Roboto Mono', monospace; font-weight: 500;
    }
    .up { background: rgba(22,199,132,0.12); color: #16C784; }
    .down { background: rgba(234,57,67,0.10); color: #EA3943; }
    .watchlist-row { cursor: pointer; }
    .watchlist-row:hover td { background: #f8f9ff; }
    th.mat-header-cell {
      font-size: 11px; font-weight: 600;
      text-transform: uppercase; letter-spacing: 0.05em;
      color: #999; background: #fafafa;
      padding: 10px 16px;
    }
    td.mat-cell { padding: 10px 16px; border-bottom-color: #f0f0f0; }
    .empty-state {
      display: flex; flex-direction: column;
      align-items: center; padding: 64px 24px;
      color: #bbb; gap: 10px; text-align: center;
    }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; }
    .empty-state p { margin: 0; font-size: 16px; color: #999; font-weight: 500; }
    .empty-state span { font-size: 13px; color: #bbb; }
  `],
})
export class WatchlistComponent implements OnInit {
  private facade = inject(WatchlistFacade);
  private marketFacade = inject(MarketFacade);
  private router = inject(Router);

  items = toSignal(this.facade.items$, {
    // start with an empty array to match WatchlistItem[] without forcing required fields
    // Use a permissive initial value type to satisfy the toSignal overload
    initialValue: [] as unknown as any[],
  });
  loading = toSignal(this.facade.loading$, { initialValue: false });

  displayedColumns = ['coin', 'price', 'change', 'added', 'remove'];

  ngOnInit() {
    this.facade.loadWatchlist();
    // Load market coins too so live prices are available for enrichment
    this.marketFacade.loadCoins();
  }

  remove(item: WatchlistItem) {
    this.facade.removeCoin(item.coin_id);
  }

  goToDetail(item: WatchlistItem) {
    this.router.navigate(['/coins', item.coin_id]);
  }

  goToMarket() {
    this.router.navigate(['/market']);
  }
}