from fastapi import FastAPI
from routers import admin
from pydantic import BaseModel

app = FastAPI(description="Payment API Wrapper to implemnt most used payment methods",
              version="1.1",
              )

app.include_router(
    admin.router,
    prefix="/stripe",
    tags=["stripe"],
    responses={418: {"description": "I'm a teapot"}},
)

class payment(BaseModel):
    amount: float
    currency: str
    method: str
    info: str


@app.get("/v1/payments/{id}")
async def root(id="a"):
    return {"message": "Hello World"}

@app.post("/v1/payments/{id}")
async def root(id: str, pay: payment):
    return {"message": "Hello World"}


    

@app.delete("/v1/payments")
async def root():
    return {"message": "Hello World"}

@app.put("/v1/payments")
async def root():
    return {"message": "Hello World"}

