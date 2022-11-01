import { Router } from 'express'
import pool from '../database'
import BluetoothData from '../models/BluetoothData'
import { uploadBLData } from '../services/database.service'
import cors from 'cors'

const router = Router()

router.get('/', async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT device_seen_by_node.node_id AS node_id, device_seen_by_node.rssi, bluetooth_device.hashed_address, device_seen_by_node.timestamp FROM device_seen_by_node
            JOIN bluetooth_device ON device_id=bluetooth_device.id ORDER BY timestamp`)

        res.json(BluetoothData.parseFromDatabaseToFrontend(rows))
    } catch (e) {
        console.error(e)
    }
})

export default router