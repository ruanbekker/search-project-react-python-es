from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
import json

app = Flask(__name__)
CORS(app)

MEILI_HOST = os.getenv("MEILI_HOST", "http://localhost:7700")
MEILI_API_KEY = os.getenv("MEILI_API_KEY", "")

HEADERS = {"Authorization": f"Bearer {MEILI_API_KEY}"}

INDEX_NAME = "documents"

@app.route("/search", methods=["GET"])
def search():
    query = request.args.get("q", "")

    if not query:
        return jsonify([])

    res = requests.post(
        f"{MEILI_HOST}/indexes/{INDEX_NAME}/search",
        headers=HEADERS,
        json={"q": query, "limit": 10}
    )

    if res.status_code != 200:
        return jsonify([])

    return jsonify(res.json().get("hits", []))

@app.route("/popular-tags")
def popular_tags():

    res = requests.post(
        f"{MEILI_HOST}/indexes/{INDEX_NAME}/search",
        headers=HEADERS,
        json={"q": "", "limit": 1000}
    )

    if res.status_code != 200:
        return jsonify([])

    results = res.json().get("hits", [])

    tag_counts = {}
    for doc in results:
        for tag in doc.get("tags", []):
            tag_counts[tag] = tag_counts.get(tag, 0) + 1

    sorted_tags = sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)
    return jsonify([tag for tag, _ in sorted_tags[:10]])

@app.route("/details/<int:item_id>")
def get_details(item_id):

    res = requests.post(
        f"{MEILI_HOST}/indexes/{INDEX_NAME}/search",
        headers=HEADERS,
        json={"q": "", "limit": 1000}
    )

    if res.status_code != 200:
        return jsonify({}), 404

    hits = res.json().get("hits", [])
    for doc in hits:
        if doc.get("id") == item_id:
            return jsonify(doc)

    return jsonify({}), 404

@app.route("/setup", methods=["POST"])
def setup():
    with open('documents.json', 'r') as file:
        documents = json.load(file)

    requests.post(f"{MEILI_HOST}/indexes", headers=HEADERS, json={"uid": INDEX_NAME})

    res = requests.post(
        f"{MEILI_HOST}/indexes/{INDEX_NAME}/documents",
        headers=HEADERS,
        json=documents
    )

    return jsonify({"status": "index created", "details": res.json()})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

