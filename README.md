# NotionOS - AI Daily Planner ✨

![NotionOS Banner](https://picsum.photos/seed/notionos-banner/1200/400)

**NotionOS** is a magical, AI-powered productivity assistant that turns your cluttered Notion workspace into a focused, action-oriented daily adventure. It uses advanced AI to analyze your goals and tasks, creating an optimized plan that helps you sparkle every day! 💖

## ✨ Features

- **🤖 AI-Powered Planning:** Automatically generates a daily plan based on your Notion goals and tasks.
- **🔄 Real-time Notion Sync:** Seamlessly integrates with your Notion databases for goals and tasks.
- **🎨 20+ Kawaii Themes:** Customize your experience with a wide palette of magical colors.
- **📅 Visual Calendar:** See your tasks and goals laid out in a beautiful, intuitive calendar view.
- **💬 AI Chat Assistant:** Get help, advice, or quick updates through the integrated AI agent.
- **🎯 Goal Tracking:** Monitor your progress on long-term goals with visual progress bars.

## 🚀 Getting Started

### Prerequisites

- A Notion account with an Internal Integration Token.
- A Notion workspace with two databases: **Goals** and **Tasks**.
- A Gemini AI API Key (provided automatically in AI Studio).

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-repo/notion-os.git
   cd notion-os
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file based on `.env.example`:
   ```env
   NOTION_API_KEY="your_notion_token"
   NOTION_GOALS_DB_ID="your_goals_db_id"
   NOTION_TASKS_DB_ID="your_tasks_db_id"
   GEMINI_API_KEY="your_gemini_key"
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS 4.0
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Backend:** Express (Node.js)
- **AI:** Google Gemini API (@google/genai)
- **Database:** Notion API (@notionhq/client)

## 🎨 Customization

You can change the theme by clicking the **Palette** icon in the navigation sidebar. Choose from 20 different magical colors to match your mood!

---

Made with ✨ and 💖 by the NotionOS Team.
