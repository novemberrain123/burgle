FROM pytorch/pytorch:latest
WORKDIR /app
COPY requirements.txt /app
RUN apt-get update
RUN pip install -r requirements.txt
COPY . /app