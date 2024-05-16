let url_to_head = (url) => {
    return new Promise(function (resolve, reject) {
        var script = document.createElement("script");
        script.src = url;
        script.onload = function () {
            resolve();
        };
        script.onerror = function () {
            reject("Error loading script.");
        };
        document.head.appendChild(script);
    });
};

let handle_click = (event) => {
    if (event.target.classList.contains("ms-close")) {
        handle_close(event);
    }
};

let handle_close = (event) => {
    event.target.closest(".ms-alert").remove();
};

document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("click", handle_click);

    // PAYPAL BUTTONS
    const paypal_sdk_url = "https://www.paypal.com/sdk/js";
    const client_id = "Abi_EpOMLx3Z1zZj_8es8kSRlqpDYQYZe2dPKQfmSvYyAmCc5YqhIUVSrQyWzRutQzE9T9OmNMCLhlgN";
    const currency = "USD";
    const intent = "capture";
    let alerts = document.getElementById("alerts");

    url_to_head(
        `${paypal_sdk_url}?client-id=${client_id}&enable-funding=venmo&currency=${currency}&intent=${intent}`
    )
    .then(() => {
        // Handle loading spinner
        document.getElementById("loading").classList.add("hide");
        document.getElementById("content").classList.remove("hide");

        let paypal_buttons = paypal.Buttons({
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
                    body: JSON.stringify({ intent: intent }),
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
                        intent: intent,
                        order_id: order_id,
                    }),
                })
                .then((response) => response.json())
                .then((order_details) => {
                    console.log(order_details);
                    let intent_object =
                        intent === "authorize" ? "authorizations" : "captures";
                    // Custom Successful Message
                    alerts.innerHTML =
                        `<div class='ms-alert ms-action'>Thank you ` +
                        order_details.payer.name.given_name +
                        ` ` +
                        order_details.payer.name.surname +
                        ` for your payment of ` +
                        order_details.purchase_units[0].payments[intent_object][0].amount
                            .value +
                        ` ` +
                        order_details.purchase_units[0].payments[intent_object][0].amount
                            .currency_code +
                        `!</div>`;

                    // Close out the PayPal buttons that were rendered
                    paypal_buttons.close();
                })
                .catch((error) => {
                    console.log(error);
                    alerts.innerHTML = `<div class="ms-alert ms-action2 ms-small"><span class="ms-close"></span><p>An Error Ocurred!</p></div>`;
                });
            },

            onCancel: function (data) {
                alerts.innerHTML = `<div class="ms-alert ms-action2 ms-small"><span class="ms-close"></span><p>Order cancelled!</p></div>`;
            },

            onError: function (err) {
                console.log(err);
            },
        });

        paypal_buttons.render("#payment_options");
    })
    .catch((error) => {
        console.error(error);
    });
});
