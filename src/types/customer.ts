import { Timestamp } from "firebase/firestore";

export type Family = {
  name: string;
  relation: string;
  furigana: string;
};

export type Customer = {
  id: string; // FirestoreのドキュメントID
  name: string;
  furigana: string;
  phone: string;
  address: string;
  gender?: 'male' | 'female' | 'other' | '';
  birthday?: string;
  createdAt?: Timestamp;
  sizeId?: string;
  price?: number;
  wishId?: string;
  families?: Family[];
}; 