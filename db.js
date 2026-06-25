const sql = require('mssql');

const config = {

    user: 'sa',
    password: 'Msdsl2012',

    server: '202.4.106.203',
    port:1432,

    database : 'Mbrella_WH',

    options: {
        trustServerCertificate: true,
        encrypt: false
    },
    requestTimeout: 60000,  // 15000 → 60000 (60 seconds)
    connectionTimeout: 30000,
};

const mbrellaPoolPromise = new sql.ConnectionPool(config)
.connect()
.then(pool=>{
    return pool;
    
})
.catch(err=>{
    console.log("db error",err)
})

const config_1 = {

    user: 'sa',
    password: 'Msdsl2012',

    server: 'localhost',
    port:1433,

    database : 'MIS_DB',

    options: {
        trustServerCertificate: true,
        encrypt: false
    },
        requestTimeout: 60000,  // 15000 → 60000 (60 seconds)
    connectionTimeout: 30000,
};

const MIS_DBpoolPromise = new sql.ConnectionPool(config_1)
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
    MIS_DBpoolPromise,
    mbrellaPoolPromise

};