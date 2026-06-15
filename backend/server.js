import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

const app = express();
// 1. Dynamic Port Configuration
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 2. Dynamic Database Connection
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  port: process.env.DB_PORT || 3306,
  password: process.env.DB_PASSWORD || 'Kets.8865',
  database: process.env.DB_DATABASE || 'airlinemanagementsystem',
  // Render environments sometimes require SSL connections for cloud databases
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

// --- DB INITIALIZATION ---
const initDb = async () => {
  try {
    // 1. login table
    await db.query(`
      CREATE TABLE IF NOT EXISTS login (
        username          VARCHAR(255) PRIMARY KEY,
        password          VARCHAR(255),
        security_question VARCHAR(500),
        security_answer   VARCHAR(255)
      )
    `);
    try { await db.query("ALTER TABLE login ADD COLUMN security_question VARCHAR(500)"); } catch (e) { }
    try { await db.query("ALTER TABLE login ADD COLUMN security_answer VARCHAR(255)"); } catch (e) { }

    const [admins] = await db.query("SELECT * FROM login");
    if (admins.length === 0) {
      await db.query(
        "INSERT INTO login (username, password, security_question, security_answer) VALUES (?,?,?,?)",
        ['admin', 'admin123', 'What is your favorite airline?', 'Boing Boing']
      );
    }

    // 2. passenger table
    await db.query(`
      CREATE TABLE IF NOT EXISTS passenger (
        aadhar            VARCHAR(255) PRIMARY KEY,
        name              VARCHAR(255),
        nationality       VARCHAR(255),
        phone             VARCHAR(255),
        address           VARCHAR(255),
        gender            VARCHAR(50),
        date_of_birth     VARCHAR(20),
        emergency_contact VARCHAR(255),
        passport_no       VARCHAR(100),
        passport_expiry   VARCHAR(20),
        passport_country  VARCHAR(100),
        is_international  TINYINT(1) DEFAULT 0
      )
    `);
    try { await db.query("ALTER TABLE passenger ADD COLUMN date_of_birth VARCHAR(20)"); } catch (e) { }
    try { await db.query("ALTER TABLE passenger ADD COLUMN emergency_contact VARCHAR(255)"); } catch (e) { }
    try { await db.query("ALTER TABLE passenger ADD COLUMN passport_no VARCHAR(100)"); } catch (e) { }
    try { await db.query("ALTER TABLE passenger ADD COLUMN passport_expiry VARCHAR(20)"); } catch (e) { }
    try { await db.query("ALTER TABLE passenger ADD COLUMN passport_country VARCHAR(100)"); } catch (e) { }
    try { await db.query("ALTER TABLE passenger ADD COLUMN is_international TINYINT(1) DEFAULT 0"); } catch (e) { }
    try { await db.query("ALTER TABLE passenger MODIFY COLUMN name VARCHAR(255)"); } catch (e) { }
    try { await db.query("ALTER TABLE passenger MODIFY COLUMN nationality VARCHAR(255)"); } catch (e) { }
    try { await db.query("ALTER TABLE passenger MODIFY COLUMN phone VARCHAR(255)"); } catch (e) { }
    try { await db.query("ALTER TABLE passenger MODIFY COLUMN address VARCHAR(255)"); } catch (e) { }
    try { await db.query("ALTER TABLE passenger MODIFY COLUMN gender VARCHAR(50)"); } catch (e) { }

    // 3. flight table
    await db.query(`
      CREATE TABLE IF NOT EXISTS flight (
        f_code              VARCHAR(255) PRIMARY KEY,
        f_name              VARCHAR(255),
        flight_type         VARCHAR(20),
        source              VARCHAR(255),
        source_airport      VARCHAR(255),
        destination         VARCHAR(255),
        dest_airport        VARCHAR(255),
        departure_time      VARCHAR(20),
        arrival_time        VARCHAR(20),
        price_economy       INT DEFAULT 0,
        price_business      INT DEFAULT 0,
        price_first         INT DEFAULT 0
      )
    `);
    // Safe migrations for existing deployments
    const flightAlters = [
      "ALTER TABLE flight ADD COLUMN flight_type VARCHAR(20) DEFAULT 'DOMESTIC'",
      "ALTER TABLE flight ADD COLUMN source_airport VARCHAR(255)",
      "ALTER TABLE flight ADD COLUMN dest_airport VARCHAR(255)",
      "ALTER TABLE flight ADD COLUMN departure_time VARCHAR(20)",
      "ALTER TABLE flight ADD COLUMN arrival_time VARCHAR(20)",
      "ALTER TABLE flight ADD COLUMN price_economy INT DEFAULT 0",
      "ALTER TABLE flight ADD COLUMN price_business INT DEFAULT 0",
      "ALTER TABLE flight ADD COLUMN price_first INT DEFAULT 0",
    ];
    for (const sql of flightAlters) { try { await db.query(sql); } catch (e) { } }

    // Drop old simple flights and reseed with full data
    const [existingFlights] = await db.query("SELECT COUNT(*) as cnt FROM flight");
    if (existingFlights[0].cnt < 20) {
      await db.query("DELETE FROM flight");

      // DOMESTIC FLIGHTS (India routes)
      // [f_name, f_code, type, src, src_airport, dest, dest_airport, dep, arr, eco, biz, first]
      const domesticFlights = [
        ['Air India', 'AI-101', 'DOMESTIC', 'Delhi', 'Indira Gandhi Intl (DEL)', 'Mumbai', 'Chhatrapati Shivaji Intl (BOM)', '06:00 AM', '08:10 AM', 4500, 12000, 22000],
        ['IndiGo', '6E-304', 'DOMESTIC', 'Mumbai', 'Chhatrapati Shivaji Intl (BOM)', 'Delhi', 'Indira Gandhi Intl (DEL)', '09:30 AM', '11:45 AM', 3800, 10500, 20000],
        ['SpiceJet', 'SG-442', 'DOMESTIC', 'Kolkata', 'Netaji SC Bose Intl (CCU)', 'Bangalore', 'Kempegowda Intl (BLR)', '11:00 AM', '01:45 PM', 5200, 13500, 24000],
        ['Vistara', 'UK-815', 'DOMESTIC', 'Bangalore', 'Kempegowda Intl (BLR)', 'Delhi', 'Indira Gandhi Intl (DEL)', '02:15 PM', '05:05 PM', 6000, 15000, 27000],
        ['Boing Boing Air', 'BB-102', 'DOMESTIC', 'Mumbai', 'Chhatrapati Shivaji Intl (BOM)', 'Bangalore', 'Kempegowda Intl (BLR)', '05:45 PM', '07:30 PM', 3500, 9800, 19000],
        ['Air India', 'AI-202', 'DOMESTIC', 'Delhi', 'Indira Gandhi Intl (DEL)', 'Bangalore', 'Kempegowda Intl (BLR)', '07:00 PM', '09:30 PM', 5500, 14000, 25000],
        ['IndiGo', '6E-501', 'DOMESTIC', 'Bangalore', 'Kempegowda Intl (BLR)', 'Mumbai', 'Chhatrapati Shivaji Intl (BOM)', '08:20 PM', '10:05 PM', 3600, 10000, 18500],
        ['GoAir', 'G8-201', 'DOMESTIC', 'Delhi', 'Indira Gandhi Intl (DEL)', 'Goa', 'Goa Intl Airport (GOI)', '07:30 AM', '09:55 AM', 4800, 12500, 23000],
        ['SpiceJet', 'SG-610', 'DOMESTIC', 'Chennai', 'Chennai Intl (MAA)', 'Mumbai', 'Chhatrapati Shivaji Intl (BOM)', '10:10 AM', '12:25 PM', 4200, 11000, 21000],
        ['Vistara', 'UK-220', 'DOMESTIC', 'Mumbai', 'Chhatrapati Shivaji Intl (BOM)', 'Chennai', 'Chennai Intl (MAA)', '01:00 PM', '03:10 PM', 4000, 10800, 20500],
        ['Air India', 'AI-315', 'DOMESTIC', 'Hyderabad', 'Rajiv Gandhi Intl (HYD)', 'Delhi', 'Indira Gandhi Intl (DEL)', '05:30 AM', '08:00 AM', 5100, 13000, 24500],
        ['IndiGo', '6E-720', 'DOMESTIC', 'Kolkata', 'Netaji SC Bose Intl (CCU)', 'Chennai', 'Chennai Intl (MAA)', '09:00 AM', '11:30 AM', 4700, 12200, 22500],
        ['GoAir', 'G8-415', 'DOMESTIC', 'Jaipur', 'Jaipur Intl Airport (JAI)', 'Mumbai', 'Chhatrapati Shivaji Intl (BOM)', '06:45 AM', '08:30 AM', 3200, 8800, 17000],
        ['Boing Boing Air', 'BB-303', 'DOMESTIC', 'Pune', 'Pune Airport (PNQ)', 'Delhi', 'Indira Gandhi Intl (DEL)', '03:00 PM', '05:30 PM', 4900, 13200, 24000],
        ['Air India', 'AI-540', 'DOMESTIC', 'Ahmedabad', 'Sardar Vallabhbhai Patel Intl (AMD)', 'Bangalore', 'Kempegowda Intl (BLR)', '08:00 AM', '10:15 AM', 4100, 11200, 21500],
      ];

      // INTERNATIONAL FLIGHTS
      const intlFlights = [
        ['Boing Boing Air', 'BB-777', 'INTERNATIONAL', 'Delhi', 'Indira Gandhi Intl (DEL)', 'London', 'Heathrow Airport (LHR)', '03:30 PM', '09:00 PM', 35000, 75000, 150000],
        ['Air India', 'AI-301', 'INTERNATIONAL', 'Mumbai', 'Chhatrapati Shivaji Intl (BOM)', 'Dubai', 'Dubai Intl Airport (DXB)', '11:00 PM', '01:30 AM', 14000, 35000, 72000],
        ['IndiGo', '6E-89', 'INTERNATIONAL', 'Delhi', 'Indira Gandhi Intl (DEL)', 'Singapore', 'Changi Airport (SIN)', '08:00 AM', '02:45 PM', 18000, 45000, 92000],
        ['Boing Boing Air', 'BB-900', 'INTERNATIONAL', 'Mumbai', 'Chhatrapati Shivaji Intl (BOM)', 'New York', 'JFK Intl Airport (JFK)', '01:30 AM', '07:00 AM', 55000, 120000, 240000],
        ['Air India', 'AI-143', 'INTERNATIONAL', 'Delhi', 'Indira Gandhi Intl (DEL)', 'Paris', 'Charles de Gaulle Airport (CDG)', '02:15 AM', '07:30 AM', 40000, 88000, 175000],
        ['Vistara', 'UK-160', 'INTERNATIONAL', 'Bangalore', 'Kempegowda Intl (BLR)', 'Bangkok', 'Suvarnabhumi Airport (BKK)', '10:30 PM', '04:45 AM', 15000, 38000, 78000],
        ['Boing Boing Air', 'BB-440', 'INTERNATIONAL', 'Delhi', 'Indira Gandhi Intl (DEL)', 'Toronto', 'Pearson Intl Airport (YYZ)', '11:55 PM', '05:30 AM', 52000, 115000, 230000],
        ['Air India', 'AI-307', 'INTERNATIONAL', 'Mumbai', 'Chhatrapati Shivaji Intl (BOM)', 'Tokyo', 'Narita Intl Airport (NRT)', '09:30 PM', '08:15 AM', 48000, 105000, 210000],
        ['Boing Boing Air', 'BB-620', 'INTERNATIONAL', 'Delhi', 'Indira Gandhi Intl (DEL)', 'Sydney', 'Kingsford Smith Airport (SYD)', '06:45 AM', '07:30 PM', 62000, 135000, 270000],
        ['IndiGo', '6E-77', 'INTERNATIONAL', 'Kolkata', 'Netaji SC Bose Intl (CCU)', 'Bangkok', 'Suvarnabhumi Airport (BKK)', '11:30 PM', '04:30 AM', 13500, 34000, 70000],
        ['Vistara', 'UK-065', 'INTERNATIONAL', 'Mumbai', 'Chhatrapati Shivaji Intl (BOM)', 'Frankfurt', 'Frankfurt Airport (FRA)', '12:30 AM', '07:15 AM', 38000, 82000, 165000],
        ['Air India', 'AI-659', 'INTERNATIONAL', 'Delhi', 'Indira Gandhi Intl (DEL)', 'Nairobi', 'Jomo Kenyatta Intl (NBO)', '04:00 AM', '10:30 AM', 25000, 58000, 115000],
        ['Boing Boing Air', 'BB-550', 'INTERNATIONAL', 'Mumbai', 'Chhatrapati Shivaji Intl (BOM)', 'Kuala Lumpur', 'KLIA Airport (KUL)', '07:15 PM', '01:00 AM', 16000, 40000, 82000],
        ['IndiGo', '6E-120', 'INTERNATIONAL', 'Bangalore', 'Kempegowda Intl (BLR)', 'Abu Dhabi', 'Abu Dhabi Intl (AUH)', '09:00 PM', '11:30 PM', 12500, 32000, 65000],
        ['Boing Boing Air', 'BB-210', 'INTERNATIONAL', 'Delhi', 'Indira Gandhi Intl (DEL)', 'Amsterdam', 'Amsterdam Schiphol (AMS)', '01:45 AM', '07:30 AM', 37000, 80000, 160000],
      ];

      const allFlights = [...domesticFlights, ...intlFlights];
      for (const f of allFlights) {
        await db.query(
          'INSERT INTO flight (f_name,f_code,flight_type,source,source_airport,destination,dest_airport,departure_time,arrival_time,price_economy,price_business,price_first) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
          f
        );
      }
      console.log('Seeded 30 flights (15 domestic + 15 international).');
    }

    // 4. reservation table
    await db.query(`
      CREATE TABLE IF NOT EXISTS reservation (
        PNR              VARCHAR(255) PRIMARY KEY,
        TICKET           VARCHAR(255),
        aadhar           VARCHAR(255),
        name             VARCHAR(255),
        nationality      VARCHAR(255),
        flightname       VARCHAR(255),
        flightcode       VARCHAR(255),
        src              VARCHAR(255),
        dest             VARCHAR(255),
        ddate            VARCHAR(255),
        return_date      VARCHAR(255),
        ticket_type      VARCHAR(30),
        cabin_class      VARCHAR(255) DEFAULT 'ECONOMY',
        seat_number      VARCHAR(255),
        meal_included    TINYINT(1)   DEFAULT 0,
        wifi_included    TINYINT(1)   DEFAULT 0,
        total_price      INT          DEFAULT 0,
        payment_method   VARCHAR(50),
        payment_status   VARCHAR(30)  DEFAULT 'PENDING',
        passport_no      VARCHAR(100),
        coupon_code      VARCHAR(50),
        discount_amount  INT          DEFAULT 0,
        flight_type      VARCHAR(20)  DEFAULT 'DOMESTIC'
      )
    `);
    const resAlters = [
      "ALTER TABLE reservation ADD COLUMN cabin_class VARCHAR(255) DEFAULT 'ECONOMY'",
      "ALTER TABLE reservation ADD COLUMN seat_number VARCHAR(255)",
      "ALTER TABLE reservation ADD COLUMN meal_included TINYINT(1) DEFAULT 0",
      "ALTER TABLE reservation ADD COLUMN wifi_included TINYINT(1) DEFAULT 0",
      "ALTER TABLE reservation ADD COLUMN total_price INT DEFAULT 0",
      "ALTER TABLE reservation ADD COLUMN payment_method VARCHAR(50)",
      "ALTER TABLE reservation ADD COLUMN payment_status VARCHAR(30) DEFAULT 'PENDING'",
      "ALTER TABLE reservation ADD COLUMN passport_no VARCHAR(100)",
      "ALTER TABLE reservation ADD COLUMN coupon_code VARCHAR(50)",
      "ALTER TABLE reservation ADD COLUMN discount_amount INT DEFAULT 0",
      "ALTER TABLE reservation ADD COLUMN flight_type VARCHAR(20) DEFAULT 'DOMESTIC'",
      "ALTER TABLE reservation ADD COLUMN return_date VARCHAR(255)",
      "ALTER TABLE reservation ADD COLUMN ticket_type VARCHAR(30)",
      "ALTER TABLE reservation ADD COLUMN extra_luggage INT DEFAULT 0",
      "ALTER TABLE reservation MODIFY COLUMN PNR VARCHAR(255)",
      "ALTER TABLE reservation MODIFY COLUMN TICKET VARCHAR(255)",
      "ALTER TABLE reservation MODIFY COLUMN name VARCHAR(255)",
      "ALTER TABLE reservation MODIFY COLUMN nationality VARCHAR(255)",
      "ALTER TABLE reservation MODIFY COLUMN flightname VARCHAR(255)",
      "ALTER TABLE reservation MODIFY COLUMN src VARCHAR(255)",
      "ALTER TABLE reservation MODIFY COLUMN dest VARCHAR(255)",
      "ALTER TABLE reservation MODIFY COLUMN seat_number VARCHAR(255)",
      "ALTER TABLE reservation MODIFY COLUMN cabin_class VARCHAR(255) DEFAULT 'ECONOMY'"
    ];
    for (const sql of resAlters) { try { await db.query(sql); } catch (e) { } }

    // 5. coupons table
    await db.query(`
      CREATE TABLE IF NOT EXISTS coupons (
        code             VARCHAR(50) PRIMARY KEY,
        discount_percent INT,
        description      VARCHAR(255),
        valid_until      VARCHAR(20)
      )
    `);
    const [coupons] = await db.query("SELECT COUNT(*) as cnt FROM coupons");
    if (coupons[0].cnt === 0) {
      const defaultCoupons = [
        ['BOING10', 10, '10% off your first booking', '2027-12-31'],
        ['SUMMER20', 20, '20% summer sale discount', '2026-09-30'],
        ['INTL15', 15, '15% off international flights', '2027-06-30'],
        ['WELCOME5', 5, '5% welcome bonus', '2027-12-31'],
        ['BUSINESS25', 25, '25% off business class bookings', '2026-12-31'],
      ];
      for (const c of defaultCoupons) {
        await db.query("INSERT INTO coupons (code, discount_percent, description, valid_until) VALUES (?,?,?,?)", c);
      }
    }

    // 6. cancel table
    await db.query(`
      CREATE TABLE IF NOT EXISTS cancel (
        pnr         VARCHAR(255) PRIMARY KEY,
        name        VARCHAR(255),
        cancelno    VARCHAR(255),
        fcode       VARCHAR(255),
        ddate       VARCHAR(255),
        refund_amount INT DEFAULT 0
      )
    `);
    try { await db.query("ALTER TABLE cancel ADD COLUMN refund_amount INT DEFAULT 0"); } catch (e) { }
    try { await db.query("ALTER TABLE cancel MODIFY COLUMN pnr VARCHAR(255)"); } catch (e) { }
    try { await db.query("ALTER TABLE cancel MODIFY COLUMN name VARCHAR(255)"); } catch (e) { }
    try { await db.query("ALTER TABLE cancel MODIFY COLUMN cancelno VARCHAR(255)"); } catch (e) { }
    try { await db.query("ALTER TABLE cancel MODIFY COLUMN fcode VARCHAR(255)"); } catch (e) { }

    console.log('Database initialization completed.');
  } catch (error) {
    console.error('Database initialization error:', error.message);
  }
};

