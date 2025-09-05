// Navigator extensions for Bluetooth & Serial to reduce 'any' casts
// Ambient declarations merged with lib.dom

interface Navigator {
  bluetooth?: {
    requestDevice(options: RequestDeviceOptions): Promise<BluetoothDevice>;
    getDevices(): Promise<BluetoothDevice[]>;
  };
  serial?: {
    requestPort(options?: SerialPortRequestOptions): Promise<SerialPort>;
    getPorts(): Promise<SerialPort[]>;
  };
}

interface RequestDeviceOptions {
  filters?: Array<{ services?: BluetoothServiceUUID[]; namePrefix?: string }>;
  optionalServices?: BluetoothServiceUUID[];
  acceptAllDevices?: boolean;
}

// Minimal Serial types (subset)
interface SerialPortRequestOptions { filters?: Array<Record<string, unknown>> }
interface SerialPort { readable: ReadableStream; open: (opts: { baudRate: number }) => Promise<void> }

// Utility type guards
export function hasBluetooth(n: Navigator): n is Navigator & { bluetooth: NonNullable<Navigator['bluetooth']> } {
  return typeof n.bluetooth !== 'undefined'
}

export function hasSerial(n: Navigator): n is Navigator & { serial: NonNullable<Navigator['serial']> } {
  return typeof n.serial !== 'undefined'
}
