import { describe, expect, it } from 'vitest'
import { parseTelemetryData, TelemetryError } from '../../services/BluetoothService'

const buildTelemetryView = (options: {
  speed?: number
  mileage?: number
  power?: number
  temperature?: number
  errorCode?: number
  cruise?: number
  batteryVoltageRaw?: number
  batteryPercent?: number
  length?: number
}) => {
  const {
    speed = 1234,
    mileage = 987654,
    power = -250,
    temperature = 22,
    errorCode = 2,
    cruise = 1,
    batteryVoltageRaw = 5412,
    batteryPercent = 87,
    length = 14
  } = options

  const buffer = new ArrayBuffer(length)
  const view = new DataView(buffer)
  if (length >= 2) view.setUint16(0, speed, true)
  if (length >= 6) view.setUint32(2, mileage, true)
  if (length >= 8) view.setInt16(6, power, true)
  if (length >= 9) view.setInt8(8, temperature)
  if (length >= 10) view.setUint8(9, errorCode)
  if (length >= 11) view.setUint8(10, cruise)
  if (length >= 13) view.setUint16(11, batteryVoltageRaw, true)
  if (length >= 14) view.setUint8(13, batteryPercent)
  return view
}

describe('parseTelemetryData', () => {
  it('parses normalized telemetry fields with battery data', () => {
    const view = buildTelemetryView({})
    const result = parseTelemetryData(view)

    expect(result).not.toBeNull()
    expect(result?.speed).toBeCloseTo(12.34, 2)
    expect(result?.totalMileage).toBeCloseTo(987.654, 3)
    expect(result?.power).toBe(-250)
    expect(result?.temperature).toBe(22)
    expect(result?.errorCode).toBe(2)
    expect(result?.error).toBe(TelemetryError.Battery)
    expect(result?.batteryVoltage).toBeCloseTo(54.12, 2)
    expect(result?.batteryPercent).toBe(87)
    expect(result?.cruiseControlActive).toBe(true)
  })

  it('returns null for short payloads', () => {
    const view = buildTelemetryView({ length: 8 })
    expect(parseTelemetryData(view)).toBeNull()
  })

  it('clamps battery percentage and maps unknown error codes', () => {
    const view = buildTelemetryView({ errorCode: 99, batteryPercent: 150 })
    const result = parseTelemetryData(view)

    expect(result?.error).toBe(TelemetryError.Unknown)
    expect(result?.batteryPercent).toBe(100)
  })
})
