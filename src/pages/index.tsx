import { useState } from 'react';
import Head from 'next/head';
import ScanForm from '@/components/ScanForm';
import DeviceTable from '@/components/DeviceTable';
import { clearDevices } from '@/lib/api';

export default function Home() {
  const [ipRange, setIpRange] = useState<string | null>(null);
  const [clearTrigger, setClearTrigger] = useState(0);

  const handleClear = async () => {
    await clearDevices();
    setIpRange(null);
    setClearTrigger((prev) => prev + 1);
  };

  return (
    <>
      <Head>
        <title>Network Scanner</title>
        <meta name="description" content="Scan your local network for active devices" />
      </Head>
      <main className="min-h-screen bg-gray-100 py-10 px-4">
        <h1 className="text-3xl font-bold text-center mb-6">Network Scanner</h1>

        <ScanForm onScan={(range) => setIpRange(range)} />

        {ipRange && (
          <div className="relative max-w-4xl mx-auto">
            <button
              onClick={handleClear}
              className="absolute top-0 right-0 mt-2 mr-2 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 z-10"
            >
              Clear
            </button>
            <DeviceTable ipRange={ipRange} key={clearTrigger} />
          </div>
        )}
      </main>
    </>
  );
}