import {
  Component,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { selectCoins } from '../../store/market/market.selectors';
import { Coin } from '../../models/coin.model';
import { Holding } from '../../models/portfolio.model';

export interface DialogData {
  mode: 'add' | 'edit';
  holding?: Holding;
  coins: Coin[];
}

@Component({
  selector: 'app-add-holding-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>
      {{ data.mode === 'add' ? 'Add Holding' : 'Edit Holding' }}
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="form">

        <!-- Coin search — only in add mode -->
        <ng-container *ngIf="data.mode === 'add'">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Coin</mat-label>
            <mat-icon matPrefix>search</mat-icon>
            <input
              matInput
              formControlName="coinSearch"
              [matAutocomplete]="auto"
              placeholder="Search Bitcoin, ETH..."
            />
            <mat-autocomplete
              #auto="matAutocomplete"
              [displayWith]="displayCoin"
              (optionSelected)="onCoinSelected($event.option.value)"
            >
              <mat-option *ngFor="let coin of filteredCoins()" [value]="coin">
                <div class="coin-option">
                  <img [src]="coin.image" width="20" height="20" style="border-radius:50%" />
                  <span>{{ coin.name }}</span>
                  <span class="sym">{{ coin.symbol | uppercase }}</span>
                </div>
              </mat-option>
            </mat-autocomplete>
            <mat-error *ngIf="form.get('coinSearch')?.hasError('required') && form.get('coinSearch')?.touched">
              Please select a coin
            </mat-error>
          </mat-form-field>

          <!-- Selected coin preview -->
          <div class="selected-coin" *ngIf="selectedCoin()">
            <img [src]="selectedCoin()!.image" width="24" height="24" style="border-radius:50%" />
            <span>{{ selectedCoin()!.name }}</span>
            <span class="current-price">
              Current: \${{ selectedCoin()?.current_price | number:'1.2-6' }}
            </span>
          </div>
        </ng-container>

        <div class="selected-coin" *ngIf="data.mode === 'edit'">
          <img [src]="data.holding!.coin_image" width="24" height="24" style="border-radius:50%" />
          <span>{{ data.holding!.coin_name }}</span>
        </div>

        <!-- Quantity -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Quantity</mat-label>
          <input matInput type="number" formControlName="quantity" step="0.00000001" />
          <mat-error *ngIf="form.get('quantity')?.hasError('required') && form.get('quantity')?.touched">
            Quantity is required
          </mat-error>
          <mat-error *ngIf="form.get('quantity')?.hasError('min')">
            Quantity must be greater than 0
          </mat-error>
        </mat-form-field>

        <!-- Buy price -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Buy price (USD)</mat-label>
          <span matPrefix>$&nbsp;</span>
          <input matInput type="number" formControlName="buyPrice" step="0.01" />
          <mat-error *ngIf="form.get('buyPrice')?.hasError('required') && form.get('buyPrice')?.touched">
            Buy price is required
          </mat-error>
          <mat-error *ngIf="form.get('buyPrice')?.hasError('min')">
            Buy price must be greater than 0
          </mat-error>
        </mat-form-field>

        <!-- Buy date -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Buy date</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="buyDate" />
          <mat-datepicker-toggle matIconSuffix [for]="picker" />
          <mat-datepicker #picker />
          <mat-error *ngIf="form.get('buyDate')?.hasError('required') && form.get('buyDate')?.touched">
            Buy date is required
          </mat-error>
        </mat-form-field>

        <!-- Total invested preview -->
        <div class="total-preview" *ngIf="totalInvested() > 0">
          Total invested: <strong>\${{ totalInvested() | number:'1.2-2' }}</strong>
        </div>

      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button
        mat-flat-button
        color="primary"
        (click)="submit()"
        [disabled]="form.invalid"
      >
        {{ data.mode === 'add' ? 'Add Holding' : 'Save Changes' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form { display: flex; flex-direction: column; gap: 4px; min-width: 340px; padding-top: 8px; }
    .full-width { width: 100%; }
    .coin-option { display: flex; align-items: center; gap: 8px; }
    .sym { color: #999; font-size: 11px; }
    .selected-coin {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 12px; background: #f5f5f5;
      border-radius: 6px; margin-bottom: 8px; font-size: 13px;
    }
    .current-price { color: #3F51B5; font-size: 12px; margin-left: auto; }
    .total-preview {
      padding: 8px 12px; background: #e8eaf6;
      border-radius: 6px; font-size: 13px; color: #3F51B5;
    }
  `],
})
export class AddHoldingDialogComponent {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  dialogRef = inject(MatDialogRef<AddHoldingDialogComponent>);
  data: DialogData = inject(MAT_DIALOG_DATA);

  coins = toSignal(this.store.select(selectCoins), { initialValue: [] as Coin[] });
  selectedCoin = signal<Coin | null>(null);

  form = this.fb.group({
    coinSearch: [
      '',
      this.data.mode === 'add' ? Validators.required : [],
    ],
    quantity: [
      this.data.holding?.quantity ?? null,
      [Validators.required, Validators.min(0.00000001)],
    ],
    buyPrice: [
      this.data.holding?.buy_price ?? null,
      [Validators.required, Validators.min(0.01)],
    ],
    buyDate: [
      this.data.holding?.buy_date
        ? new Date(this.data.holding.buy_date)
        : new Date(),
      Validators.required,
    ],
  });

  // Filter coins based on search input
  filteredCoins = computed(() => {
    const search = this.form.get('coinSearch')?.value?.toLowerCase() ?? '';
    if (!search) return this.coins().slice(0, 20);
    return this.coins()
      .filter(
        (c) =>
          c.name.toLowerCase().includes(search) ||
          c.symbol.toLowerCase().includes(search)
      )
      .slice(0, 10);
  });

  // Live total invested preview
  totalInvested = computed(() => {
    const qty = Number(this.form.get('quantity')?.value ?? 0);
    const price = Number(this.form.get('buyPrice')?.value ?? 0);
    return qty * price;
  });

  displayCoin(coin: Coin | null): string {
    return coin ? `${coin.name} (${coin.symbol.toUpperCase()})` : '';
  }

  onCoinSelected(coin: Coin) {
    this.selectedCoin.set(coin);
    // Pre-fill buy price with current price
    this.form.patchValue({ buyPrice: coin.current_price });
  }

  submit() {
    if (this.form.invalid) return;

    const qty = Number(this.form.get('quantity')!.value);
    const buyPrice = Number(this.form.get('buyPrice')!.value);
    const buyDate = new Date(this.form.get('buyDate')!.value!)
      .toISOString()
      .split('T')[0];

    if (this.data.mode === 'add') {
      const coin = this.selectedCoin();
      if (!coin) return;
      this.dialogRef.close({
        coin_id: coin.id,
        coin_name: coin.name,
        coin_symbol: coin.symbol,
        coin_image: coin.image,
        quantity: qty,
        buy_price: buyPrice,
        buy_date: buyDate,
      });
    } else {
      this.dialogRef.close({
        quantity: qty,
        buy_price: buyPrice,
        buy_date: buyDate,
      });
    }
  }
}
