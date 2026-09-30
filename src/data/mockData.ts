import { ParkingSlot, ParkingRecord, Reservation, EVSession, TariffRate, SystemNotification } from '../types';

export const INITIAL_SLOTS: ParkingSlot[] = [
  // Section A: Slots A01-A10
  { id: 1, slot_number: 'A01', slot_type: 'VIP', status: 'Occupied', floor_level: 'Ground', remarks: 'VIP Reserved Zone' },
  { id: 2, slot_number: 'A02', slot_type: 'VIP', status: 'Reserved', floor_level: 'Ground', remarks: 'Advance Booking' },
  { id: 3, slot_number: 'A03', slot_type: 'Car', status: 'Occupied', floor_level: 'Ground' },
  { id: 4, slot_number: 'A04', slot_type: 'Car', status: 'Occupied', floor_level: 'Ground' },
  { id: 5, slot_number: 'A05', slot_type: 'Car', status: 'Available', floor_level: 'Ground' },
  { id: 6, slot_number: 'A06', slot_type: 'Car', status: 'Available', floor_level: 'Ground' },
  { id: 7, slot_number: 'A07', slot_type: 'Car', status: 'Available', floor_level: 'Ground' },
  { id: 8, slot_number: 'A08', slot_type: 'Car', status: 'Available', floor_level: 'Ground' },
  { id: 9, slot_number: 'A09', slot_type: 'Car', status: 'Available', floor_level: 'Ground' },
  { id: 10, slot_number: 'A10', slot_type: 'Accessible', status: 'Available', floor_level: 'Ground', remarks: 'Near Elevator / Ramp' },

  // Section B: Slots B01-B10
  { id: 11, slot_number: 'B01', slot_type: 'EV', status: 'Occupied', floor_level: 'Ground', remarks: 'Fast DC Charger' },
  { id: 12, slot_number: 'B02', slot_type: 'EV', status: 'Available', floor_level: 'Ground', remarks: 'Fast DC Charger' },
  { id: 13, slot_number: 'B03', slot_type: 'EV', status: 'Available', floor_level: 'Ground', remarks: 'Type 2 AC Charger' },
  { id: 14, slot_number: 'B04', slot_type: 'Bike', status: 'Occupied', floor_level: 'Ground' },
  { id: 15, slot_number: 'B05', slot_type: 'Bike', status: 'Available', floor_level: 'Ground' },
  { id: 16, slot_number: 'B06', slot_type: 'Bike', status: 'Available', floor_level: 'Ground' },
  { id: 17, slot_number: 'B07', slot_type: 'Bike', status: 'Available', floor_level: 'Ground' },
  { id: 18, slot_number: 'B08', slot_type: 'Bike', status: 'Available', floor_level: 'Ground' },
  { id: 19, slot_number: 'B09', slot_type: 'Bike', status: 'Available', floor_level: 'Ground' },
  { id: 20, slot_number: 'B10', slot_type: 'Accessible', status: 'Available', floor_level: 'Ground', remarks: 'Near Exit Gate' },

  // Section C: Slots C01-C10
  { id: 21, slot_number: 'C01', slot_type: 'Bike', status: 'Occupied', floor_level: 'Floor 1' },
  { id: 22, slot_number: 'C02', slot_type: 'Bike', status: 'Available', floor_level: 'Floor 1' },
  { id: 23, slot_number: 'C03', slot_type: 'Car', status: 'Occupied', floor_level: 'Floor 1' },
  { id: 24, slot_number: 'C04', slot_type: 'Car', status: 'Available', floor_level: 'Floor 1' },
  { id: 25, slot_number: 'C05', slot_type: 'Car', status: 'Maintenance', floor_level: 'Floor 1', remarks: 'Sensor Calibration' },
  { id: 26, slot_number: 'C06', slot_type: 'Car', status: 'Available', floor_level: 'Floor 1' },
  { id: 27, slot_number: 'C07', slot_type: 'Car', status: 'Available', floor_level: 'Floor 1' },
  { id: 28, slot_number: 'C08', slot_type: 'Car', status: 'Available', floor_level: 'Floor 1' },
  { id: 29, slot_number: 'C09', slot_type: 'Car', status: 'Available', floor_level: 'Floor 1' },
  { id: 30, slot_number: 'C10', slot_type: 'Car', status: 'Available', floor_level: 'Floor 1' },
];

