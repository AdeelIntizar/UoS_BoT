import pandas as pd
import torch
import requests
from openai import OpenAI
import os
import uvicorn
from dotenv import load_dotenv
from groq import Groq
import chromadb
from chromadb.config import Settings
from chromadb.utils import embedding_functions
from sklearn.metrics.pairwise import cosine_similarity
from transformers import AutoTokenizer, AutoModel
from chromadb import Client
import openai
from langchain.text_splitter import RecursiveCharacterTextSplitter
import os
from fastapi.middleware.cors import CORSMiddleware
from docx import Document
load_dotenv()
from fastapi import FastAPI
app = FastAPI()
origins = [
    "http://localhost:8000",
    "http://localhost:3000",
    "http://192.168.18.99:3000",
    "http://192.168.18.99",
    "http://192.168.18.1:8000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_embeddings(texts, tokenizer, model):
    inputs = tokenizer(texts, padding=True, truncation=True, return_tensors="pt")
    with torch.no_grad():
        embeddings = model(**inputs).last_hidden_state.mean(dim=1)
    return embeddings.cpu().numpy()

def split_text(text):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=2000,
        chunk_overlap=500,
        separators=["\n", ", ", " "]
    )
    chunks = text_splitter.split_text(text)
    return chunks

def chunks_and_embeddings(main_heading_list, para_table_list, model, tokenizer):
    chunks_data = []
    embedding_list = []
    metadata_list = []
    visited_list = []
    for index,(main, para) in enumerate(zip(main_heading_list, para_table_list)):
        print("Index : ",index)
        temp_list = []
        temp_tuple = (main, para)
        if main and para:
            if temp_tuple not in visited_list:
                visited_list.append(temp_tuple)
                chunks = split_text(str(para))
                print("Length of chunks : ",len(chunks))
                for ind, chunk in enumerate(chunks):
                    print("Chunk number : ",ind)
                    chunks_data.append(chunk)
                    embeddings = get_embeddings([chunk], tokenizer, model)
                    embedding_list.append(embeddings)
                    all_details = "".join(main)
                    metadata_list.append(all_details)
    return chunks_data, embedding_list, metadata_list
def parse_markdown_line_by_line(file_path,model,tokenizer):
    main_heading_list=[]
    paragraphs_list=[]
    current_heading=""
    temp_heading_list=[]
    temp_paragraphs_list=[]
    headers = []  # To store table headers
    in_table = False

    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return

    with open(file_path, 'r', encoding='utf-8') as file:
        # print("Parsed Markdown Content:\n")
        for index, line in enumerate(file):
            # print(index)
            line = line.strip()
            if line.startswith("# ") and not line.startswith("##"):
                content = line[2:].strip()
                if current_heading!=content and current_heading!="":
                    main_heading_list.append(",".join(temp_heading_list))
                    paragraphs_list.append(",".join(temp_paragraphs_list))
                    current_heading=content
                    temp_heading_list=[]
                    temp_paragraphs_list=[]
                    temp_heading_list.append(content)
                elif current_heading=="":
                    current_heading=content
                    temp_heading_list.append(content)
            elif line.startswith("## ") and not line.startswith("###"):
                content = line[3:].strip()
                temp_heading_list.append(content)
                temp_paragraphs_list.append(content)
            elif line.startswith("### ") and not line.startswith("####"):
                content = line[4:].strip()
                temp_heading_list.append(content)
                temp_paragraphs_list.append(content)
                in_table = False  # Reset table flag when a new heading starts

            elif "|" in line and not in_table:
                headers = [col.strip() for col in line.split("|") if col]
                in_table = True
                skip_flag = True

            elif "|" in line and in_table:
                row_data = [col.strip() for col in line.split("|") if col]
                if all("-" in col for col in row_data):
                    continue

                if len(headers) == len(row_data):
                    row_dict = {headers[i]: row_data[i] for i in range(len(headers))}
                    formatted_row = f"({', '.join([f'{key}: {value}' for key, value in row_dict.items()])})"
                    temp_paragraphs_list.append(formatted_row)

            elif in_table and not line.strip():
                in_table = False
                headers = []

            elif "|" not in line:
                temp_paragraphs_list.append(line)
        main_heading_list.append(" , ".join(temp_heading_list))
        paragraphs_list.append(" , ".join(temp_paragraphs_list))
        print("Length of headings : ",len(main_heading_list))
        print("Length of paragraphs : ",len(paragraphs_list))
    chunks_data,embedding_list,metadata_list=chunks_and_embeddings(main_heading_list,paragraphs_list,model,tokenizer)
    return chunks_data,embedding_list,metadata_list

