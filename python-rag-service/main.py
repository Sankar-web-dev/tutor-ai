import json
import math
import os
import re
import urllib.error
import urllib.request
from collections import Counter
from http.server import BaseHTTPRequestHandler, HTTPServer
from typing import Any, Dict, List, Optional


BASE_DIR = os.path.dirname(os.path.abspath(__file__))

STOP_WORDS = set([
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't",
    "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by",
    "can", "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing",
    "don't", "down", "during", "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't",
    "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself",
    "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is",
    "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself", "no",
    "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves",
    "out", "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so",
    "some", "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then", "there",
    "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through", "to",
    "too", "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were",
    "weren't", "what", "what's", "when", "when's", "where", "where's", "which", "while", "who", "who's",
    "whom", "why", "why's", "with", "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're",
    "you've", "your", "yours", "yourself", "yourselves"
])


def tokenize(text: str) -> List[str]:
    """Extract lowercase word tokens, dropping stop words."""
    if not text:
        return []
    text = text.lower()
    text = re.sub(r'http\S+', ' ', text)
    tokens = re.findall(r"[a-z0-9]+(?:[-'][a-z0-9]+)*", text)
    return [t for t in tokens if t not in STOP_WORDS and len(t) > 1]


def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 150, min_size: int = 200) -> List[str]:
    """Split text into overlapping chunks, trying not to break words."""
    if not text:
        return []
    if len(text) <= chunk_size:
        return [text.strip()]

    chunks = []
    start = 0
    n = len(text)
    while start < n:
        end = min(start + chunk_size, n)
        if end < n:
            # Walk back to a word boundary
            while end > start and text[end] not in (' ', '\n'):
                end -= 1
            if end == start:
                end = min(start + chunk_size, n)
        chunks.append(text[start:end].strip())
        next_start = end - overlap
        if next_start <= start:
            break
        start = next_start

    return [c for c in chunks if len(c) >= min_size]


class RAGIndex:
    """In-memory TF-IDF index for document chunks."""

    def __init__(self, chunk_size: int = 1000, overlap: int = 150):
        self.chunk_size = chunk_size
        self.overlap = overlap
        self.chunks: List[Dict[str, Any]] = []
        self.idf: Dict[str, float] = {}
        self.vectors: List[Dict[str, float]] = []
        self.norms: List[float] = []

    def index(self, documents: List[Dict[str, Any]]):
        """Index a list of documents. Each document must have id, name, content."""
        self.chunks = []
        for doc in documents:
            doc_id = doc.get('id', '')
            name = doc.get('name', doc_id)
            content = doc.get('content', '')
            if not content:
                continue
            for chunk_str in chunk_text(content, self.chunk_size, self.overlap):
                self.chunks.append({
                    'id': doc_id,
                    'name': name,
                    'text': chunk_str,
                    'terms': Counter(tokenize(chunk_str))
                })

        if not self.chunks:
            return

        N = len(self.chunks)
        df = Counter()
        for chunk in self.chunks:
            for term in chunk['terms']:
                df[term] += 1

        self.idf = {
            term: math.log((N + 1) / (count + 1)) + 1.0
            for term, count in df.items()
        }

        self.vectors = []
        self.norms = []
        for chunk in self.chunks:
            vec = {term: count * self.idf.get(term, 1.0) for term, count in chunk['terms'].items()}
            norm = math.sqrt(sum(v * v for v in vec.values()))
            self.vectors.append(vec)
            self.norms.append(norm)

    def query(self, question: str, k: int = 5) -> List[Dict[str, Any]]:
        """Return the top-k most relevant chunks for the question."""
        if not self.chunks:
            return []

        q_terms = Counter(tokenize(question))
        q_vec = {term: count * self.idf.get(term, 1.0) for term, count in q_terms.items()}
        q_norm = math.sqrt(sum(v * v for v in q_vec.values()))

        if q_norm == 0:
            return []

        scored = []
        for idx, (vec, norm) in enumerate(zip(self.vectors, self.norms)):
            if norm == 0:
                continue
            dot = sum(q_vec[term] * vec.get(term, 0.0) for term in q_vec)
            score = dot / (q_norm * norm)
            chunk = self.chunks[idx]
            scored.append({
                'id': chunk['id'],
                'name': chunk['name'],
                'text': chunk['text'],
                'score': round(score, 4)
            })

        scored.sort(key=lambda x: x['score'], reverse=True)
        return scored[:k]


def call_openrouter(api_key: str, model: str, messages: List[Dict[str, str]], max_tokens: int, temperature: float) -> Dict[str, Any]:
    payload = {
        'model': model,
        'messages': messages,
        'temperature': temperature,
        'max_tokens': max_tokens
    }

    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Python RAG QA'
    }

    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(
        'https://openrouter.ai/api/v1/chat/completions',
        data=data,
        headers=headers,
        method='POST'
    )

    try:
        with urllib.request.urlopen(req, timeout=90) as resp:
            return json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        return {'error': e.read().decode('utf-8'), 'status': e.code}
    except Exception as e:
        return {'error': str(e), 'status': 500}


