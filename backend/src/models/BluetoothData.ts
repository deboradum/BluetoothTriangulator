export default class BluetoothData {
    constructor(
        public nodeId: number,
        public address: string,
        public rssi: number,
    ) {}

    static parseFromDatabaseToFrontend(data: any[]) {
        interface Data {
            hashedAddress: string,
            seenBy: Value[]
        }

        interface Value {
            nodeId: number,
            rssi: number,
            timestamp: Date
        }
        const frontendData: Data[] = []

        for (let i = 0; i < data.length; i++) {
            const element = data[i]

            let foundKey = false

            for (const field of frontendData) {
                if (field.hashedAddress === element.hashed_address) {
                    foundKey = true
                    if (field.seenBy[0].nodeId === element.node_id) {
                        continue
                    }
                    if (field.seenBy.length >= 2) {
                        continue
                    }
                    field.seenBy.push({ nodeId: element.node_id, rssi: element.rssi, timestamp: element.timestamp })
                }
            }

            if (!foundKey) {
                frontendData.push({ hashedAddress: element.hashed_address, seenBy: [{ nodeId: element.node_id, rssi: element.rssi, timestamp: element.timestamp }]})
            }
        }

        return frontendData
    }

    static parseMC(data: any) {
        return new BluetoothData(
            data.nodeId,
            data.address,
            data.rssi
        )
    }
}