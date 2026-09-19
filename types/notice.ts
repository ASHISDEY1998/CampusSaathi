import { ObjectId } from "mongodb";

export type NoticeCategory =
  | "Academic"
  | "Examination"
  | "Events"
  | "Administration"
  | "Hostel"
  | "Placements";

export type NoticePriority = "NORMAL" | "HIGH";

export interface Notice {
  _id?: ObjectId;
  title: string;
  category: NoticeCategory;
  date: string; // ISO date string e.g. "2026-10-12"
  content: string;
  priority: NoticePriority;
}
