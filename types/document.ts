import { ObjectId } from "mongodb";

export interface DocumentChunk {
  _id?: ObjectId;
  docId: string;
  title: string;
  section: string;
  page: number;
  content: string;
  embedding?: number[]; // Will be populated in Stage 5
}
