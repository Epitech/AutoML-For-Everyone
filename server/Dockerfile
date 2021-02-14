FROM python:3.8.7-slim-buster AS server-base

RUN apt-get update && apt-get install -y build-essential
RUN pip install pipenv

COPY Pipfile /Pipfile
COPY Pipfile.lock /Pipfile.lock

RUN pipenv lock --keep-outdated --requirements > requirements.txt
RUN pip install -r requirements.txt

COPY dask-config.yaml /root/dask/dask-config.yaml



FROM server-base AS server-complete

RUN pip install 'gunicorn==20.0.4'

COPY app /app

CMD ["gunicorn", "app:create_app()", "-b", "0.0.0.0:5000"]



FROM server-complete AS server-worker

COPY worker_setup.py /
