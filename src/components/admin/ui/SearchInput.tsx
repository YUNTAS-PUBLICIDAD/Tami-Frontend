import { FaSearch } from "react-icons/fa"

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchInput = ({ value, onChange, placeholder = "Buscar..." }: SearchInputProps) => {
    return (
        <div className="relative w-full sm:w-80">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-teal-500" />
            <input
                type="text"
                placeholder={placeholder}
                className="text-gray-400 pl-10 w-full rounded-full border-2 border-teal-100 dark:border-teal-700 py-3 px-5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-sm transition-all duration-300 dark:bg-gray-600/25"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    )
}