initDb();

// ============================================================
// ROUTES
// ============================================================

// 1. Admin Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ success: false, message: 'Please provide both username and password' });
  try {
    const [rows] = await db.query('SELECT * FROM login WHERE username=? AND password=?', [username, password]);
    if (rows.length > 0) return res.json({ success: true, message: 'Login successful', user: { username } });
    return res.status(401).json({ success: false, message: 'INVALID USERNAME OR PASSWORD' });
  } catch (e) { return res.status(500).json({ success: false, message: 'Internal Server Error' }); }
});

// 1.1 Register
app.post('/api/register', async (req, res) => {
  const { username, password, securityQuestion, securityAnswer } = req.body;
  if (!username || !password || !securityQuestion || !securityAnswer)
    return res.status(400).json({ success: false, message: 'All fields are required' });
  try {
    const [ex] = await db.query('SELECT username FROM login WHERE username=?', [username]);
    if (ex.length > 0) return res.status(400).json({ success: false, message: 'Username already exists' });
    await db.query('INSERT INTO login (username,password,security_question,security_answer) VALUES (?,?,?,?)',
      [username, password, securityQuestion, securityAnswer]);
    return res.status(201).json({ success: true, message: 'Account created. You can now log in.' });
  } catch (e) { return res.status(500).json({ success: false, message: 'Internal Server Error' }); }
});

