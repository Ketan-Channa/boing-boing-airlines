import mysql from 'mysql2/promise';

async function test() {
  try {
    const db = mysql.createPool({
      host    : 'localhost',
      user    : 'root',
      password: 'Kets.8865',
      database: 'airlinemanagementsystem',
    });

    const [rows] = await db.query('DESCRIBE passenger');
    console.log("Passenger table schema:", rows);

    try {
      await db.query(
        'INSERT INTO passenger (name,nationality,phone,address,aadhar,gender,date_of_birth,emergency_contact,passport_no,passport_expiry,passport_country,is_international) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
        ['John Doe','Indian','9999999999','123 Long Address Avenue, City, State, 123456','123412341234','Male','1990-01-01','Jane Doe - 8888888888','A1234567','2030-01-01','India',0]
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
