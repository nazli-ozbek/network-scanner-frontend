import { useState } from 'react';
import Head from 'next/head';
import ScanForm from '@/components/ScanForm';
import DeviceTable from '@/components/DeviceTable';

export default function Home() {
  const [ipRange, setIpRange] = useState<string | null>(null);

  return (
    <>
      <Head>
        <title>Network Scanner</title>
        <meta name="description" content="Scan your local network for active devices" />
      </Head>
      <main className="min-h-screen bg-gray-100 py-10 px-4">
        <h1 className="text-3xl font-bold text-center mb-6">Network Scanner</h1>  
        <ScanForm onScan={(range) => setIpRange(range)} />
        {ipRange && <DeviceTable ipRange={ipRange} />}
      </main>
    </>
  );
}
