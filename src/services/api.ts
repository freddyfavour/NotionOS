export interface NotionGoal {
  id: string;
  properties: {
    Name: { title: { plain_text: string }[] };
    Progress: { number: number };
    Category: { select: { name: string } };
    Deadline?: { date: { start: string } | null };
  };
}

export interface NotionTask {
  id: string;
  properties: {
    Name: { title: { plain_text: string }[] };
    Status: { select: { name: string } };
    "Due Date": { date: { start: string } | null };
    Goal?: { relation: { id: string }[] };
    goal_relation?: { relation: { id: string }[] };
    goal?: { relation: { id: string }[] };
  };
}

export interface AIPlanItem {
  task_id: string;
  task_name: string;
  subtasks: string[];
  sub_subtasks?: string[];
  start_time: string;
  end_time: string;
  goal_name: string;
  reason: string;
}

export interface AIPlan {
  today_plan: AIPlanItem[];
  focus_task: {
    task_name: string;
    reason: string;
  };
  suggestions: string[];
}

export const fetchNotionStatus = async () => {
  const res = await fetch("/api/notion/status");
  return res.json();
};

export const fetchNotionData = async () => {
  const res = await fetch("/api/notion/data");
  if (!res.ok) throw new Error("Failed to fetch Notion data");
  return res.json();
};

export const generateAIPlan = async (goals: any[], tasks: any[]) => {
  const res = await fetch("/api/ai/plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ goals, tasks }),
  });
  if (!res.ok) throw new Error("Failed to generate AI plan");
  return res.json();
};

export const updateTaskStatus = async (taskId: string, status: string) => {
  const res = await fetch("/api/notion/update-task", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ taskId, status }),
  });
  return res.json();
};

export const createGoal = async (name: string, category: string, deadline?: string) => {
  const res = await fetch("/api/notion/create-goal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, category, deadline }),
  });
  if (!res.ok) throw new Error("Failed to create goal");
  return res.json();
};

export const createTask = async (name: string, goalId?: string, dueDate?: string) => {
  const res = await fetch("/api/notion/create-task", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, goalId, dueDate }),
  });
  if (!res.ok) throw new Error("Failed to create task");
  return res.json();
};
