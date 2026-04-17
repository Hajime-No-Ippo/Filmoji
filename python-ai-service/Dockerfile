FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for some packages (may increase build time)
RUN apt-get update && apt-get install -y --no-install-recommends \
	build-essential \
	gcc \
	&& rm -rf /var/lib/apt/lists/*

COPY . .

# Install Python deps from requirements
RUN pip install --no-cache-dir -r requirements.txt

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]