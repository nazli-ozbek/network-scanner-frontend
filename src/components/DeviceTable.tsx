import { useEffect, useState } from 'react';
import { fetchDevices, Device } from '@/lib/api';

type DeviceTableProps = {
  ipRange: string;
};

export default function DeviceTable({ ipRange }: DeviceTableProps) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadDevices = async () => {
    try {
      const result = await fetchDevices();
      setDevices(result);
    } catch (err) {
      setError('Failed to fetch devices');
    }
  };

  useEffect(() => {
    loadDevices();

    const interval = setInterval(() => {
      loadDevices();
    }, 5000);

    return () => clearInterval(interval);
  }, [ipRange]);

  return (
    <div className="p-4 mt-8 max-w-4xl mx-auto bg-white rounded shadow-md">
      <h2 className="text-xl font-semibold mb-4">Discovered Devices</h2>
      {error && <p className="text-red-600">{error}</p>}
      {devices.length === 0 ? (
        <p className="text-gray-600">No devices found yet.</p>
      ) : (
        <table className="min-w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2 text-left">IP Address</th>
              <th className="border px-4 py-2 text-left">MAC Address</th>
              <th className="border px-4 py-2 text-left">Hostname</th>
              <th className="border px-4 py-2 text-left">Online</th>
              <th className="border px-4 py-2 text-left">Last Seen</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{device.ip_address}</td>
                <td className="border px-4 py-2">{device.mac_address}</td>
                <td className="border px-4 py-2">{device.hostname}</td>
                <td className="border px-4 py-2">
                  <span
                    className={`inline-block w-3 h-3 rounded-full mr-2 ${
                      device.is_online ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  ></span>
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
      )}
    </div>
  );
}
