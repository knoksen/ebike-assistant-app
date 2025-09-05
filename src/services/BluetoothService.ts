// BluetoothService.ts - Handles BLE connectivity and device communication
import { log } from './logger';

// Minimal Web Bluetooth type shims (avoid full lib dependency)
interface GATTServerLike {
  getPrimaryService(uuid: string): Promise<GATTServiceLike>;
  disconnect?: () => void;
}
interface GATTServiceLike {
  uuid: string;
  getCharacteristic(uuid: string): Promise<GATTCharacteristicLike>;
}
interface GATTCharacteristicLike {
  startNotifications(): Promise<void>;
  addEventListener(event: string, cb: (e: Event) => void): void;
  readValue?: () => Promise<DataView>;
}
export interface BLEDeviceInfo {
  id: string;
  name: string;
  connected: boolean;
  rssi?: number;
  batteryInfo?: BatteryInfo;
  telemetry?: TelemetryData;
}

export interface BatteryInfo {
  totalVoltage: number;
  totalCurrent: number;
  remainingCapacity: number;
  numberOfCells: number;
  cellVoltages: number[];
  temperature: number;
  charging: boolean;
}

export interface TelemetryData {
  speed: number;
  totalMileage: number;
  power: number;
  temperature: number;
  errorCode?: number;
  cruiseControlActive: boolean;
}

export class BluetoothService {
  private static instance: BluetoothService;
  // Using minimal structural types instead of 'any'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private device: any | null = null;
  private server: GATTServerLike | null = null;
  private characteristic: GATTCharacteristicLike | null = null;

  // Xiaomi service and characteristic UUIDs
  private readonly XIAOMI_SERVICE_UUID = '0000fe95-0000-1000-8000-00805f9b34fb';
  private readonly NORDIC_UART_SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
  private readonly NORDIC_UART_TX_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
  private readonly NORDIC_UART_RX_UUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';
  private readonly CCCD_UUID = '00002902-0000-1000-8000-00805f9b34fb';

  private connectionListeners: Array<(connected: boolean) => void> = [];
  private telemetryListeners: Array<(data: TelemetryData) => void> = [];

  private constructor() {
    if (!navigator.bluetooth) {
      log.error('Bluetooth API is not available in this browser/environment');
    }
  }

  public static getInstance(): BluetoothService {
    if (!BluetoothService.instance) {
      BluetoothService.instance = new BluetoothService();
    }
    return BluetoothService.instance;
  }

  public async requestDevice(): Promise<boolean> {
    try {
      this.device = await navigator.bluetooth.requestDevice({
        filters: [
          {
            services: [this.XIAOMI_SERVICE_UUID]
          },
          {
            services: [this.NORDIC_UART_SERVICE_UUID]
          }
        ],
        optionalServices: [this.XIAOMI_SERVICE_UUID, this.NORDIC_UART_SERVICE_UUID]
      });

      this.device.addEventListener('gattserverdisconnected', this.onDisconnected.bind(this));
      return true;
    } catch (error) {
      log.error('Error requesting device:', error);
      return false;
    }
  }

  public async connect(): Promise<boolean> {
    if (!this.device) {
      log.error('No device selected');
      return false;
    }

    try {
      this.server = await this.device.gatt?.connect();
      if (!this.server) {
        throw new Error('Could not connect to GATT server');
      }

      // Try Xiaomi service first, then fall back to Nordic UART
      let service = await this.server.getPrimaryService(this.XIAOMI_SERVICE_UUID)
        .catch(() => this.server!.getPrimaryService(this.NORDIC_UART_SERVICE_UUID));

      if (service.uuid === this.XIAOMI_SERVICE_UUID) {
        // Initialize Xiaomi ECDH authentication
        await this.initializeXiaomiAuth();
      }

      // Subscribe to notifications
      this.characteristic = await this.setupNotifications(service);
      
      this.notifyConnectionListeners(true);
      return true;
    } catch (error) {
      log.error('Error connecting to device:', error);
      this.notifyConnectionListeners(false);
      return false;
    }
  }