def generate_answer(question: str, chunks: List[Dict[str, Any]], api_key: str, model: str, max_tokens: int) -> Dict[str, Any]:
    context = '\n\n'.join(
        f"--- From {chunk.get('name', 'document')} ---\n{chunk.get('text', '')}"
        for chunk in chunks
    )

    system_prompt = (
        "You are a friendly tutor that explains topics in a simple, easy-to-understand way. "
        "Use the provided notes to help answer, and feel free to add general knowledge to make the explanation clearer. "
        "Always return a valid JSON object with exactly this structure:\n"
        "{\"answer\": \"...\", \"references\": [{\"title\": \"...\", \"url\": \"...\"}]}\n"
        "Include 2 to 4 relevant reference links from the internet with title and URL."
    )

    user_prompt = (
        f"Notes:\n{context}\n\n"
        f"Question: {question}\n\n"
        "Provide:\n"
        "1. A simple, clear explanation\n"
        "2. 2 to 4 relevant reference links from the internet (title and URL) where the student can learn more\n\n"
        "Return ONLY a JSON object in this exact structure:\n"
        '{\n  "answer": "Your easy explanation here",\n  "references": [\n    { "title": "Example Title", "url": "https://example.com" }\n  ]\n}'
    )

    messages = [
        {'role': 'system', 'content': system_prompt},
        {'role': 'user', 'content': user_prompt}
    ]

    response = call_openrouter(api_key, model, messages, max_tokens, 0.4)
    if 'error' in response:
        return {'answer': f"Error from AI: {response.get('error')}", 'references': [], 'chunks': chunks}

    content = response.get('choices', [{}])[0].get('message', {}).get('content', '').strip()
    if not content:
        return {'answer': 'No response generated by AI model.', 'references': [], 'chunks': chunks}

    # 1. Clean markdown code fences if present
    cleaned = content
    if '```' in cleaned:
        fence_match = re.search(r'```(?:json)?\s*(\{[\s\S]*\})\s*```', cleaned)
        if fence_match:
            cleaned = fence_match.group(1)

    # 2. Greedy search for outermost braces
    start = cleaned.find('{')
    end = cleaned.rfind('}')
    if start != -1 and end != -1 and end > start:
        json_str = cleaned[start:end+1]
        try:
            parsed = json.loads(json_str, strict=False)
            if isinstance(parsed, dict) and 'answer' in parsed:
                return {
                    'answer': str(parsed.get('answer', content)),
                    'references': parsed.get('references', []) if isinstance(parsed.get('references'), list) else [],
                    'chunks': chunks
                }
        except Exception:
            pass

        # 3. Fallback: Try regex to extract "answer" field directly if full JSON had syntax glitch
        ans_match = re.search(r'"answer"\s*:\s*"((?:[^"\\]|\\.)*)"', json_str, re.DOTALL)
        if ans_match:
            try:
                ans_text = json.loads(f'"{ans_match.group(1)}"')
                refs = []
                for ref_match in re.finditer(r'\{\s*"title"\s*:\s*"([^"]+)"\s*,\s*"url"\s*:\s*"([^"]+)"\s*\}', json_str):
                    refs.append({'title': ref_match.group(1), 'url': ref_match.group(2)})
                return {'answer': ans_text, 'references': refs, 'chunks': chunks}
            except Exception:
                pass

    # 4. If all else fails, return the model content directly
    display_content = content
    if display_content.startswith('{"answer":') or display_content.startswith('{\n  "answer":'):
        display_content = re.sub(r'^\s*\{\s*"answer"\s*:\s*"?', '', display_content)
        display_content = re.sub(r'"?\s*,?\s*"references"[\s\S]*$', '', display_content)

    return {'answer': display_content.strip() or content, 'references': [], 'chunks': chunks}


class RAGHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        if self.path == '/':
            self.send_json(200, {'message': 'Python RAG QA Service', 'version': '1.0.0'})
        else:
            self.send_json(404, {'error': 'Not found'})

    def do_POST(self):
        if self.path not in ['/rag']:
            self.send_json(404, {'error': 'Not found'})
            return

        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        print(f"Received request: {self.path}, length: {content_length}")

        try:
            data = json.loads(body)
        except json.JSONDecodeError:
            self.send_json(400, {'error': 'Invalid JSON'})
            return

        if self.path == '/rag':
            documents = data.get('documents', [])
            question = data.get('question', '').strip()
            api_key = data.get('api_key', '')
            model = data.get('model', 'mistralai/mistral-nemo')
            k = int(data.get('k', 5))
            max_tokens = int(data.get('max_tokens', 2048))

            if not documents:
                self.send_json(400, {'error': 'No documents provided'})
                return
            if not question:
                self.send_json(400, {'error': 'No question provided'})
                return
            if not api_key:
                self.send_json(400, {'error': 'No api_key provided'})
                return

            index = RAGIndex()
            index.index(documents)
            chunks = index.query(question, k)

            if not chunks:
                self.send_json(200, {
                    'answer': "I could not find any relevant text in the provided notes.",
                    'references': [],
                    'chunks': []
                })
                return

            result = generate_answer(question, chunks, api_key, model, max_tokens)
            self.send_json(200, result)

    def send_json(self, status: int, data: Dict[str, Any]):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def log_message(self, format, *args):
        pass


def run(host: str = '0.0.0.0', port: int = 8001):
    server = HTTPServer((host, port), RAGHandler)
    print(f"Python RAG QA Service running at http://{host}:{port}")
    server.serve_forever()


if __name__ == '__main__':
    run()
