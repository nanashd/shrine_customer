import { useState, useEffect } from "react";
import { normalizeKana } from "@/utils/normalizeKana";

interface SearchBoxProps {
  onSearch: (query: string) => void;
}

export default function SearchBox({ onSearch }: SearchBoxProps) {
  const [input, setInput] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(normalizeKana(input));
    }, 300);
    return () => clearTimeout(handler);
  }, [input, onSearch]);

  return (
    <input
      className="border px-2 py-1 w-full mb-4"
      placeholder="氏名・フリガナ・電話番号で検索"
      value={input}
      onChange={e => setInput(e.target.value)}
    />
  );
} 