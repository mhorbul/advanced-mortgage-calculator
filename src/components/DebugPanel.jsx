import React, { useState } from 'react';
import { formatCurrency } from '../utils/mortgageCalculations';

export default function DebugPanel({ debugData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showFirst12Months, setShowFirst12Months] = useState(true);

  if (!debugData || debugData.length === 0) return null;

  const displayData = showFirst12Months 
    ? debugData.slice(0, 12) 
    : debugData.slice(-12);

  return (
    <div className="bg-gray-100 rounded-lg p-4 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-gray-700">LOC Strategy Debug Output</h4>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="debugPeriod"
              checked={showFirst12Months}
              onChange={() => setShowFirst12Months(true)}
              className="h-4 w-4 text-blue-600"
            />
            <span className="text-sm text-gray-600">First 12 months</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="debugPeriod"
              checked={!showFirst12Months}
              onChange={() => setShowFirst12Months(false)}
              className="h-4 w-4 text-blue-600"
            />
            <span className="text-sm text-gray-600">Last 12 months</span>
          </label>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            {isOpen ? 'Hide' : 'Show'} Details
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mortgage Balance</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LOC Balance</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mortgage Interest</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LOC Interest</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Principal Payment</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LOC Payment</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leftover</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {displayData.map((month, index) => (
                <tr key={month.month} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-3 py-2 text-sm text-gray-900">{month.month}</td>
                  <td className="px-3 py-2 text-sm text-gray-900">{formatCurrency(month.mortgageBalance)}</td>
                  <td className="px-3 py-2 text-sm text-gray-900">{formatCurrency(month.locBalance)}</td>
                  <td className="px-3 py-2 text-sm text-red-600">{formatCurrency(month.mortgageInterest)}</td>
                  <td className="px-3 py-2 text-sm text-red-600">{formatCurrency(month.locInterest)}</td>
                  <td className="px-3 py-2 text-sm text-green-600">{formatCurrency(month.principalPayment)}</td>
                  <td className="px-3 py-2 text-sm text-green-600">{formatCurrency(month.locPayment)}</td>
                  <td className="px-3 py-2 text-sm text-blue-600">{formatCurrency(month.leftover)}</td>
                  <td className="px-3 py-2 text-sm font-semibold text-gray-900">{formatCurrency(month.totalBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Total months calculated:</strong> {debugData.length}</p>
        <p><strong>Final mortgage balance:</strong> {formatCurrency(debugData[debugData.length - 1]?.mortgageBalance || 0)}</p>
        <p><strong>Final LOC balance:</strong> {formatCurrency(debugData[debugData.length - 1]?.locBalance || 0)}</p>
        <p><strong>Final total balance:</strong> {formatCurrency(debugData[debugData.length - 1]?.totalBalance || 0)}</p>
      </div>
    </div>
  );
}
