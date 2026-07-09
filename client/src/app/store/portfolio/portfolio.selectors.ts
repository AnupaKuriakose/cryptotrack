import { createSelector } from '@ngrx/store';
import { portfolioFeature } from './portfolio.reducer';
import { selectCoins } from '../market/market.selectors';
import { PortfolioStats } from '../../models/portfolio.model';

export const {
  selectHoldings,
  selectLoading,
  selectSaving,
  selectError,
} = portfolioFeature;

// Enrich holdings with live prices + compute P&L
export const selectEnrichedHoldings = createSelector(
  selectHoldings,
  selectCoins,
  (holdings, coins) =>
    holdings.map((h) => {
      const live = coins.find((c) => c.id === h.coin_id);
      const currentPrice = live?.current_price ?? 0;
      const invested = Number(h.quantity) * Number(h.buy_price);
      const currentValue = Number(h.quantity) * currentPrice;
      const pnl = currentValue - invested;
      const pnlPercent = invested > 0 ? (pnl / invested) * 100 : 0;
      return {
        ...h,
        current_price: currentPrice,
        current_value: currentValue,
        invested,
        pnl,
        pnl_percent: pnlPercent,
      };
    })
);

// Portfolio summary stats — derived from enriched holdings
export const selectPortfolioStats = createSelector(
  selectEnrichedHoldings,
  (holdings): PortfolioStats => {
    const totalInvested = holdings.reduce((sum, h) => sum + (h.invested ?? 0), 0);
    const currentValue = holdings.reduce((sum, h) => sum + (h.current_value ?? 0), 0);
    const totalPnl = currentValue - totalInvested;
    const totalPnlPercent = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;
    return { totalInvested, currentValue, totalPnl, totalPnlPercent };
  }
);