FROM python:3.8.7-slim-buster

RUN apt-get update && apt-get install -y build-essential
RUN pip install pipenv

COPY Pipfile /Pipfile
COPY Pipfile.lock /Pipfile.lock

RUN pipenv lock --keep-outdated --requirements > requirements.txt
RUN pip install -r requirements.txt

COPY dask-config.yaml /root/dask/dask-config.yaml

CMD ["flask", "run"]
