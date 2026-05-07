"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";

const OrderList = ({ loading }: { loading: boolean }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentKey = searchParams.get('sort') || 'price';
  const currentDir = searchParams.get('dir') || 'asc';

  const updateOrder = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);

    if ('pending_urls' in sessionStorage) { sessionStorage.removeItem('pending_urls') };
    if ('last_id_results' in sessionStorage) { sessionStorage.removeItem('last_id_results') };
    if ('last_prov_results' in sessionStorage) { sessionStorage.removeItem('last_prov_results') };
    if ('last_search_results' in sessionStorage) { sessionStorage.removeItem('last_search_results') };
    if ('last_scroll_pos' in sessionStorage) { sessionStorage.removeItem('last_scroll_pos') };

    const urlToOrder = `${pathname}?${params.toString()}`;
    router.push(urlToOrder, { scroll: false });
  };

  // Opciones para los selects
  const sortOptions = [
    { value: "price", label: "Price" },
    { value: "itemRef", label: "Reference" },
    { value: "builtSize", label: "Square Meters" },
    { value: "updatedAt", label: "Latest Update" },
  ];

  const dirOptions = [
    { value: "asc", label: "Ascending ↑" },
    { value: "desc", label: "Descending ↓" },
  ];

  return (
    <div className="flex flex-wrap sm:flex-row gap-4 items-center justify-end">
      <label className="txtsecondary text-left sm:text-right min-w-fit">Sort by</label>

      {/* Select de Criterio */}
      <CustomDropdown
        options={sortOptions}
        value={currentKey}
        onChange={(val: string) => updateOrder('sort', val)}
        disabled={loading}
      />

      {/* Select de Dirección */}
      <CustomDropdown
        options={dirOptions}
        value={currentDir}
        onChange={(val: string) => updateOrder('dir', val)}
        disabled={loading}
      />
    </div>
  );
};

// Sub-componente para el Select personalizado
const CustomDropdown = ({ options, value, onChange, disabled }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt: any) => opt.value === value);

  return (
    <div className="relative flex-1 sm:flex-none" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full txtsecondary text-center border-b border-dotted bg-transparent pb-0.5 focus:outline-none transition-opacity text-nowrap ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {selectedOption?.label}
      </button>

      {isOpen && !disabled && (
        <div className="absolute top-full 
        left-1/2 -translate-x-1/2 
        mt-2 w-max min-w-full bg-(--form-bg) shadow-2xl z-100 overflow-hidden rounded-2xl border border-(--form-border)">
          {options.map((option: any) => (
            <div
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`px-4 py-2 text-sm transition-colors cursor-pointer text-center whitespace-nowrap rounded-2xl
              ${value === option.value ?
                  'text-white font-bold bg-(--app-accent)' :
                  'text-(--app-text)'}
              hover:bg-(--form-border-hover) hover:text-white`}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderList;
