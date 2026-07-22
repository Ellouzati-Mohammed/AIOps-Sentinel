from fastapi import FastAPI

app = FastAPI(
    title="AIOps Sentinel API",
    version="1.0.0"
)

@app.get("/")
def home():
    return {"message": "AIOps Sentinel API"}