// load libraries
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const bodyParser = require('body-parser')
const mysql = require('mysql2/promise')
const secure = require('secure-env')

// retrieve env variables
global.env = secure({secret: process.env.ENV_PASSWORD})

// declare variables
const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000

// declare an instance of express
const app = express()

// create a pool
const pool = mysql.createPool({
    host: global.env.SQL_HOST,
    port: global.env.SQL_PORT,
    user: global.env.SQL_USER,
    password: global.env.SQL_PASS,
    database: global.env.SQL_SCHEMA,
    connectionLimit: global.env.SQL_CON_LIMIT
})

// use cors header
app.use(cors())

// log requests with morgan
app.use(morgan('combined'))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

// SQL Statements
const SELECT_FROM_CUSTOMERS = "SELECT id, RTRIM(LTRIM(CONCAT(first_name,' ',last_name))) AS name FROM customers";
const SELECT_FROM_EMPLOYEES = "SELECT id, RTRIM(LTRIM(CONCAT(first_name,' ',last_name))) AS name FROM employees";
const SELECT_FROM_SHIPPERS = "SELECT id, company as name FROM shippers";
const SELECT_FROM_PRODUCTS = "SELECT id, product_name as name, list_price, quantity_per_unit as qty_per_unit FROM products";

mkQuery = (SQL, POOL) => {
    return async (PARAMS) => {
        // get a connection from pool
        const conn = await POOL.getConnection()
        try {
            // Execute the query
            const results = await conn.query(SQL, PARAMS)
            return results[0]
        } catch (e) {
            return Promise.reject(e)
        } finally {
            conn.release()
        }
    }
}

const QUERY_CUSTOMERS = mkQuery(SELECT_FROM_CUSTOMERS, pool);
const QUERY_EMPLOYEES = mkQuery(SELECT_FROM_EMPLOYEES, pool);
const QUERY_SHIPPERS = mkQuery(SELECT_FROM_SHIPPERS, pool);
const QUERY_PRODUCTS = mkQuery(SELECT_FROM_PRODUCTS, pool);

app.get('/api/data/:type', async (req, resp) => {
    const type = req.params.type
    resp.type('application/json')
    resp.status(200)
    switch (type) {
        case 'customers': {
            resp.json(await QUERY_CUSTOMERS());
            break;
        }
        case 'employees': {
            resp.json(await QUERY_EMPLOYEES());
            break;
        }
        case 'shippers': {
            resp.json(await QUERY_SHIPPERS());
            break;
        }
        case 'products': {
            resp.json(await QUERY_PRODUCTS());
            break;
        }
        default: {
            resp.json({});
            break;
        }
    }
    
})

pool.getConnection()
.then(conn => {
    conn.ping()
    console.info('Pinging for database...')
    return conn
    })
    .then (conn => {
        conn.release()
        console.info('Pinging successful...')
        app.listen(PORT, () => {
            console.info(`Application is listening PORT ${PORT} at ${new Date()}.`)
        })
    })