
# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Install system dependencies
# git is required for gitpython to clone repositories
RUN apt-get update && apt-get install -y \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Run the preload script to download the model into the image
RUN python preload_model.py

# Expose the port the app runs on
EXPOSE 8080

# Command to run the application
# We use the main_simple:app as seen in your active files
# Host 0.0.0.0 is required for Cloud Run
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
