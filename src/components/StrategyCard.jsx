import React from 'react';
import { formatCurrency } from '../utils/mortgageCalculations';
import DebugPanel from './DebugPanel';

export default function StrategyCard({
  title,
  strategy,
  enableRentalComparison,
  rentalData,
  mortgagePayment
}) {
  if (!strategy) return null;

  const formatMonths = (months) => {
    const years = Math.floor(months / 12);
    const remainingMonths = Math.round(months % 12);
    if (remainingMonths === 0) {
      return `${years} years`;
    }
    return `${years} years ${remainingMonths} months`;
  };

  const renderRentalSection = () => {
    if (!enableRentalComparison || !rentalData) return null;

    return (
      <>
        <div className="flex justify-between">
          <span className="text-gray-600">Home Value:</span>
          <span className="font-semibold text-green-600">{formatCurrency(strategy.finalHomeValue)}</span>
        </div>

        {/* Rental Subsection */}
        <div className="pt-2 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Rental</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Investment Gain:</span>
              <span className={`font-semibold ${rentalData.investmentGain >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {formatCurrency(rentalData.investmentGain)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Rent Cost:</span>
              <span className="font-semibold text-red-600">{formatCurrency(rentalData.totalRent)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-gray-100">
              <span className="text-gray-700 font-medium">Total:</span>
              <span className={`font-bold ${rentalData.total >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {formatCurrency(rentalData.total)}
              </span>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>

      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Monthly Payment:</span>
          <span className="font-semibold text-red-600">{formatCurrency(mortgagePayment)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Payoff Time:</span>
          <span className="font-semibold">{formatMonths(strategy.months)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Mortgage Interest:</span>
          <span className="font-semibold text-red-600">{formatCurrency(strategy.totalInterest)}</span>
        </div>

        {strategy.totalLocInterest !== undefined && (
          <div className="flex justify-between">
            <span className="text-gray-600">LOC Interest:</span>
            <span className="font-semibold text-red-600">{formatCurrency(strategy.totalLocInterest)}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-gray-600">Tax Savings:</span>
          <span className="font-semibold text-green-600">{formatCurrency(strategy.totalTaxSavings)}</span>
        </div>

        {enableRentalComparison && (
          <div className="flex justify-between">
            <span className="text-gray-600">Total Maintenance:</span>
            <span className="font-semibold text-red-600">{formatCurrency(strategy.totalMaintenance)}</span>
          </div>
        )}

        <div className="flex justify-between pt-2 border-t border-gray-200">
          <span className="text-gray-700 font-medium">Net Cost:</span>
          <span className="font-bold text-red-700">{formatCurrency(strategy.netInterest)}</span>
        </div>

        {renderRentalSection()}
      </div>

      {/* Debug Panel for LOC Strategy */}
      {title === 'LOC Strategy' && strategy.debugData && (
        <DebugPanel debugData={strategy.debugData} />
      )}
    </div>
  );
}
