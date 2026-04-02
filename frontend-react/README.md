# Frontend Deployment Guide

This directory contains the modernized React/Tailwind frontend for the network security assessment platform.

## Option 1: Running with Docker (Recommended)

If you don't have Node.js installed locally, you can run the frontend completely inside Docker using the provided `Dockerfile`.

1. Build the Docker image:
   ```bash
   docker build -t secops-frontend .
   ```

2. Run the container:
   ```bash
   docker run -d -p 3000:80 --name frontend secops-frontend
   ```

3. Open your browser and navigate to `http://localhost:3000`.

## Option 2: Running Locally (Requires Node.js)

If you have Node.js and NPM installed:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server (with hot module replacement):
   ```bash
   npm run dev
   ```

3. Open your browser to the URL provided in the terminal (usually `http://localhost:5173`).
