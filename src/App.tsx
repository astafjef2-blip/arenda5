import React, { useState, useEffect } from 'react';
import { Booking, Payment, TabType } from './types';
import { getBookings, saveBookings, getPayments, savePayments } from './utils/storage';
import HomeScreen from './components/HomeScreen';
import BookingsScreen from './components/BookingsScreen';
import PaymentsScreen from './components/PaymentsScreen';
import StatsScreen from './components/StatsScreen';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    setBookings(getBookings());
    setPayments(getPayments());
  }, []);

  const handleSaveBookings = (newBookings: Booking[]) => {
    setBookings(newBookings);
    saveBookings(newBookings);
  };

  const handleSavePayments = (newPayments: Payment[]) => {
    setPayments(newPayments);
    savePayments(newPayments);
  };

  const tabs: { key: TabType; icon: string; label: string }[] = [
    { key: 'home', icon: '🏠', label: 'Главная' },
    { key: 'bookings', icon: '📋', label: 'Брони' },
    { key: 'payments', icon: '💰', label: 'Оплаты' },
    { key: 'stats', icon: '📊', label: 'Стата' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-md bg-gray-50 min-h-screen flex flex-col relative">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto pb-20">
          {activeTab === 'home' && (
            <HomeScreen bookings={bookings} payments={payments} />
          )}
          {activeTab === 'bookings' && (
            <BookingsScreen bookings={bookings} onSave={handleSaveBookings} />
          )}
          {activeTab === 'payments' && (
            <PaymentsScreen
              bookings={bookings}
              payments={payments}
              onSaveBookings={handleSaveBookings}
              onSavePayments={handleSavePayments}
            />
          )}
          {activeTab === 'stats' && (
            <StatsScreen bookings={bookings} payments={payments} />
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 shadow-lg">
          <div className="flex justify-around items-center py-2 px-2">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
                  activeTab === tab.key
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-400'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span className="text-[10px] font-medium mt-0.5">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
