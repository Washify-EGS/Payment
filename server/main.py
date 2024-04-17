from fastapi import FastAPI, HTTPException, Request, Response, Depends
from pydantic import BaseModel
from fastapi_versioning import VersionedFastAPI, version
from fastapi.encoders import jsonable_encoder
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import stripe
import os

load_dotenv()

origins = [
    "http://127.0.0.1:8080"
]

stripe.api_key = os.getenv("STRIPE_API_KEY")

app = FastAPI(description="Payment API Wrapper to implemnt most used payment methods",
                enable_latest=True
              )

# Allow CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.intent = None

key = os.getenv("STRIPE_PUBLIC_KEY")

class payment(BaseModel):
    amount: int
    currency: str


@app.get("/v1/payments/{id}")
async def getPayment(id: str):
    return {"message": "payment intent here"}

@app.get("/config")
async def config():
    return{"publishableKey": key}


@app.get("/secret")
def clientSecret():
    return {"paymentInfo": app.intent}

@app.post("/v1/payment")
async def charge(payment_request: payment):
    try:
        payment_intent = stripe.PaymentIntent.create(
            amount=payment_request.amount,
            currency=payment_request.currency,
            payment_method_types=['card', 'paypal']
        )

        app.intent = payment_intent.client_secret

        return {"paymentInfo": payment_intent}
    
    except stripe.error.StripeError as e:
        raise HTTPException(status_code= 400, detail=str(e))
    

@app.post("/create-checkout-session")
async def create_checkout_session():
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            mode="payment",
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': 'T-shirt',
                    },
                    'unit_amount': 2000,
                },
                'quantity': 1,
            }],
            success_url=f"{os.getenv('SERVER_URL')}/success.html",
            cancel_url=f"{os.getenv('SERVER_URL')}/cancel.html",
        )
        return RedirectResponse(url=session.url, status_code=303)
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=500, detail=f"Stripe error: {e}")
    
@app.options("/create-checkout-session")
async def handle_options(request: Request):
    response = Response()
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"
    return response



@app.delete("/v1/payments")
async def deletePayments():
    return {"message": "Hello World"}