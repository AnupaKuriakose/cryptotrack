import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Holding, HoldingFormData } from '../../models/portfolio.model';

export const PortfolioActions = createActionGroup({
  source: 'Portfolio',
  events: {
    // Load
    'Load Holdings': emptyProps(),
    'Load Holdings Success': props<{ holdings: Holding[] }>(),
    'Load Holdings Failure': props<{ error: string }>(),

    // Add
    'Add Holding': props<{ data: HoldingFormData }>(),
    'Add Holding Success': props<{ holding: Holding }>(),
    'Add Holding Failure': props<{ error: string }>(),

    // Update
    'Update Holding': props<{ id: number; data: Partial<HoldingFormData> }>(),
    'Update Holding Success': props<{ holding: Holding }>(),
    'Update Holding Failure': props<{ error: string }>(),

    // Delete
    'Delete Holding': props<{ id: number }>(),
    'Delete Holding Success': props<{ id: number }>(),
    'Delete Holding Failure': props<{ error: string }>(),
  },
});