document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const ordersContainer = document.getElementById("orders-container");
  const messageArea = document.getElementById("message-area");

  if (!token) {
    messageArea.innerHTML =
      '<p class="text-red-500">Please <a href="login.html" class="underline">login</a> to view your orders.</p>';
    return;
  }

  try {
    const response = await fetch("http://localhost:3001/api/orders", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // If the token is invalid or expired, the server will return a 401 status
      if (response.status === 401) {
        messageArea.innerHTML =
          '<p class="text-red-500">Your session has expired. Please <a href="login.html" class="underline">log in</a> again.</p>';
        localStorage.removeItem("token"); // Clear the invalid token
        return; // Stop further execution
      }
      throw new Error(`Server responded with status: ${response.status}`);
    }

    const orders = await response.json();

    if (orders.length === 0) {
      ordersContainer.innerHTML =
        '<p class="text-center text-stone-600">You have no orders.</p>';
      return;
    }

    ordersContainer.innerHTML = orders
      .map(
        (order) => `
      <div class="border-b border-stone-200 py-4 mb-4 last:mb-0">
        <div class="flex justify-between items-center mb-2">
          <p class="text-lg font-semibold">Order ID: ${order.id}</p>
          <p class="text-sm text-stone-500">${new Date(
            order.created_at
          ).toLocaleDateString()}</p>
        </div>
        <p class="text-stone-700 mb-2">Status: <span class="font-semibold">${order.status}</span></p>
        <p class="text-xl font-bold mb-4">Total: ${(
          order.total_amount_in_cents / 100
        ).toFixed(2)}</p>
        <div class="space-y-3">
          ${order.items
            .map(
              (item) => `
            <div class="flex items-center space-x-4">
              <img src="${item.image_url}" alt="${item.name}" class="w-16 h-16 object-cover rounded-md">
              <div>
                <p class="font-medium">${item.name}</p>
                <p class="text-sm text-stone-600">Quantity: ${item.quantity} x ${(
                item.price_at_purchase_in_cents / 100
              ).toFixed(2)}</p>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `
      )
      .join("");
  } catch (error) {
    console.error("Error fetching orders:", error);
    // The specific 401 error is handled above, this is for other network/server errors.
    if (!messageArea.innerHTML) {
      // Only set if not already set by the 401 handler
      messageArea.innerHTML =
        '<p class="text-red-500">There was an error fetching your orders. Please try again later.</p>';
    }
  }
});