// 1.2 Forgot password - get question
app.post('/api/forgot-password/question', async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ success: false, message: 'Username is required' });
  try {
    const [rows] = await db.query('SELECT security_question FROM login WHERE username=?', [username]);
    if (rows.length > 0) return res.json({ success: true, securityQuestion: rows[0].security_question || 'What is your favorite airline?' });
    return res.status(404).json({ success: false, message: 'Username not found' });
  } catch (e) { return res.status(500).json({ success: false, message: 'Internal Server Error' }); }
});

// 1.3 Forgot password - reset
app.post('/api/forgot-password/reset', async (req, res) => {
  const { username, securityAnswer, newPassword } = req.body;
  if (!username || !securityAnswer || !newPassword)
    return res.status(400).json({ success: false, message: 'All fields are required' });
  try {
    const [rows] = await db.query('SELECT security_answer FROM login WHERE username=?', [username]);
    if (rows.length > 0 && rows[0].security_answer?.toLowerCase().trim() === securityAnswer.toLowerCase().trim()) {
      await db.query('UPDATE login SET password=? WHERE username=?', [newPassword, username]);
      return res.json({ success: true, message: 'Password reset successfully.' });
    }
    return res.status(400).json({ success: false, message: 'Incorrect security answer' });
  } catch (e) { return res.status(500).json({ success: false, message: 'Internal Server Error' }); }
});

