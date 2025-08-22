'use client';

import { useEffect, useState } from 'react';
import { IPRange, fetchIPRanges, addIPRange, deleteIPRange } from '@/lib/api';

type Props = {
  onSelect: (ipRange: string) => void;
};

export default function IPRangeTable({ onSelect }: Props) {
  const [items, setItems] = useState<IPRange[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<IPRange>>({ name: '', range: '' });

  const load = async () => {
    try {
      setError(null);
      const data = await fetchIPRanges();
      setItems(data);
    } catch {
      setError('Failed to load IP ranges');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async () => {
  if (!form.name || !form.range) {
    setError('All fields are required');
    return;
  }
  try {
    await addIPRange({
      name: form.name,
      range: form.range,
      id: ''
    });
    setForm({ name: '', range: '' });
    load();
  } catch {
    setError('Failed to add IP range');
  }
};


  const handleDelete = async (id: string) => {
    if (!confirm('Delete this range?')) return;
    try {
      await deleteIPRange(id);
      setItems((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError('Failed to delete range');
    }
  };

  return (
    <div className="p-4 mt-8 max-w-4xl mx-auto bg-white rounded shadow-md">
      <h2 className="text-xl font-semibold mb-4">Saved IP Ranges</h2>

      <div className="mb-4 flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Name"
          value={form.name || ''}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border rounded px-2 py-1 flex-1"
        />
        <input
          type="text"
          placeholder="CIDR Range (e.g., 192.168.1.0/24)"
          value={form.range || ''}
          onChange={(e) => setForm({ ...form, range: e.target.value })}
          className="border rounded px-2 py-1 flex-1"
        />
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
        >
          Add
        </button>
      </div>

      {error && <p className="text-red-600 mb-2">{error}</p>}

      {Array.isArray(items) && items.length === 0 ? (
        <p className="text-gray-600">No saved ranges.</p>
      ) : (
        <table className="min-w-full text-sm border rounded overflow-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2 text-left">ID</th>
              <th className="border px-3 py-2 text-left">Name</th>
              <th className="border px-3 py-2 text-left">CIDR</th>
              <th className="border px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(items) && items.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="border px-3 py-2">{row.id}</td>
                <td className="border px-3 py-2">{row.name}</td>
                <td className="border px-3 py-2">{row.range}</td>
                <td className="border px-3 py-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onSelect(row.range)}
                      className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                    >
                      Scan
                    </button>
                    <button
                      onClick={() => handleDelete(row.id)}
                      className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
