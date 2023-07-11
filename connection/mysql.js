const mysql = require("mysql");
const config = require("config");

const pool = mysql.createPool({
  host: config.get("HOST"),
  user: config.get("USER"),
  password: config.get("PASSWORD"),
  database: config.get("DATABASE"),
  port: config.get("MYSQL_PORT"),
});

let query = function (sql, values) {
  return new Promise((resolve, reject) => {
    pool.getConnection(function (err, connection) {
      if (err) {
        reject(err);
      } else {
        console.log("mysql connected!!");
        connection.query(sql, values, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
          connection.release();
        });
      }
    });
  });
};

module.exports = { query };
