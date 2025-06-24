// src/components/Bill.js

export default class Bill {
  constructor({ type, name, paymentMethod, amount, currency, status }) {
    // We use a unique ID to manage each bill later (e.g., for deleting)
    this.id = Date.now().toString(); // Simple unique ID based on timestamp

    this.type = type; // e.g., 'Energy', 'Broadband', 'Streaming'
    this.name = name; // Specifically for the streaming service name, e.g., 'Netflix'
    this.paymentMethod = paymentMethod; // e.g., 'Credit Card'
    this.status = status || 'Pending'; // Default to 'Pending' if not provided

    // The amount is now an object to hold both value and currency
    this.amount = {
      value: parseFloat(amount) || 0, // Ensure amount is a number
      currency: currency || 'EUR' // Default to EUR
    };
  }
}