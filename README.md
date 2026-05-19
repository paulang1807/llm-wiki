# LLM Wiki: Self-Curating Knowledge Base

LLM Wiki is a premium, AI-driven knowledge management system designed to turn raw information into a structured, semantic knowledge graph. Powered by Google's Gemini Pro, it automatically synthesizes notes, URLs, and files into a cohesive wiki with intelligent linking and automated categorization.

![LLM Wiki Home Page](./media/home.png)

## ✨ Features

### 🧠 AI-Powered Ingestion Hub
Streamline your knowledge gathering with multi-method ingestion. Whether it's a quick note, a long article, or a collection of research papers, the AI engine processes and integrates it seamlessly.
- **Quick Note**: Paste text directly for immediate synthesis.
- **Link Ingestion**: Provide a URL, and the AI extracts the core knowledge while preserving the source citation.
- **Batch Upload**: Drag and drop multiple files (Markdown, Text, PDF) for bulk processing.

![Ingestion Hub](./media/ingestion.png)

### 📊 Semantic Graph & Hierarchy
Visualize your knowledge. LLM Wiki builds a dynamic graph of concepts and automatically organizes them into a deep, logical domain hierarchy.
- **Dynamic Sidebar**: Reflects the real-time structure of your knowledge base.
- **Knowledge Graph**: Explore relationships between concepts visually.
- **Home Analytics**: Dashboard tiles showing subdomain and page counts for each primary domain.

![Knowledge Graph](./media/graph.png)

### 🔗 Intelligent Linking & Meta-data
Every page is part of a larger conversation. The AI automatically generates:
- **Wikilinks**: Semantic connections to existing knowledge using `[[Title]]` syntax.
- **Provenance**: Automatic source tracking for all ingested links.
- **Rich Frontmatter**: Titles, categories, tags, last-updated dates, and AI confidence scores.

![Page View](./media/page_view.png)

### 💎 Premium Design Language
Built for productivity and aesthetics:
- **Glassmorphic UI**: A modern, translucent interface that feels lightweight and responsive.
- **Micro-animations**: Smooth transitions and hover effects for a premium feel.
- **Real-time Console**: Watch the AI knowledge engine work in real-time.

## 🚀 Getting Started

### 🖥️ Desktop Application (macOS)

LLM Wiki is packaged as a standalone macOS application. There is no need to manually start a Next.js server.

1. **Clone the repository** (if building from source):
   ```bash
   git clone https://github.com/paulang1807/llm-wiki.git
   cd llm-wiki
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the macOS App**:
   ```bash
   npm run package:mac
   ```
   The packaged `.app` will be available in the `release/mac` folder. You can drag `LLM Wiki.app` to your `/Applications` folder.

### 🗄️ Data Storage & Configuration

Because macOS applications are sandboxed, all of your wiki data and configuration is automatically stored in your user Documents folder:
- **Wiki Notes:** `~/Documents/LLM-Wiki/`
- **Environment Variables:** `~/Documents/LLM-Wiki/.env`

If the `.env` file does not exist when the app launches, it will automatically create a template for you. You must add your `GOOGLE_API_KEY` to this file.

### 👨‍💻 Local Development

If you prefer to run the web application directly from your terminal (without packaging it as a macOS application):

1. **Setup Environment**: Copy the provided sample configuration.
   ```bash
   cp .env.sample .env
   ```
   *Make sure to add your `GOOGLE_API_KEY` to the newly created `.env` file.*

2. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to start building.

**Blank Slate Architecture:** By default, local development uses the `wiki/`, `raw/`, `archive/`, and `notes/` folders inside your repository workspace. These folders are tracked in git using empty `.gitkeep` files. This ensures that any new user who clones the repository will start with a perfectly clean, blank slate knowledge base. 

*Optional:* If you want your local development server to point to your macOS Desktop App's storage folder, you can append `DATA_DIR=~/Documents/LLM-Wiki` to your `.env` file.
## 📺 Demonstration

Watch the AI Knowledge Engine synthesize a quick note into a structured wiki page:

![Ingestion Flow Demo](./media/ingestion_demo.gif)

---

Built with ❤️ using Next.js and Gemini Pro.
