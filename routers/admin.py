from fastapi import APIRouter

router = APIRouter()


@router.post("/")
async def update_admin():
    return {"message": "Admin getting schwifty"}

@router.get("/v1/payments/{var1}")
async def root(var1="a"):
    return {"message": "Hello World"}

@router.post("/v1/payments")
async def root():
    return {"message": "Hello World"}

@router.delete("/v1/payments")
async def root():
    return {"message": "Hello World"}

@router.put("/v1/payments")
async def root():
    return {"message": "Hello World"}