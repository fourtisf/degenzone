'use client';

import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Search, X } from 'lucide-react';

type Props = {
  value: string;
  onChange: (v: string) => void;
  resultCount?: number;
  placeholder?: string;
};

export type SearchBarHandle = { focus: () => void };

const SearchBar = forwardRef<SearchBarHandle, Props>(function SearchBar(
  { value, onChange, resultCount, placeholder = 'Search tokens, symbols, contracts…' },
  ref
) {
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }));

  return (
    <div className="relative w-full max-w-md hidden md:block">
      <Search
        size={14}
        strokeWidth={2}
        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
      />
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            onChange('');
            inputRef.current?.blur();
          }
        }}
        placeholder={placeholder}
        className="w-full pl-8 pr-20 py-1.5 text-[13px] bg-surface-2 hover:bg-surface-3 focus:bg-surface-3 border border-border-line focus:border-border-strong rounded outline-none transition placeholder:text-zinc-600"
      />
      {value ? (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {resultCount != null && (
            <span className="text-[10px] text-zinc-500 font-mono tabular-nums">{resultCount}</span>
          )}
          <button
            onClick={() => onChange('')}
            className="text-zinc-500 hover:text-white rounded hover:bg-surface-3 p-0.5 transition"
            title="Clear"
            aria-label="Clear search"
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-zinc-500 font-mono px-1.5 py-0.5 rounded bg-surface-1 border border-border-line">
          ⌘K
        </kbd>
      )}
    </div>
  );
});

export default SearchBar;
