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
import { WatchlistFacade } from '../../store/watchlist/watchlist.facade';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddHoldingDialogComponent } from '../portfolio/add-holding-dialog.component';
import { PortfolioFacade } from '../../store/portfolio/portfolio.facade';

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
        MatDialogModule
        // ← no BaseChartDirective needed
    ],
    templateUrl: './coin-detail.component.html',
    styleUrls: ['./coin-detail.component.scss']
})
export class CoinDetailComponent implements OnInit, AfterViewInit, OnDestroy {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private facade = inject(MarketFacade);
    private watchlistFacade = inject(WatchlistFacade);
    private dialog = inject(MatDialog);
private portfolioFacade = inject(PortfolioFacade);
    watchlistIds = toSignal(this.watchlistFacade.watchlistIds$, { initialValue: new Set<string>() });

    // Canvas ref — Chart.js attaches here
    @ViewChild('priceChart') chartCanvas!: ElementRef<HTMLCanvasElement>;

    coin = toSignal(this.facade.selectedCoin$, { initialValue: null });
    priceHistory = toSignal(this.facade.priceHistory$, { initialValue: [] });
    detailLoading = toSignal(this.facade.detailLoading$, { initialValue: false });
    historyLoading = toSignal(this.facade.historyLoading$, { initialValue: false });
    private chartReady = signal(false); // ← new signal

    selectedDays = signal(7);

    private chart: Chart | null = null;

    ngAfterViewInit() {
        // Canvas is now in DOM — signal the effect it can render
        this.chartReady.set(true);
        queueMicrotask(() => this.renderChartIfReady());
    }

    private renderChartIfReady() {
        const history = this.priceHistory();
        const ready = this.chartReady();

        if (!ready || !history.length) return;

        const canvas = this.chartCanvas?.nativeElement;
        if (!canvas) {
            queueMicrotask(() => this.renderChartIfReady());
            return;
        }

        const labels = history.map((p) =>
            new Date(p.timestamp).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
            })
        );
        const prices = history.map((p) => p.price);

        if (this.chart) {
            this.chart.data.labels = labels;
            this.chart.data.datasets[0].data = prices;
            this.chart.update('active');
            return;
        }

        this.chart = new Chart(canvas, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    data: prices,
                    borderColor: '#3F51B5',
                    backgroundColor: 'rgba(63,81,181,0.08)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    borderWidth: 2,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { intersect: false, mode: 'index' },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => ` $${ctx?.parsed?.y?.toLocaleString()}`,
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

    // Effect — watches both priceHistory AND chartReady
    private chartEffect = effect(() => {
        this.renderChartIfReady();
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
            this.watchlistFacade.loadWatchlist(); // ← add
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

    toggleWatchlist(c: any) {
        if (this.watchlistIds().has(c.id)) {
            this.watchlistFacade.removeCoin(c.id);
        } else {
            this.watchlistFacade.addCoin({
                coin_id: c.id,
                coin_name: c.name,
                coin_symbol: c.symbol,
                coin_image: c.image.large,
            });
        }
    }
    openAddToPortfolio(c: any) {
  const ref = this.dialog.open(AddHoldingDialogComponent, {
    data: {
      mode: 'add',
      holding: {
        coin_id: c.id,
        coin_name: c.name,
        coin_symbol: c.symbol,
        coin_image: c.image.large,
        buy_price: c.market_data.current_price.usd,
      },
      coins: [],
    },
    width: '420px',
  });

  ref.afterClosed().subscribe((result) => {
    if (result) this.portfolioFacade.addHolding(result);
  });
}
}