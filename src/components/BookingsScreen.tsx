import React, { useState } from 'react';
import { Booking } from '../types';
import { formatDate, formatCurrency, getDaysBetween, generateId } from '../utils/storage';

interface Props {
  bookings: Booking[];
  onSave: (bookings: Booking[]) => void;
}

export default function BookingsScreen({ bookings, onSave }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming' | 'past'>('all');
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  
  const [form, setForm] = useState({
    guestName: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    totalAmount: '',
    notes: '',
    status: 'confirmed' as Booking['status'],
  });

  const resetForm = () => {
    setForm({ guestName: '', phone: '', checkIn: '', checkOut: '', totalAmount: '', notes: '', status: 'confirmed' });
    setEditingBooking(null);
    setShowForm(false);
  };

  const handleSave = () => {
    if (!form.guestName || !form.checkIn || !form.checkOut || !form.totalAmount) return;
    
    const today = new Date().toISOString().split('T')[0];
    let status: Booking['status'] = form.status;
    if (!editingBooking) {
      if (form.checkIn <= today && form.checkOut >= today) status = 'checked-in';
      else if (form.checkIn > today) status = 'confirmed';
      else status = 'checked-out';
    }

    if (editingBooking) {
      const updated = bookings.map(b => b.id === editingBooking.id ? {
        ...b,
        guestName: form.guestName,
        phone: form.phone,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        totalAmount: Number(form.totalAmount),
        notes: form.notes,
        status,
      } : b);
      onSave(updated);
    } else {
      const newBooking: Booking = {
        id: generateId(),
        guestName: form.guestName,
        phone: form.phone,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        totalAmount: Number(form.totalAmount),
        paidAmount: 0,
        status,
        notes: form.notes,
        createdAt: new Date().toISOString(),
      };
      onSave([...bookings, newBooking]);
    }
    resetForm();
  };

  const handleEdit = (booking: Booking) => {
    setForm({
      guestName: booking.guestName,
      phone: booking.phone,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      totalAmount: booking.totalAmount.toString(),
      notes: booking.notes,
      status: booking.status,
    });
    setEditingBooking(booking);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Удалить бронирование?')) {
      onSave(bookings.filter(b => b.id !== id));
    }
  };

  const handleStatusChange = (id: string, status: Booking['status']) => {
    const updated = bookings.map(b => b.id === id ? { ...b, status } : b);
    onSave(updated);
  };

  const today = new Date().toISOString().split('T')[0];
  
  const filteredBookings = bookings.filter(b => {
    switch (filter) {
      case 'active': return b.status === 'checked-in' && b.checkIn <= today && b.checkOut >= today;
      case 'upcoming': return b.checkIn > today && b.status !== 'cancelled';
      case 'past': return b.checkOut < today || b.status === 'cancelled' || b.status === 'checked-out';
      default: return true;
    }
  }).sort((a, b) => b.checkIn.localeCompare(a.checkIn));

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed': return <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Подтверждено</span>;
      case 'checked-in': return <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Проживает</span>;
      case 'checked-out': return <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Выехал</span>;
      case 'cancelled': return <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Отменено</span>;
    }
  };

  if (showForm) {
    return (
      <div className="px-4 pt-4 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {editingBooking ? 'Редактировать' : 'Новое бронирование'}
          </h2>
          <button onClick={resetForm} className="text-gray-500 text-2xl">&times;</button>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">Имя гостя *</label>
            <input
              type="text"
              value={form.guestName}
              onChange={e => setForm({...form, guestName: e.target.value})}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="Иван Иванов"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">Телефон</label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm({...form, phone: e.target.value})}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="+7 (999) 123-45-67"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Заезд *</label>
              <input
                type="date"
                value={form.checkIn}
                onChange={e => setForm({...form, checkIn: e.target.value})}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Выезд *</label>
              <input
                type="date"
                value={form.checkOut}
                onChange={e => setForm({...form, checkOut: e.target.value})}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
          
          {form.checkIn && form.checkOut && (
            <p className="text-sm text-indigo-600 font-medium">
              🌙 {getDaysBetween(form.checkIn, form.checkOut)} ночей
            </p>
          )}
          
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">Сумма (₽) *</label>
            <input
              type="number"
              value={form.totalAmount}
              onChange={e => setForm({...form, totalAmount: e.target.value})}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              placeholder="5000"
            />
          </div>
          
          {editingBooking && (
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">Статус</label>
              <select
                value={form.status}
                onChange={e => setForm({...form, status: e.target.value as Booking['status']})}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              >
                <option value="confirmed">Подтверждено</option>
                <option value="checked-in">Проживает</option>
                <option value="checked-out">Выехал</option>
                <option value="cancelled">Отменено</option>
              </select>
            </div>
          )}
          
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">Заметки</label>
            <textarea
              value={form.notes}
              onChange={e => setForm({...form, notes: e.target.value})}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
              rows={2}
              placeholder="Дополнительная информация..."
            />
          </div>
          
          <button
            onClick={handleSave}
            disabled={!form.guestName || !form.checkIn || !form.checkOut || !form.totalAmount}
            className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed active:bg-indigo-700 transition-colors"
          >
            {editingBooking ? 'Сохранить изменения' : 'Создать бронирование'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-4">
      <div className="px-4 pt-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Бронирования</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-lg active:bg-indigo-700"
        >
          +
        </button>
      </div>

      {/* Filters */}
      <div className="px-4 mt-3 flex gap-2 overflow-x-auto pb-2">
        {[
          { key: 'all', label: 'Все' },
          { key: 'active', label: 'Проживают' },
          { key: 'upcoming', label: 'Ожидаемые' },
          { key: 'past', label: 'Прошлые' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as typeof filter)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f.key
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div className="px-4 mt-3 space-y-3">
        {filteredBookings.length === 0 && (
          <div className="text-center py-8">
            <p className="text-4xl mb-2">📭</p>
            <p className="text-gray-500">Нет бронирований</p>
          </div>
        )}
        {filteredBookings.map(booking => (
          <div key={booking.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-bold text-gray-800 text-lg">{booking.guestName}</p>
                {booking.phone && <p className="text-sm text-gray-500">{booking.phone}</p>}
              </div>
              {getStatusBadge(booking.status)}
            </div>
            
            <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
              <span>{formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}</span>
              <span className="text-gray-400">{getDaysBetween(booking.checkIn, booking.checkOut)} н.</span>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <span className="font-semibold text-gray-800">{formatCurrency(booking.totalAmount)}</span>
                {booking.paidAmount > 0 && (
                  <span className="text-sm text-green-600 ml-2">
                    Оплачено: {formatCurrency(booking.paidAmount)}
                  </span>
                )}
                {booking.paidAmount < booking.totalAmount && (
                  <span className="text-sm text-red-500 ml-2">
                    Долг: {formatCurrency(booking.totalAmount - booking.paidAmount)}
                  </span>
                )}
              </div>
            </div>

            {booking.notes && (
              <p className="text-xs text-gray-400 mt-2 italic">💬 {booking.notes}</p>
            )}
            
            {/* Actions */}
            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
              {booking.status === 'confirmed' && (
                <button
                  onClick={() => handleStatusChange(booking.id, 'checked-in')}
                  className="flex-1 text-xs bg-green-100 text-green-700 py-1.5 rounded-lg font-medium"
                >
                  ✓ Заселить
                </button>
              )}
              {booking.status === 'checked-in' && (
                <button
                  onClick={() => handleStatusChange(booking.id, 'checked-out')}
                  className="flex-1 text-xs bg-orange-100 text-orange-700 py-1.5 rounded-lg font-medium"
                >
                  🚪 Выписать
                </button>
              )}
              <button
                onClick={() => handleEdit(booking)}
                className="flex-1 text-xs bg-blue-100 text-blue-700 py-1.5 rounded-lg font-medium"
              >
                ✏️ Изменить
              </button>
              <button
                onClick={() => handleDelete(booking.id)}
                className="text-xs bg-red-100 text-red-700 py-1.5 px-3 rounded-lg font-medium"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
