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
 templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.scss',
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