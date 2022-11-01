interface SeenBy {
    nodeUid: string,
    rssi: number,
    timestamp: Date
}

export default class BluetoothDevice {
    constructor(
        public hashedAddress: string,
        public uid: string,
        public seenBy: SeenBy[]
    ) {}



}