import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { formatCurrency } from '../utils/mortgageCalculations';
import { trackChartInteraction } from '../utils/analytics';

export default function ChartsSection({ calculations }) {
  if (!calculations) return null;

  return (
    <div className="space-y-6">
      {/* Balance Over Time Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Mortgage Balance Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={calculations.chartData} onClick={() => trackChartInteraction('mortgage_balance_chart')}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" label={{ value: 'Year', position: 'insideBottom', offset: -5 }} />
            <YAxis label={{ value: 'Balance ($)', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Line type="monotone" dataKey="traditional" stroke="#ef4444" strokeWidth={2} name="Traditional" />
            <Line type="monotone" dataKey="extraPayment" stroke="#3b82f6" strokeWidth={2} name="Extra Principal" />
            <Line type="monotone" dataKey="accelerated" stroke="#10b981" strokeWidth={2} name="LOC Strategy" />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-600 mt-2 text-center">
          Shows remaining mortgage balance over time for each strategy.
        </p>
      </div>

      {/* Net Position Comparison */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Final Net Position Comparison</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={[
            { strategy: 'Traditional', value: -calculations.traditional.netInterest },
            { strategy: 'Extra Principal', value: -calculations.extraPayment.netInterest },
            { strategy: 'LOC Strategy', value: -calculations.accelerated.netInterest },
            { strategy: 'Invest & Pay', value: calculations.investment.netPosition },
            ...(calculations.rental ? [{ strategy: 'Rent & Invest', value: calculations.rental.comparisonValue }] : [])
          ]} onClick={() => trackChartInteraction('net_position_chart')}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="strategy" angle={-20} textAnchor="end" height={80} />
            <YAxis label={{ value: 'Net Position/Cost ($)', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Bar dataKey="value" fill="#8b5cf6" />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-600 mt-2 text-center">
          Positive values = money gained. Negative values = interest cost after tax savings.
        </p>
      </div>
    </div>
  );
}
