import { SearchIcon } from "../../ui/icons";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
}: Props) {
  return (
    <div className="bg-[#151618] border-b border-[#23252A] rounded-lg overflow-hidden p-6">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#9798A4]" />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full max-w-lg bg-transparent border border-[#626366] rounded-lg pl-10 pr-4 py-2 text-[#9798A4] placeholder-[#9798A4] focus:outline-none"
        />
      </div>
    </div>
  );
}
