/* ============================================================================
   Gupana — demo-data.js
   Sample data shown automatically when the backend isn't reachable (DEMO_MODE).
   ============================================================================ */

const ADMIN_DEMO = {
  user: { user_id: 1, role: 'admin', full_name: 'Administrator', email: 'admin@gupana.com' },
  stats: { total_requests: 23, pending_requests: 12, confirmed_appointments: 15, new_inquiries: 7, unread_notifications: 18 },
  statusBreakdown: [
    { status: 'pending', count: 12 }, { status: 'approved', count: 8 },
    { status: 'completed', count: 6 }, { status: 'cancelled', count: 4 },
  ],
  requestsOverTime: [
    { day: 'May 9', count: 3 }, { day: 'May 10', count: 5 }, { day: 'May 11', count: 2 },
    { day: 'May 12', count: 9 }, { day: 'May 13', count: 4 }, { day: 'May 14', count: 12 }, { day: 'May 15', count: 8 },
  ],
  services: [
    { service_id: 1, service_name: 'Electrical Installation', category: 'Installation', description: 'We provide safe and reliable installation services.', icon: 'home', is_active: true },
    { service_id: 2, service_name: 'Electrical Repair', category: 'Repair', description: 'We fix electrical issues in your home or business.', icon: 'wrench', is_active: true },
    { service_id: 3, service_name: 'Wiring Services', category: 'Wiring', description: 'House wiring, rewiring, and new wiring setup.', icon: 'plug', is_active: true },
    { service_id: 4, service_name: 'Maintenance', category: 'Maintenance', description: 'Preventive maintenance for your electrical systems.', icon: 'settings', is_active: true },
  ],
  users: [
    { user_id: 2, role: 'client', full_name: 'Juan Dela Cruz', email: 'juan.delacruz@example.com', phone_number: '0917-111-2222', status: 'active', created_at: '2025-04-02' },
    { user_id: 3, role: 'client', full_name: 'Maria Santos', email: 'maria.santos@example.com', phone_number: '0917-222-3333', status: 'active', created_at: '2025-04-10' },
    { user_id: 4, role: 'client', full_name: 'Pedro Lopez', email: 'pedro.lopez@example.com', phone_number: '0917-333-4444', status: 'active', created_at: '2025-04-18' },
    { user_id: 5, role: 'client', full_name: 'Ana Reyes', email: 'ana.reyes@example.com', phone_number: '0917-444-5555', status: 'active', created_at: '2025-05-01' },
    { user_id: 6, role: 'client', full_name: 'Robert Garcia', email: 'robert.garcia@example.com', phone_number: '0917-555-6666', status: 'inactive', created_at: '2025-05-05' },
  ],
  requests: [
    { request_id: 10, request_code: 'SR-2025-0010', client_name: 'Juan Dela Cruz', service_name: 'Electrical Installation', status: 'pending', created_at: '2025-05-15', block_date: '2025-05-15', start_time: '08:00', end_time: '10:00', address: 'Purok 1, Poblacion, Borobo', problem_description: 'Need new outlets installed in the kitchen and living room.' },
    { request_id: 9, request_code: 'SR-2025-0009', client_name: 'Maria Santos', service_name: 'Wiring Repair', status: 'pending', created_at: '2025-05-15', block_date: '2025-05-16', start_time: '10:30', end_time: '12:30', address: 'Purok 3, Borobo', problem_description: 'Flickering lights in the second floor.' },
    { request_id: 8, request_code: 'SR-2025-0008', client_name: 'Pedro Lopez', service_name: 'Electrical Repair', status: 'approved', created_at: '2025-05-14', block_date: '2025-05-15', start_time: '13:00', end_time: '15:00', address: 'Purok 2, Borobo', problem_description: 'Circuit breaker keeps tripping.' },
    { request_id: 7, request_code: 'SR-2025-0007', client_name: 'Ana Reyes', service_name: 'Maintenance', status: 'pending', created_at: '2025-05-14', block_date: '2025-05-16', start_time: '08:00', end_time: '10:00', address: 'Purok 1, Borobo', problem_description: 'Yearly preventive maintenance check-up.' },
    { request_id: 6, request_code: 'SR-2025-0006', client_name: 'Robert Garcia', service_name: 'Wiring Services', status: 'completed', created_at: '2025-05-13', block_date: '2025-05-16', start_time: '14:00', end_time: '16:00', address: 'Purok 4, Borobo', problem_description: 'New wiring for garage extension.' },
  ],
  appointments: [
    { appointment_id: 1, request_id: 10, client_name: 'Juan Dela Cruz', service_name: 'Electrical Installation', appointment_date: '2025-05-15', start_time: '08:00', end_time: '10:00', status: 'confirmed', location: 'Purok 1, Poblacion, Borobo', note: 'Please clear the area near the breaker box before we arrive.' },
    { appointment_id: 2, request_id: 9, client_name: 'Maria Santos', service_name: 'Wiring Repair', appointment_date: '2025-05-15', start_time: '10:30', end_time: '12:30', status: 'confirmed', location: 'Purok 3, Borobo', note: '' },
    { appointment_id: 3, request_id: 8, client_name: 'Pedro Lopez', service_name: 'Electrical Repair', appointment_date: '2025-05-15', start_time: '13:00', end_time: '15:00', status: 'pending', location: 'Purok 2, Borobo', note: 'Bringing a replacement breaker just in case — please have the panel accessible.' },
    { appointment_id: 4, request_id: 7, client_name: 'Ana Reyes', service_name: 'Maintenance', appointment_date: '2025-05-16', start_time: '08:00', end_time: '10:00', status: 'confirmed', location: 'Purok 1, Borobo', note: '' },
    { appointment_id: 5, request_id: 6, client_name: 'Robert Garcia', service_name: 'Wiring Services', appointment_date: '2025-05-16', start_time: '14:00', end_time: '16:00', status: 'confirmed', location: 'Purok 4, Borobo', note: '' },
  ],
  inquiries: [
    { inquiry_id: 11, inquiry_code: 'INQ-2025-0011', client_name: 'Juan Dela Cruz', subject: 'Service Availability', message: 'Do you offer weekend appointments for installation services?', status: 'unanswered', created_at: '2025-05-15', reply: null },
    { inquiry_id: 10, inquiry_code: 'INQ-2025-0010', client_name: 'Maria Santos', subject: 'Price Inquiry', message: 'How much does a full house rewiring cost?', status: 'unanswered', created_at: '2025-05-15', reply: null },
    { inquiry_id: 9, inquiry_code: 'INQ-2025-0009', client_name: 'Pedro Lopez', subject: 'Schedule Inquiry', message: 'Can I move my appointment to next week?', status: 'answered', created_at: '2025-05-14', reply: 'Yes, please let us know your preferred schedule block and we will confirm.' },
    { inquiry_id: 8, inquiry_code: 'INQ-2025-0008', client_name: 'Ana Reyes', subject: 'Installation Details', message: 'What brands of circuit breakers do you install?', status: 'answered', created_at: '2025-05-14', reply: 'We install Schneider and ABB breakers as standard, with other brands available on request.' },
    { inquiry_id: 7, inquiry_code: 'INQ-2025-0007', client_name: 'Robert Garcia', subject: 'Warranty Inquiry', message: 'Is there a warranty on wiring services?', status: 'answered', created_at: '2025-05-13', reply: 'Yes, all wiring work comes with a 6-month workmanship warranty.' },
  ],
  notifications: [
    { notification_id: 1, title: 'New Service Request', message: 'Juan Dela Cruz submitted a new service request (SR-2025-0010).', type: 'request', is_read: false, created_at: '2025-05-15T08:00:00' },
    { notification_id: 2, title: 'New Inquiry', message: 'Maria Santos sent an inquiry: "Price Inquiry".', type: 'inquiry', is_read: false, created_at: '2025-05-15T07:40:00' },
    { notification_id: 3, title: 'Appointment Reminder', message: 'Appointment with Pedro Lopez is scheduled today at 1:00 PM.', type: 'appointment', is_read: true, created_at: '2025-05-15T06:00:00' },
  ],
  activity: [
    { log_id: 1, user_name: 'Administrator', action: 'Set request SR-2025-0008 to approved', module: 'Service Requests', created_at: '2025-05-14T10:22:00' },
    { log_id: 2, user_name: 'Administrator', action: 'Answered inquiry INQ-2025-0009', module: 'Inquiries', created_at: '2025-05-14T09:50:00' },
    { log_id: 3, user_name: 'Administrator', action: 'Scheduled appointment for request SR-2025-0006', module: 'Appointments', created_at: '2025-05-13T15:10:00' },
    { log_id: 4, user_name: 'Administrator', action: 'Logged in', module: 'Auth', created_at: '2025-05-15T07:00:00' },
  ],
};

