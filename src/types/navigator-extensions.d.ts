// Minimal augmentation for Bluetooth & Serial APIs (subset used)
interface Bluetooth {
  requestDevice(options: RequestDeviceOptions): Promise<BluetoothDevice>
  getDevices(): Promise<BluetoothDevice[]>
}

interface RequestDeviceOptions {
  filters?: Array<{ services?: Array<string>; namePrefix?: string }>
  optionalServices?: Array<string>
  acceptAllDevices?: boolean
}

interface SerialPortRequestOptions { filters?: Array<Record<string, unknown>> }
interface SerialPort { readable: ReadableStream; open: (opts: { baudRate: number }) => Promise<void> }
interface Serial { requestPort(options?: SerialPortRequestOptions): Promise<SerialPort>; getPorts?: () => Promise<SerialPort[]> }

interface Navigator { bluetooth?: Bluetooth; serial?: Serial }

export function hasBluetooth(n: unknown): n is Navigator & { bluetooth: Bluetooth } { return typeof (n as any)?.bluetooth !== 'undefined' }
export function hasSerial(n: unknown): n is Navigator & { serial: Serial } { return typeof (n as any)?.serial !== 'undefined' }
