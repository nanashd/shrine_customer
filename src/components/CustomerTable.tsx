"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Dialog as ConfirmDialog, DialogContent as ConfirmDialogContent, DialogHeader as ConfirmDialogHeader, DialogTitle as ConfirmDialogTitle } from "@/components/ui/dialog";
import { useCollection } from "@/lib/hooks/useCollection";
import { Customer, Family } from "@/types/customer";
import { Size } from "@/types/size";
import { formatPhone } from "@/utils/phoneFormat";
import { normalizeKana } from "@/utils/normalizeKana";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, doc, serverTimestamp, deleteDoc } from "firebase/firestore";
import SearchBox from "@/components/SearchBox";
import { Wish } from "@/types/wish";
import CustomerImport from "@/components/CustomerImport";
import { differenceInYears, parseISO } from "date-fns";
import { SHICHIGOSAN, YAKUDOSHI } from "@/lib/notificationMaster";
import Link from "next/link";

const customerSchema = z.object({
  name: z.string().min(1, "氏名は必須です"),
  furigana: z.string().min(1, "フリガナは必須です"),
  phone: z.string().min(10, "電話番号は10桁以上").max(13),
  address: z.string().min(1, "住所は必須です"),
  gender: z.enum(["male", "female", "other", ""]).optional(),
  birthday: z.string().optional(),
  sizeId: z.string().optional(),
  price: z.number().optional(),
  wishId: z.string().optional(),
});
type CustomerForm = z.infer<typeof customerSchema>;

