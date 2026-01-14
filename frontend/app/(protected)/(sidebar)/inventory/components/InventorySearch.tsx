import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface InventorySearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function InventorySearch({
  searchTerm,
  onSearchChange,
}: InventorySearchProps) {
  return (
    <div className="relative mb-6">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5" />
      <Input
        type="text"
        placeholder="Search products..."
        value={searchTerm}
        onChange={e => onSearchChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
}
