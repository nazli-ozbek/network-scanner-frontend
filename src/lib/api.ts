const BASE_URL = 'http://localhost:8080';

export async function startScan(ipRange: string): Promise<string> {
  const response = await fetch(`${BASE_URL}/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ip_range: ipRange }),
  });
  if (!response.ok) throw new Error('Failed to start scan');
  const data = await response.json();
  return data.status;
}

export type Device = {
  id: string;
  ip_address: string;
  mac_address: string;
  hostname: string;
  status: string;
  manufacturer?: string;
  tags?: string[];
  last_seen: string;
  first_seen: string;
};

export async function fetchDevices(): Promise<Device[]> {
  const response = await fetch(`${BASE_URL}/devices`);
  if (!response.ok) throw new Error('Failed to fetch devices');
  const data = await response.json().catch(() => []);
  if (!Array.isArray(data)) return [];
  return data;
}

export async function clearDevices(): Promise<void> {
  const response = await fetch(`${BASE_URL}/clear`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to clear devices');
}

export type IPRange = {
  id: string;
  name: string;
  range: string;
};

export async function fetchIPRanges(): Promise<IPRange[]> {
  const res = await fetch(`${BASE_URL}/ranges`);
  if (!res.ok) throw new Error('Failed to fetch IP ranges');
  return res.json();
}

export async function addIPRange(range: IPRange): Promise<void> {
  const res = await fetch(`${BASE_URL}/ranges`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(range),
  });
  if (!res.ok) throw new Error('Failed to add IP range');
}

export async function deleteIPRange(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/ranges/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete IP range');
}

export async function addTagToDevice(id: string, tag: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/devices/${id}/tags`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tag }),
  });
  if (!res.ok) throw new Error('Failed to add tag');
}

export async function removeTagFromDevice(id: string, tag: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/devices/${id}/tags`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tag }),
  });
  if (!res.ok) throw new Error('Failed to remove tag');
}


