"use client";
import { useState, useRef } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useCollection } from "@/lib/hooks/useCollection";
import { Size } from "@/types/size";
import { Wish } from "@/types/wish";

interface PreviewRow {
  name: string;
  furigana: string;
  phone: string;
  address: string;
  sizeName: string;
  wishName: string;
  sizeId?: string;
  wishId?: string;
  error?: string;
}

export default function CustomerImport() {
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [imported, setImported] = useState(false);
  const { data: sizes } = useCollection<Size>("sizes");
  const { data: wishes } = useCollection<Wish>("wishes");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows: PreviewRow[] = (results.data as Record<string, string>[]).map((row) => {
          const size = sizes.find((s) => s.name === row["御札サイズ"]);
          const wish = wishes.find((w) => w.name === row["願意"]);
          let error = "";
          // サイズ・願意が未入力ならエラーにしない
          // 入力があるのにマスタに存在しない場合のみエラー
          if (row["御札サイズ"] && !size) error += "サイズ不明; ";
          if (row["願意"] && !wish) error += "願意不明; ";
          return {
            name: row["氏名"] || "",
            furigana: row["フリガナ"] || "",
            phone: row["電話番号"] || "",
            address: row["住所"] || "",
            sizeName: row["御札サイズ"] || "",
            wishName: row["願意"] || "",
            sizeId: size?.id,
            wishId: wish?.id,
            error: error || undefined,
          };
        });
        setPreview(rows);
        setImported(false);
      },
    });
  };

  const handleImport = async () => {
    setLoading(true);
    for (const row of preview) {
      if (row.error) continue;
      await addDoc(collection(db, "customers"), {
        name: row.name,
        furigana: row.furigana,
        phone: row.phone,
        address: row.address,
        sizeId: row.sizeId || null,
        wishId: row.wishId || null,
        price: row.sizeId ? sizes.find((s) => s.id === row.sizeId)?.price ?? null : null,
        createdAt: serverTimestamp(),
      });
    }
    setLoading(false);
    setImported(true);
    setPreview([]);
  };

  const handleSampleDownload = () => {
    const csv =
      '氏名,フリガナ,電話番号,住所,御札サイズ,願意\n' +
      '山田太郎,ヤマダタロウ,08012345678,いわき市,大,家内安全\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customer_import_sample.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mb-6">
      <label className="block mb-2 font-semibold">CSVインポート</label>
      <div className="flex gap-2 mb-2">
        <Button type="button" className="bg-[#C41E3A] text-white" onClick={() => fileInputRef.current?.click()}>
          ファイルを選択
        </Button>
        <Button type="button" variant="outline" onClick={handleSampleDownload}>
          サンプルCSVダウンロード
        </Button>
      </div>
      <input
        type="file"
        accept=".csv"
        onChange={handleFile}
        ref={fileInputRef}
        style={{ display: "none" }}
      />
      {preview.length > 0 && (
        <div className="mb-2">
          <table className="min-w-full text-xs border">
            <thead>
              <tr className="bg-gray-50">
                <th className="border px-2">氏名</th>
                <th className="border px-2">フリガナ</th>
                <th className="border px-2">電話番号</th>
                <th className="border px-2">住所</th>
                <th className="border px-2">御札サイズ</th>
                <th className="border px-2">願意</th>
                <th className="border px-2">エラー</th>
              </tr>
            </thead>
            <tbody>
              {preview.map((row, i) => (
                <tr key={i} className={row.error ? "bg-red-50" : ""}>
                  <td className="border px-2">{row.name}</td>
                  <td className="border px-2">{row.furigana}</td>
                  <td className="border px-2">{row.phone}</td>
                  <td className="border px-2">{row.address}</td>
                  <td className="border px-2">{row.sizeName}</td>
                  <td className="border px-2">{row.wishName}</td>
                  <td className="border px-2 text-red-500">{row.error || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Button className="mt-2 bg-[#C41E3A] text-white" onClick={handleImport} disabled={loading || preview.some(r => r.error)}>
            {loading ? "インポート中..." : "インポート実行"}
          </Button>
        </div>
      )}
      {imported && <div className="text-green-600 font-semibold">インポートが完了しました！</div>}
    </div>
  );
} 