import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function BackToDashboard() {
  return (
    <div className="mb-4">
      <Link href="/dashboard">
        <Button variant="outline" className="text-[#C41E3A] border-[#C41E3A]">← ダッシュボードへ戻る</Button>
      </Link>
    </div>
  );
} 