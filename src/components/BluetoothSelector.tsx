import React, { useEffect, useState } from 'react';
import { BluetoothService, type BLEDeviceInfo, type TelemetryData } from '../services/BluetoothService';

interface BluetoothSelectorProps {
  onTelemetryUpdate?: (data: TelemetryData) => void;
}

export function BluetoothSelector({ onTelemetryUpdate }: BluetoothSelectorProps) {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<BLEDeviceInfo | null>(null);

  useEffect(() => {
    // Check if Web Bluetooth is available
  // Narrow usage with minimal cast (Bluetooth API optional)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setIsAvailable(!!(navigator as any).bluetooth);

    const bluetoothService = BluetoothService.getInstance();

    // Set up connection listener
    const handleConnectionChange = (connected: boolean) => {
      setIsConnected(connected);
      setIsConnecting(false);
    };

    // Set up telemetry listener
    const handleTelemetry = (data: TelemetryData) => {
      onTelemetryUpdate?.(data);
      setDeviceInfo(prev => prev ? { ...prev, telemetry: data } : null);
    };

    bluetoothService.addConnectionListener(handleConnectionChange);
    bluetoothService.addTelemetryListener(handleTelemetry);

    return () => {
      bluetoothService.removeConnectionListener(handleConnectionChange);
      bluetoothService.removeTelemetryListener(handleTelemetry);
    };
  }, [onTelemetryUpdate]);

  const handleConnect = async () => {
    setError(null);
    setIsConnecting(true);

    try {
      const bluetoothService = BluetoothService.getInstance();
      const deviceRequested = await bluetoothService.requestDevice();
      
      if (deviceRequested) {
        await bluetoothService.connect();
      } else {
        setError('Device selection was cancelled');
        setIsConnecting(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await BluetoothService.getInstance().disconnect();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect');
    }
  };

  if (!isAvailable) {
    return (
      <div className="text-center p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">
        Web Bluetooth is not available in your browser
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Bluetooth Connection
        </h3>
        <div className="flex items-center space-x-2">
          <span className={`h-3 w-3 rounded-full ${
            isConnected 
              ? 'bg-green-500 animate-pulse' 
              : 'bg-gray-300 dark:bg-gray-600'
          }`} />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      {deviceInfo?.telemetry && (
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">Speed</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {deviceInfo.telemetry.speed.toFixed(1)} km/h
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">Power</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {deviceInfo.telemetry.power} W
            </div>
          </div>
        </div>
      )}

      <button
        onClick={isConnected ? handleDisconnect : handleConnect}
        disabled={isConnecting}
        className={`w-full px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
          isConnected
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isConnecting ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Connecting...
          </span>
        ) : isConnected ? 'Disconnect' : 'Connect Device'}
      </button>
    </div>
  );
}
