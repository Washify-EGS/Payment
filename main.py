from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi_versioning import VersionedFastAPI, version
from fastapi.encoders import jsonable_encoder
import stripe

stripe.api_key = "sk_test_51OoOS3LthcxqmRhTQOFt42tZJ8yEX4iwQZLz3ZaiRB4j0bnmHF9X0mu4kZx70P7segyWfORl6386MNWatM7cNmde007904vFAq"

app = FastAPI(description="Payment API Wrapper to implemnt most used payment methods",
                enable_latest=True
              )

class payment(BaseModel):
    amount: int
    currency: str


@app.get("/v1/payments/{id}")
async def getPayment(id: str):
    return {"message": "Hello World"}



@app.post("/v1/payment")
async def charge(payment_request: payment):
    try:
        payment_intent = stripe.PaymentIntent.create(
            amount=payment_request.amount,
            currency=payment_request.currency,
            payment_method_types=['card', 'paypal']
        )
        return {"paymentInfo": payment_intent}
    
    except stripe.error.StripeError as e:
        raise HTTPException(status_code= 400, detail=str(e))


@app.delete("/v1/payments")
async def deletePayments():
    return {"message": "Hello World"}