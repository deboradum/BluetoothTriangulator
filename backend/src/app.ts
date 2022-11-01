import express from 'express'
import router from './routes'
import cors from 'cors'

import 'dotenv/config'
import path from 'path'
import pool from './database'
import { ReadlineParser, SerialPort } from 'serialport'

import { uploadBLData } from './services/database.service'

const PORT = process.env.PORT || 8000
const app = express()

const serial = new SerialPort({
    path: '/dev/ttyUSB0',
    baudRate: 115200
})

const parser = serial.pipe(new ReadlineParser({ delimiter: '\n' }))
parser.on('data', async (data) => {
    try {
        await uploadBLData(JSON.parse(data))
    } catch (e) {

    }
})

app.use(cors({ origin: process.env.URL }))
if (process.env.NODE_ENV === 'development') {
}

app.use(express.json())
app.use('/api', router)

if (process.env.NODE_ENV === 'production') {
    app.use(express.static('../frontend/build'))
    app.get(['/', '/*'], (req, res) => {
        res.sendFile(path.resolve(__dirname, '../../frontend', 'build', 'index.html'))
    })
} else {
}

app.listen(PORT, () => {
    console.log(`Running on port ${PORT}`)
})

if (process.env.NODE_ENV === 'production') {
    setInterval(() => {
        pool.query(`TRUNCATE device_seen_by_node, bluetooth_device`)
    }, 600000)
}