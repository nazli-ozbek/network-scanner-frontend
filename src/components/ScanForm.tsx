import { useState } from 'react';
import { startScan, clearDevices } from '@/lib/api';

type ScanFormProps = {
  onScan: (ipRange: string) => void;
};

export default function ScanForm({ onScan }: ScanFormProps) {
  const [ipRange, setIpRange] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    setError(null);

    try {
      const result = await startScan(ipRange);
      setStatus(result);
      onScan(ipRange);
    } catch (err) {
      setError('Failed to start scan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 border rounded-md shadow-md bg-white max-w-md mx-auto"
    >
      <h2 className="text-lg font-semibold mb-2">Start Network Scan</h2>
      <input
        type="text"
        placeholder="Enter IP Range (e.g. 192.168.1.0/24)"
        value={ipRange}
        onChange={(e) => setIpRange(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        disabled={!ipRange || loading}
      >
        {loading ? 'Scanning...' : 'Scan'}
      </button>
      {status && <p className="mt-2 text-green-600">{status}</p>}
      {error && <p className="mt-2 text-red-600">{error}</p>}
    </form>
  );
}
