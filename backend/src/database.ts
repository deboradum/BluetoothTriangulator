import { Pool } from 'pg'
import 'dotenv/config'

const pool = new Pool({
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    user: process.env.PG_USER,
    port: parseInt(process.env.PG_PORT!),
    password: process.env.PG_PASSWORD,
    ssl: {
        rejectUnauthorized: false
    }
})

export default pool