  private async setupNotifications(service: GATTServiceLike): Promise<GATTCharacteristicLike> {
    const characteristic = await service.getCharacteristic(
      service.uuid === this.XIAOMI_SERVICE_UUID ? this.XIAOMI_SERVICE_UUID : this.NORDIC_UART_RX_UUID
    );

    await characteristic.startNotifications();
    characteristic.addEventListener('characteristicvaluechanged', this.handleNotification.bind(this));
    return characteristic;
  }

  private async initializeXiaomiAuth(): Promise<void> {
    // Implement Xiaomi ECDH authentication
    // This is a placeholder for the actual implementation based on XiaomiECDH.kt
    try {
      // 1. Generate key pair
      // 2. Send public key
      // 3. Receive and verify response
      // 4. Establish secure session
  log.debug('Xiaomi authentication initialized');
    } catch (error) {
  log.error('Error in Xiaomi authentication:', error);
      throw error;
    }
  }

  private handleNotification(event: Event): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value = (event.target as { value?: DataView } | null)?.value;
    if (!value) return;

    // Parse the notification data
    const data = this.parseNotificationData(value);
    if (data) {
      this.notifyTelemetryListeners(data);
    }
  }

  private parseNotificationData(value: DataView): TelemetryData | null {
    try {
      // This is a basic implementation - extend based on actual data format
      return {
        speed: value.getUint16(0, true) / 100, // km/h
        totalMileage: value.getUint32(2, true) / 1000, // km
        power: value.getInt16(6, true), // watts
        temperature: value.getInt8(8), // celsius
        errorCode: value.getUint8(9),
        cruiseControlActive: Boolean(value.getUint8(10) & 0x01)
      };
    } catch (error) {
      log.error('Error parsing notification data:', error);
      return null;
    }
  }

  private onDisconnected(): void {
    this.server = null;
    this.characteristic = null;
    this.notifyConnectionListeners(false);

    // Attempt to reconnect
    this.reconnect();
  }

  private async reconnect(attempts: number = 3): Promise<void> {
    for (let i = 0; i < attempts; i++) {
      try {
        await this.connect();
        return;
      } catch (error) {
        console.error(`Reconnection attempt ${i + 1} failed:`, error);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s between attempts
      }
    }
  }

  public async disconnect(): Promise<void> {
    if (this.device?.gatt?.connected) {
      await this.device.gatt.disconnect();
    }
  }

  // Event listener management
  public addConnectionListener(listener: (connected: boolean) => void): void {
    this.connectionListeners.push(listener);
  }

  public removeConnectionListener(listener: (connected: boolean) => void): void {
    const index = this.connectionListeners.indexOf(listener);
    if (index > -1) {
      this.connectionListeners.splice(index, 1);
    }
  }

  public addTelemetryListener(listener: (data: TelemetryData) => void): void {
    this.telemetryListeners.push(listener);
  }

  public removeTelemetryListener(listener: (data: TelemetryData) => void): void {
    const index = this.telemetryListeners.indexOf(listener);
    if (index > -1) {
      this.telemetryListeners.splice(index, 1);
    }
  }

  private notifyConnectionListeners(connected: boolean): void {
    this.connectionListeners.forEach(listener => listener(connected));
  }

  private notifyTelemetryListeners(data: TelemetryData): void {
    this.telemetryListeners.forEach(listener => listener(data));
  }

  // Battery management
  public async readBatteryInfo(): Promise<BatteryInfo | null> {
    if (!this.server) return null;

    try {
  const service = await this.server.getPrimaryService(this.XIAOMI_SERVICE_UUID);
  const characteristic = await service.getCharacteristic(this.XIAOMI_SERVICE_UUID);
  const value = characteristic.readValue ? await characteristic.readValue() : undefined;
  if (!value) return null;

      return {
        totalVoltage: value.getUint16(0, true) / 100,
        totalCurrent: value.getInt16(2, true) / 100,
        remainingCapacity: value.getUint16(4, true),
        numberOfCells: value.getUint8(6),
        cellVoltages: Array.from({ length: value.getUint8(6) }, (_, i) => 
          value.getUint16(7 + i * 2, true) / 1000
        ),
        temperature: value.getInt8(value.byteLength - 2),
        charging: Boolean(value.getUint8(value.byteLength - 1) & 0x01)
      };
    } catch (error) {
      log.error('Error reading battery info:', error);
      return null;
    }
  }
}
