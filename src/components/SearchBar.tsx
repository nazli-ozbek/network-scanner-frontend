import { useState } from 'react';
import { FiSearch } from 'react-icons/fi';

type SearchBarProps = {
  onSearch: (query: string) => void;
};

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [input, setInput] = useState('');

  const handleSubmit = () => {
    onSearch(input.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-6">
      <div className="flex items-center gap-2 bg-white border border-gray-300 rounded shadow-sm px-4 py-2">
        <FiSearch className="text-gray-500" size={18} />
        <input
          type="text"
          placeholder="Search by IP, hostname, or tags..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full outline-none text-sm"
        />
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 text-sm"
        >
          Search
        </button>
      </div>
    </div>
  );
}
