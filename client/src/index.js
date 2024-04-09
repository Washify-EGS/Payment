import React from 'react';
import ReactDOM from 'react-dom';
import {Elements} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';

import CheckoutForm from './CheckoutForm';

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe('pk_test_51OoOS3LthcxqmRhTrRHGxKcER3jdKmy6Y4pweKDwk9yGaIfTUvcs4XA5F4an4wyqcshWlIFoLd5lv26e4j1JiIXE00Mp1MCkKd');

(async () => {
    const response = await fetch('/secret');
    const {client_secret: clientSecret} = await response.json();
    // Render the form using the clientSecret
  })();

function App() {
  const options = {
    // passing the client secret obtained in step 3
    clientSecret: '{client_secret}',
    // Fully customizable with appearance API.
    appearance: {/*...*/},
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm />
    </Elements>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));









/* import React from "react";
import ReactDOM from "react-dom";
import App from './App'
import {loadStripe} from "@stripe/stripe-js";
import {Elements} from "@stripe/react-stripe-js";


const stripePromise = loadStripe('pk_test_51OoOS3LthcxqmRhTrRHGxKcER3jdKmy6Y4pweKDwk9yGaIfTUvcs4XA5F4an4wyqcshWlIFoLd5lv26e4j1JiIXE00Mp1MCkKd')

ReactDOM.render(
    <React.StrictMode>
        <Elements stripe = {stripePromise}>
        <App/>
        </Elements>
    </React.StrictMode>,
    
    document.getElementById('root')
); */