#  Customer Support Bot

Most websites do not have chatbots that can cover each and every information about their portal. Education websites especially do not contain chatbots that can give information at a very detailed level. The platforms that do have chatbots often do not have good response times and cannot answer specific questions properly.

This AI-powered customer support chatbot solves these problems by providing accurate answers to user queries based on real website content. The bot uses RAG (Retrieval-Augmented Generation) technology to give reliable and helpful responses quickly.

##  Future Perspective

Currently, there is no unified platform that offers a **no-code solution** for building intelligent, website-specific chatbots. This project aims to address that gap.

The long-term vision is to transform this system into a **fully automated platform**, where users can generate a chatbot for any website—**without writing a single line of code**.

###  Proposed Workflow:
- The user provides a **URL** of their website via the platform.
- The integrated **Generic Scraper** (available in this GitHub repository) initiates a full crawl, extracting all meaningful content—including headings, paragraphs, and tables.
- The scraped data is automatically converted into **structured Markdown format**.
- This data feeds into a **RAG (Retrieval-Augmented Generation) pipeline**, where:
  - Embeddings are generated
  - Context is indexed and stored
  - A domain-specific chatbot is created
- The final output is a **plug-and-play chatbot** that users can integrate directly into their websites.

###  One Platform, Infinite Chatbots
This system will empower users to build **smart, customized bots for any domain**, including education, healthcare, business, or customer support, simply by submitting their website’s link.

---

**In essence, this project is a stepping stone toward democratizing intelligent assistant creation, transforming every website into an interactive knowledge base.**


##  What is RAG (Retrieval-Augmented Generation)?

RAG is a smart way for AI to answer questions properly. It works in two steps:
- **First**: It searches through stored information to find what's relevant to your question
- **Second**: It uses that information to create a natural, helpful answer

This means the bot doesn't make up answers. Instead, it looks through real website content first, finds the right information, then gives you a proper response. This way, you get answers that are both correct and easy to understand.

##  How the Bot Works (Step by Step)

### Step 1: Data Preparation
- Website content is already collected and stored in markdown format
- The bot breaks down this content into smaller, manageable pieces (chunks)
- Each chunk contains meaningful information that can answer specific questions

### Step 2: Creating Embeddings
- The bot converts each piece of content into "embeddings"

### Step 3: Storing in ChromaDB
- All the embeddings are stored in ChromaDB

### Step 4: When You Ask a Question
- Your question is also converted into an embedding
- The bot searches ChromaDB to find the most relevant content pieces
- It retrieves the top matching answers from the stored website content

### Step 5: Generating the Response
- The bot takes the retrieved information and sends it to the AI model
- The AI model creates a natural, helpful response based on this real information
- You get an accurate answer that sounds conversational and easy to understand


##  Performance Comparison

This bot generate responses from many AI models for comparison below are they:
- **OpenAI GPT**
- **LLaMA (hosted on DeepInfra)**  
- **Perplexity AI**




##  Example Questions and Answers

<details>
  <summary><strong>Q: How many colleges are there in UoS?</strong></summary>
  <blockquote>The University of Sharjah has <strong>15 colleges</strong> including Engineering, Medicine, Law, and more...</blockquote>
</details>

<details>
  <summary><strong>Q: Who is Dr. Amina Al Marzouqi?</strong></summary>
  <blockquote>A Vice Chancellor with 40+ years of experience in healthcare and academia...</blockquote>
</details>

<details>
  <summary><strong>Q: How many students are there at UoS?</strong></summary>
  <blockquote>There are <strong>20,754 students</strong> currently enrolled at the University of Sharjah.</blockquote>
</details>

---

##  Technology Used

- **Content Processing**: Python tools to organize the collected information
- **Smart Search**: AI models to understand what users are asking
- **Response Generation**: LLaMA API to create natural answers
- **Data Storage**: ChromaDB to store and find information quickly






##  Getting Started

### Installation and Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/AdeelIntizar/UoS_BoT.git
   cd UoS_BoT
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the Application**
   ```bash
   python app.py
   ```

4. **Access the API**
   - A FastAPI server will start automatically
   - You can test your model through the generated API endpoints
   - The API provides an interactive interface to test the chatbot functionality

### Frontend Options

The project includes two dockerized frontend versions:

#### LLaMA Version
- **Directory**: `llama/`
- Contains the main frontend interface


#### LLaMA v2 Version  
- **Directory**: `llama_v2/`
- Contains an updated frontend interface


Both frontend versions are ready to use and can be deployed using Docker for a complete chatbot experience.