export default function CustomerTable() {
  const { data: customers, loading } = useCollection<Customer>("customers");
  const { data: sizes } = useCollection<Size>("sizes");
  const { data: wishes } = useCollection<Wish>("wishes");
  const [open, setOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Customer | null>(null);
  const [search, setSearch] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
    control,
  } = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
  });
  // families, useFieldArray, familyToAdd, handleAddFamilyAsCustomer, append, remove, family関連のstateやUIを全て削除
  // familiesに関するregisterや初期値セットも削除
  // フォームから「家族」セクション全体を削除
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingCustomer, setPendingCustomer] = useState<CustomerForm | null>(null);
  const [dupInfo, setDupInfo] = useState<{ name: string; furigana: string; phone: string } | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const selectedSizeId = watch("sizeId");
  const selectedSize = sizes.find((s) => s.id === selectedSizeId);

  // サイズ選択時に金額を自動セット
  useEffect(() => {
    if (selectedSize) {
      setValue("price", selectedSize.price);
    } else {
      setValue("price", undefined);
    }
  }, [selectedSize, setValue]);

  // 家族から顧客追加用の初期値セット
  // families, useFieldArray, familyToAdd, handleAddFamilyAsCustomer, append, remove, family関連のstateやUIを全て削除
  // familiesに関するregisterや初期値セットも削除
  // フォームから「家族」セクション全体を削除

  const onSubmit = async (values: CustomerForm) => {
    // 重複チェック
    const dup = customers.find(
      (c) =>
        c.name === values.name &&
        c.furigana === values.furigana &&
        c.phone.replace(/-/g, "") === formatPhone(values.phone).replace(/-/g, "")
    );
    if (!editTarget && dup) {
      setDupInfo({ name: dup.name, furigana: dup.furigana, phone: dup.phone });
      setPendingCustomer(values);
      setConfirmOpen(true);
      return;
    }
    setSubmitLoading(true);
    await actuallyAddCustomer(values);
    setSubmitLoading(false);
  };

  // 実際の追加処理
  const actuallyAddCustomer = async (values: CustomerForm) => {
    const payload = {
      ...values,
      phone: formatPhone(values.phone),
      name: values.name.replace(/　/g, " "), // 全角空白→半角
      furigana: normalizeKana(values.furigana),
      price: selectedSizeId ? selectedSize?.price ?? null : null,
      wishId: values.wishId || null,
      // families: values.families || [], // 家族情報は削除
    };
    if (editTarget) {
      await updateDoc(doc(db, "customers", editTarget.id), payload);
    } else {
      await addDoc(collection(db, "customers"), {
        ...payload,
        createdAt: serverTimestamp(),
      });
    }
    setOpen(false);
    setEditTarget(null);
    reset();
  };

  const handleEdit = (customer: Customer) => {
    setEditTarget(customer);
    setValue("name", customer.name);
    setValue("furigana", customer.furigana);
    setValue("phone", customer.phone.replace(/-/g, ""));
    setValue("address", customer.address);
    setValue("sizeId", customer.sizeId || "");
    setValue("price", customer.price ?? undefined);
    setValue("wishId", customer.wishId || "");
    setValue("gender", customer.gender || "");
    setValue("birthday", customer.birthday || "");
    // setValue("families", customer.families || []); // 家族情報は削除
    setOpen(true);
  };

  const handleDelete = async () => {
    if (editTarget) {
      await deleteDoc(doc(db, "customers", editTarget.id));
      setOpen(false);
      setEditTarget(null);
      setDeleteConfirmOpen(false);
      reset();
    }
  };

  // 検索フィルタ
  const filtered = customers.filter((c) => {
    if (!search) return true;
    const q = search;
    const name = normalizeKana(c.name);
    const furigana = normalizeKana(c.furigana);
    const phone = c.phone.replace(/-/g, "");
    return (
      name.includes(q) ||
      furigana.includes(q) ||
      phone.includes(q)
    );
  });

  // 通知対象者抽出
  function getAge(birthday?: string) {
    if (!birthday) return null;
    try {
      const now = new Date();
      const endOfYear = new Date(now.getFullYear(), 11, 31); // 12月31日
      return differenceInYears(endOfYear, parseISO(birthday));
    } catch {
      return null;
    }
  }
  function matchMaster(age: number | null, gender: string, master: { age: number; gender: string; label: string }[]) {
    if (age == null) return null;
    return master.find((m) => m.age === age && m.gender === gender);
  }
  const shichigosan = filtered.filter((c) => matchMaster(getAge(c.birthday), c.gender || '', SHICHIGOSAN));
  const yakudoshi = filtered.filter((c) => matchMaster(getAge(c.birthday), c.gender || '', YAKUDOSHI));

  // 住所グルーピング・アコーディオン表示を削除

  // ページネーション用state
  const [page, setPage] = useState(1);
  const pageSize = 50;
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  // 検索やデータ変更時にページを1に戻す
  useEffect(() => { setPage(1); }, [search, customers]);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-[#C41E3A]">顧客台帳</h2>
      <CustomerImport />
      {(shichigosan.length > 0 || yakudoshi.length > 0) && (
        <div className="mb-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded">
          <span className="font-bold">通知:</span> 七五三・厄年の該当者がいます。
          <Link href="/notifications" className="ml-4 underline text-[#C41E3A]">通知対象者一覧を見る</Link>
        </div>
      )}
      <SearchBox onSearch={setSearch} />
      <div className="mb-4 overflow-x-auto rounded-lg border shadow-sm bg-white">
        <table className="min-w-[950px] w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-3 py-2 text-left font-semibold">氏名</th>
              <th className="px-3 py-2 text-left font-semibold">フリガナ</th>
              <th className="px-3 py-2 text-left font-semibold">電話番号</th>
              <th className="px-3 py-2 text-left font-semibold">住所</th>
              <th className="px-3 py-2 text-left font-semibold">御札サイズ</th>
              <th className="px-3 py-2 text-left font-semibold">金額</th>
              <th className="px-3 py-2 text-left font-semibold">願意</th>
              <th className="px-3 py-2 text-left font-semibold">家族人数</th>
              <th className="px-3 py-2 text-left font-semibold">性別</th>
              <th className="px-3 py-2 text-left font-semibold">誕生日</th>
              <th className="px-3 py-2 text-left font-semibold">年齢</th>
              <th className="px-3 py-2 text-left font-semibold">登録日</th>
              <th className="px-3 py-2 text-left font-semibold">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={13} className="text-center py-4">Loading...</td></tr>
            ) : paged.length === 0 ? (
              <tr><td colSpan={13} className="text-center py-4 text-gray-400">該当なし</td></tr>
            ) : (
              paged.map((c) => {
                const sizeName = sizes.find(s => s.id === c.sizeId)?.name || "-";
                const price = c.price ?? sizes.find(s => s.id === c.sizeId)?.price ?? "-";
                const wishName = wishes.find(w => w.id === c.wishId)?.name || "-";
                const familyCount = Array.isArray(c.families) ? c.families.filter(f => f.name || f.relation || f.furigana).length : 0;
                return (
                  <tr key={c.id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-3 py-2 whitespace-nowrap">{c.name}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{c.furigana}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{c.phone}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{c.address}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{sizeName}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{typeof price === "number" ? price.toLocaleString() + " 円" : "-"}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{wishName}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{familyCount > 0 ? familyCount : "-"}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{c.gender === 'male' ? '男性' : c.gender === 'female' ? '女性' : c.gender === 'other' ? 'その他' : '-'}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{c.birthday || '-'}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{c.birthday ? (() => { try { return differenceInYears(new Date(), parseISO(c.birthday)); } catch { return '-'; } })() : '-'}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{c.createdAt && c.createdAt.toDate ? c.createdAt.toDate().toLocaleDateString() : "-"}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <Button size="sm" variant="outline" className="border-[#C41E3A] text-[#C41E3A] hover:bg-[#C41E3A]/10" onClick={() => handleEdit(c)}>編集</Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {/* ページネーションUI */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 my-4">
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >前へ</button>
          <span className="text-sm">{page} / {totalPages}</span>
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >次へ</button>
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-[#C41E3A] hover:bg-[#a81a30] text-white" onClick={() => { setEditTarget(null); reset(); }}>新規顧客追加</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editTarget ? "顧客編集" : "新規顧客追加"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
            <div>
              <label className="block text-xs font-semibold mb-1">氏名 <span className='text-red-500'>*</span></label>
              <input className="border px-2 py-1 w-full rounded" {...register("name")} />
              {errors.name && <div className="text-red-500 text-xs">{errors.name.message}</div>}
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">フリガナ <span className='text-red-500'>*</span></label>
              <input className="border px-2 py-1 w-full rounded" {...register("furigana")} />
              {errors.furigana && <div className="text-red-500 text-xs">{errors.furigana.message}</div>}
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">電話番号 <span className='text-red-500'>*</span></label>
              <input className="border px-2 py-1 w-full rounded" {...register("phone")} inputMode="numeric" maxLength={11} />
              {errors.phone && <div className="text-red-500 text-xs">{errors.phone.message}</div>}
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">住所 <span className='text-red-500'>*</span></label>
              <input className="border px-2 py-1 w-full rounded" {...register("address")} />
              {errors.address && <div className="text-red-500 text-xs">{errors.address.message}</div>}
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">性別</label>
              <div className="flex gap-4">
                <label><input type="radio" value="male" {...register("gender")} /> 男性</label>
                <label><input type="radio" value="female" {...register("gender")} /> 女性</label>
                <label><input type="radio" value="other" {...register("gender")} /> その他</label>
                <label><input type="radio" value="" {...register("gender")} /> 未選択</label>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">誕生日</label>
              <input className="border px-2 py-1 w-full rounded" type="date" {...register("birthday")} />
              {/* 年齢リアルタイム表示 */}
              {(() => {
                const bday = watch("birthday");
                let age: number | null = null;
                if (bday) {
                  try {
                    age = differenceInYears(new Date(), parseISO(bday));
                  } catch {}
                }
                return (
                  <div className="text-xs text-gray-600 mt-1">{bday ? `年齢: ${age ?? "-"} 歳` : ""}</div>
                );
              })()}
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">御札サイズ</label>
              <select className="border px-2 py-1 w-full rounded" {...register("sizeId")}> 
                <option value="">選択してください</option>
                {sizes.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">金額</label>
              <input className="border px-2 py-1 w-full rounded bg-gray-100" type="number" {...register("price", { valueAsNumber: true })} value={selectedSize?.price ?? ""} readOnly />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">願意</label>
              <select className="border px-2 py-1 w-full rounded" {...register("wishId")}> 
                <option value="">選択してください</option>
                {wishes.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
            {/* 家族セクションを削除 */}
            <div className="flex gap-2 justify-end pt-2">
              <Button type="submit" className="bg-[#C41E3A] hover:bg-[#a81a30] text-white" disabled={submitLoading}>
                {submitLoading ? (
                  <span className="flex items-center gap-2"><svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>処理中...</span>
                ) : (
                  editTarget ? "更新" : "追加"
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitLoading}>キャンセル</Button>
              {editTarget && (
                <Button type="button" variant="destructive" onClick={() => setDeleteConfirmOpen(true)} disabled={submitLoading}>
                  削除
                </Button>
              )}
            </div>
          </form>
        </DialogContent>
        <ConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <ConfirmDialogContent>
            <ConfirmDialogHeader>
              <ConfirmDialogTitle>重複確認</ConfirmDialogTitle>
            </ConfirmDialogHeader>
            <div className="mb-2 text-sm">
              同じ氏名・フリガナ・電話番号の顧客が既に存在します。<br />
              <span className="font-semibold">氏名:</span> {dupInfo?.name} ／ <span className="font-semibold">フリガナ:</span> {dupInfo?.furigana} ／ <span className="font-semibold">電話番号:</span> {dupInfo?.phone}
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => { setConfirmOpen(false); setPendingCustomer(null); }}>キャンセル</Button>
              <Button className="bg-[#C41E3A] text-white" onClick={async () => {
                if (pendingCustomer) await actuallyAddCustomer(pendingCustomer);
                setConfirmOpen(false); setPendingCustomer(null);
              }}>OK（追加する）</Button>
            </div>
          </ConfirmDialogContent>
        </ConfirmDialog>
        <ConfirmDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <ConfirmDialogContent>
            <ConfirmDialogHeader>
              <ConfirmDialogTitle>削除確認</ConfirmDialogTitle>
            </ConfirmDialogHeader>
            <div className="mb-2 text-sm">
              この顧客を本当に削除しますか？<br />
              <span className="font-semibold">氏名:</span> {editTarget?.name} ／ <span className="font-semibold">フリガナ:</span> {editTarget?.furigana}
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>キャンセル</Button>
              <Button className="bg-[#C41E3A] text-white" onClick={handleDelete}>OK（削除する）</Button>
            </div>
          </ConfirmDialogContent>
        </ConfirmDialog>
      </Dialog>
    </div>
  );
} 