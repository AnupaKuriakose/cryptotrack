import {
  Component,
  inject,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { selectCoins } from '../../store/market/market.selectors';
import { Coin } from '../../models/coin.model';
import { signal } from '@angular/core';

@Component({
  selector: 'app-create-alert-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatRadioModule,
    MatAutocompleteModule,
    MatIconModule,
  ],
  templateUrl: './create-alert-dialog.component.html',
  styleUrl: './create-alert-dialog.component.scss',
  
})
export class CreateAlertDialogComponent {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  dialogRef = inject(MatDialogRef<CreateAlertDialogComponent>);

  coins = toSignal(this.store.select(selectCoins), { initialValue: [] as Coin[] });
  selectedCoin = signal<Coin | null>(null);

  form = this.fb.group({
    coinSearch: ['', Validators.required],
    condition: ['above', Validators.required],
    targetPrice: [null, [Validators.required, Validators.min(0.01)]],
  });

  filteredCoins = computed(() => {
    const search = this.form.get('coinSearch')?.value?.toLowerCase() ?? '';
    if (!search) return this.coins().slice(0, 20);
    return this.coins()
      .filter(c =>
        c.name.toLowerCase().includes(search) ||
        c.symbol.toLowerCase().includes(search)
      )
      .slice(0, 10);
  });

  displayCoin(coin: Coin): string {
    return coin ? `${coin.name} (${coin.symbol.toUpperCase()})` : '';
  }

  onCoinSelected(coin: Coin) {
    this.selectedCoin.set(coin);
  }

  submit() {
    if (this.form.invalid || !this.selectedCoin()) return;
    const coin = this.selectedCoin()!;
    this.dialogRef.close({
      coin_id: coin.id,
      coin_name: coin.name,
      coin_symbol: coin.symbol,
      condition: this.form.get('condition')!.value,
      target_price: Number(this.form.get('targetPrice')!.value),
    });
  }
}