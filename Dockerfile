FROM python:3.9.1-alpine

COPY requirements.txt /
RUN pip install --no-cache-dir -r requirements.txt

CMD ["flask", "run"]
