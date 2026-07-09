import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { PortfolioActions } from './portfolio.actions';
import {
  selectEnrichedHoldings,
  selectPortfolioStats,
  selectLoading,
  selectSaving,
} from './portfolio.selectors';
import { HoldingFormData } from '../../models/portfolio.model';

@Injectable({ providedIn: 'root' })
export class PortfolioFacade {
  private store = inject(Store);

  holdings$ = this.store.select(selectEnrichedHoldings);
  stats$ = this.store.select(selectPortfolioStats);
  loading$ = this.store.select(selectLoading);
  saving$ = this.store.select(selectSaving);

  loadHoldings() {
    this.store.dispatch(PortfolioActions.loadHoldings());
  }

  addHolding(data: HoldingFormData) {
    this.store.dispatch(PortfolioActions.addHolding({ data }));
  }

  updateHolding(id: number, data: Partial<HoldingFormData>) {
    this.store.dispatch(PortfolioActions.updateHolding({ id, data }));
  }

  deleteHolding(id: number) {
    this.store.dispatch(PortfolioActions.deleteHolding({ id }));
  }
}