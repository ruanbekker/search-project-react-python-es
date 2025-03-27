# search-project-react-python-es
Search Project using React JavaScript, Python and Elasticsearch on Docker

## Test

<details>
  <summary>Test the API by making a request using the origin and x-api-key</summary>

```bash
curl -H "X-API-Key: super-secret-key" -H "Origin: http://192.168.0.70:3000" http://192.168.0.70:5000/popular-tags -i
HTTP/1.1 200 OK
Server: Werkzeug/3.1.3 Python/3.11.11
Date: Thu, 27 Mar 2025 22:24:28 GMT
Content-Type: application/json
Content-Length: 133
Access-Control-Allow-Origin: http://192.168.0.70:3000
Connection: close

[
  "drama",
  "thriller",
  "action",
  "crime",
  "sci-fi",
  "classic",
  "psychological",
  "epic",
  "family",
  "historical"
]
```

</details>
