const sql = require('mssql');

const config = {

    user: 'sa',
    password: 'Msdsl2012',

    server: 'localhost',
    port:1433,

    database : 'MIS_DB',

    options: {
        trustServerCertificate: true,
        encrypt: false
    }
};


const poolPromise = new sql.ConnectionPool(config)
.connect()
.then(pool=>{
    // console.log('Database Connected');
    return pool;
})
.catch(err=>{
    console.log('db error:',err)
})

module.exports = {
    sql,
    poolPromise
};