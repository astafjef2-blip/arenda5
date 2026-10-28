import React from 'react';
import { Booking, Payment } from '../types';
import { formatDate, formatCurrency, getDaysBetween, isToday } from '../utils/storage';

interface Props {
  bookings: Booking[];
  payments: Payment[];
}

export default function HomeScreen({ bookings, payments }: Props) {
  const today = new Date().toISOString().split('T')[0];
  
  const activeBookings = bookings.filter(b => 
    b.status === 'checked-in' && b.checkIn <= today && b.checkOut >= today
  );
  
  const upcomingCheckins = bookings.filter(b => 
    (b.status === 'confirmed' || b.status === 'checked-in') && b.checkIn > today
  ).sort((a, b) => a.checkIn.localeCompare(b.checkIn)).slice(0, 3);
  
  const upcomingCheckouts = bookings.filter(b => 
    (b.status === 'checked-in') && b.checkOut >= today
  ).sort((a, b) => a.checkOut.localeCompare(b.checkOut)).slice(0, 3);

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalDebt = bookings.reduce((sum, b) => sum + (b.totalAmount - b.paidAmount), 0);
  
  const thisMonthPayments = payments.filter(p => {
    const d = new Date(p.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthRevenue = thisMonthPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="pb-4">
      {/* Header Stats */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 px-4 pt-6 pb-8 rounded-b-3xl">
        <h1 className="text-white text-xl font-bold mb-4">📋 Панель управления</h1>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/20 backdrop-blur rounded-xl p-3">
            <p className="text-white/70 text-xs">Выручка за месяц</p>
            <p className="text-white font-bold text-lg">{formatCurrency(monthRevenue)}</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl p-3">
            <p className="text-white/70 text-xs">Общая выручка</p>
            <p className="text-white font-bold text-lg">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl p-3">
            <p className="text-white/70 text-xs">Задолженность</p>
            <p className="text-yellow-200 font-bold text-lg">{formatCurrency(totalDebt > 0 ? totalDebt : 0)}</p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-xl p-3">
            <p className="text-white/70 text-xs">Сейчас проживает</p>
            <p className="text-white font-bold text-lg">{activeBookings.length} чел.</p>
          </div>
        </div>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {/* Active Guests */}
        {activeBookings.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Сейчас проживают
            </h2>
            <div className="space-y-2">
              {activeBookings.map(booking => (
                <div key={booking.id} className="bg-green-50 border border-green-200 rounded-xl p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">{booking.guestName}</p>
                      <p className="text-sm text-gray-500">
                        Заезд: {formatDate(booking.checkIn)} → Выезд: {formatDate(booking.checkOut)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {getDaysBetween(booking.checkIn, booking.checkOut)} ночей
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-700">
                        {formatCurrency(booking.paidAmount)} / {formatCurrency(booking.totalAmount)}
                      </p>
                      {booking.paidAmount < booking.totalAmount && (
                        <p className="text-xs text-red-500">Долг: {formatCurrency(booking.totalAmount - booking.paidAmount)}</p>
                      )}
                      {booking.paidAmount >= booking.totalAmount && (
                        <p className="text-xs text-green-600">✓ Оплачено</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Check-ins */}
        {upcomingCheckins.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
              📅 Ожидаемые заезды
            </h2>
            <div className="space-y-2">
              {upcomingCheckins.map(booking => (
                <div key={booking.id} className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">{booking.guestName}</p>
                      <p className="text-sm text-gray-500">
                        Заезд: {formatDate(booking.checkIn)}
                      </p>
                      {isToday(booking.checkIn) && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">Сегодня!</span>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-700">
                        {formatCurrency(booking.totalAmount)}
                      </p>
                      <p className="text-xs text-gray-500">{booking.phone}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Check-outs */}
        {upcomingCheckouts.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
              🚪 Ожидаемые выезды
            </h2>
            <div className="space-y-2">
              {upcomingCheckouts.map(booking => (
                <div key={booking.id} className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">{booking.guestName}</p>
                      <p className="text-sm text-gray-500">
                        Выезд: {formatDate(booking.checkOut)}
                      </p>
                      {isToday(booking.checkOut) && (
                        <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">Сегодня!</span>
                      )}
                    </div>
                    <div className="text-right">
                      {booking.paidAmount < booking.totalAmount && (
                        <p className="text-xs text-red-500">Долг: {formatCurrency(booking.totalAmount - booking.paidAmount)}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {bookings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-5xl mb-4">🏠</p>
            <p className="text-gray-500 text-lg">Нет бронирований</p>
            <p className="text-gray-400 text-sm mt-1">Добавьте первое бронирование</p>
          </div>
        )}
      </div>
    </div>
  );
}