// 2. Fetch all flights
app.get('/api/flights', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM flight ORDER BY flight_type, departure_time');
    return res.json(rows);
  } catch (e) { return res.status(500).json({ success: false, message: 'Internal Server Error' }); }
});

// 3. Add / Update passenger
app.post('/api/passengers', async (req, res) => {
  const { name, nationality, phone, address, aadhar, gender, date_of_birth, emergency_contact,
    passport_no, passport_expiry, passport_country, is_international } = req.body;
  if (!name || !aadhar) return res.status(400).json({ success: false, message: 'Name and Aadhar ID are required' });
  try {
    const [ex] = await db.query('SELECT aadhar FROM passenger WHERE aadhar=?', [aadhar]);
    if (ex.length > 0) {
      await db.query(
        'UPDATE passenger SET name=?,nationality=?,phone=?,address=?,gender=?,date_of_birth=?,emergency_contact=?,passport_no=?,passport_expiry=?,passport_country=?,is_international=? WHERE aadhar=?',
        [name, nationality, phone, address, gender, date_of_birth || null, emergency_contact || null,
          passport_no || null, passport_expiry || null, passport_country || null, is_international ? 1 : 0, aadhar]
      );
      return res.json({ success: true, message: 'CUSTOMER DETAILS UPDATED SUCCESSFULLY' });
    } else {
      await db.query(
        'INSERT INTO passenger (name,nationality,phone,address,aadhar,gender,date_of_birth,emergency_contact,passport_no,passport_expiry,passport_country,is_international) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
        [name, nationality, phone, address, aadhar, gender, date_of_birth || null, emergency_contact || null,
          passport_no || null, passport_expiry || null, passport_country || null, is_international ? 1 : 0]
      );
      return res.status(201).json({ success: true, message: 'CUSTOMER DETAILS ADDED SUCCESSFULLY' });
    }
  } catch (e) { return res.status(500).json({ success: false, message: 'Internal Server Error' }); }
});

