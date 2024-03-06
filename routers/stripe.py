from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class payment(BaseModel):
    amount: float
    currency: str
    info: str


@router.get("/v1/payments/{id}")
async def root(id: str, pay: payment):
    return {"message": "Hello World"}



@router.post("/v1/payments/{id}")
async def root(id:str, pay: payment):
    return {"message": "Hello World"}


    

@router.delete("/v1/payments")
async def root():
    return {"message": "Hello World"}

@router.put("/v1/payments")
async def root():
    return {"message": "Hello World"}



