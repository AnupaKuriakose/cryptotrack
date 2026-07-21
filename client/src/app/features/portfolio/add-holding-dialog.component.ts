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
  templateUrl: './add-holding-dialog.component.html',
  styleUrl: './add-holding-dialog.component.scss',
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