// 4. Fetch passenger by Aadhar
app.get('/api/passengers/:aadhar', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM passenger WHERE aadhar=?', [req.params.aadhar]);
    if (rows.length > 0) return res.json({ success: true, passenger: rows[0] });
    return res.status(404).json({ success: false, message: 'PASSENGER NOT FOUND' });
  } catch (e) { return res.status(500).json({ success: false, message: 'Internal Server Error' }); }
});

// 5. Search flights by source + destination
app.get('/api/flights/search', async (req, res) => {
  const { source, destination, type } = req.query;
  if (!source || !destination) return res.status(400).json({ success: false, message: 'Source and destination are required' });
  try {
    let q = 'SELECT * FROM flight WHERE source=? AND destination=?';
    const params = [source, destination];
    if (type) { q += ' AND flight_type=?'; params.push(type); }
    const [rows] = await db.query(q, params);
    if (rows.length > 0) return res.json({ success: true, flights: rows });
    return res.status(404).json({ success: false, message: 'NO FLIGHTS FOUND' });
  } catch (e) { return res.status(500).json({ success: false, message: 'Internal Server Error' }); }
});

// 6. Book reservation
app.post('/api/reservations', async (req, res) => {
  const { aadhar, name, nationality, flightname, flightcode, source, destination, date,
    ticketType, returnDate, cabinClass, seatNumber, mealIncluded, wifiIncluded,
    totalPrice, paymentMethod, passportNo, couponCode, discountAmount, flightType, extraLuggage } = req.body;
  if (!aadhar || !name || !flightcode || !source || !destination || !date)
    return res.status(400).json({ success: false, message: 'Incomplete booking details' });
  try {
    const pnr = `PNR-${Math.floor(100000 + Math.random() * 900000)}`;
    const ticket = `TIC-${Math.floor(1000 + Math.random() * 9000)}`;
    await db.query(
      `INSERT INTO reservation
        (PNR,TICKET,aadhar,name,nationality,flightname,flightcode,src,dest,ddate,return_date,ticket_type,
         cabin_class,seat_number,meal_included,wifi_included,total_price,payment_method,payment_status,
         passport_no,coupon_code,discount_amount,flight_type,extra_luggage)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [pnr, ticket, aadhar, name, nationality, flightname, flightcode, source, destination, date,
        returnDate || null, ticketType || 'ONE-WAY', cabinClass || 'ECONOMY', seatNumber || null,
        mealIncluded ? 1 : 0, wifiIncluded ? 1 : 0, totalPrice || 0, paymentMethod || 'COUNTER',
        paymentMethod === 'COUNTER' ? 'PENDING' : 'PAID', passportNo || null,
        couponCode || null, discountAmount || 0, flightType || 'DOMESTIC', extraLuggage || 0]
    );
    return res.status(201).json({ success: true, message: 'TICKET BOOKED', pnr, ticket });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// 7. Get reservation by PNR
app.get('/api/reservations/:pnr', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM reservation WHERE PNR=?', [req.params.pnr]);
    if (rows.length > 0) return res.json({ success: true, reservation: rows[0] });
    return res.status(404).json({ success: false, message: 'NO RESERVATION FOUND' });
  } catch (e) { return res.status(500).json({ success: false, message: 'Internal Server Error' }); }
});

// 8. Get all reservations for a passenger (by Aadhar)
app.get('/api/reservations/passenger/:aadhar', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM reservation WHERE aadhar=? ORDER BY ddate DESC', [req.params.aadhar]
    );
    return res.json({ success: true, reservations: rows });
  } catch (e) { return res.status(500).json({ success: false, message: 'Internal Server Error' }); }
});

// 9. Update reservation
app.put('/api/reservations/:pnr', async (req, res) => {
  const { ddate, return_date, cabin_class, seat_number, meal_included, wifi_included } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE reservation SET ddate=?,return_date=?,cabin_class=?,seat_number=?,meal_included=?,wifi_included=? WHERE PNR=?',
      [ddate, return_date || null, cabin_class, seat_number, meal_included ? 1 : 0, wifi_included ? 1 : 0, req.params.pnr]
    );
    if (result.affectedRows > 0) return res.json({ success: true, message: 'Booking updated' });
    return res.status(404).json({ success: false, message: 'Reservation not found' });
  } catch (e) { return res.status(500).json({ success: false, message: 'Internal Server Error' }); }
});

// 10. Cancel reservation (with refund)
app.post('/api/reservations/cancel', async (req, res) => {
  const { pnr, name, cancelno, fcode, date, refundAmount } = req.body;
  if (!pnr || !name) return res.status(400).json({ success: false, message: 'PNR and name required' });
  try {
    await db.query(
      'INSERT INTO cancel (pnr,name,cancelno,fcode,ddate,refund_amount) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE refund_amount=VALUES(refund_amount)',
      [pnr, name, cancelno, fcode, date, refundAmount || 0]
    );
    const [result] = await db.query('DELETE FROM reservation WHERE PNR=?', [pnr]);
    if (result.affectedRows > 0) return res.json({ success: true, message: 'TICKET CANCELLED', refundAmount });
    return res.status(404).json({ success: false, message: 'Reservation not found' });
  } catch (e) { return res.status(500).json({ success: false, message: 'Internal Server Error' }); }
});

// 11. Validate coupon
app.post('/api/coupons/validate', async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ success: false, message: 'Coupon code required' });
  try {
    const [rows] = await db.query('SELECT * FROM coupons WHERE code=?', [code.toUpperCase()]);
    if (rows.length > 0) {
      const c = rows[0];
      const today = new Date().toISOString().split('T')[0];
      if (c.valid_until && c.valid_until < today)
        return res.status(400).json({ success: false, message: 'Coupon has expired' });
      return res.json({ success: true, coupon: c });
    }
    return res.status(404).json({ success: false, message: 'Invalid coupon code' });
  } catch (e) { return res.status(500).json({ success: false, message: 'Internal Server Error' }); }
});

app.get('/', (req, res) => {
  res.send('✈️ BOING-BOING AIRLINES BACKEND SERVER IS RUNNING SUCCESSFULLY! ✈️');
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
