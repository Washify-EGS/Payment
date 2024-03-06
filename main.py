from fastapi import FastAPI
from routers import stripe, sibs
from fastapi_versioning import VersionedFastAPI, version


app = FastAPI(description="Payment API Wrapper to implemnt most used payment methods",
                enable_latest=True
              )

app.include_router(
    stripe.router,
    prefix="/stripe",
    tags=["stripe"],
    responses={418: {"description": "I'm a teapot"}},
)

app.include_router(
    sibs.router,
    prefix="/sibs",
    tags=["sibs"],
    responses={418: {"description": "I'm a teapot"}},
)

