import React from 'react';
import { formatCurrency } from '../utils/mortgageCalculations';

export default function BestStrategyBanner({ bestStrategy }) {
  if (!bestStrategy) return null;

  return (
    <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-md p-6 text-white">
      <h2 className="text-2xl font-bold mb-2">Best Strategy: {bestStrategy.name}</h2>
      <div className="text-lg">
        {bestStrategy.netWorth >= 0 ? 'Net Position' : 'Net Cost'}: <span className="font-bold text-3xl">{formatCurrency(bestStrategy.netWorth >= 0 ? bestStrategy.netWorth : Math.abs(bestStrategy.netWorth))}</span>
      </div>
      <div className="text-sm mt-2 text-green-100">
        {bestStrategy.name === 'Invest & Pay'
          ? 'Investment gains exceed interest costs!'
          : 'Minimizes total interest paid'}
      </div>
    </div>
  );
}
