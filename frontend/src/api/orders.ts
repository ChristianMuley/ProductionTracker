import type {
  ProductionOrder,
  CreateProductionOrder
} from '../types/order';

//region Retrieve Orders
export async function getOrders(): Promise<ProductionOrder[]> {
  const response = await fetch('/api/orders/');

  if (!response.ok) {
    throw new Error(`Failed to retrieve orders: ${response.status}`);
  }

  return response.json();
}
//endregion

//region Create Orders
export async function createOrder(
  order: CreateProductionOrder
): Promise<ProductionOrder> {

  // Retrieve Django's CSRF token
  const csrfToken = document.cookie
    .split('; ')
    .find(cookie => cookie.startsWith('csrftoken='))
    ?.split('=')[1];

  if (!csrfToken) {
    throw new Error('Please log in first.');
  }

  const response = await fetch('/api/orders/', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': decodeURIComponent(csrfToken),
    },
    body: JSON.stringify(order),
  });

  if (!response.ok) {
    throw new Error(`Failed to create order: ${response.status}`);
  }

  return response.json();
}
//endregion

//region Update Orders
export async function updateOrder(
  id: number,
  changes: Partial<CreateProductionOrder>
): Promise<ProductionOrder> {

  // Retrieve Django's CSRF token
  const csrfToken = document.cookie
    .split('; ')
    .find(cookie => cookie.startsWith('csrftoken='))
    ?.split('=')[1];

  if (!csrfToken) {
    throw new Error('CSRF token missing. Please log in first.');
  }

  const response = await fetch(`/api/orders/${id}/`, {
    method: 'PATCH',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': decodeURIComponent(csrfToken),
    },
    body: JSON.stringify(changes),
  });

  if (!response.ok) {
    throw new Error(`Failed to update order: ${response.status}`);
  }

  return response.json();
}
//endregion

//region Delete Orders
export async function deleteOrder(id: number): Promise<void> {

  // Retrieve Django's CSRF token
  const csrfToken = document.cookie
    .split('; ')
    .find(cookie => cookie.startsWith('csrftoken='))
    ?.split('=')[1];

  if (!csrfToken) {
    throw new Error('CSRF token missing. Please log in first.');
  }

  const response = await fetch(`/api/orders/${id}/`, {
    method: 'DELETE',
    credentials: 'same-origin',
    headers: {
      'X-CSRFToken': decodeURIComponent(csrfToken),
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete order: ${response.status}`);
  }
}

//endregion


//region Dispatch Orders
export async function dispatchOrder(
  id: number,
  priority: boolean
): Promise<ProductionOrder> {

  // Retrieve Django's CSRF token
  const csrfToken = document.cookie
    .split('; ')
    .find(cookie => cookie.startsWith('csrftoken='))
    ?.split('=')[1];

  if (!csrfToken) {
    throw new Error('CSRF token missing. Please log in first.');
  }

  // Send the order to the appropriate production queue
  const response = await fetch(`/api/orders/${id}/dispatch/`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': decodeURIComponent(csrfToken),
    },
    body: JSON.stringify({ priority }),
  });

  if (!response.ok) {
    throw new Error(`Failed to dispatch order: ${response.status}`);
  }

  return response.json();
}
//endregion

