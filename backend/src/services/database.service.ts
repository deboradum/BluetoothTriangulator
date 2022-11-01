import pool from '../database'
import BluetoothData from '../models/BluetoothData'
import crypto from 'crypto'

if (!process.env.HASH_SECRET) {
    console.error('Missing HASH_SECRET environment variable!')
    process.exit(1)
}

// The hasher used to hash our mac addresses.

/** This function uploads the bluetooth data to the database.
 * @param {BluetoothData[]} data Represents the bluetooth data to be uploaded.
 *
 * @throws Database errors.
 */
export async function uploadBLData(data: BluetoothData[]) {
    try {
        for (const element of data) {
            const hasher = crypto.createHmac('sha256', process.env.HASH_SECRET!)
            // Check if the node specified by element.nodeUid exists.
            const nodeExistsResult = await pool.query(`SELECT COUNT(*) AS N FROM node WHERE id = $1`, [element.nodeId])
            if (nodeExistsResult.rows[0].N <= 0) {
                continue
            }

            // Hash the incoming address.
            const hashedAddress = hasher.update(element.address).digest('base64')

            // This query is used to find out if a bluetooth device has been discovered before.
            const { rows } = await pool.query(`SELECT COUNT(*) AS N FROM bluetooth_device WHERE hashed_address = $1`, [hashedAddress])
            // If this if-statement is true it means that a bluetooth device has not been discovered before.
            if (rows[0].n == 0) {
                // Get a client from the database pool so we can create a database transaction.
                const client = await pool.connect()

                try {
                    await client.query('BEGIN')

                    // Create a new row for this bluetooth device.
                    const newDeviceResult = await client.query(`INSERT INTO bluetooth_device (hashed_address) VALUES ($1) RETURNING id`, [hashedAddress])
                    if (!newDeviceResult.rows[0].id) {
                        continue
                    }
                    const deviceId = newDeviceResult.rows[0].id

                    // Create a new row in the device_seen_by_node table.
                    await client.query(`INSERT INTO device_seen_by_node (node_id, device_id, rssi) VALUES ($1, $2, $3)`, [element.nodeId, deviceId, element.rssi])
                    await client.query('COMMIT')
                } catch (e) {
                    await client.query('ROLLBACK')
                }

                client.release()
            } else if (rows[0].n > 0) { // This if-statement is true if the bluetooth device has been discovered before.
                // Get id of the bluetooth device based on the hashed mac address.
                const deviceIdResult = await pool.query(`SELECT id FROM bluetooth_device WHERE hashed_address = $1`, [hashedAddress])
                if (!deviceIdResult.rows[0].id) {
                    continue
                }
                const deviceId = deviceIdResult.rows[0].id

                // Create a new row in the device_seen_by_node table.
                await pool.query(`INSERT INTO device_seen_by_node (node_id, device_id, rssi) VALUES ($1, $2, $3)`, [element.nodeId, deviceId, element.rssi])
            }
        }
    } catch (e) {
        throw e
    }
}