"use client";

import { useState } from "react";
import { DndProvider } from "react-dnd";
import type { BackendFactory } from "dnd-core";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import KanbanList from "./KanbanList";
import { v4 as uuidv4 } from "uuid";

// Define types
export type CardType = "project" | "task" | "comment";

export type Comment = {
  id: string;
  author: string;
  text: string;
  createdAt: string;
};

export type Contributor = {
  id: string;
  name: string;
  role: string;
  avatar?: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "completed";
  assignees: Contributor[];
  dueDate?: string;
  labels?: { text: string; color: string }[];
};

export type Card = {
  id: string;
  title: string;
  description: string;
  type: CardType;
  labels?: { text: string; color: string }[];
  // Project specific fields
  tasks?: Task[];
  contributors?: Contributor[];
  comments?: Comment[];
  // Task specific fields (for standalone tasks not in a project)
  status?: "todo" | "in-progress" | "completed";
  assignees?: Contributor[];
  dueDate?: string;
  // Comment specific fields (for standalone comments)
  author?: string;
  createdAt?: string;
};

export type List = {
  id: string;
  title: string;
  cards: Card[];
};

// Available label colors
export const labelColors = [
  { name: "purple", bg: "bg-purple-100", text: "text-purple-700" },
  { name: "blue", bg: "bg-blue-100", text: "text-blue-700" },
  { name: "green", bg: "bg-green-100", text: "text-green-700" },
  { name: "yellow", bg: "bg-amber-100", text: "text-amber-700" },
  { name: "red", bg: "bg-red-100", text: "text-red-700" },
  { name: "pink", bg: "bg-pink-100", text: "text-pink-700" },
  { name: "indigo", bg: "bg-indigo-100", text: "text-indigo-700" },
  { name: "gray", bg: "bg-gray-100", text: "text-gray-700" },
];

