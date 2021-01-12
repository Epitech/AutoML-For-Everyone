FROM python:3.8.7-slim-buster

RUN apt-get update && apt-get install -y build-essential

RUN pip3 install shap

COPY requirements.txt /

RUN pip install --no-cache-dir -r requirements.txt

CMD ["flask", "run"]
