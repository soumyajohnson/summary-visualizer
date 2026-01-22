# Text to Flowchart

This is a "Text to Flowchart" application that uses a Large Language Model (LLM) to generate a flowchart from a given text.

## Tech Stack

- **Frontend**: Next.js (App Router), React, React Flow, TypeScript
- **Backend**: FastAPI (Python), Pydantic, uvicorn
- **Layout**: ELK.js
- **Shared Schema**: TypeScript types and Pydantic models

## Project Structure

The project is structured as a monorepo with the following packages:

- `frontend`: The Next.js frontend application.
- `backend`: The FastAPI backend application.
- `shared`: Shared types and schema between the frontend and backend.

## Local Setup

### Prerequisites

- Node.js (v18 or higher)
- npm
- Python (v3.8 or higher)
- pip

### 1. Install Dependencies

First, install the dependencies for the root, frontend and shared packages:

```bash
npm install
npm install --prefix frontend
npm install --prefix shared
```

Then, install the dependencies for the backend:

```bash
pip install -r backend/requirements.txt
```

### 2. Set up Environment Variables

Create a `.env` file in the `backend` directory and add your Google API key:

```
GOOGLE_API_KEY="your_api_key"
```

You can get a Google API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### 3. Run the Backend

To run the backend, navigate to the `backend` directory and run the following command:

```bash
uvicorn main:app --reload
```

The backend will be available at `http://localhost:8000`.

### 4. Run the Frontend

To run the frontend, navigate to the `frontend` directory and run the following command:

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`.

## How to Use

1. Open the application in your browser at `http://localhost:3000`.
2. Enter the text you want to convert to a flowchart in the text area.
3. Click the "Generate Flowchart" button.
4. The application will generate a flowchart and display it on the screen.
5. You can export the flowchart as an SVG file by clicking the "Export as SVG" button.
