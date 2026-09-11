# Python ML Placement Email Classifier

Python service that classifies emails as placement-related or spam. Uses only Python standard library — no pip install required.

## Run the service

```bash
cd python-ml-service
python main.py
```

The API will be available at `http://localhost:8000`

## API Endpoints

- `POST /classify` - Classify a single email
- `POST /classify-batch` - Classify multiple emails

## Example Request

```bash
curl -X POST "http://localhost:8000/classify-batch" \
  -H "Content-Type: application/json" \
  -d '{
    "emails": [
      {
        "id": "1",
        "subject": "Campus placement drive tomorrow",
        "from_email": "placement@college.edu",
        "snippet": "You are shortlisted for the placement drive.",
        "body": "Please attend the placement drive tomorrow at 10 AM."
      }
    ]
  }'
```
