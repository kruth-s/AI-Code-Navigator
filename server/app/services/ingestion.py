from git import Repo
import os
import shutil
from typing import List, Dict, Any
from langchain_community.document_loaders import DirectoryLoader, TextLoader, UnstructuredFileLoader
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pinecone import Pinecone, ServerlessSpec
from ..core.config import settings
import time

class IngestionService:
    def __init__(self):
        self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        self.pc = Pinecone(api_key=settings.PINECONE_API_KEY)
        self.index_name = settings.PINECONE_INDEX

    def clone_repo(self, repo_url: str, repo_path: str) -> str:
        if os.path.exists(repo_path):
            shutil.rmtree(repo_path)  # Clean up existing
        
        Repo.clone_from(repo_url, repo_path)
        return repo_path

    def process_repo(self, repo_url: str):
        repo_name = repo_url.split("/")[-1].replace(".git", "")
        repo_path = os.path.join(os.getcwd(), "repos", repo_name)
        
        print(f"Cloning {repo_url} to {repo_path}...")
        self.clone_repo(repo_url, repo_path)
        
        print("Loading documents...")
        # Basic text loader for code files
        loader = DirectoryLoader(repo_path, glob="**/*.*", show_progress=True, use_multithreading=True, loader_cls=TextLoader, loader_kwargs={'autodetect_encoding': True})
        docs = loader.load()
        
        print(f"Loaded {len(docs)} documents. Splitting...")
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            add_start_index=True
        )
        splits = text_splitter.split_documents(docs)
        print(f" created {len(splits)} chunks.")
        
        # Prepare vectors
        print("Creating embeddings and upserting to Pinecone...")
        
        # Check if index exists
        existing_indexes = [index.name for index in self.pc.list_indexes()]
        if self.index_name not in existing_indexes:
            print(f"Index {self.index_name} does not exist. Please create it first or use a serverless spec creation if needed.")
            # Basic serverless spec creation for starter if allowed, otherwise fail
            try:
                self.pc.create_index(
                    name=self.index_name,
                    dimension=384, # all-MiniLM-L6-v2 dimension
                    metric="cosine",
                    spec=ServerlessSpec(
                        cloud="aws",
                        region="us-east-1"
                    ) 
                )
                while not self.pc.describe_index(self.index_name).status['ready']:
                    time.sleep(1)
            except Exception as e:
                print(f"Failed to create index: {e}")
                return

        index = self.pc.Index(self.index_name)
        
        batch_size = 100
        for i in range(0, len(splits), batch_size):
            batch = splits[i:i+batch_size]
            texts = [doc.page_content for doc in batch]
            metadatas = [{"source": doc.metadata["source"], "repo": repo_name} for doc in batch]
            ids = [f"{repo_name}-{i+j}" for j in range(len(batch))]
            
            # Embed
            embeddings = self.embeddings.embed_documents(texts)
            
            # Upsert
            vectors = zip(ids, embeddings, metadatas)
            index.upsert(vectors=list(vectors))
            print(f"Upserted batch {i} to {i+len(batch)}")

        print("Ingestion complete.")
        return {"status": "success", "chunks": len(splits)}
