# 🤖 Akaza - Interactive Codebase Q&A CLI

Dynamic AI-powered tool to analyze any GitHub repository and answer questions about it.

## 🚀 Quick Start

### Option 1: Using the Launcher
```bash
run_cli.bat
```

### Option 2: Direct Python
```bash
python interactive_cli.py
```

## 📖 How to Use

### Step 1: Ingest a Repository
1. Run the CLI
2. Choose option `1` (Ingest a new repository)
3. Enter any GitHub repository URL, for example:
   - `https://github.com/kruth-s/object-identity-ai-gcp`
   - `https://github.com/facebook/react`
   - `https://github.com/your-username/your-repo`

The system will:
- ✅ Clone the repository
- ✅ Extract and chunk code files
- ✅ Generate embeddings
- ✅ Upload to Pinecone vector database

### Step 2: Ask Questions
1. Choose option `2` (Ask a question)
2. Type your question in natural language:
   - "Where is authentication implemented?"
   - "How does the caching layer work?"
   - "What does the ghost context do?"
   - "Explain the main architecture"

The AI agent will:
- 🔍 Search the vector database
- 🧠 Analyze relevant code
- 💡 Provide a detailed answer

### Step 3: Switch Repositories
Want to analyze a different repo?
1. Choose option `1` again
2. Enter a new GitHub URL
3. The old data will be cleared automatically

## 🎯 Example Session

```
🤖 Akaza - Interactive Codebase Q&A
======================================================================

📌 Options:
  1. Ingest a new repository
  2. Ask a question about current repository
  3. Exit

👉 Enter choice (1/2/3): 1

🔗 Enter GitHub repository URL: https://github.com/kruth-s/object-identity-ai-gcp

📥 Ingesting repository: https://github.com/kruth-s/object-identity-ai-gcp
======================================================================
📂 Cloning to E:\Github\Akaza\server\repos\object-identity-ai-gcp...
📖 Reading files...
✅ Found 45 files
✂️  Splitting into chunks...
✅ Created 289 chunks
🧠 Generating embeddings...
☁️  Uploading to Pinecone...
   Batch 1/3 uploaded
   Batch 2/3 uploaded
   Batch 3/3 uploaded

✅ Repository 'object-identity-ai-gcp' ingested successfully!

👉 Enter choice (1/2/3): 2

❓ Ask about 'object-identity-ai-gcp': Where is ghost context used?

🤔 Question: Where is ghost context used?
======================================================================
🔍 Searching and analyzing...

💡 Answer:
----------------------------------------------------------------------
The ghost context is used in the ghost_signals.py file for detecting
and analyzing faint images using image processing, feature extraction,
and machine learning techniques...

🎯 Confidence: high
======================================================================
```

## 🛠️ Technical Details

- **LLM**: Groq (llama-3.3-70b-versatile)
- **Embeddings**: HuggingFace (all-MiniLM-L6-v2)
- **Vector DB**: Pinecone (384 dimensions)
- **Agent Framework**: LangGraph

## 📝 Notes

- Each new repository ingestion **clears previous data**
- Local repo clones are stored in `server/repos/` during ingestion
- All vector data is stored in Pinecone cloud
- Supports: `.py`, `.js`, `.ts`, `.jsx`, `.tsx`, `.md`, `.txt`, `.java`, `.go`, `.rs`, `.c`, `.cpp`, `.h`

## 🔧 Configuration

Edit `.env` file:
```env
GROQ_API_KEY=your_groq_key
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX=codey
```
