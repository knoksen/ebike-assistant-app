/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_API_URL?: string
	readonly VITE_WEATHER_API_KEY?: string
	readonly VITE_MAPS_API_KEY?: string
	readonly VITE_ELEVATION_API_KEY?: string
	readonly VITE_TRAFFIC_API_KEY?: string
	readonly VITE_COMMUNITY_API_KEY?: string
	readonly VITE_WS_URL?: string
	readonly BASE_URL?: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}

// Minimal Web Bluetooth type shims (only parts we use)
interface BluetoothRemoteGATTCharacteristic {
	uuid: string
	service: BluetoothRemoteGATTService
	startNotifications(): Promise<BluetoothRemoteGATTCharacteristic>
	writeValue(data: BufferSource): Promise<void>
	readValue(): Promise<DataView>
	addEventListener(type: 'characteristicvaluechanged', listener: (event: Event) => void): void
	value?: DataView
}

interface BluetoothRemoteGATTService {
	uuid: string
	getCharacteristic(characteristicUUID: string): Promise<BluetoothRemoteGATTCharacteristic>
}

interface BluetoothRemoteGATTServer {
	device: BluetoothDevice
	connect(): Promise<BluetoothRemoteGATTServer>
	getPrimaryService(serviceUUID: string): Promise<BluetoothRemoteGATTService>
}

interface BluetoothDevice {
	id: string
	name?: string
	gatt?: BluetoothRemoteGATTServer
	addEventListener(type: 'gattserverdisconnected', listener: (event: Event) => void): void
}

interface Bluetooth {
	requestDevice(options: any): Promise<BluetoothDevice>
	getDevices(): Promise<BluetoothDevice[]>
}

interface Navigator {
	bluetooth: Bluetooth
	serial?: any
}
