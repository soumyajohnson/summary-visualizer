### Running the Backend

1.  Navigate to the `backend` directory.
2.  Create a virtual environment and activate it:
    ```sh
    # On macOS/Linux
    python3 -m venv venv
    source venv/bin/activate

    # On Windows
    python -m venv venv
    .\venv\Scripts\activate
    ```
3.  Install dependencies from `requirements.txt`:
    ```sh
    pip install -r requirements.txt
    ```
4.  Run the FastAPI server using Uvicorn:
    ```sh
    # From within the 'backend' directory
    uvicorn app.main:app --reload --app-dir .
    ```
    - `--reload` enables auto-reload on code changes.
    - `--app-dir .` tells Uvicorn to run from the `backend` directory, which makes `app` a discoverable package.

The API will be available at `http://127.0.0.1:8000`.

-   **API Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
-   **Health Check**: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)
