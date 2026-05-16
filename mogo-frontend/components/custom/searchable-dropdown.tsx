import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import { Input } from "geobuk-shared/ui";
import { cn } from "@/lib/utils";

interface SearchableDropdownProps {
  items: string[];
  placeholder: string;
  onSelect: (item: string | null) => void;
  selectedItem?: string | null;
  className?: string;
}

export const SearchableDropdown = React.memo(function SearchableDropdown({
  items,
  placeholder,
  onSelect,
  selectedItem,
  className,
}: SearchableDropdownProps) {
  const [localSearchTerm, setLocalSearchTerm] = useState(selectedItem || "");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setLocalSearchTerm(term);
    setIsOpen(true);
    if (term === "") {
      onSelect(null);
    }
  };

  const filteredItems = useMemo(() => {
    if (localSearchTerm === "") return items;
    return items.filter((item) =>
      item.toLowerCase().includes(localSearchTerm.toLowerCase()),
    );
  }, [items, localSearchTerm]);

  const handleClickItem = useCallback(
    (item: string) => {
      onSelect(item);
      setLocalSearchTerm(item);
      setIsOpen(false);
    },
    [onSelect],
  );

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(e.target as Node)
    ) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  useEffect(() => {
    if (selectedItem) {
      setLocalSearchTerm(selectedItem);
    }
  }, [selectedItem]);

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <Input
        placeholder={placeholder}
        value={localSearchTerm}
        onChange={handleSearchInputChange}
        onFocus={() => setIsOpen(true)}
      />
      {isOpen && filteredItems.length > 0 && (
        <div className="absolute left-0 top-full z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
          {filteredItems.map((item) => (
            <div key={item} className="flex min-h-[36px] w-full">
              <p
                className="flex min-h-[36px] w-full cursor-pointer items-center px-2 text-sm hover:bg-gray-100"
                onMouseDown={() => handleClickItem(item)}
                title={item}
              >
                {item}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
