const {Pool} = require("pg");
const env = require("./env");

const pool = new Pool({
    connectionString:env.database.url,
});
pool.on("error",(error)=>{
    console.error("unexpected postgreSQL error:",error);
});
module.exports = pool;