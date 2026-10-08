FROM python:3.10-slim

WORKDIR /app

# Python / pip optimizations
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PIP_NO_CACHE_DIR=1

# Install application dependencies
COPY requirements.txt .

RUN pip install --upgrade pip \
    && pip install -r requirements.txt \
    && pip install torch==2.13.0 --index-url https://download.pytorch.org/whl/cpu

# Copy application
COPY app ./app
COPY ML ./ML

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]