export const INITIAL_RATES: Record<string, TariffRate> = {
  Car: { vehicle_type: 'Car', hourly_rate: 40, daily_max: 320 },
  Bike: { vehicle_type: 'Bike', hourly_rate: 20, daily_max: 160 },
  EV: { vehicle_type: 'EV', hourly_rate: 30, daily_max: 260 },
  VIP: { vehicle_type: 'VIP', hourly_rate: 60, daily_max: 500 },
  Accessible: { vehicle_type: 'Accessible', hourly_rate: 30, daily_max: 240 },
};

export const INITIAL_RECORDS: ParkingRecord[] = [
  {
    id: 1,
    ticket_id: 'TKT-20260929-101',
    vehicle_number: 'DL01AB1234',
    slot_number: 'A01',
    vehicle_type: 'VIP',
    owner_name: 'Vikram Malhotra',
    owner_phone: '9876543210',
    entry_time: '2026-09-29 08:30:00',
    parking_fee: 0,
    ev_fee: 0,
    total_amount: 0,
    payment_status: 'Pending',
    status: 'Active',
    created_by: 'admin',
    color: 'Metallic Black'
  },
  {
    id: 2,
    ticket_id: 'TKT-20260929-102',
    vehicle_number: 'MH12DE1432',
    slot_number: 'A03',
    vehicle_type: 'Car',
    owner_name: 'Aditi Sharma',
    owner_phone: '9811223344',
    entry_time: '2026-09-29 09:15:00',
    parking_fee: 0,
    ev_fee: 0,
    total_amount: 0,
    payment_status: 'Pending',
    status: 'Active',
    created_by: 'staff',
    color: 'Silver Grey'
  },
  {
    id: 3,
    ticket_id: 'TKT-20260929-103',
    vehicle_number: 'KA05MB9999',
    slot_number: 'A04',
    vehicle_type: 'Car',
    owner_name: 'Rahul Verma',
    owner_phone: '9722334455',
    entry_time: '2026-09-29 09:40:00',
    parking_fee: 0,
    ev_fee: 0,
    total_amount: 0,
    payment_status: 'Pending',
    status: 'Active',
    created_by: 'staff',
    color: 'Pearl White'
  },
  {
    id: 4,
    ticket_id: 'TKT-20260929-104',
    vehicle_number: 'DL08CY5521',
    slot_number: 'B01',
    vehicle_type: 'EV',
    owner_name: 'Pooja Hegde',
    owner_phone: '9988776655',
    entry_time: '2026-09-29 09:00:00',
    parking_fee: 0,
    ev_fee: 137.75,
    total_amount: 0,
    payment_status: 'Pending',
    status: 'Active',
    created_by: 'staff',
    color: 'Ocean Blue'
  },
  {
    id: 5,
    ticket_id: 'TKT-20260929-105',
    vehicle_number: 'HR26DK4321',
    slot_number: 'B04',
    vehicle_type: 'Bike',
    owner_name: 'Rohan Das',
    owner_phone: '9655443322',
    entry_time: '2026-09-29 07:15:00',
    parking_fee: 0,
    ev_fee: 0,
    total_amount: 0,
    payment_status: 'Pending',
    status: 'Active',
    created_by: 'staff',
    color: 'Matte Red'
  },
  {
    id: 6,
    ticket_id: 'TKT-20260929-106',
    vehicle_number: 'UP16BZ7890',
    slot_number: 'C01',
    vehicle_type: 'Bike',
    owner_name: 'Amitabh Sen',
    owner_phone: '9123456780',
    entry_time: '2026-09-29 10:05:00',
    parking_fee: 0,
    ev_fee: 0,
    total_amount: 0,
    payment_status: 'Pending',
    status: 'Active',
    created_by: 'staff',
    color: 'Midnight Black'
  },
  {
    id: 7,
    ticket_id: 'TKT-20260929-107',
    vehicle_number: 'DL03TC8812',
    slot_number: 'C03',
    vehicle_type: 'Car',
    owner_name: 'Siddharth Rao',
    owner_phone: '9876512345',
    entry_time: '2026-09-29 06:30:00',
    parking_fee: 0,
    ev_fee: 0,
    total_amount: 0,
    payment_status: 'Pending',
    status: 'Active',
    created_by: 'admin',
    color: 'Dark Titanium'
  },
  // Historical Records
  {
    id: 8,
    ticket_id: 'TKT-20260928-001',
    vehicle_number: 'DL05AQ1111',
    slot_number: 'A05',
    vehicle_type: 'Car',
    owner_name: 'Karan Johar',
    owner_phone: '9810101010',
    entry_time: '2026-09-28 10:00:00',
    exit_time: '2026-09-28 13:00:00',
    duration_minutes: 180,
    parking_fee: 120,
    ev_fee: 0,
    total_amount: 120,
    payment_status: 'Paid',
    payment_method: 'UPI',
    transaction_id: 'UPI-REF-9021',
    status: 'Completed',
    created_by: 'staff'
  },
  {
    id: 9,
    ticket_id: 'TKT-20260928-002',
    vehicle_number: 'MH01AB2222',
    slot_number: 'B05',
    vehicle_type: 'Bike',
    owner_name: 'Sunil Grover',
    owner_phone: '9820202020',
    entry_time: '2026-09-28 12:00:00',
    exit_time: '2026-09-28 14:00:00',
    duration_minutes: 120,
    parking_fee: 40,
    ev_fee: 0,
    total_amount: 40,
    payment_status: 'Paid',
    payment_method: 'Cash',
    transaction_id: 'CSH-8831',
    status: 'Completed',
    created_by: 'staff'
  },
  {
    id: 10,
    ticket_id: 'TKT-20260928-003',
    vehicle_number: 'KA01EV3333',
    slot_number: 'B02',
    vehicle_type: 'EV',
    owner_name: 'Neha Kakkar',
    owner_phone: '9830303030',
    entry_time: '2026-09-28 09:30:00',
    exit_time: '2026-09-28 13:30:00',
    duration_minutes: 240,
    parking_fee: 120,
    ev_fee: 190,
    total_amount: 310,
    payment_status: 'Paid',
    payment_method: 'Card',
    transaction_id: 'CRD-4411',
    status: 'Completed',
    created_by: 'admin'
  }
];

