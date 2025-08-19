import { useEffect, useMemo, useState } from 'react';
import { fetchDevices, Device } from '@/lib/api';

type DeviceTableProps = {
  ipRange: string;
};

function ipToInt(ip: string): number {
  const parts = ip.split('.').map((p) => parseInt(p, 10));
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return -1;
  return ((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
}

function isInCidr(ip: string, cidr: string): boolean {
  const [base, prefixStr] = cidr.split('/');
  const prefix = parseInt(prefixStr, 10);
  if (!base || Number.isNaN(prefix) || prefix < 0 || prefix > 32) return false;

  const ipNum = ipToInt(ip);
  const baseNum = ipToInt(base);
  if (ipNum < 0 || baseNum < 0) return false;

  const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
  return (ipNum & mask) === (baseNum & mask);
}

export default function DeviceTable({ ipRange }: DeviceTableProps) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadDevices = async () => {
    try {
      const result = await fetchDevices();
      setDevices(result);
      setError(null);
    } catch (err) {
      setError('Failed to fetch devices');
    }
  };

  useEffect(() => {
    loadDevices();
    const interval = setInterval(loadDevices, 5000);
    return () => clearInterval(interval);
  }, [ipRange]);

  const filtered = useMemo(
    () => devices.filter((d) => isInCidr(d.ip_address, ipRange)),
    [devices, ipRange]
  );

  return (
    <div className="p-4 mt-8 max-w-4xl mx-auto bg-white rounded shadow-md">
      <h2 className="text-xl font-semibold mb-4">Discovered Devices</h2>
      {error && <p className="text-red-600">{error}</p>}

      {filtered.length === 0 ? (
        <p className="text-gray-600">No devices in this subnet yet.</p>
      ) : (
        <div className="max-h-96 overflow-auto rounded border">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="border px-4 py-2 text-left">IP Address</th>
                <th className="border px-4 py-2 text-left">MAC Address</th>
                <th className="border px-4 py-2 text-left">Hostname</th>
                <th className="border px-4 py-2 text-left">Online</th>
                <th className="border px-4 py-2 text-left">Last Seen</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((device, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{device.ip_address}</td>
                  <td className="border px-4 py-2">{device.mac_address}</td>
                  <td className="border px-4 py-2">{device.hostname}</td>
                  <td className="border px-4 py-2">
                    <span
                      className={`inline-block w-3 h-3 rounded-full mr-2 ${
                        device.is_online ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    />
                    {device.is_online ? 'Online' : 'Offline'}
                  </td>
                  <td className="border px-4 py-2">
                    {device.last_seen && new Date(device.last_seen).getFullYear() > 2000
                      ? new Date(device.last_seen).toLocaleString()
                      : 'Not seen yet'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
