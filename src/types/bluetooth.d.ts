declare interface BluetoothDevice {
  id: string
  name: string | null
  gatt?: {
    connect(): Promise<BluetoothRemoteGATTServer>
  }
}

declare interface BluetoothRemoteGATTServer {
  connected: boolean
  device: BluetoothDevice
  connect(): Promise<BluetoothRemoteGATTServer>
  disconnect(): void
  getPrimaryService(uuid: string): Promise<BluetoothRemoteGATTService>
  getPrimaryServices(uuid?: string): Promise<BluetoothRemoteGATTService[]>
}

declare interface BluetoothRemoteGATTService {
  uuid: string
  device: BluetoothDevice
  getCharacteristic(uuid: string): Promise<BluetoothRemoteGATTCharacteristic>
  getCharacteristics(uuid?: string): Promise<BluetoothRemoteGATTCharacteristic[]>
}

declare interface BluetoothRemoteGATTCharacteristic {
  uuid: string
  service: BluetoothRemoteGATTService
  properties: BluetoothCharacteristicProperties
  value: DataView | null
  getDescriptor(uuid: string): Promise<BluetoothRemoteGATTDescriptor>
  getDescriptors(): Promise<BluetoothRemoteGATTDescriptor[]>
  readValue(): Promise<DataView>
  writeValue(value: BufferSource): Promise<void>
  startNotifications(): Promise<BluetoothRemoteGATTCharacteristic>
  stopNotifications(): Promise<BluetoothRemoteGATTCharacteristic>
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void
}

declare interface BluetoothCharacteristicProperties {
  broadcast: boolean
  read: boolean
  writeWithoutResponse: boolean
  write: boolean
  notify: boolean
  indicate: boolean
  authenticatedSignedWrites: boolean
  reliableWrite: boolean
  writableAuxiliaries: boolean
}

declare interface Navigator {
  bluetooth: {
    getAvailability(): Promise<boolean>
    requestDevice(options: {
      filters?: Array<{
        services?: string[]
        name?: string
        namePrefix?: string
        manufacturerId?: number
        serviceData?: { [key: string]: DataView }
      }>,
      optionalServices?: string[],
      acceptAllDevices?: boolean
    }): Promise<BluetoothDevice>
    getDevices(): Promise<BluetoothDevice[]>
  }
  serial: {
    requestPort(): Promise<any>
  }
}
