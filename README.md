
# Payment API
Integration of Stripe API and PayPal API for payment processing. 

## Installation
```bash
sudo npm install
```

## Usage
Run the following command:
```bash
node index.js
```

## Using Docker
Build image:
```bash
docker build -t payment-api .
```
Run container:
```bash
docker run --name payment-api-container -p 8002:8002 payment-api
```
