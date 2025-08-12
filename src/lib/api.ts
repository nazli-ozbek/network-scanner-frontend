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
