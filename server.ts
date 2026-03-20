import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY2 || process.env.GEMINI_API_KEY || "",
});

// Notion Helpers
const extractId = (idOrUrl: string) => {
  if (!idOrUrl) return "";
  const trimmed = idOrUrl.trim();
  const match = trimmed.match(/[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i);
  if (match) {
    return match[0].replace(/-/g, "");
  }
  return trimmed;
};

const fetchNotion = async (path: string, method: string = "GET", body?: any) => {
  const response = await fetch(`https://api.notion.com/v1/${path}`, {
    method,
    headers: {
      "Authorization": `Bearer ${process.env.NOTION_API_KEY}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`Notion API Error: ${errorData.message || response.statusText}`);
  }
  
  return response.json();
};

const queryAllNotion = async (dbId: string) => {
  let results: any[] = [];
  let hasMore = true;
  let startCursor: string | undefined = undefined;

  while (hasMore) {
    const response = await fetchNotion(`databases/${dbId}/query`, "POST", {
      start_cursor: startCursor,
    });
    results = [...results, ...response.results];
    hasMore = response.has_more;
    startCursor = response.next_cursor;
  }

  return results;
};

// API Routes
app.get("/api/notion/status", async (req, res) => {
  const hasKey = !!process.env.NOTION_API_KEY;
  const hasGoalsDb = !!process.env.NOTION_GOALS_DB_ID;
  const hasTasksDb = !!process.env.NOTION_TASKS_DB_ID;
  
  res.json({
    configured: hasKey && hasGoalsDb && hasTasksDb,
    missing: {
      apiKey: !hasKey,
      goalsDb: !hasGoalsDb,
      tasksDb: !hasTasksDb
    }
  });
});

app.get("/api/notion/debug", async (req, res) => {
  try {
    const goalsDbId = extractId(process.env.NOTION_GOALS_DB_ID || "");
    const tasksDbId = extractId(process.env.NOTION_TASKS_DB_ID || "");
    
    const [goalsDb, tasksDb] = await Promise.all([
      fetchNotion(`databases/${goalsDbId}`),
      fetchNotion(`databases/${tasksDbId}`),
    ]);
    
    res.json({ goalsDb, tasksDb });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/notion/data", async (req, res) => {
  try {
    if (!process.env.NOTION_API_KEY || !process.env.NOTION_GOALS_DB_ID || !process.env.NOTION_TASKS_DB_ID) {
      return res.status(400).json({ error: "Notion not configured" });
    }

    const goalsDbId = extractId(process.env.NOTION_GOALS_DB_ID || "");
    const tasksDbId = extractId(process.env.NOTION_TASKS_DB_ID || "");

    if (!goalsDbId || goalsDbId.length !== 32) {
      throw new Error(`Invalid Goals Database ID: "${goalsDbId}". Expected a 32-character ID.`);
    }
    if (!tasksDbId || tasksDbId.length !== 32) {
      throw new Error(`Invalid Tasks Database ID: "${tasksDbId}". Expected a 32-character ID.`);
    }

    const [goals, tasks] = await Promise.all([
      queryAllNotion(goalsDbId),
      queryAllNotion(tasksDbId),
    ]);

    res.json({
      goals,
      tasks,
    });
  } catch (error: any) {
    console.error("Notion Fetch Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Chat & Agentic Features
const notionTools = {
  get_workspace_data: async () => {
    const goalsDbId = extractId(process.env.NOTION_GOALS_DB_ID || "");
    const tasksDbId = extractId(process.env.NOTION_TASKS_DB_ID || "");
    const [goals, tasks] = await Promise.all([
      queryAllNotion(goalsDbId),
      queryAllNotion(tasksDbId),
    ]);
    return { goals, tasks };
  },
  update_task_status: async ({ taskId, status }: { taskId: string, status: string }) => {
    await fetchNotion(`pages/${taskId}`, "PATCH", {
      properties: { Status: { select: { name: status } } }
    });
    return { success: true, taskId, status };
  },
  create_task: async ({ name, goalId }: { name: string, goalId?: string }) => {
    const tasksDbId = extractId(process.env.NOTION_TASKS_DB_ID || "");
    const properties: any = {
      Name: { title: [{ text: { content: name } }] },
      Status: { select: { name: "To Do" } }
    };
    if (goalId) {
      // Using goal_relation as specified by the user
      properties.goal_relation = { relation: [{ id: goalId }] };
    }
    const result = await fetchNotion(`pages`, "POST", {
      parent: { database_id: tasksDbId },
      properties
    });
    return { success: true, taskId: result.id, name };
  }
};

app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: `
          You are the NotionOS Agent, a highly capable productivity assistant.
          You can help users manage their Notion workspace, plan their day, and stay focused.
          
          When a user asks about their goals or tasks, use 'get_workspace_data' to see what's there.
          When they want to complete a task, use 'update_task_status'.
          When they have a new idea, use 'create_task'.
          
          Be lively, encouraging, and proactive. Use emojis.
          If you perform an action, confirm it clearly to the user.
        `,
        tools: [{
          functionDeclarations: [
            {
              name: "get_workspace_data",
              description: "Fetch all goals and tasks from the user's Notion workspace.",
              parameters: { type: Type.OBJECT, properties: {} }
            },
            {
              name: "update_task_status",
              description: "Update the status of a specific task in Notion.",
              parameters: {
                type: Type.OBJECT,
                properties: {
                  taskId: { type: Type.STRING, description: "The ID of the task page in Notion." },
                  status: { type: Type.STRING, enum: ["To Do", "In Progress", "Done"], description: "The new status." }
                },
                required: ["taskId", "status"]
              }
            },
            {
              name: "create_task",
              description: "Create a new task in the Notion tasks database.",
              parameters: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "The name of the task." },
                  goalId: { type: Type.STRING, description: "Optional ID of a goal to link this task to." }
                },
                required: ["name"]
              }
            }
          ]
        }]
      }
    });

    // Send the message
    let response = await chat.sendMessage({ message });
    
    // Handle function calls
    const functionCalls = response.functionCalls;
    if (functionCalls) {
      const functionResponses = [];
      for (const call of functionCalls) {
        const tool = (notionTools as any)[call.name];
        if (tool) {
          const result = await tool(call.args);
          functionResponses.push({
            name: call.name,
            response: result,
            id: call.id
          });
        }
      }
      
      // Send tool results back to model
      response = await chat.sendMessage({
        message: {
          parts: functionResponses.map(r => ({
            functionResponse: { name: r.name, response: r.response, id: r.id }
          }))
        }
      } as any);
    }

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/ai/plan", async (req, res) => {
  try {
    const { goals, tasks } = req.body;
    
    const prompt = `
      You are a productivity assistant. Prioritize these tasks for today based on deadlines, importance, and goal alignment. 
      Break large tasks into subtasks if necessary. 
      
      Goals: ${JSON.stringify(goals)}
      Tasks: ${JSON.stringify(tasks)}
      
      Return a structured JSON response exactly like this:
      {
        "today_plan": [
          {
            "task_id": "string",
            "task_name": "string",
            "subtasks": ["string"],
            "sub_subtasks": ["string"],
            "start_time": "HH:MM",
            "end_time": "HH:MM",
            "goal_name": "string",
            "reason": "string"
          }
        ],
        "focus_task": {
          "task_name": "string",
          "reason": "string"
        },
        "suggestions": ["string"]
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const responseText = response.text;
    if (!responseText) throw new Error("No response from AI");
    
    // Clean up response if it contains markdown code blocks
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : responseText;
    
    res.json(JSON.parse(jsonStr));
  } catch (error: any) {
    console.error("AI Plan Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/notion/update-task", async (req, res) => {
  try {
    const { taskId, status } = req.body;
    const response = await fetch(`https://api.notion.com/v1/pages/${taskId}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${process.env.NOTION_API_KEY}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        properties: {
          Status: {
            select: { name: status }
          }
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`Notion API Error: ${errorData.message || response.statusText}`);
    }

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/notion/create-goal", async (req, res) => {
  try {
    const { name, category, deadline } = req.body;
    const goalsDbId = extractId(process.env.NOTION_GOALS_DB_ID || "");
    
    const properties: any = {
      Name: { title: [{ text: { content: name } }] },
      Category: { select: { name: category } },
      Progress: { number: 0 }
    };
    
    if (deadline) {
      properties.Deadline = { date: { start: deadline } };
    }

    const response = await fetch(`https://api.notion.com/v1/pages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.NOTION_API_KEY}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        parent: { database_id: goalsDbId },
        properties
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`Notion API Error: ${errorData.message || response.statusText}`);
    }

    const result = await response.json();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/notion/create-task", async (req, res) => {
  try {
    const { name, goalId, dueDate } = req.body;
    const tasksDbId = extractId(process.env.NOTION_TASKS_DB_ID || "");
    
    const properties: any = {
      Name: { title: [{ text: { content: name } }] },
      Status: { select: { name: "To Do" } }
    };
    
    if (goalId) {
      // Using goal_relation as specified by the user
      properties.goal_relation = { relation: [{ id: goalId }] };
    }
    
    if (dueDate) {
      properties["Due Date"] = { date: { start: dueDate } };
    }

    const response = await fetch(`https://api.notion.com/v1/pages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.NOTION_API_KEY}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        parent: { database_id: tasksDbId },
        properties
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`Notion API Error: ${errorData.message || response.statusText}`);
    }

    const result = await response.json();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
