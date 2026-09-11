# Python RAG QA Service

A lightweight, pure-Python RAG (Retrieval-Augmented Generation) service for the QA from Drive feature.

## What it does

- Receives a list of documents (text extracted from Drive files, including PDFs)
- Splits documents into overlapping chunks
- Builds an in-memory TF-IDF index
- Finds the most relevant chunks for a question
- Sends those chunks + the question to OpenRouter
- Returns a simple AI explanation and reference links

## Requirements

No external Python packages are required. The service uses only the standard library.

If you want the service to parse raw PDF bytes in the future, install `PyPDF2` or `PyMuPDF` and add extraction logic to the `/rag` endpoint.

## Run

From the project root:

```bash
cd python-rag-service
python main.py
```

The server starts on `http://localhost:8001`.

## Endpoint

### `POST /rag`

Request body:

```json
{
  "documents": [
    { "id": "file-id", "name": "Unit IV.pdf", "content": "extracted text..." }
  ],
  "question": "What is the drive date for Kyndryl?",
  "api_key": "YOUR_OPENROUTER_KEY",
  "model": "mistralai/mistral-nemo",
  "k": 5,
  "max_tokens": 2048
}
```

Response:

```json
{
  "answer": "The drive date is ...",
  "references": [
    { "title": "Example", "url": "https://example.com" }
  ],
  "chunks": [
    { "id": "file-id", "name": "Unit IV.pdf", "text": "...", "score": 0.85 }
  ]
}
```

`k` controls how many chunks are retrieved. `max_tokens` limits the output length sent to OpenRouter.
