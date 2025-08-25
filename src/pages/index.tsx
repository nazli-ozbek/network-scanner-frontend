import { useState } from 'react';
import Head from 'next/head';
import ScanForm from '@/components/ScanForm';
import DeviceTable from '@/components/DeviceTable';
import { clearDevices, startScan, Device } from '@/lib/api';
import IPRangeTable from '@/components/IPRangeTable';
import SearchBar from '@/components/SearchBar';
import { searchDevices } from '@/lib/api';


export default function Home() {
  const [ipRange, setIpRange] = useState<string | null>(null);
  const [clearTrigger, setClearTrigger] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState <Device[] | null>(null);


const handleSearch = async (query: string) => {
  setSearchQuery(query);
  if (query.length === 0) {
    setSearchResults(null);
    return;
  }
  try {
    const results = await searchDevices(query);
    setSearchResults(results);
  } catch (err) {
    console.error('Search failed');
  }
};

const handleClear = async () => {
  await clearDevices();
  setIpRange(null);
  setClearTrigger((prev) => prev + 1);
  setSearchResults(null);
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

        <IPRangeTable
          onSelect={async (range) => {
            await startScan(range);
            setIpRange(range);
          }}
        />

        {ipRange && (
      <div className="max-w-4xl mx-auto">
        <SearchBar onSearch={handleSearch} />

        <div className="relative">
          <div className="absolute top-2 right-2 z-10">
            <button
              onClick={handleClear}
              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm shadow"
            >
              Clear
            </button>
          </div>

          <DeviceTable
            ipRange={ipRange}
            key={clearTrigger}
            overrideDevices={searchResults}
            searchQuery={searchQuery}
          />
        </div>
      </div>
    )}

      </main>
    </>
  );


}
