import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  effect,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, CurrencyPipe, DatePipe, DecimalPipe, UpperCasePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Filler,
  Tooltip,
  CategoryScale,
} from 'chart.js';
import { MarketFacade } from '../../store/market/market.facade';

// Register Chart.js components
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Filler,
  Tooltip,
  CategoryScale
);

@Component({
  selector: 'app-coin-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    DecimalPipe,
    UpperCasePipe,
    MatButtonModule,
    MatIconModule,
    MatButtonToggleModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    // ← no BaseChartDirective needed
  ],
  template: `
    <div class="page">

      <!-- Back button -->
      <button mat-button class="back-btn" (click)="goBack()">
        <mat-icon>arrow_back</mat-icon> Back to Market
      </button>

      @if (detailLoading()) {
        <div class="spinner-wrap">
          <mat-spinner diameter="48" />
        </div>
      }

      @if (coin(); as c) {
        <!-- Coin header -->
        <div class="coin-header">
          <div class="coin-identity">
            <img [src]="c.image.large" [alt]="c.name" width="48" height="48" class="coin-logo" />
            <div>
              <div class="coin-title">
                {{ c.name }}
                <span class="coin-symbol">{{ c.symbol | uppercase }}</span>
                <span class="rank-badge">#{{ c.market_cap_rank }}</span>
              </div>
              <div class="coin-price">
                {{ c.market_data.current_price.usd | currency:'USD':'symbol':'1.2-6' }}
                <span
                  class="change-pill"
                  [class.up]="c.market_data.price_change_percentage_24h > 0"
                  [class.down]="c.market_data.price_change_percentage_24h < 0"
                >
                  {{ c.market_data.price_change_percentage_24h > 0 ? '+' : '' }}
                  {{ c.market_data.price_change_percentage_24h | number:'1.2-2' }}%
                </span>
              </div>
            </div>
          </div>

          <!-- Action buttons -->
          <div class="coin-actions">
            <button mat-stroked-button>
              <mat-icon>star_border</mat-icon> Watchlist
            </button>
            <button mat-flat-button color="primary">
              <mat-icon>add</mat-icon> Add to Portfolio
            </button>
          </div>
        </div>

        <!-- Chart section -->
        <div class="chart-card">
          <div class="chart-header">
            <span class="chart-title">Price Chart</span>
            <mat-button-toggle-group
              [value]="selectedDays()"
              (change)="onDaysChange($event.value)"
              class="days-toggle"
            >
              <mat-button-toggle [value]="1">1D</mat-button-toggle>
              <mat-button-toggle [value]="7">7D</mat-button-toggle>
              <mat-button-toggle [value]="30">30D</mat-button-toggle>
              <mat-button-toggle [value]="90">90D</mat-button-toggle>
            </mat-button-toggle-group>
          </div>

          @if (historyLoading()) {
            <div class="chart-loading">
              <mat-spinner diameter="32" />
            </div>
          } @else {
            <div class="chart-wrap">
              <canvas #priceChart></canvas>
            </div>
          }
        </div>

        <!-- Stats grid — unchanged -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Market Cap</div>
            <div class="stat-value">{{ formatLarge(c.market_data.market_cap.usd) }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Volume 24h</div>
            <div class="stat-value">{{ formatLarge(c.market_data.total_volume.usd) }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">24h High</div>
            <div class="stat-value up">{{ c.market_data.high_24h.usd | currency:'USD':'symbol':'1.2-2' }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">24h Low</div>
            <div class="stat-value down">{{ c.market_data.low_24h.usd | currency:'USD':'symbol':'1.2-2' }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">All Time High</div>
            <div class="stat-value">{{ c.market_data.ath.usd | currency:'USD':'symbol':'1.2-2' }}</div>
            <div class="stat-sub">{{ c.market_data.ath_date.usd | date:'mediumDate' }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">All Time Low</div>
            <div class="stat-value">{{ c.market_data.atl.usd | currency:'USD':'symbol':'1.2-6' }}</div>
            <div class="stat-sub">{{ c.market_data.atl_date.usd | date:'mediumDate' }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Circulating Supply</div>
            <div class="stat-value">
              {{ c.market_data.circulating_supply | number:'1.0-0' }} {{ c.symbol | uppercase }}
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Max Supply</div>
            <div class="stat-value">
              {{ c.market_data.max_supply
                ? (c.market_data.max_supply | number:'1.0-0') + ' ' + (c.symbol | uppercase)
                : '∞' }}
            </div>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    .page { max-width: 1100px; }
    .back-btn { margin-bottom: 20px; color: #666; }
    .spinner-wrap { display: flex; justify-content: center; padding: 80px; }
    .coin-header {
      display: flex; align-items: flex-start;
      justify-content: space-between; flex-wrap: wrap;
      gap: 16px; margin-bottom: 24px;
    }
    .coin-identity { display: flex; align-items: center; gap: 16px; }
    .coin-logo { border-radius: 50%; }
    .coin-title {
      font-size: 22px; font-weight: 600;
      display: flex; align-items: center; gap: 8px; margin-bottom: 6px;
    }
    .coin-symbol { color: #888; font-size: 14px; font-weight: 400; }
    .rank-badge {
      background: #f0f0f0; color: #666;
      font-size: 11px; padding: 2px 8px;
      border-radius: 10px; font-weight: 500;
    }
    .coin-price {
      font-size: 28px; font-weight: 700;
      font-family: 'Roboto Mono', monospace;
      display: flex; align-items: center; gap: 10px;
    }
    .coin-actions { display: flex; gap: 10px; align-items: center; }
    .change-pill { font-size: 14px; padding: 3px 10px; border-radius: 20px; font-weight: 500; }
    .up { color: #16C784; }
    .down { color: #EA3943; }
    .change-pill.up { background: rgba(22,199,132,0.12); color: #16C784; }
    .change-pill.down { background: rgba(234,57,67,0.10); color: #EA3943; }
    .chart-card {
      background: #fff; border: 1px solid #e0e0e0;
      border-radius: 10px; padding: 20px;
      margin-bottom: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    }
    .chart-header {
      display: flex; align-items: center;
      justify-content: space-between; margin-bottom: 16px;
    }
    .chart-title { font-size: 14px; font-weight: 600; color: #333; }
    .chart-wrap { height: 280px; position: relative; }
    .chart-loading { height: 280px; display: flex; align-items: center; justify-content: center; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
    .stat-card {
      background: #fff; border: 1px solid #e0e0e0;
      border-radius: 8px; padding: 14px 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .stat-label {
      font-size: 11px; color: #999;
      text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;
    }
    .stat-value { font-size: 15px; font-weight: 600; font-family: 'Roboto Mono', monospace; color: #222; }
    .stat-sub { font-size: 11px; color: #aaa; margin-top: 3px; }
    @media (max-width: 768px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .coin-header { flex-direction: column; }
    }
  `],
})
export class CoinDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private facade = inject(MarketFacade);

  // Canvas ref — Chart.js attaches here
  @ViewChild('priceChart') chartCanvas!: ElementRef<HTMLCanvasElement>;

  coin = toSignal(this.facade.selectedCoin$, { initialValue: null });
  priceHistory = toSignal(this.facade.priceHistory$, { initialValue: [] });
  detailLoading = toSignal(this.facade.detailLoading$, { initialValue: false });
  historyLoading = toSignal(this.facade.historyLoading$, { initialValue: false });

  selectedDays = signal(7);

  private chart: Chart | null = null;

  // Effect — watches priceHistory signal
  // When data arrives OR days changes → rebuild chart
  private chartEffect = effect(() => {
    const history = this.priceHistory();

    // Don't render if no data or canvas not ready
    if (!history.length || !this.chartCanvas?.nativeElement) return;

    const labels = history.map((p) =>
      new Date(p.timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    );
    const prices = history.map((p) => p.price);

    if (this.chart) {
      // Chart already exists — just update data
      // Much faster than destroying and recreating
      this.chart.data.labels = labels;
      this.chart.data.datasets[0].data = prices;
      this.chart.update('active');
    } else {
      // First render — create the chart
      this.chart = new Chart(this.chartCanvas.nativeElement, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              data: prices,
              borderColor: '#3F51B5',
              backgroundColor: 'rgba(63,81,181,0.08)',
              fill: true,
              tension: 0.4,
              pointRadius: 0,
              pointHoverRadius: 4,
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { intersect: false, mode: 'index' },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => ` $${ctx.parsed.y?.toLocaleString()}`,
              },
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { maxTicksLimit: 8, font: { size: 11 } },
            },
            y: {
              position: 'right',
              grid: { color: '#f0f0f0' },
              ticks: {
                font: { size: 11 },
                callback: (val) => `$${Number(val).toLocaleString()}`,
              },
            },
          },
        },
      });
    }
  });

  // Effect — reload history when days signal changes
  private daysEffect = effect(() => {
    const days = this.selectedDays();
    const coinId = this.route.snapshot.paramMap.get('id');
    if (coinId) {
      this.facade.loadPriceHistory(coinId, days);
    }
  });

  ngOnInit() {
    const coinId = this.route.snapshot.paramMap.get('id');
    if (coinId) {
      this.facade.loadCoinDetail(coinId);
      this.facade.loadPriceHistory(coinId, this.selectedDays());
    }
  }

  ngOnDestroy() {
    // Always destroy Chart.js instance to prevent memory leaks
    this.chart?.destroy();
    this.chart = null;
  }

  onDaysChange(days: number) {
    this.selectedDays.set(days);
  }

  goBack() {
    this.router.navigate(['/market']);
  }

  formatLarge(value: number): string {
    if (!value) return '-';
    if (value >= 1_000_000_000_000) return `$${(value / 1_000_000_000_000).toFixed(2)}T`;
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
    return `$${value.toLocaleString()}`;
  }
}