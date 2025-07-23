import CustomerTable from "@/components/CustomerTable";

export default function CustomersPage() {
  return (
    <main className="p-6">
      {/* TODO: 検索バーやフィルタもここに追加 */}
      <CustomerTable />
    </main>
  );
} 