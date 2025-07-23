export type Wish = {
  id: string; // FirestoreのドキュメントID
  name: string; // 願意名（例：家内安全、商売繁盛など）
  order?: number;
}; 