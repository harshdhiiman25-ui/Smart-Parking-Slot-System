export type SlotStatus = 'Available' | 'Occupied' | 'Reserved' | 'Maintenance';
export type VehicleType = 'Car' | 'Bike' | 'EV' | 'VIP' | 'Accessible';
export type PaymentMethod = 'Cash' | 'UPI' | 'Card';

export interface ParkingSlot {
  id: number;
  slot_number: string;
  slot_type: VehicleType;
  status: SlotStatus;
  floor_level: string;
  remarks?: string;
}

export interface ParkingRecord {
  id: number;
  ticket_id: string;
  vehicle_number: string;
  slot_number: string;
  vehicle_type: VehicleType;
  owner_name: string;
  owner_phone?: string;
  entry_time: string;
  exit_time?: string;
  duration_minutes?: number;
  parking_fee: number;
  ev_fee: number;
  total_amount: number;
  payment_status: 'Paid' | 'Pending';
  payment_method?: PaymentMethod;
  transaction_id?: string;
  status: 'Active' | 'Completed' | 'Cancelled';
  created_by?: string;
  color?: string;
  remarks?: string;
}

export interface Reservation {
  id: number;
  reservation_code: string;
  vehicle_number: string;
  owner_name: string;
  phone_number: string;
  vehicle_type: VehicleType;
  slot_number: string;
  reservation_date: string;
  start_time: string;
  end_time: string;
  status: 'Confirmed' | 'Completed' | 'Cancelled' | 'Expired';
}

export interface EVSession {
  id: number;
  ticket_id?: string;
  slot_number: string;
  vehicle_number: string;
  start_time: string;
  end_time?: string;
  units_kwh: number;
  rate_per_kwh: number;
  total_charging_fee: number;
  status: 'Charging' | 'Completed' | 'Idle';
}

export interface TariffRate {
  vehicle_type: VehicleType;
  hourly_rate: number;
  daily_max: number;
}

export interface SystemNotification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'danger';
  created_at: string;
  is_read: boolean;
}

export interface UserSession {
  id: number;
  username: string;
  full_name: string;
  role: 'admin' | 'staff';
  email?: string;
  phone?: string;
}
