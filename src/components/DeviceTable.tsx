import { useEffect, useMemo, useState } from 'react';
import { fetchDevices, Device, addTagToDevice, removeTagFromDevice} from '@/lib/api';


type DeviceTableProps = { ipRange: string };

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
  const [tagInputs, setTagInputs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);


  const handleAddTag = async (deviceId: string) => {
  const tag = tagInputs[deviceId]?.trim();
  if (!tag) return;
  try {
    await addTagToDevice(deviceId, tag);
    setTagInputs((prev) => ({ ...prev, [deviceId]: '' }));
    loadDevices();
  } catch {
    alert('Failed to add tag');
  }
};

  const handleRemoveTag = async (deviceId: string, tag: string) => {
    try {
      await removeTagFromDevice(deviceId, tag);
      loadDevices();
    } catch {
      alert('Failed to remove tag');
    }
  };


  const loadDevices = async () => {
  setLoading(true);
  try {
    const result = await fetchDevices();
    setDevices(result);
    setError(null);
  } catch {
    setError('Failed to fetch devices');
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    loadDevices();
    const interval = setInterval(loadDevices, 5000);
    return () => clearInterval(interval);
  }, [ipRange]);

  const filtered = useMemo(
  () => (devices || []).filter((d) => isInCidr(d.ip_address, ipRange)),
  [devices, ipRange]
);


  return (
    <div className="p-4 mt-8 max-w-4xl mx-auto bg-white rounded shadow-md">
      <h2 className="text-xl font-semibold mb-4">Discovered Devices</h2>
      {error && <p className="text-red-600">{error}</p>}
      {loading ? (
      <p className="text-gray-600 italic">Loading devices...</p>
    ) : filtered.length === 0 ? (
      <p className="text-gray-600">No devices in this subnet yet.</p>
    ) : (
        <div className="max-h-96 overflow-auto rounded border">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="border px-4 py-2 text-left">ID</th>
                <th className="border px-4 py-2 text-left">IP Address</th>
                <th className="border px-4 py-2 text-left">MAC Address</th>
                <th className="border px-4 py-2 text-left">Hostname</th>
                <th className="border px-4 py-2 text-left">Status</th>
                <th className="border px-4 py-2 text-left">First Seen</th>
                <th className="border px-4 py-2 text-left">Last Seen</th>
                <th className="border px-4 py-2 text-left">Manufacturer</th>
                <th className="border px-4 py-2 text-left">Tags</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((device) => (
                <tr key={device.id || device.ip_address} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{device.id}</td>
                  <td className="border px-4 py-2">{device.ip_address}</td>
                  <td className="border px-4 py-2">{device.mac_address}</td>
                  <td className="border px-4 py-2">{device.hostname}</td>
                  <td className="border px-4 py-2">
                    <span
                      className={`inline-block w-3 h-3 rounded-full mr-2 ${
                        device.status === 'online' ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    />
                    {device.status === 'online' ? 'Online' : 'Offline'}
                  </td>
                  <td className="border px-4 py-2">
                    {device.first_seen && new Date(device.first_seen).getFullYear() > 2000
                      ? new Date(device.first_seen).toLocaleString()
                      : 'Unknown'}
                  </td>
                  <td className="border px-4 py-2">
                    {device.last_seen && new Date(device.last_seen).getFullYear() > 2000
                      ? new Date(device.last_seen).toLocaleString()
                      : 'Not seen yet'}
                  </td>
                  <td className="border px-4 py-2">{device.manufacturer || ''}</td>
                  <td className="border px-4 py-2">
                    {device.tags && device.tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {device.tags.map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded-full bg-gray-100 border flex items-center gap-1">
                          {t}
                          <button
                            onClick={() => handleRemoveTag(device.id, t)}
                            className="text-red-500 hover:text-red-700 text-xs"
                            title="Remove tag"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 italic mb-2">No tags</p>
                    )}

                    <div className="flex gap-1">
                      <input
                        type="text"
                        placeholder="New tag"
                        value={tagInputs[device.id] || ''}
                        onChange={(e) =>
                          setTagInputs({ ...tagInputs, [device.id]: e.target.value })
                        }
                        className="border rounded px-2 py-0.5 text-xs"
                      />
                      <button
                        onClick={() => handleAddTag(device.id)}
                        className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
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
