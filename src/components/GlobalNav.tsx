import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalNav() {
  return (
    <nav className="w-full bg-white shadow mb-6 py-2 px-2 flex gap-2 items-center overflow-x-auto scrollbar-hide whitespace-nowrap">
      <Link href="/dashboard">
        <Button variant="ghost" className="text-[#C41E3A] font-bold text-base min-w-[110px]">ダッシュボード</Button>
      </Link>
      <Link href="/customers">
        <Button variant="ghost" className="min-w-[100px]">顧客台帳</Button>
      </Link>
      <Link href="/notifications">
        <Button variant="ghost" className="min-w-[140px]">通知対象者一覧</Button>
      </Link>
      <Link href="/master/sizes">
        <Button variant="ghost" className="min-w-[120px]">御札サイズマスタ</Button>
      </Link>
      <Link href="/master/wishes">
        <Button variant="ghost" className="min-w-[100px]">願意マスタ</Button>
      </Link>
      <Link href="/master/notifications">
        <Button variant="ghost" className="min-w-[170px]">七五三・厄年マスタ</Button>
      </Link>
    </nav>
  );
} 