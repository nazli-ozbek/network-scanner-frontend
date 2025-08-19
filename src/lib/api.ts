const BASE_URL = 'http://localhost:8080';

export async function startScan(ipRange: string): Promise<string> {
  const response = await fetch(`${BASE_URL}/scan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ip_range: ipRange }),
  });

  if (!response.ok) {
    throw new Error('Failed to start scan');
  }

  const data = await response.json();
  return data.status;
}

export type Device = {
  ip_address: string;
  mac_address: string;
  hostname: string;
  is_online: boolean;
  last_seen: string;
};

export async function fetchDevices(): Promise<Device[]> {
  const response = await fetch(`${BASE_URL}/devices`);

  if (!response.ok) {
    throw new Error('Failed to fetch devices');
  }

  const data: Device[] = await response.json();
  return data;
}

export async function clearDevices(): Promise<void> {
  const response = await fetch(`${BASE_URL}/clear`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to clear devices');
  }
}

export type ScanHistory = {
  id: number;
  ip_range: string;
  started_at: string;
  device_count: number;
};

export async function fetchScanHistory(): Promise<ScanHistory[]> {
  const res = await fetch(`${BASE_URL}/scan-history`);
  if (!res.ok) throw new Error('Failed to fetch scan history');
  return res.json();
}

export async function repeatScan(id: number): Promise<string> {
  const res = await fetch(`${BASE_URL}/scan/repeat?id=${id}`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to repeat scan');
  const data = await res.json();
  return data.status;
}

export async function deleteScanHistory(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/scan-history/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete history');
}

export async function clearScanHistory(): Promise<void> {
  const res = await fetch(`${BASE_URL}/scan-history`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to clear history');
}
