export function normalizeKana(input: string): string {
  // NFKC正規化
  let str = input.normalize("NFKC");
  // ひらがな→カタカナ
  str = str.replace(/[\u3041-\u3096]/g, (s) =>
    String.fromCharCode(s.charCodeAt(0) + 0x60)
  );
  // 全角空白→半角空白
  str = str.replace(/\u3000/g, " ");
  // 空白削除
  str = str.replace(/\s+/g, "");
  return str;
} 