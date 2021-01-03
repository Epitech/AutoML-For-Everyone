FROM python:3.8.7-slim-buster

COPY requirements.txt /

RUN apt-get update && apt-get install -y build-essential

RUN pip3 install shap

RUN pip install --no-cache-dir -r requirements.txt

CMD ["flask", "run"]
