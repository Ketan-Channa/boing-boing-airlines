import mysql from 'mysql2/promise';

async function test() {
  try {
    const db = mysql.createPool({
      host    : 'localhost',
      user    : 'root',
      password: 'Kets.8865',
      database: 'airlinemanagementsystem',
    });

    const [rows] = await db.query('DESCRIBE reservation');
    console.log("Reservation table schema:", rows);

    try {
      const pnr = `PNR-123456`;
      const ticket = `TIC-1234`;
      await db.query(
        `INSERT INTO reservation
          (PNR,TICKET,aadhar,name,nationality,flightname,flightcode,src,dest,ddate,return_date,ticket_type,
           cabin_class,seat_number,meal_included,wifi_included,total_price,payment_method,payment_status,
           passport_no,coupon_code,discount_amount,flight_type)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [pnr,ticket,'123412341234','John Doe','Indian','Air India','AI-101','Delhi','Mumbai','2026-06-20',
         null,'ONE-WAY','ECONOMY','12A',
         0,0,5000,'COUNTER',
         'PENDING',null,
         null,0,'DOMESTIC']
      );
      console.log("Insert successful!");
    } catch(err) {
      console.error("Insert error:", err);
    }
    
    process.exit(0);
  } catch(e) {
    console.error("Connection error:", e);
    process.exit(1);
  }
}

test();
