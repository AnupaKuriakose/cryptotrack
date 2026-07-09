import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule, CurrencyPipe, DatePipe, DecimalPipe, UpperCasePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { PortfolioFacade } from '../../store/portfolio/portfolio.facade';
import { MarketFacade } from '../../store/market/market.facade';
import { AddHoldingDialogComponent } from './add-holding-dialog.component';
import { Holding } from '../../models/portfolio.model';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    DecimalPipe,
    UpperCasePipe,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatDialogModule,
    MatCardModule,
  ],
  template: `
    <div class="page">

      <!-- Header -->
      <div class="page-header">
        <div>
          <h2>Portfolio</h2>
          <p class="subtitle">{{ holdings().length }} holdings</p>
        </div>
        <button mat-flat-button color="primary" (click)="openAddDialog()">
          <mat-icon>add</mat-icon> Add Holding
        </button>
      </div>

      @if (loading()) {
        <mat-progress-bar mode="indeterminate" class="progress" />
      }

      <!-- Summary cards -->
      @if (stats(); as s) {
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Total Invested</div>
            <div class="stat-value">{{ s.totalInvested | currency:'USD':'symbol':'1.2-2' }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Current Value</div>
            <div class="stat-value">{{ s.currentValue | currency:'USD':'symbol':'1.2-2' }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Total P&L</div>
            <div class="stat-value" [class.up]="s.totalPnl > 0" [class.down]="s.totalPnl < 0">
              {{ s.totalPnl >= 0 ? '+' : '' }}{{ s.totalPnl | currency:'USD':'symbol':'1.2-2' }}
            </div>
            <div class="stat-sub" [class.up]="s.totalPnlPercent > 0" [class.down]="s.totalPnlPercent < 0">
              {{ s.totalPnlPercent >= 0 ? '+' : '' }}{{ s.totalPnlPercent | number:'1.2-2' }}%
            </div>
          </div>
        </div>
      }

      <!-- Empty state -->
      @if (!loading() && holdings().length === 0) {
        <div class="empty-state">
          <mat-icon>account_balance_wallet</mat-icon>
          <p>No holdings yet</p>
          <span>Add your first holding to start tracking your portfolio</span>
          <button mat-stroked-button (click)="openAddDialog()">
            <mat-icon>add</mat-icon> Add Holding
          </button>
        </div>
      }

      <!-- Holdings table -->
      @if (holdings().length > 0) {
        <div class="table-card">
          <table mat-table [dataSource]="holdings()" class="portfolio-table">

            <!-- Coin -->
            <ng-container matColumnDef="coin">
              <th mat-header-cell *matHeaderCellDef>Coin</th>
              <td mat-cell *matCellDef="let h">
                <div class="coin-cell">
                  <img [src]="h.coin_image" [alt]="h.coin_name" width="28" height="28" class="coin-img" />
                  <div>
                    <div class="coin-name">{{ h.coin_name }}</div>
                    <div class="coin-sym">{{ h.coin_symbol | uppercase }}</div>
                  </div>
                </div>
              </td>
            </ng-container>

            <!-- Quantity -->
            <ng-container matColumnDef="quantity">
              <th mat-header-cell *matHeaderCellDef class="text-right">Quantity</th>
              <td mat-cell *matCellDef="let h" class="text-right mono">
                {{ h.quantity | number:'1.0-8' }}
              </td>
            </ng-container>

            <!-- Buy price -->
            <ng-container matColumnDef="buyPrice">
              <th mat-header-cell *matHeaderCellDef class="text-right">Buy Price</th>
              <td mat-cell *matCellDef="let h" class="text-right mono">
                {{ h.buy_price | currency:'USD':'symbol':'1.2-2' }}
              </td>
            </ng-container>

            <!-- Current price -->
            <ng-container matColumnDef="currentPrice">
              <th mat-header-cell *matHeaderCellDef class="text-right">Current Price</th>
              <td mat-cell *matCellDef="let h" class="text-right mono">
                {{ h.current_price ? (h.current_price | currency:'USD':'symbol':'1.2-2') : '—' }}
              </td>
            </ng-container>

            <!-- Current value -->
            <ng-container matColumnDef="value">
              <th mat-header-cell *matHeaderCellDef class="text-right">Value</th>
              <td mat-cell *matCellDef="let h" class="text-right mono">
                {{ h.current_value ? (h.current_value | currency:'USD':'symbol':'1.2-2') : '—' }}
              </td>
            </ng-container>

            <!-- P&L -->
            <ng-container matColumnDef="pnl">
              <th mat-header-cell *matHeaderCellDef class="text-right">P&L</th>
              <td mat-cell *matCellDef="let h" class="text-right">
                @if (h.pnl !== undefined) {
                  <div>
                    <div class="mono" [class.up]="h.pnl > 0" [class.down]="h.pnl < 0">
                      {{ h.pnl >= 0 ? '+' : '' }}{{ h.pnl | currency:'USD':'symbol':'1.2-2' }}
                    </div>
                    <div class="pnl-percent" [class.up]="h.pnl_percent! > 0" [class.down]="h.pnl_percent! < 0">
                      {{ h.pnl_percent! >= 0 ? '+' : '' }}{{ h.pnl_percent | number:'1.2-2' }}%
                    </div>
                  </div>
                }
              </td>
            </ng-container>

            <!-- Actions -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let h">
                <div class="actions">
                  <button mat-icon-button matTooltip="Edit" (click)="openEditDialog(h)">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" matTooltip="Delete" (click)="delete(h)">
                    <mat-icon>delete_outline</mat-icon>
                  </button>
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="portfolio-row"></tr>

          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 1100px; }
    .page-header {
      display: flex; align-items: center;
      justify-content: space-between; margin-bottom: 20px;
    }
    .page-header h2 { margin: 0 0 2px; font-size: 22px; font-weight: 600; }
    .subtitle { margin: 0; font-size: 12px; color: #888; }
    .progress { margin-bottom: 16px; }

    /* Summary cards */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }
    .stat-card {
      background: #fff; border: 1px solid #e0e0e0;
      border-radius: 10px; padding: 16px 20px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    }
    .stat-label {
      font-size: 11px; color: #999;
      text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;
    }
    .stat-value { font-size: 22px; font-weight: 700; font-family: 'Roboto Mono', monospace; }
    .stat-sub { font-size: 13px; font-family: 'Roboto Mono', monospace; margin-top: 2px; }
    .up { color: #16C784; }
    .down { color: #EA3943; }

    /* Table */
    .table-card {
      border: 1px solid #e0e0e0; border-radius: 10px;
      overflow: hidden; background: #fff;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    }
    .portfolio-table { width: 100%; }
    .coin-cell { display: flex; align-items: center; gap: 10px; padding: 4px 0; }
    .coin-img { border-radius: 50%; }
    .coin-name { font-weight: 500; font-size: 14px; }
    .coin-sym { color: #999; font-size: 11px; }
    .mono { font-family: 'Roboto Mono', monospace; font-size: 13px; }
    .text-right { text-align: right !important; }
    .pnl-percent { font-size: 11px; font-family: 'Roboto Mono', monospace; }
    .actions { display: flex; gap: 4px; }
    .portfolio-row:hover td { background: #f8f9ff; }
    th.mat-header-cell {
      font-size: 11px; font-weight: 600;
      text-transform: uppercase; letter-spacing: 0.05em;
      color: #999; background: #fafafa;
      padding: 10px 16px;
    }
    td.mat-cell { padding: 10px 16px; border-bottom-color: #f0f0f0; }

    /* Empty state */
    .empty-state {
      display: flex; flex-direction: column;
      align-items: center; padding: 64px 24px;
      color: #bbb; gap: 10px; text-align: center;
    }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; }
    .empty-state p { margin: 0; font-size: 16px; color: #999; font-weight: 500; }
    .empty-state span { font-size: 13px; }
  `],
})
export class PortfolioComponent implements OnInit {
  private facade = inject(PortfolioFacade);
  private marketFacade = inject(MarketFacade);
  private dialog = inject(MatDialog);

  holdings = toSignal(this.facade.holdings$, {  initialValue: [] as unknown as any[], });
  stats = toSignal(this.facade.stats$, { initialValue: null });
  loading = toSignal(this.facade.loading$, { initialValue: false });

  displayedColumns = ['coin', 'quantity', 'buyPrice', 'currentPrice', 'value', 'pnl', 'actions'];

  ngOnInit() {
    this.facade.loadHoldings();
    this.marketFacade.loadCoins(); // needed for live price enrichment
  }

  openAddDialog() {
    const ref = this.dialog.open(AddHoldingDialogComponent, {
      data: { mode: 'add', coins: [] },
      width: '420px',
    });

    ref.afterClosed().subscribe((result) => {
      if (result) this.facade.addHolding(result);
    });
  }

  openEditDialog(holding: Holding) {
    const ref = this.dialog.open(AddHoldingDialogComponent, {
      data: { mode: 'edit', holding },
      width: '420px',
    });

    ref.afterClosed().subscribe((result) => {
      if (result) this.facade.updateHolding(holding.id, result);
    });
  }

  delete(holding: Holding) {
    this.facade.deleteHolding(holding.id);
  }
}