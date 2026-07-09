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
   templateUrl: './watchlist.component.html',
   styleUrls: ['./watchlist.component.scss']
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