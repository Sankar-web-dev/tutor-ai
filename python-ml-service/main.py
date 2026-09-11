import json
import math
import os
import re
from http.server import BaseHTTPRequestHandler, HTTPServer
from typing import Dict, List, Tuple

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Training data
PLACEMENT_KEYWORDS = [
    "placement", "job opening", "job opportunity", "interview", "recruitment",
    "hiring", "career", "internship", "offer letter", "selected", "shortlisted",
    "assessment", "aptitude test", "technical interview", "hr interview",
    "on campus", "off campus", "drive", "recruiting", "opportunity",
    "apply now", "application", "cv", "resume", "shortlisted", "congratulations",
    "recruitment process", "eligibility", "job role", "package", "salary",
    "lpa", "ctc", "stipend", "bond", "bond period"
]

SPAM_KEYWORDS = [
    "unsubscribe", "promotional", "limited time", "buy now", "click here",
    "discount", "offer ends", "free gift", "congratulations you won",
    "claim your prize", "urgent action required", "verify your account",
    "suspicious activity", "lottery", "winner", "cash prize", "act now",
    "exclusive deal", "special promotion", "marketing", "newsletter",
    "promotions", "offers", "deals", "free gift", "win a", "urgent",
    "limited offer", "sale", "advertisement", "ads", "industrial visit",
    "guest lecture", "workshop", "seminar", "webinar",
    "online course", "certification",
    "resume upload", "recruiters can not see you", "recruiters cant see you",
    "job recommendations", "naukri campus", "naukri minis",
    "promotional announcement", "new courses",
    "get timely", "timely job", "app download"
]

PLACEMENT_EXAMPLES = [
    "You are shortlisted for the placement drive tomorrow.",
    "Interview scheduled for the software engineer role at 2 PM.",
    "Congratulations! You have been selected for the internship.",
    "Campus placement opportunity from Google for 2024 batch.",
    "Please submit your resume for the recruitment process.",
    "Your offer letter for the full-time role is attached.",
    "Technical assessment for placement drive on Friday.",
    "You have an HR interview tomorrow for the shortlisted candidates.",
    "Job opening for freshers at Infosys, apply now.",
    "Internship opportunity with stipend, no bond.",
    "Selected for next round of interview at Microsoft.",
    "Recruitment process starts tomorrow at 10 AM.",
    "Your CTC will be 8 LPA with 2 years bond.",
    "Campus drive for mechanical engineers, eligible candidates should attend.",
    "Assessment test for the placement cell at 3 PM."
]

SPAM_EXAMPLES = [
    "Buy now and get 50% discount on all products.",
    "Congratulations you won a free gift, claim your prize.",
    "Limited time offer, click here to unsubscribe.",
    "Win a lottery worth $1000 cash prize.",
    "Special promotion for our new product launch.",
    "Exclusive deal for today only, buy now.",
    "Marketing newsletter for the month.",
    "Free gift if you complete the survey now.",
    "Urgent action required for your account.",
    "Suspicious activity detected, verify your account.",
    "Best deals and offers just for you.",
    "Get 30% off on your next purchase.",
    "You are a winner, claim your prize money.",
    "Join our promotional event and win exciting prizes.",
    "Unsubscribe from our daily newsletter.",
    "GOMATHYSANKAR, recruiters cannot see you. Upload your resume for increased visibility.",
    "Department of Mechanical Engineering is organizing an Industrial Visit to ICF Chennai.",
    "Guest Lecture on Cracking the Career Code: From Campus to Corporate Success.",
    "Now 7499 per year: Learn from Microsoft experts with Coursera.",
    "Welcome to Your AWS Skill Builder Digital Team Subscription.",
    "New Promotional Announcement: MTF new courses on Udemy.",
    "Naukri Campus Get timely job recommendations and job alerts faster.",
    "Naukri MINIs: A 130M startup is hiring across AI and ML.",
    "How Does an ATS Score Your Resume? Read this career guidance blog.",
    "Department of Computer Science is organizing an Industrial Visit to BHAVINI.",
    "AWS training and certification new courses available."
]

# Non-placement email sources (promotional/course platforms only)
SPAM_DOMAINS = [
    "@naukri.com",
    "@minis.naukri.com",
    "@m.learn.coursera.org",
    "@coursera.org",
    "@aws.training",
    "@e.udemymail.com",
    "@udemy.com",
    "@udemy.com",
    "@inspireleap.in",
    "@ucanly.org"
]