def store_data_in_chromadb(chunks_data, embedding_list, metadata_list, collection_name=""):
    client = Client()
    collection = client.get_or_create_collection(name=collection_name)
    for idx, (chunk, embedding, metadata) in enumerate(zip(chunks_data, embedding_list, metadata_list)):
        doc_id = f"doc_{idx}"
        try:
            collection.add(
                ids=[doc_id],
                documents=[chunk],
                metadatas=[{"UoS Info": metadata}],
                embeddings=embedding,
            )
        except Exception as e:
            print(f"Error adding data for doc_id {doc_id}: {e}")
            continue
    print(f"Data successfully stored in ChromaDB under collection '{collection_name}'.")
def get_response(question, context, metadata):
    prompt = f"""
    Answer the following question concisely in 1-3 sentences. Provide only the relevant information requested, strictly based on the context and metadata provided. Do not include any information beyond the context and metadata.
    Question: {question}
    Context: {context}
    Metadata: {metadata}
    Answer:
    """
    url = "http://34.55.35.224:8040/v1/completions"
    req_body = {
    "model": os.getenv("model_id"),
    "prompt": prompt,
    "max_tokens": 150,
    "temperature": 0.2,
    "stop": ["\n", "Answer:"]

}
    resp = requests.post(url, json=req_body)
    resp = resp.json()
    return resp['choices'][0]['text']
def get_response_openai(question, context, metadata):
    prompt = f"""
    Answer the following question concisely in 1-3 sentences. Use only the relevant information from the context and metadata and must not mention context or metadata as reference in response
    Also validate the answer from metadata and context and if the answer is unavailable then give an apology message(something like you do not have information about that, is there anything else you can help with)

    Question: {question}
    Context: {context}
    Metadata: {metadata}
    Answer:
    """
    client = OpenAI(api_key=os.getenv("openai_api_key"))
    GPT_MODEL = "gpt-4-1106-preview" 
    messages = [
            {"role": "system", "content": 'You answer question about Web  services.'
            },
            {"role": "user", "content": prompt},
        ]
    response = client.chat.completions.create(
            model=GPT_MODEL,
            messages=messages,
            temperature=0
        )
    response_message = response.choices[0].message.content
    return response_message

def caller_fn(query_question):
    client = Client()
    collection = client.get_or_create_collection("UOS_info")
    question_embedding = get_embeddings([query_question], tokenizer, model)
    results = collection.query(
        query_embeddings=[question_embedding[0].tolist()],
        n_results=50
    )
    response=""
    openai_response=""
    try:
        response = get_response(query_question,results['documents'],results['metadatas'])
    except:
        response=""
    try:
        openai_response = get_response_openai(query_question,results['documents'],results['metadatas'])
    except:
        openai_response=""
    data={"chunks":results["documents"],
          "metadata":results["metadatas"],
          "similarity":results["distances"],
          "nueralhive_llama_response":response,
          "Openai_response":openai_response}
    return data
@app.get("/")
def read_root(query: str):
    response=caller_fn(query)
    return response
file_path="D:/scrapper/NUST_data/Univeristy_of_Sharjah2.md"
tokenizer = AutoTokenizer.from_pretrained("sentence-transformers/all-MiniLM-L6-v2")
model = AutoModel.from_pretrained("sentence-transformers/all-MiniLM-L6-v2")
chunks_data,embedding_list,metadata_list=parse_markdown_line_by_line(file_path,model,tokenizer)
store_data_in_chromadb(chunks_data, embedding_list, metadata_list, collection_name="UOS_info")
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
    