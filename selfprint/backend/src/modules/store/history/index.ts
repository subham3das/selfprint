import { Router } from 'express';
import { historyController } from './history.controller';
import { authenticate } from '../../../middlewares/auth.middleware';

const historyRouter = Router();

// 1. Transaction Table (Paginated, filtered, searchable)
historyRouter.get('/transactions', authenticate, historyController.getTransactions);

// 2. Financial Summary Overview
historyRouter.get('/summary', authenticate, historyController.getFinancialSummary);

// 3. Income Chart Data
historyRouter.get('/income-chart', authenticate, historyController.getIncomeChart);

// 4. Payment Methods Breakdown
historyRouter.get('/payment-breakdown', authenticate, historyController.getPaymentBreakdown);

// 5. Export Transactions
historyRouter.get('/export', authenticate, historyController.exportTransactions);

export default historyRouter;
export { historyRouter };
export * from './history.types';
export * from './history.service';
export * from './history.repository';
export * from './history.controller';
