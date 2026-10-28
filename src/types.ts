export interface Booking {
  id: string;
  guestName: string;
  phone: string;
  checkIn: string; // ISO date
  checkOut: string; // ISO date
  totalAmount: number;
  paidAmount: number;
  status: 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';
  notes: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  method: 'cash' | 'card' | 'transfer';
  date: string; // ISO date
  note: string;
}

export type TabType = 'home' | 'bookings' | 'payments' | 'stats';
