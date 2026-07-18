-- ============================================================================
-- Gupana Electrical Supplies and Installation Services
-- Service Request and Inquiry Management System
-- PostgreSQL Database Schema
-- ============================================================================

DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS inquiries CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS service_requests CASCADE;
DROP TABLE IF EXISTS schedule_blocks CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================================
-- USERS  (Clients and Administrators)
-- ============================================================================
CREATE TABLE users (
    user_id         SERIAL PRIMARY KEY,
    role            VARCHAR(20) NOT NULL CHECK (role IN ('client', 'admin')),
    full_name       VARCHAR(150) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    phone_number    VARCHAR(30),
    address         VARCHAR(255),
    avatar_url      VARCHAR(255),
    status          VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- SERVICES  (catalog of offerings: Installation, Repair, Wiring, Maintenance)
-- ============================================================================
CREATE TABLE services (
    service_id      SERIAL PRIMARY KEY,
    service_name    VARCHAR(150) NOT NULL,
    category        VARCHAR(50) NOT NULL, -- Installation, Repair, Wiring, Maintenance
    description     TEXT,
    icon            VARCHAR(50) DEFAULT 'zap',
    base_price      NUMERIC(10,2),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- SCHEDULE BLOCKS  (admin-defined available blocks clients can pick from)
-- ============================================================================
CREATE TABLE schedule_blocks (
    block_id        SERIAL PRIMARY KEY,
    block_date      DATE NOT NULL,
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    capacity        INTEGER NOT NULL DEFAULT 1,
    is_available     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- SERVICE REQUESTS
-- ============================================================================
CREATE TABLE service_requests (
    request_id          SERIAL PRIMARY KEY,
    request_code        VARCHAR(20) NOT NULL UNIQUE, -- e.g. SR-2025-0010
    client_id           INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    service_id          INTEGER NOT NULL REFERENCES services(service_id),
    problem_description  TEXT,
    admin_comment        TEXT,
    preferred_block_id  INTEGER REFERENCES schedule_blocks(block_id),
    address              VARCHAR(255),
    status               VARCHAR(20) NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending', 'approved', 'completed', 'cancelled')),
    created_at           TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_service_requests_client ON service_requests(client_id);
CREATE INDEX idx_service_requests_status ON service_requests(status);

-- ============================================================================
-- APPOINTMENTS  (assigned/confirmed schedule for a service request)
-- ============================================================================
CREATE TABLE appointments (
    appointment_id  SERIAL PRIMARY KEY,
    request_id      INTEGER NOT NULL REFERENCES service_requests(request_id) ON DELETE CASCADE,
    client_id       INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    service_id      INTEGER NOT NULL REFERENCES services(service_id),
    appointment_date DATE NOT NULL,
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    location        VARCHAR(255),
    note            TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    assigned_by     INTEGER REFERENCES users(user_id),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_appointments_client ON appointments(client_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);

-- ============================================================================
-- INQUIRIES
-- ============================================================================
CREATE TABLE inquiries (
    inquiry_id      SERIAL PRIMARY KEY,
    inquiry_code    VARCHAR(20) NOT NULL UNIQUE, -- e.g. INQ-2025-0011
    client_id       INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    subject         VARCHAR(200) NOT NULL,
    message         TEXT NOT NULL,
    reply           TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'unanswered'
                    CHECK (status IN ('unanswered', 'answered')),
    answered_by     INTEGER REFERENCES users(user_id),
    answered_at     TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inquiries_client ON inquiries(client_id);
CREATE INDEX idx_inquiries_status ON inquiries(status);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================
CREATE TABLE notifications (
    notification_id  SERIAL PRIMARY KEY,
    user_id          INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title            VARCHAR(200) NOT NULL,
    message          TEXT NOT NULL,
    type             VARCHAR(30) NOT NULL DEFAULT 'general'
                     CHECK (type IN ('request', 'appointment', 'inquiry', 'general')),
    reference_id     INTEGER, -- id of related request/appointment/inquiry
    is_read          BOOLEAN NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);

-- ============================================================================
-- ACTIVITY LOGS  (admin actions, for accountability/monitoring)
-- ============================================================================
CREATE TABLE activity_logs (
    log_id          SERIAL PRIMARY KEY,
    user_id         INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    action          VARCHAR(200) NOT NULL,
    module          VARCHAR(50), -- Users, Services, Requests, Appointments, Inquiries...
    details         TEXT,
    ip_address      VARCHAR(50),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at);

-- ============================================================================
-- TRIGGERS: auto-update updated_at columns
-- ============================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_service_requests_updated_at BEFORE UPDATE ON service_requests
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Default admin account -> password: Admin@123 (bcrypt hash, see backend/src/config/seed.js to regenerate)
INSERT INTO users (role, full_name, email, password_hash, phone_number, status) VALUES
('admin', 'Administrator', 'admin@gupana.com', '$2b$10$replaceWithRealBcryptHashOnFirstRun', '0900-000-0000', 'active');

-- Sample services
INSERT INTO services (service_name, category, description, icon, base_price) VALUES
('Electrical Installation', 'Installation', 'We provide safe and reliable installation services.', 'home', 2500.00),
('Electrical Repair', 'Repair', 'We fix electrical issues in your home or business.', 'wrench', 1200.00),
('Wiring Services', 'Wiring', 'House wiring, rewiring, and new wiring setup.', 'plug', 3000.00),
('Maintenance', 'Maintenance', 'Preventive maintenance for your electrical systems.', 'settings', 1500.00);

-- Sample schedule blocks (next 7 days, two blocks/day)
INSERT INTO schedule_blocks (block_date, start_time, end_time, capacity) VALUES
(CURRENT_DATE + 1, '08:00', '10:00', 3),
(CURRENT_DATE + 1, '13:00', '15:00', 3),
(CURRENT_DATE + 2, '08:00', '10:00', 3),
(CURRENT_DATE + 2, '10:30', '12:30', 3),
(CURRENT_DATE + 3, '08:00', '10:00', 3),
(CURRENT_DATE + 3, '14:00', '16:00', 3);
