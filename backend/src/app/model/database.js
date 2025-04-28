const Mysql = require("mysql2");
const pool = Mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "movie"
})
const db = pool.promise()
module.exports = db