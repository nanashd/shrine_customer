"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCollection } from "@/lib/hooks/useCollection";
import { Wish } from "@/types/wish";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
// import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

const wishSchema = z.object({
  name: z.string().min(1, "願意名は必須です"),
});
type WishForm = z.infer<typeof wishSchema>;

export default function WishFormMaster() {
  const { data: wishes, loading } = useCollection<Wish>("wishes");
  const [open, setOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Wish | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<WishForm>({
    resolver: zodResolver(wishSchema),
  });

  const onSubmit = async (values: WishForm) => {
    if (editTarget) {
      await updateDoc(doc(db, "wishes", editTarget.id), values);
    } else {
      await addDoc(collection(db, "wishes"), values);
    }
    setOpen(false);
    setEditTarget(null);
    reset();
  };

  const handleEdit = (wish: Wish) => {
    setEditTarget(wish);
    setValue("name", wish.name);
    setOpen(true);
  };

  // 順序入れ替えハンドラ
  const moveItem = async (from: number, to: number) => {
    if (to < 0 || to >= wishes.length) return;
    const sorted = wishes.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const reordered = Array.from(sorted);
    const [removed] = reordered.splice(from, 1);
    reordered.splice(to, 0, removed);
    await Promise.all(
      reordered.map((w, idx) =>
        updateDoc(doc(db, "wishes", w.id), { order: idx })
      )
    );
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-[#C41E3A]">願意マスタ</h2>
      <div className="mb-4 overflow-x-auto rounded-lg border shadow-sm bg-white">
        <table className="min-w-[300px] w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-3 py-2 text-center font-semibold w-16">順序</th>
              <th className="px-3 py-2 text-left font-semibold">願意名</th>
              <th className="px-3 py-2 text-left font-semibold">操作</th>
            </tr>
          </thead>
          <tbody>
            {wishes
              .slice()
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
              .map((w, idx, arr) => (
                <tr key={w.id} className="border-b hover:bg-gray-50 transition">
                  <td className="px-3 py-2 text-center align-middle">
                    <div className="flex flex-col gap-1 items-center justify-center">
                      <Button size="icon" variant="ghost" onClick={() => moveItem(idx, idx - 1)} disabled={idx === 0} aria-label="上へ">
                        ↑
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => moveItem(idx, idx + 1)} disabled={idx === arr.length - 1} aria-label="下へ">
                        ↓
                      </Button>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">{w.name}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <Button size="sm" variant="outline" className="border-[#C41E3A] text-[#C41E3A] hover:bg-[#C41E3A]/10" onClick={() => handleEdit(w)}>編集</Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-[#C41E3A] hover:bg-[#a81a30] text-white" onClick={() => { setEditTarget(null); reset(); }}>新規願意追加</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editTarget ? "願意編集" : "新規願意追加"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
            <div>
              <label className="block text-xs font-semibold mb-1">願意名</label>
              <input className="border px-2 py-1 w-full rounded" {...register("name")} />
              {errors.name && <div className="text-red-500 text-xs">{errors.name.message}</div>}
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button type="submit" className="bg-[#C41E3A] hover:bg-[#a81a30] text-white">{editTarget ? "更新" : "追加"}</Button>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>キャンセル</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 