import CustomerTable from "@/components/CustomerTable";
import BackToDashboard from "@/components/BackToDashboard";

export default function CustomersPage() {
  return (
    <main className="p-6">
      <BackToDashboard />
      {/* TODO: 検索バーやフィルタもここに追加 */}
      <CustomerTable />
    </main>
  );
} 