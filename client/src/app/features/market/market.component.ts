import {
    Component,
    OnInit,
    OnDestroy,
    ChangeDetectionStrategy,
    inject,
    signal,
    computed,
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
import { MatSortModule, Sort } from '@angular/material/sort';
import { Router } from '@angular/router';


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
        MatSortModule,
        CurrencyPipe,
        DatePipe,
        UpperCasePipe,
    ],
    templateUrl: './market.component.html',
    styleUrls: ['./market.component.scss']
})
export class MarketComponent implements OnInit, OnDestroy {
    private facade = inject(MarketFacade);
    private router = inject(Router);

    coins = toSignal(this.facade.coins$, { initialValue: [] as Coin[] });
    loading = toSignal(this.facade.loading$, { initialValue: false });
    error = toSignal(this.facade.error$, { initialValue: null });
    lastUpdated = toSignal(this.facade.lastUpdated$, { initialValue: null });

    displayedColumns = ['watchlist', 'name', 'price', 'change24h', 'marketCap', 'volume'];

    private pollInterval: any;
    sortField = signal<string>('market_cap_rank');
    sortDir = signal<'asc' | 'desc'>('asc');


    sortedCoins = computed(() => {
        const coins = [...this.coins()];
        const field = this.sortField();
        const dir = this.sortDir();

        return coins.sort((a, b) => {
            const aVal = (a as any)[field] ?? 0;
            const bVal = (b as any)[field] ?? 0;
            return dir === 'asc' ? aVal - bVal : bVal - aVal;
        });
    });

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

    onSort(sort: Sort) {
        if (!sort.active || sort.direction === '') {
            this.sortField.set('market_cap_rank');
            this.sortDir.set('asc');
            return;
        }
        this.sortField.set(sort.active);
        this.sortDir.set(sort.direction as 'asc' | 'desc');
    }
    goToDetail(coin: Coin) {
  this.router.navigate(['/coins', coin.id]);
}
}