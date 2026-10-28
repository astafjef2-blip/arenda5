import React, { useState } from 'react';
import { Booking, Payment } from '../types';
import { formatDate, formatCurrency, generateId } from '../utils/storage';

interface Props {
  bookings: Booking[];
  payments: Payment[];
  onSaveBookings: (bookings: Booking[]) => void;
  onSavePayments: (payments: Payment[]) => void;
}

export default function PaymentsScreen({ bookings, payments, onSaveBookings, onSavePayments }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    bookingId: '',
    amount: '',
    method: 'cash' as Payment['method'],
    date: new Date().toISOString().split('T')[0],
    note: '',
  });

  const activeBookings = bookings.filter(b => b.status !== 'cancelled');

  const resetForm = () => {
    setForm({ bookingId: '', amount: '', method: 'cash', date: new Date().toISOString().split('T')[0], note: '' });
    setShowForm(false);
  };

  const handleSave = () => {
    if (!form.bookingId || !form.amount) return;
    
    const newPayment: Payment = {
      id: generateId(),
      bookingId: form.bookingId,
      amount: Number(form.amount),
      method: form.method,
      date: form.date,
      note: form.note,
    };
    
    onSavePayments([...payments, newPayment]);
    
    // Update booking paid amount
    const updatedBookings = bookings.map(b => {
      if (b.id === form.bookingId) {
        const totalPaid = b.paidAmount + Number(form.amount);
        return { ...b, paidAmount: totalPaid };
      }
      return b;
    });
    onSaveBookings(updatedBookings);
    
    resetForm();
  };

  const handleDeletePayment = (paymentId: string) => {
    if (!confirm('Удалить запись об оплате?')) return;
    
    const payment = payments.find(p => p.id === paymentId);
    if (payment) {
      const updatedBookings = bookings.map(b => {
        if (b.id === payment.bookingId) {
          return { ...b, paidAmount: Math.max(0, b.paidAmount - payment.amount) };
        }
        return b;
      });
      onSaveBookings(updatedBookings);
    }
    
    onSavePayments(payments.filter(p => p.id !== paymentId));
  };

  const getBookingName = (bookingId: string): string => {
    const booking = bookings.find(b => b.id === bookingId);
    return booking ? booking.guestName : 'Неизвестно';
  };

  const getMethodIcon = (method: Payment['method']) => {
    switch (method) {
      case 'cash': return '💵';
      case 'card': return '💳';
      case 'transfer': return '🏦';
    }
  };

  const getMethodLabel = (method: Payment['method']) => {
    switch (method) {
      case 'cash': return 'Наличные';
      case 'card': return 'Карта';
      case 'transfer': return 'Перевод';
    }
  };

  const sortedPayments = [...payments].sort((a, b) => b.date.localeCompare(a.date));
  const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);

  if (showForm) {
    return (
      <div className="px-4 pt-4 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Новая оплата</h2>
          <button onClick={resetForm} className="text-gray-500 text-2xl">&times;</button>
        </div>
        
        {activeBookings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-4xl mb-2">📭</p>
            <p className="text-gray-500">Нет активных бронирований</p>
            <p className="text-gray-400 text-sm mt-1">Сначала создайте бронирование</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Бронирование *</label>
              <select
                value={form.bookingId}
                onChange={e => setForm({...form, bookingId: e.target.value})}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              >
                <option value="">Выберите гостя</option>
                {activeBookings.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.guestName} — Долг: {formatCurrency(b.totalAmount - b.paidAmount)}
                  </option>
                ))}
              </select>
            </div>
            
            {form.bookingId && (
              <div className="bg-gray-50 rounded-xl p-3">
                {(() => {
                  const booking = bookings.find(b => b.id === form.bookingId);
                  if (!booking) return null;
                  return (
                    <div className="text-sm">
                      <p className="text-gray-600">Стоимость: <span className="font-medium">{formatCurrency(booking.totalAmount)}</span></p>
                      <p className="text-gray-600">Оплачено: <span className="font-medium text-green-600">{formatCurrency(booking.paidAmount)}</span></p>
                      <p className="text-gray-600">К оплате: <span className="font-medium text-red-600">{formatCurrency(booking.totalAmount - booking.paidAmount)}</span></p>
                    </div>
                  );
                })()}
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Сумма (₽) *</label>
              <input
                type="number"
                value={form.amount}
                onChange={e => setForm({...form, amount: e.target.value})}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="5000"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Способ оплаты</label>
              <div className="grid grid-cols-3 gap-2">
                {(['cash', 'card', 'transfer'] as const).map(method => (
                  <button
                    key={method}
                    onClick={() => setForm({...form, method})}
                    className={`py-2 rounded-xl text-sm font-medium border transition-colors ${
                      form.method === method
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                        : 'bg-white border-gray-200 text-gray-600'
                    }`}
                  >
                    {getMethodIcon(method)} {getMethodLabel(method)}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Дата</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm({...form, date: e.target.value})}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Заметка</label>
              <input
                type="text"
                value={form.note}
                onChange={e => setForm({...form, note: e.target.value})}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="Комментарий к оплате"
              />
            </div>
            
            <button
              onClick={handleSave}
              disabled={!form.bookingId || !form.amount}
              className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed active:bg-indigo-700 transition-colors"
            >
              Записать оплату
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="pb-4">
      <div className="px-4 pt-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Платежи</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-lg active:bg-indigo-700"
        >
          +
        </button>
      </div>

      {/* Summary */}
      <div className="px-4 mt-3">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 text-white">
          <p className="text-white/80 text-sm">Всего получено</p>
          <p className="text-2xl font-bold">{formatCurrency(totalPayments)}</p>
          <p className="text-white/70 text-xs mt-1">{payments.length} операций</p>
        </div>
      </div>

      {/* Payments List */}
      <div className="px-4 mt-4 space-y-2">
        {sortedPayments.length === 0 && (
          <div className="text-center py-8">
            <p className="text-4xl mb-2">💰</p>
            <p className="text-gray-500">Нет записей об оплатах</p>
          </div>
        )}
        {sortedPayments.map(payment => (
          <div key={payment.id} className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getMethodIcon(payment.method)}</span>
              <div>
                <p className="font-semibold text-gray-800">{formatCurrency(payment.amount)}</p>
                <p className="text-xs text-gray-500">
                  {getBookingName(payment.bookingId)} • {formatDate(payment.date)}
                </p>
                <p className="text-xs text-gray-400">{getMethodLabel(payment.method)}</p>
                {payment.note && <p className="text-xs text-gray-400 italic">💬 {payment.note}</p>}
              </div>
            </div>
            <button
              onClick={() => handleDeletePayment(payment.id)}
              className="text-red-400 hover:text-red-600 p-2"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
