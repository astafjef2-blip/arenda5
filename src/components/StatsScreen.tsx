import React, { useState } from 'react';
import { Booking, Payment } from '../types';
import { formatCurrency, getMonthName } from '../utils/storage';

interface Props {
  bookings: Booking[];
  payments: Payment[];
}

export default function StatsScreen({ bookings, payments }: Props) {
  const [year, setYear] = useState(new Date().getFullYear());

  // Calculate monthly stats
  const monthlyStats = Array.from({ length: 12 }, (_, month) => {
    const monthPayments = payments.filter(p => {
      const d = new Date(p.date);
      return d.getMonth() === month && d.getFullYear() === year;
    });
    const monthBookings = bookings.filter(b => {
      const d = new Date(b.checkIn);
      return d.getMonth() === month && d.getFullYear() === year;
    });
    
    const revenue = monthPayments.reduce((sum, p) => sum + p.amount, 0);
    const bookingsCount = monthBookings.length;
    const nights = monthBookings.reduce((sum, b) => {
      const checkIn = new Date(b.checkIn);
      const checkOut = new Date(b.checkOut);
      if (checkIn.getMonth() === month && checkIn.getFullYear() === year) {
        const nightsInMonth = Math.ceil((Math.min(checkOut.getTime(), new Date(year, month + 1, 0).getTime()) - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        return sum + Math.max(0, nightsInMonth);
      }
      return sum;
    }, 0);

    return { month, revenue, bookingsCount, nights };
  });

  const totalYearRevenue = monthlyStats.reduce((sum, s) => sum + s.revenue, 0);
  const totalYearBookings = monthlyStats.reduce((sum, s) => sum + s.bookingsCount, 0);
  const totalYearNights = monthlyStats.reduce((sum, s) => sum + s.nights, 0);
  const maxRevenue = Math.max(...monthlyStats.map(s => s.revenue), 1);

  // Payment methods breakdown
  const methodStats = {
    cash: payments.filter(p => p.method === 'cash').reduce((sum, p) => sum + p.amount, 0),
    card: payments.filter(p => p.method === 'card').reduce((sum, p) => sum + p.amount, 0),
    transfer: payments.filter(p => p.method === 'transfer').reduce((sum, p) => sum + p.amount, 0),
  };
  const totalAll = methodStats.cash + methodStats.card + methodStats.transfer || 1;

  // Average stats
  const avgPerBooking = bookings.length > 0 ? bookings.reduce((sum, b) => sum + b.totalAmount, 0) / bookings.length : 0;
  const avgPerNight = totalYearNights > 0 ? totalYearRevenue / totalYearNights : 0;
  const occupancyRate = (() => {
    const today = new Date();
    const daysInYear = (today.getFullYear() === year) 
      ? Math.floor((today.getTime() - new Date(year, 0, 1).getTime()) / (1000 * 60 * 60 * 24))
      : 365;
    return daysInYear > 0 ? Math.min(100, Math.round((totalYearNights / daysInYear) * 100)) : 0;
  })();

  return (
    <div className="pb-4">
      <div className="px-4 pt-4">
        <h2 className="text-xl font-bold text-gray-800">Статистика</h2>
        
        {/* Year Selector */}
        <div className="flex items-center justify-center gap-4 mt-3">
          <button 
            onClick={() => setYear(year - 1)} 
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"
          >
            ←
          </button>
          <span className="text-lg font-bold text-gray-800">{year}</span>
          <button 
            onClick={() => setYear(year + 1)} 
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"
          >
            →
          </button>
        </div>
      </div>

      {/* Year Summary */}
      <div className="px-4 mt-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-indigo-50 rounded-xl p-3 text-center">
            <p className="text-indigo-600 font-bold text-lg">{formatCurrency(totalYearRevenue)}</p>
            <p className="text-xs text-indigo-400">Доход</p>
          </div>
          <div className="bg-green-50 rounded-xl p-3 text-center">
            <p className="text-green-600 font-bold text-lg">{totalYearBookings}</p>
            <p className="text-xs text-green-400">Бронирований</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-3 text-center">
            <p className="text-purple-600 font-bold text-lg">{totalYearNights}</p>
            <p className="text-xs text-purple-400">Ночей</p>
          </div>
        </div>
      </div>

      {/* Monthly Chart */}
      <div className="px-4 mt-4">
        <h3 className="text-sm font-semibold text-gray-600 mb-3">Помесячный доход</h3>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-end justify-between gap-1 h-32">
            {monthlyStats.map((stat, i) => (
              <div key={i} className="flex flex-col items-center flex-1">
                <div className="w-full flex flex-col items-center justify-end h-24">
                  {stat.revenue > 0 && (
                    <p className="text-[8px] text-gray-500 mb-0.5">
                      {(stat.revenue / 1000).toFixed(0)}к
                    </p>
                  )}
                  <div
                    className="w-full max-w-[20px] bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-sm transition-all"
                    style={{ height: `${(stat.revenue / maxRevenue) * 100}%`, minHeight: stat.revenue > 0 ? '4px' : '0px' }}
                  />
                </div>
                <p className="text-[10px] text-gray-500 mt-1">{getMonthName(i)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Average Stats */}
      <div className="px-4 mt-4">
        <h3 className="text-sm font-semibold text-gray-600 mb-3">Средние показатели</h3>
        <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
          <div className="flex justify-between items-center p-3">
            <span className="text-sm text-gray-600">Средний чек</span>
            <span className="font-semibold text-gray-800">{formatCurrency(avgPerBooking)}</span>
          </div>
          <div className="flex justify-between items-center p-3">
            <span className="text-sm text-gray-600">Доход за ночь</span>
            <span className="font-semibold text-gray-800">{formatCurrency(avgPerNight)}</span>
          </div>
          <div className="flex justify-between items-center p-3">
            <span className="text-sm text-gray-600">Загрузка</span>
            <span className="font-semibold text-gray-800">{occupancyRate}%</span>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="px-4 mt-4">
        <h3 className="text-sm font-semibold text-gray-600 mb-3">Способы оплаты</h3>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">💵 Наличные</span>
                <span className="font-medium">{formatCurrency(methodStats.cash)}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(methodStats.cash / totalAll) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">💳 Карта</span>
                <span className="font-medium">{formatCurrency(methodStats.card)}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(methodStats.card / totalAll) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">🏦 Перевод</span>
                <span className="font-medium">{formatCurrency(methodStats.transfer)}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${(methodStats.transfer / totalAll) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
