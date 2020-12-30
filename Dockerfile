FROM python:3.8.7-slim-buster

COPY requirements.txt /
RUN pip install --no-cache-dir -r requirements.txt

CMD ["flask", "run"]
