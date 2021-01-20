FROM python:3.8.7-slim-buster

RUN apt-get update && apt-get install -y build-essential

COPY requirements.txt /

RUN pip install --no-cache-dir -r requirements.txt

COPY dask-config.yaml /root/dask/dask-config.yaml

CMD ["flask", "run"]
