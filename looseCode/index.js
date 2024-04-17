// import React, { useEffect, useState } from 'react';
// import ReactDOM from 'react-dom';
// import {Elements} from '@stripe/react-stripe-js';
// import {loadStripe} from '@stripe/stripe-js';

// import CheckoutForm from './CheckoutForm';

// // Make sure to call `loadStripe` outside of a component’s render to avoid
// // recreating the `Stripe` object on every render.
// const stripePromise = loadStripe('pk_test_51OoOS3LthcxqmRhTrRHGxKcER3jdKmy6Y4pweKDwk9yGaIfTUvcs4XA5F4an4wyqcshWlIFoLd5lv26e4j1JiIXE00Mp1MCkKd');

// (async () => {
//     const response = await fetch('/secret');
//     const {client_secret} = await response.json();
//     // Render the form using the clientSecret
//   })();

// function App() {

//     const [clientSecret, setClientSecret] = useState(null);

//     useEffect(() => {
//         const fetchClientSecret = async () => {
//         const response = await fetch('/secret');
//         const { client_secret: fetchedClientSecret } = await response.json();
//         setClientSecret(fetchedClientSecret);
//         };

//         fetchClientSecret();
//     }, []);


//   const options = {
//     // passing the client secret obtained in step 3
//     clientSecret: '{{client_secret}}',
//     // Fully customizable with appearance API.
//     appearance: {/*...*/},
//   };

//   return (
//     <Elements stripe={stripePromise} options={options}>
//       <CheckoutForm />
//     </Elements>
//   );
// };

// ReactDOM.render(<App />, document.getElementById('root'));









/* import React from "react";


import {loadStripe} from "@stripe/stripe-js";
import {Elements} from "@stripe/react-stripe-js";


const stripePromise = loadStripe('pk_test_51OoOS3LthcxqmRhTrRHGxKcER3jdKmy6Y4pweKDwk9yGaIfTUvcs4XA5F4an4wyqcshWlIFoLd5lv26e4j1JiIXE00Mp1MCkKd')

(async () => {
    const response = await fetch('/secret');
    const {client_secret: clientSecret} = await response.json();

  })(); */


 

  import React, { useState, useEffect } from 'react';

  function App() {
      // State to store the client secret
      const [clientSecret, setClientSecret] = useState('');
  
      useEffect(() => {
          // Fetch the client secret when the component mounts
          const fetchSecret = async () => {
              try {
                  console.log('Fetching secret...');
                  const response = await fetch('http://0.0.0.0/secret');
                  console.log('Response status:', response.status);
  
                  if (!response.ok) {
                      throw new Error('Failed to fetch secret');
                  }
  
                  const { client_secret: secret } = await response.json();
                  console.log('Client Secret:', secret);
                  setClientSecret(secret);
              } catch (error) {
                  console.error('Error fetching client secret:', error);
                  // Handle error
              }
          };
  
          fetchSecret();
  
          // Clean up function
          return () => {
              // Perform any cleanup (if needed)
          };
      }, []); // Empty dependency array means this effect runs only once on component mount
  
      return (
          <div>
              <h1>Hello world!</h1>
              <p>Client Secret: {clientSecret}</p>
          </div>
      );
  }
  
  export default App;
  
  
