import WishForm from "@/components/Master/WishForm";
import BackToDashboard from "@/components/BackToDashboard";

export default function WishesMasterPage() {
  return (
    <main className="p-6">
      <BackToDashboard />
      <WishForm />
    </main>
  );
} 