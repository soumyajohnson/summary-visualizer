### Running the Backend

**IMPORTANT**: These commands should be run from the project's root directory (`D:\Somi Projects\summary-visualizer`), not from within the `venv` or `backend` directory.

1.  Open your terminal in the project root directory.

2.  Create a virtual environment inside the `backend` folder and activate it:
    ```sh
    # On Windows
    python -m venv backend/venv
    .\backend\venv\Scripts\activate

    # On macOS/Linux
    python3 -m venv backend/venv
    source backend/venv/bin/activate
    ```
    *(This keeps the backend environment self-contained.)*

3.  Install dependencies into the new virtual environment:
    ```sh
    pip install -r backend/requirements.txt
    ```

4.  Run the FastAPI server using the following command from the **project root**:
    ```sh
    uvicorn app.main:app --reload --app-dir backend
    ```
    - `--app-dir backend` is the key fix: It tells Uvicorn to look for your application inside the `backend` directory.

The API will be available at `http://127.0.0.1:8000`.

-   **API Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
-   **Health Check**: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)