export default function KanbanBoard() {
  // Initial state with some example data
  const [lists, setLists] = useState<List[]>([
    {
      id: "list-1",
      title: "To Do",
      cards: [
        {
          id: "card-1",
          title: "Website Redesign",
          description: "Redesign the company website with new branding",
          type: "project",
          labels: [
            { text: "design", color: "purple" },
            { text: "high-priority", color: "red" },
          ],
          tasks: [
            {
              id: "task-1",
              title: "Create wireframes",
              description:
                "Design initial wireframes for homepage and product pages",
              status: "todo",
              assignees: [
                { id: "user-1", name: "Alex Smith", role: "UX Designer" },
              ],
              dueDate: "2023-12-15",
              labels: [{ text: "design", color: "purple" }],
            },
            {
              id: "task-2",
              title: "Develop homepage prototype",
              description: "Create a working prototype of the homepage design",
              status: "todo",
              assignees: [
                { id: "user-2", name: "Jamie Lee", role: "Frontend Developer" },
              ],
              labels: [{ text: "development", color: "green" }],
            },
          ],
          contributors: [
            { id: "user-1", name: "Alex Smith", role: "UX Designer" },
            { id: "user-2", name: "Jamie Lee", role: "Frontend Developer" },
            { id: "user-3", name: "Taylor Kim", role: "Project Manager" },
          ],
          comments: [
            {
              id: "comment-1",
              author: "Taylor Kim",
              text: "Let's make sure we incorporate the new brand guidelines in this redesign.",
              createdAt: "2023-12-01",
            },
          ],
        },
      ],
    },
    {
      id: "list-2",
      title: "In Progress",
      cards: [
        {
          id: "card-2",
          title: "Mobile App Development",
          description: "Create a mobile app version of our platform",
          type: "project",
          labels: [{ text: "development", color: "green" }],
          tasks: [
            {
              id: "task-3",
              title: "Design user flows",
              description: "Map out the user journey through the app",
              status: "completed",
              assignees: [
                { id: "user-1", name: "Alex Smith", role: "UX Designer" },
              ],
              labels: [{ text: "design", color: "purple" }],
            },
            {
              id: "task-4",
              title: "Develop authentication system",
              description: "Implement user login and registration",
              status: "in-progress",
              assignees: [
                {
                  id: "user-4",
                  name: "Jordan Casey",
                  role: "Backend Developer",
                },
              ],
              dueDate: "2023-12-20",
              labels: [{ text: "development", color: "green" }],
            },
            {
              id: "task-5",
              title: "Create UI components",
              description: "Build reusable UI components for the app",
              status: "in-progress",
              assignees: [
                { id: "user-2", name: "Jamie Lee", role: "Frontend Developer" },
              ],
              labels: [{ text: "development", color: "green" }],
            },
          ],
          contributors: [
            { id: "user-1", name: "Alex Smith", role: "UX Designer" },
            { id: "user-2", name: "Jamie Lee", role: "Frontend Developer" },
            { id: "user-4", name: "Jordan Casey", role: "Backend Developer" },
            { id: "user-3", name: "Taylor Kim", role: "Project Manager" },
          ],
          comments: [
            {
              id: "comment-2",
              author: "Jordan Casey",
              text: "I've started working on the authentication system. Should be ready for testing by Friday.",
              createdAt: "2023-12-05",
            },
            {
              id: "comment-3",
              author: "Taylor Kim",
              text: "Great progress everyone! Let's schedule a demo for next week.",
              createdAt: "2023-12-07",
            },
          ],
        },
      ],
    },
    {
      id: "list-3",
      title: "Done",
      cards: [
        {
          id: "card-3",
          title: "Q4 Marketing Campaign",
          description: "Plan and execute Q4 marketing initiatives",
          type: "project",
          labels: [{ text: "marketing", color: "blue" }],
          tasks: [
            {
              id: "task-6",
              title: "Create social media content calendar",
              description: "Plan out social posts for the quarter",
              status: "completed",
              assignees: [
                {
                  id: "user-5",
                  name: "Pat Johnson",
                  role: "Marketing Specialist",
                },
              ],
              labels: [{ text: "marketing", color: "blue" }],
            },
            {
              id: "task-7",
              title: "Design email templates",
              description: "Create templates for the email campaign",
              status: "completed",
              assignees: [
                { id: "user-1", name: "Alex Smith", role: "UX Designer" },
              ],
              labels: [{ text: "design", color: "purple" }],
            },
            {
              id: "task-8",
              title: "Launch campaign",
              description: "Execute the marketing campaign across all channels",
              status: "completed",
              assignees: [
                {
                  id: "user-5",
                  name: "Pat Johnson",
                  role: "Marketing Specialist",
                },
              ],
              dueDate: "2023-11-15",
              labels: [{ text: "marketing", color: "blue" }],
            },
          ],
          contributors: [
            { id: "user-1", name: "Alex Smith", role: "UX Designer" },
            { id: "user-5", name: "Pat Johnson", role: "Marketing Specialist" },
            { id: "user-3", name: "Taylor Kim", role: "Project Manager" },
          ],
          comments: [
            {
              id: "comment-4",
              author: "Taylor Kim",
              text: "Great job on this campaign! The metrics are looking really good.",
              createdAt: "2023-11-30",
            },
          ],
        },
      ],
    },
  ]);

  const [newListTitle, setNewListTitle] = useState("");
  const [showNewListInput, setShowNewListInput] = useState(false);

  // Move a card from one list to another
  const moveCard = (
    cardId: string,
    sourceListId: string,
    targetListId: string,
  ) => {
    setLists((prevLists) => {
      const newLists = [...prevLists];

      // Find source and target lists
      const sourceListIndex = newLists.findIndex(
        (list) => list.id === sourceListId,
      );
      const targetListIndex = newLists.findIndex(
        (list) => list.id === targetListId,
      );

      if (sourceListIndex === -1 || targetListIndex === -1) return prevLists;

      // Find the card in the source list
      const cardIndex = newLists[sourceListIndex]!.cards.findIndex(
        (card) => card.id === cardId,
      );
      if (cardIndex === -1) return prevLists;

      // Remove card from source list and add to target list
      const [movedCard] = newLists[sourceListIndex]!.cards.splice(cardIndex, 1);
      if (!movedCard) return prevLists;
      newLists[targetListIndex]!.cards.push(movedCard);

      return newLists;
    });
  };

  // Add a new card to a list
  const addCard = (listId: string, card: Omit<Card, "id">) => {
    setLists((prevLists) => {
      const newLists = [...prevLists];
      const listIndex = newLists.findIndex((list) => list.id === listId);

      if (listIndex === -1) return prevLists;

      newLists[listIndex]!.cards.push({
        ...card,
        id: uuidv4(),
      });

      return newLists;
    });
  };

  // Update a card
  const updateCard = (
    listId: string,
    cardId: string,
    updatedCard: Omit<Card, "id">,
  ) => {
    setLists((prevLists) => {
      const newLists = [...prevLists];
      const listIndex = newLists.findIndex((list) => list.id === listId);

      if (listIndex === -1) return prevLists;

      const cardIndex = newLists[listIndex]!.cards.findIndex(
        (card) => card.id === cardId,
      );

      if (cardIndex === -1) return prevLists;

      newLists[listIndex]!.cards[cardIndex] = {
        ...updatedCard,
        id: cardId,
      };

      return newLists;
    });
  };

  // Delete a card
  const deleteCard = (listId: string, cardId: string) => {
    setLists((prevLists) => {
      const newLists = [...prevLists];
      const listIndex = newLists.findIndex((list) => list.id === listId);

      if (listIndex === -1) return prevLists;

      newLists[listIndex]!.cards = newLists[listIndex]!.cards.filter(
        (card) => card.id !== cardId,
      );

      return newLists;
    });
  };

  // Add a new list
  const addList = () => {
    if (!newListTitle.trim()) return;

    setLists((prevLists) => [
      ...prevLists,
      {
        id: uuidv4(),
        title: newListTitle,
        cards: [],
      },
    ]);

    setNewListTitle("");
    setShowNewListInput(false);
  };

  // Delete a list
  const deleteList = (listId: string) => {
    setLists((prevLists) => prevLists.filter((list) => list.id !== listId));
  };

  // Update a list's title
  const updateListTitle = (listId: string, newTitle: string) => {
    setLists((prevLists) => {
      const newLists = [...prevLists];
      const listIndex = newLists.findIndex((list) => list.id === listId);

      if (listIndex === -1) return prevLists;

      newLists[listIndex]!.title = newTitle;

      return newLists;
    });
  };

  // Add a task to a project card
  const addTask = (listId: string, cardId: string, task: Omit<Task, "id">) => {
    setLists((prevLists) => {
      const newLists = [...prevLists];
      const listIndex = newLists.findIndex((list) => list.id === listId);

      if (listIndex === -1) return prevLists;

      const cardIndex = newLists[listIndex]!.cards.findIndex(
        (card) => card.id === cardId,
      );

      if (cardIndex === -1) return prevLists;

      const card = newLists[listIndex]!.cards[cardIndex];

      if (card!.type !== "project") return prevLists;

      if (!card!.tasks) card!.tasks = [];

      card!.tasks.push({
        ...task,
        id: uuidv4(),
      });

      return newLists;
    });
  };

  // Update a task in a project card
  const updateTask = (
    listId: string,
    cardId: string,
    taskId: string,
    updatedTask: Omit<Task, "id">,
  ) => {
    setLists((prevLists) => {
      const newLists = [...prevLists];
      const listIndex = newLists.findIndex((list) => list.id === listId);

      if (listIndex === -1) return prevLists;

      const cardIndex = newLists[listIndex]!.cards.findIndex(
        (card) => card.id === cardId,
      );

      if (cardIndex === -1) return prevLists;

      const card = newLists[listIndex]!.cards[cardIndex];

      if (card!.type !== "project" || !card!.tasks) return prevLists;

      const taskIndex = card!.tasks.findIndex((task) => task.id === taskId);

      if (taskIndex === -1) return prevLists;

      card!.tasks[taskIndex] = {
        ...updatedTask,
        id: taskId,
      };

      return newLists;
    });
  };

  // Delete a task from a project card
  const deleteTask = (listId: string, cardId: string, taskId: string) => {
    setLists((prevLists) => {
      const newLists = [...prevLists];
      const listIndex = newLists.findIndex((list) => list.id === listId);

      if (listIndex === -1) return prevLists;

      const cardIndex = newLists[listIndex]!.cards.findIndex(
        (card) => card.id === cardId,
      );

      if (cardIndex === -1) return prevLists;

      const card = newLists[listIndex]!.cards[cardIndex];

      if (card!.type !== "project" || !card!.tasks) return prevLists;

      card!.tasks = card!.tasks.filter((task) => task.id !== taskId);

      return newLists;
    });
  };

  // Add a contributor to a project card
  const addContributor = (
    listId: string,
    cardId: string,
    contributor: Omit<Contributor, "id">,
  ) => {
    setLists((prevLists) => {
      const newLists = [...prevLists];
      const listIndex = newLists.findIndex((list) => list.id === listId);

      if (listIndex === -1) return prevLists;

      const cardIndex = newLists[listIndex]!.cards.findIndex(
        (card) => card.id === cardId,
      );

      if (cardIndex === -1) return prevLists;

      const card = newLists[listIndex]!.cards[cardIndex];

      if (card!.type !== "project") return prevLists;

      if (!card!.contributors) card!.contributors = [];

      card!.contributors.push({
        ...contributor,
        id: uuidv4(),
      });

      return newLists;
    });
  };

  // Add a comment to a project card
  const addComment = (
    listId: string,
    cardId: string,
    comment: Omit<Comment, "id" | "createdAt">,
  ) => {
    setLists((prevLists) => {
      const newLists = [...prevLists];
      const listIndex = newLists.findIndex((list) => list.id === listId);

      if (listIndex === -1) return prevLists;

      const cardIndex = newLists[listIndex]!.cards.findIndex(
        (card) => card.id === cardId,
      );

      if (cardIndex === -1) return prevLists;

      const card = newLists[listIndex]!.cards[cardIndex];

      if (!card!.comments) card!.comments = [];

      card!.comments.push({
        ...comment,
        id: uuidv4(),
        createdAt: new Date().toISOString().split("T")[0] ?? "",
      });

      return newLists;
    });
  };

  return (
    <DndProvider backend={HTML5Backend as BackendFactory}>
      <div className="flex min-h-[calc(100vh-12rem)] items-start gap-4 overflow-x-auto pb-8">
        {lists.map((list) => (
          <KanbanList
            key={list.id}
            list={list}
            moveCard={moveCard}
            addCard={addCard}
            updateCard={updateCard}
            deleteCard={deleteCard}
            deleteList={deleteList}
            updateListTitle={updateListTitle}
            addTask={addTask}
            updateTask={updateTask}
            deleteTask={deleteTask}
            addContributor={addContributor}
            addComment={addComment}
          />
        ))}

        {showNewListInput ? (
          <div className="h-fit min-w-[280px] rounded-xl border bg-white/80 p-3 shadow-sm backdrop-blur-sm">
            <Input
              value={newListTitle}
              onChange={(e) => setNewListTitle(e.target.value)}
              placeholder="Enter list title..."
              className="mb-2"
              onKeyDown={(e) => {
                if (e.key === "Enter") addList();
                if (e.key === "Escape") {
                  setShowNewListInput(false);
                  setNewListTitle("");
                }
              }}
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                onClick={addList}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700"
              >
                Add List
              </Button>
              <Button
                onClick={() => {
                  setShowNewListInput(false);
                  setNewListTitle("");
                }}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={() => setShowNewListInput(true)}
            variant="outline"
            className="flex h-fit min-w-[280px] items-center justify-start rounded-xl border-dashed bg-white/50 px-4 py-3 backdrop-blur-sm transition-all duration-200 hover:bg-white/80 hover:shadow-md"
          >
            <Plus className="mr-2 h-5 w-5 text-purple-600" />
            Add another list
          </Button>
        )}
      </div>
    </DndProvider>
  );
}
