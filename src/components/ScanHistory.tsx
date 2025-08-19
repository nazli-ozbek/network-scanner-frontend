import { useEffect, useState } from 'react';
import {
  fetchScanHistory,
  repeatScan,
  deleteScanHistory,
  clearScanHistory,
  ScanHistory,
} from '@/lib/api';

type Props = {
  onRepeat: (ipRange: string) => void;
};

export default function ScanHistoryTable({ onRepeat }: Props) {
  const [items, setItems] = useState<ScanHistory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [clearing, setClearing] = useState(false);

  const load = async () => {
    try {
      setError(null);
      const data = await fetchScanHistory();
      setItems(data);
    } catch {
      setError('Failed to load scan history');
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  const handleRepeat = async (row: ScanHistory) => {
    try {
      setLoadingId(row.id);
      await repeatScan(row.id);
      onRepeat(row.ip_range);
    } catch {
      setError('Failed to repeat scan');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      if (!confirm('Delete this history record?')) return;
      await deleteScanHistory(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch {
      setError('Failed to delete history');
    }
  };

  const handleClearAll = async () => {
    try {
      if (!confirm('Clear all history?')) return;
      setClearing(true);
      await clearScanHistory();
      setItems([]);
    } catch {
      setError('Failed to clear history');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="p-4 mt-8 max-w-4xl mx-auto bg-white rounded shadow-md">
      <div className="flex items-center justify-between mb-3 gap-2">
        <h2 className="text-xl font-semibold">Scan History</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="text-sm px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
            disabled={clearing}
          >
            Refresh
          </button>
          <button
            onClick={handleClearAll}
            className="text-sm px-3 py-1 rounded bg-red-100 hover:bg-red-200 disabled:opacity-50"
            disabled={clearing || items.length === 0}
          >
            {clearing ? 'Clearing…' : 'Clear All'}
          </button>
        </div>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      {(!items || items.length === 0) ? (
        <p className="text-gray-600">No history yet.</p>
      ) : (
        <div className="max-h-72 overflow-auto rounded border">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="border px-3 py-2 text-left">IP Range</th>
                <th className="border px-3 py-2 text-left">Started At</th>
                <th className="border px-3 py-2 text-left">Online Device Count</th>
                <th className="border px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="border px-3 py-2">{row.ip_range}</td>
                  <td className="border px-3 py-2">
                    {new Date(row.started_at).toLocaleString()}
                  </td>
                  <td className="border px-3 py-2">{row.device_count}</td>
                  <td className="border px-3 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRepeat(row)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                        disabled={loadingId === row.id}
                      >
                        {loadingId === row.id ? 'Repeating…' : 'Repeat'}
                      </button>
                      <button
                        onClick={() => handleDelete(row.id)}
                        className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                        disabled={loadingId === row.id}
                      >
                        Delete
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
