document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const stripeId = urlParams.get('stripe_id');
    let currency = "USD";
    let alerts = document.getElementById("alerts");
  
    // If the payment was successful, display the success message
    if (stripeId) {
        fetch('http://localhost:8080/complete_order_stripe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stripe_id: stripeId })
        })
        .then(response => response.json())
        .then(data => {
          const alerts = document.getElementById('alerts');
          if (alerts) {
            alerts.innerHTML = `
              <div class='ms-alert ms-action'>
                Your payment was successful!
              </div>
            `;
          }
          window.location.href = "/success";
        })
        .catch(error => {
          console.error('Error:', error);
        })
        .finally(() => {
          urlParams.delete('stripe_id');
          window.history.replaceState({}, '', `${window.location.pathname}?${urlParams.toString()}`);
        });
    }

    // Fetch the updated price and currency from the server  
    function updatePriceAndCurrency() {
        fetch('/get_price_amount')
          .then(response => response.json())
          .then(data => {
            currency = data.currency;
            var priceCurrencyString = `${data.currency} ${data.price.toFixed(2)}`;
            if(currency === 'USD') {
                priceCurrencyString = `$${data.price.toFixed(2)} ${data.currency}`;
            } else {
                priceCurrencyString = `€${data.price.toFixed(2)} ${data.currency}`;
            }
      
            // Update the HTML element with the new price and currency
            document.getElementById('amount').textContent = priceCurrencyString;

            loadPayPalSDK();
        })
        .catch(error => {
          console.error('Error:', error);
        });
    }

    // Initially update the price and currency and load PayPal SDK
    updatePriceAndCurrency();
  
    // Event handlers
    let handle_click = (event) => {
      if (event.target.classList.contains("ms-close")) {
        handle_close(event);
      }
    };
  
    let handle_close = (event) => {
      event.target.closest(".ms-alert").remove();
    };
  
    document.addEventListener("click", handle_click);
  
    // Function to render PayPal buttons
    const renderPayPalButtons = () => {
        const paymentOptions = document.getElementById("payment_options");
        if (paymentOptions) {
          paypal.Buttons({
            onClick: (data) => {
              // Custom JS here
            },
            style: {
              shape: "rect",
              color: "gold",
              layout: "vertical",
              label: "paypal",
            },
          
            createOrder: function (data, actions) {
              return fetch("http://localhost:8080/create_order", {
                method: "post",
                headers: { "Content-Type": "application/json; charset=utf-8" },
                body: JSON.stringify({ intent: "capture" }),
              })
              .then((response) => response.json())
              .then((order) => {
                return order.id;
              });
            },
          
            onApprove: function (data, actions) {
              let order_id = data.orderID;
              return fetch("http://localhost:8080/complete_order", {
                method: "post",
                headers: { "Content-Type": "application/json; charset=utf-8" },
                body: JSON.stringify({
                  intent: "capture",
                  order_id: order_id,
                }),
              })
              .then((response) => response.json())
              .then((order_details) => {
                console.log(order_details);
                let intent_object = "captures"; // Assuming intent is always "capture"
                // Custom Successful Message
                if (alerts) {
                  alerts.innerHTML = `
                    <div class='ms-alert ms-action'>Thank you ${order_details.payer.name.given_name} ${order_details.payer.name.surname} for your payment of ${order_details.purchase_units[0].payments[intent_object][0].amount.value} ${order_details.purchase_units[0].payments[intent_object][0].amount.currency_code}!</div>`;
                }
                window.location.href = "/success";
                hidePaymentButtons();
              })
              .catch((error) => {
                console.log(error);
                if (alerts) {
                  alerts.innerHTML = `<div class="ms-alert ms-action2 ms-small"><span class="ms-close"></span><p>An Error Occurred!</p></div>`;
                }
              });
            },
          
            onCancel: function (data) {
              if (alerts) {
                alerts.innerHTML = `<div class="ms-alert ms-action2 ms-small"><span class="ms-close"></span><p>Order cancelled!</p></div>`;
              }
            },
          
            onError: function (err) {
              console.log(err);
            },
          }).render("#payment_options")
            .then(() => {
              // Handle loading spinner
              document.getElementById("loading").classList.add("hide");
              document.getElementById("content").classList.remove("hide");
            })
            .catch((error) => {
              console.error(error);
            });
        }
    };

    // Function to load PayPal SDK dynamically with updated currency
    const loadPayPalSDK = () => {
        const paypal_sdk_url = `https://www.paypal.com/sdk/js?client-id=${client_id}&enable-funding=venmo&currency=${currency}&intent=${intent}`;
        const script = document.createElement("script");
        script.src = paypal_sdk_url;
        script.onload = () => {
            renderPayPalButtons();
        };
        script.onerror = () => {
            console.error("Error loading PayPal SDK.");
        };
        document.head.appendChild(script);
    };

    // PayPal Buttons configurations
    const client_id = "Abi_EpOMLx3Z1zZj_8es8kSRlqpDYQYZe2dPKQfmSvYyAmCc5YqhIUVSrQyWzRutQzE9T9OmNMCLhlgN";
    const intent = "capture";
    
    // Function to handle hiding payment buttons
    const hidePaymentButtons = () => {
      const paymentOptions = document.getElementById("payment_options");
      if (paymentOptions) {
        paymentOptions.innerHTML = ""; // Clear the content of the payment options container
      }
    };
});
