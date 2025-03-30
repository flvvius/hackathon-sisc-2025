// Common types used throughout the application

// User type for assignees
export interface UserInfo {
  id: string;
  name?: string | null;
  email?: string | null;
  imageUrl?: string | null;
}

// Frontend types (fully typed with required properties)
export interface CardItem {
  id: string;
  title: string;
  description: string | null;
  position: number;
  listId: string;
  type?: "project" | "comment" | "task";
  status?: "todo" | "in-progress" | "completed";
  labels?: Array<{
    text: string;
    color: string;
  }>;
  assignees?: UserInfo[];
}

export interface ListItem {
  id: string;
  title: string;
  boardId: string;
  position: number;
  cards: CardItem[];
}

export interface BoardItem {
  id: string;
  title: string;
  description: string | null;
  userId: string;
}

// Database types (matched to actual DB schema with potentially undefined fields)
export interface DbCard {
  id: string;
  title: string;
  description: string | null;
  position: number;
  listId: string;
  type?: "project" | "comment" | "task";
  status?: "todo" | "in-progress" | "completed";
  labels?: Array<{
    text: string;
    color: string;
  }>;
  assignees?: Array<UserInfo>;
  boardId?: string;
  author?: string | null;
  createdAt?: Date;
  updatedAt?: Date | null;
}

export interface DbList {
  id: string;
  title: string;
  boardId: string;
  position: number;
  cards?: DbCard[];
  createdAt?: Date;
  updatedAt?: Date | null;
}

export interface DbBoard {
  id: string;
  title: string;
  description: string | null;
  userId: string;
  lists?: DbList[];
  createdAt?: Date;
  updatedAt?: Date | null;
}
