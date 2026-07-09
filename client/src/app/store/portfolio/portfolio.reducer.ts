import { createFeature, createReducer, on } from '@ngrx/store';
import { Holding } from '../../models/portfolio.model';
import { PortfolioActions } from './portfolio.actions';

export interface PortfolioState {
  holdings: Holding[];
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: PortfolioState = {
  holdings: [],
  loading: false,
  saving: false,
  error: null,
};

export const portfolioFeature = createFeature({
  name: 'portfolio',
  reducer: createReducer(
    initialState,
    on(PortfolioActions.loadHoldings, (state) => ({
      ...state, loading: true, error: null,
    })),
    on(PortfolioActions.loadHoldingsSuccess, (state, { holdings }) => ({
      ...state, holdings, loading: false,
    })),
    on(PortfolioActions.loadHoldingsFailure, (state, { error }) => ({
      ...state, loading: false, error,
    })),

    // Add
    on(PortfolioActions.addHolding, (state) => ({
      ...state, saving: true,
    })),
    on(PortfolioActions.addHoldingSuccess, (state, { holding }) => ({
      ...state,
      holdings: [holding, ...state.holdings],
      saving: false,
    })),
    on(PortfolioActions.addHoldingFailure, (state, { error }) => ({
      ...state, saving: false, error,
    })),

    // Update
    on(PortfolioActions.updateHoldingSuccess, (state, { holding }) => ({
      ...state,
      holdings: state.holdings.map((h) =>
        h.id === holding.id ? holding : h
      ),
      saving: false,
    })),

    // Delete — optimistic
    on(PortfolioActions.deleteHolding, (state, { id }) => ({
      ...state,
      holdings: state.holdings.filter((h) => h.id !== id),
    })),
  ),
});

export const portfolioReducer = portfolioFeature.reducer;