export const INITIAL_RESERVATIONS: Reservation[] = [
  {
    id: 1,
    reservation_code: 'RES-8921',
    vehicle_number: 'DL04XY9000',
    owner_name: 'Rajesh Khanna',
    phone_number: '9899112233',
    vehicle_type: 'VIP',
    slot_number: 'A02',
    reservation_date: '2026-09-29',
    start_time: '14:00',
    end_time: '18:00',
    status: 'Confirmed'
  },
  {
    id: 2,
    reservation_code: 'RES-7412',
    vehicle_number: 'HR01ZZ5555',
    owner_name: 'Ananya Panday',
    phone_number: '9812345678',
    vehicle_type: 'Car',
    slot_number: 'A08',
    reservation_date: '2026-09-30',
    start_time: '10:00',
    end_time: '15:00',
    status: 'Confirmed'
  }
];

export const INITIAL_EV_SESSIONS: EVSession[] = [
  {
    id: 1,
    ticket_id: 'TKT-20260929-104',
    slot_number: 'B01',
    vehicle_number: 'DL08CY5521',
    start_time: '2026-09-29 09:00:00',
    units_kwh: 14.5,
    rate_per_kwh: 9.50,
    total_charging_fee: 137.75,
    status: 'Charging'
  },
  {
    id: 2,
    ticket_id: 'TKT-20260928-003',
    slot_number: 'B02',
    vehicle_number: 'KA01EV3333',
    start_time: '2026-09-28 09:30:00',
    end_time: '2026-09-28 13:30:00',
    units_kwh: 20.0,
    rate_per_kwh: 9.50,
    total_charging_fee: 190.00,
    status: 'Completed'
  }
];

export const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 1,
    title: 'System Initialized',
    message: 'Smart Parking Slot Management System database initialized with 30 slots.',
    type: 'success',
    created_at: '2026-09-29 06:00:00',
    is_read: false
  },
  {
    id: 2,
    title: 'Slot C05 Inactive',
    message: 'Slot C05 is set under Maintenance for ultrasonic sensor testing.',
    type: 'warning',
    created_at: '2026-09-29 07:00:00',
    is_read: false
  },
  {
    id: 3,
    title: 'EV Fast Charger Active',
    message: 'Port B01 is currently charging DL08CY5521 at 9.50 INR/kWh.',
    type: 'info',
    created_at: '2026-09-29 09:05:00',
    is_read: true
  }
];
