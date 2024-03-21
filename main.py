from fastapi import FastAPI, Request
from pydantic import BaseModel
from fastapi_versioning import VersionedFastAPI, version
from fastapi.encoders import jsonable_encoder
import stripe

stripe.api_key = "sk_test_51OoOS3LthcxqmRhTQOFt42tZJ8yEX4iwQZLz3ZaiRB4j0bnmHF9X0mu4kZx70P7segyWfORl6386MNWatM7cNmde007904vFAq"

app = FastAPI(description="Payment API Wrapper to implemnt most used payment methods",
                enable_latest=True
              )

class payment(BaseModel):
    amount: float
    currency: str
    method: str 


@app.get("/v1/payments/{id}")
async def root(id: str):
    return {"message": "Hello World"}



@app.post("/v1/payment")
async def charge():
    
    payment_intent = stripe.PaymentIntent.create(
    amount = 200,
    currency = "eur",
    payment_method_types = ['card', 'paypal']
    )

    return jsonable_encoder({'paymentInfo': payment_intent})
        
   


@app.delete("/v1/payments")
async def root():
    return {"message": "Hello World"}



@app.put("/v1/payments")
async def root():
    return {"message": "Hello World"}