def clean_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r'http\S+', ' ', text)
    text = re.sub(r'[^a-zA-Z\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def tokenize(text: str) -> List[str]:
    return clean_text(text).split()


class NaiveBayesClassifier:
    def __init__(self):
        self.word_counts = {'placement': {}, 'spam': {}}
        self.class_counts = {'placement': 0, 'spam': 0}
        self.total_words = {'placement': 0, 'spam': 0}
        self.vocab = set()

    def train(self, texts: List[Tuple[str, str]]):
        for text, label in texts:
            words = tokenize(text)
            self.class_counts[label] += 1
            for word in words:
                self.word_counts[label][word] = self.word_counts[label].get(word, 0) + 1
                self.total_words[label] += 1
                self.vocab.add(word)

    def predict_proba(self, text: str) -> float:
        words = tokenize(text)

        total_docs = self.class_counts['placement'] + self.class_counts['spam']
        if total_docs == 0:
            return 0.0

        p_placement = math.log((self.class_counts['placement'] + 1) / (total_docs + 2))
        p_spam = math.log((self.class_counts['spam'] + 1) / (total_docs + 2))

        vocab_size = len(self.vocab)

        for word in words:
            count_placement = self.word_counts['placement'].get(word, 0)
            count_spam = self.word_counts['spam'].get(word, 0)

            p_placement += math.log((count_placement + 1) / (self.total_words['placement'] + vocab_size + 1))
            p_spam += math.log((count_spam + 1) / (self.total_words['spam'] + vocab_size + 1))

        exp_p = math.exp(p_placement)
        exp_s = math.exp(p_spam)

        if exp_p + exp_s == 0:
            return 0.0

        return exp_p / (exp_p + exp_s)


def build_classifier() -> NaiveBayesClassifier:
    clf = NaiveBayesClassifier()
    training_data = []

    for text in PLACEMENT_EXAMPLES:
        training_data.append((text, 'placement'))

    for text in SPAM_EXAMPLES:
        training_data.append((text, 'spam'))

    clf.train(training_data)
    return clf


classifier = build_classifier()


def extract_domain(from_email: str) -> str:
    # Extract domain from "Name <email@domain.com>" or "email@domain.com"
    match = re.search(r'<([^>]+)>', from_email)
    if match:
        from_email = match.group(1)
    if '@' in from_email:
        return from_email.split('@')[-1].lower().strip()
    return from_email.lower().strip()


def is_spam_domain(from_email: str) -> bool:
    domain = extract_domain(from_email)
    for spam_domain in SPAM_DOMAINS:
        if domain.endswith(spam_domain[1:]) or domain == spam_domain[1:]:
            return True
    return False


def predict_email(subject: str, from_email: str, snippet: str, body: str) -> Tuple[bool, float, str]:
    # Hard filter: known spam domains
    if is_spam_domain(from_email):
        return False, 0.0, "Filtered by sender/domain."

    # Do not include from_email in ML text, only subject/snippet/body
    text = f"{subject} {snippet} {body}"
    cleaned = clean_text(text)

    placement_score = sum(1 for kw in PLACEMENT_KEYWORDS if kw in cleaned)
    spam_score = sum(1 for kw in SPAM_KEYWORDS if kw in cleaned)

    ml_score = classifier.predict_proba(text)

    # Keyword adjustment: placement boosts, spam penalizes
    final_score = ml_score
    if spam_score > 0:
        final_score = max(0.0, final_score - (spam_score * 0.08))
    if placement_score > 0:
        final_score = min(1.0, final_score + (placement_score * 0.1))

    # Direct wins: strong placement keywords override
    if placement_score >= 2 and spam_score == 0:
        final_score = max(0.7, final_score)

    # Direct losses: strong spam keywords with no placement keywords
    if spam_score >= 2 and placement_score == 0:
        final_score = min(0.3, final_score)

    is_placement = final_score >= 0.55

    if is_placement:
        reason = "Classified as placement-related by ML model."
    else:
        reason = "Classified as spam/non-placement by ML model."

    return is_placement, final_score, reason


class ClassifierHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        if self.path == '/':
            self.send_json(200, {"message": "Placement Email ML Classifier", "version": "1.0.0"})
        else:
            self.send_json(404, {"error": "Not found"})

    def do_POST(self):
        if self.path not in ['/classify', '/classify-batch']:
            self.send_json(404, {"error": "Not found"})
            return

        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        print(f"Received request: {self.path}, length: {content_length}")

        try:
            data = json.loads(body)
        except json.JSONDecodeError:
            self.send_json(400, {"error": "Invalid JSON"})
            return

        if self.path == '/classify':
            email = data
            is_placement, score, reason = predict_email(
                email.get('subject', ''),
                email.get('from_email', ''),
                email.get('snippet', ''),
                email.get('body', '')
            )
            self.send_json(200, {
                "id": email.get('id', ''),
                "is_placement": is_placement,
                "score": round(score, 3),
                "reason": reason
            })

        elif self.path == '/classify-batch':
            emails = data.get('emails', [])
            results = []
            for email in emails:
                is_placement, score, reason = predict_email(
                    email.get('subject', ''),
                    email.get('from_email', ''),
                    email.get('snippet', ''),
                    email.get('body', '')
                )
                results.append({
                    "id": email.get('id', ''),
                    "is_placement": is_placement,
                    "score": round(score, 3),
                    "reason": reason
                })
            self.send_json(200, results)

    def send_json(self, status: int, data: Dict):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def log_message(self, format, *args):
        pass


def run(host: str = '0.0.0.0', port: int = 8000):
    server = HTTPServer((host, port), ClassifierHandler)
    print(f"Placement Email ML Classifier running at http://{host}:{port}")
    server.serve_forever()


if __name__ == "__main__":
    run()
