import { useState } from 'react';
import Head from 'next/head';
import ScanForm from '@/components/ScanForm';
import DeviceTable from '@/components/DeviceTable';
import { clearDevices, startScan } from '@/lib/api';
import IPRangeTable from '@/components/IPRangeTable';

export default function Home() {
  const [ipRange, setIpRange] = useState<string | null>(null);
  const [clearTrigger, setClearTrigger] = useState(0);

  return (
    <>
      <Head>
        <title>Network Scanner</title>
        <meta name="description" content="Scan your local network for active devices" />
      </Head>
      <main className="min-h-screen bg-gray-100 py-10 px-4">
        <h1 className="text-3xl font-bold text-center mb-6">Network Scanner</h1>

        <ScanForm onScan={(range) => setIpRange(range)} />

        <IPRangeTable
          onSelect={async (range) => {
            await startScan(range);
            setIpRange(range);
          }}
        />

        {ipRange && (
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute top-0 right-0 mt-2 mr-2 flex items-center gap-2 z-10">
              <button
                onClick={async () => {
                  await clearDevices();
                  setIpRange(null);
                  setClearTrigger((prev) => prev + 1);
                }}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                Clear
              </button>
            </div>

            <DeviceTable ipRange={ipRange} key={clearTrigger} />
          </div>
        )}
      </main>
    </>
  );
}
