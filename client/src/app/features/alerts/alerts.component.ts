import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  inject,
  effect,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule, DatePipe, DecimalPipe, UpperCasePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AlertsFacade } from '../../store/alerts/alerts.facade';
import { MarketFacade } from '../../store/market/market.facade';
import { CreateAlertDialogComponent } from './create-alert-dialog.component';
import { PriceAlert } from '../../models/alert.model';

@Component({
  selector: 'app-alerts',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    DatePipe,
    DecimalPipe,
    UpperCasePipe,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatDialogModule,
    MatChipsModule,
  ],
    templateUrl: './alerts.component.html',
    styleUrl: './alerts.component.scss',
   
})
export class AlertsComponent implements OnInit {
  private facade = inject(AlertsFacade);
  private marketFacade = inject(MarketFacade);
  private dialog = inject(MatDialog);
  private snackbar = inject(MatSnackBar);

  alerts = toSignal(this.facade.alerts$, { initialValue: [] as any });
  loading = toSignal(this.facade.loading$, { initialValue: false });
  activeCount = toSignal(this.facade.activeAlertsCount$, { initialValue: 0 });
  coins = toSignal(this.marketFacade.coins$, { initialValue: [] });

  displayedColumns = ['coin', 'condition', 'target', 'current', 'status', 'created', 'delete'];

  // ⭐ The key Sprint 5 feature — signal-driven alert checker
  // Runs every time the coins signal updates (every 60s)
  private alertChecker = effect(() => {
    const currentCoins = this.coins();
    const activeAlerts = this.alerts().filter((a: { status: string; }) => a.status === 'active');

    if (!currentCoins.length || !activeAlerts.length) return;

    activeAlerts.forEach((alert: { coin_id: string; condition: string; target_price: number; id: number; }) => {
      const coin = currentCoins.find(c => c.id === alert.coin_id);
      if (!coin) return;

      const triggered =
        (alert.condition === 'above' && coin.current_price >= alert.target_price) ||
        (alert.condition === 'below' && coin.current_price <= alert.target_price);

      if (triggered) {
        // Fire snackbar notification
        this.snackbar.open(
          `🔔 ${coin.name} is ${alert.condition} $${alert.target_price.toLocaleString()}! Current: $${coin.current_price.toLocaleString()}`,
          'VIEW',
          {
            duration: 8000,
            panelClass: 'snack-alert',
            verticalPosition: 'top',
          }
        );
        // Mark as triggered in DB
        this.facade.triggerAlert(alert.id);
      }
    });
  });

  ngOnInit() {
    this.facade.loadAlerts();
    this.marketFacade.loadCoins();
  }

  openCreateDialog() {
    const ref = this.dialog.open(CreateAlertDialogComponent, {
      width: '400px',
    });

    ref.afterClosed().subscribe((result) => {
      if (result) this.facade.createAlert(result);
    });
  }

  delete(alert: PriceAlert) {
    this.facade.deleteAlert(alert.id);
  }

  getColor(symbol: string): string {
    const colors: Record<string, string> = {
      btc: '#F7931A', eth: '#627EEA', sol: '#9945FF',
      bnb: '#F3BA2F', ada: '#0033AD', xrp: '#346AA9',
      dot: '#E6007A', avax: '#E84142', matic: '#8247E5',
    };
    return colors[symbol.toLowerCase()] ?? '#3F51B5';
  }
}