const CLIENT_DEMO = {
  user: { user_id: 2, role: 'client', full_name: 'Juan Dela Cruz', email: 'juan.delacruz@example.com', phone_number: '0917-111-2222', address: 'Purok 1, Poblacion, Borobo' },
  stats: { my_requests: 2, upcoming_appointments: 1, unanswered_inquiries: 1, unread_notifications: 3 },
  services: [
    { service_id: 1, service_name: 'Electrical Installation', category: 'Installation', description: 'We provide safe and reliable installation services.', icon: 'home' },
    { service_id: 2, service_name: 'Electrical Repair', category: 'Repair', description: 'We fix electrical issues in your home or business.', icon: 'wrench' },
    { service_id: 3, service_name: 'Wiring Services', category: 'Wiring', description: 'House wiring, rewiring, and new wiring setup.', icon: 'plug' },
    { service_id: 4, service_name: 'Maintenance', category: 'Maintenance', description: 'Preventive maintenance for your electrical systems.', icon: 'settings' },
  ],
  scheduleBlocks: [
    { block_id: 1, block_date: '2025-05-18', start_time: '08:00', end_time: '10:00' },
    { block_id: 2, block_date: '2025-05-19', start_time: '13:00', end_time: '15:00' },
    { block_id: 3, block_date: '2025-05-20', start_time: '10:30', end_time: '12:30' },
  ],
  requests: [
    { request_id: 2, request_code: 'SR-2025-0002', service_name: 'Electrical Installation', status: 'pending', created_at: '2025-05-14', problem_description: 'Need new outlets installed in the kitchen.', address: 'Purok 1, Poblacion, Borobo', block_date: '2025-05-18', start_time: '08:00', end_time: '10:00' },
    { request_id: 1, request_code: 'SR-2025-0001', service_name: 'Wiring Repair', status: 'approved', created_at: '2025-05-10', problem_description: 'Flickering lights in the living room.', address: 'Purok 1, Poblacion, Borobo', block_date: '2025-05-12', start_time: '13:00', end_time: '15:00' },
    { request_id: 3, request_code: 'SR-2025-0003', service_name: 'Maintenance', status: 'completed', created_at: '2025-05-05', problem_description: 'Yearly preventive maintenance check-up.', address: 'Purok 1, Poblacion, Borobo', block_date: '2025-05-06', start_time: '08:00', end_time: '10:00' },
  ],
  appointments: [
    { appointment_id: 1, request_id: 2, service_name: 'Electrical Installation', appointment_date: '2025-05-18', start_time: '08:00', end_time: '10:00', status: 'confirmed', location: 'Purok 1, Poblacion, Borobo', note: 'Please make sure someone is available during the schedule.', request_code: 'SR-2025-0002' },
  ],
  inquiries: [
    { inquiry_id: 1, inquiry_code: 'INQ-2025-0004', subject: 'Service Availability', message: 'Do you offer weekend appointments for installation services?', status: 'unanswered', created_at: '2025-05-15', reply: null },
    { inquiry_id: 2, inquiry_code: 'INQ-2025-0003', subject: 'Warranty Inquiry', message: 'Is there a warranty on wiring services?', status: 'answered', created_at: '2025-05-13', reply: 'Yes, all wiring work comes with a 6-month workmanship warranty.' },
  ],
  notifications: [
    { notification_id: 1, title: 'Appointment Confirmed', message: 'Your appointment for request SR-2025-0002 is confirmed on May 18, 2025.', type: 'appointment', is_read: false, created_at: '2025-05-15T09:00:00' },
    { notification_id: 2, title: 'Inquiry Answered', message: 'Your inquiry "Warranty Inquiry" has been answered.', type: 'inquiry', is_read: false, created_at: '2025-05-13T14:00:00' },
    { notification_id: 3, title: 'Service Request Update', message: 'Your request SR-2025-0001 is now approved.', type: 'request', is_read: false, created_at: '2025-05-11T11:00:00' },
  ],
};
