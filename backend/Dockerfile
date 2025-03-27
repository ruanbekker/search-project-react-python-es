FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

ARG datestamp
ENV datestamp=$datestamp

COPY . .

CMD ["python", "app.py"]

