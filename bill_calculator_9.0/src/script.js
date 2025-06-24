/**Bill Calculator 8.0
 * By Clayton Crispim
 */

import Bill from "./components/Bill.js";
// console.log(Bill);

// --- STATE ---
// It's an array that will hold all the bill objects.
let bills = [];


// --- DOM ELEMENTS ---
const billForm = document.querySelector('#bill-form');
const billsListContainer = document.querySelector('#bills-list');
const totalPaidDisplay = document.querySelector('#total-paid');
const totalPendingDisplay = document.querySelector('#total-pending');
const totalUnpaidDisplay = document.querySelector('#total-unpaid');
const billTypeSelect = document.querySelector('#billType');
const streamingNameContainer = document.querySelector('#streamingName-container');
const otherTypeContainer = document.querySelector('#otherType-container');


// --- FUNCTIONS ---
/**
 * Shows or hides conditional form fields based on the selected bill type.
 */
function handleBillTypeChange() {
  const selectedValue = billTypeSelect.value;

  // First, hide both containers by default
  streamingNameContainer.classList.add('d-none');
  otherTypeContainer.classList.add('d-none');

  if (selectedValue === 'Streaming') {
    // If 'Streaming' is selected, remove 'd-none' to show the streaming container
    streamingNameContainer.classList.remove('d-none');
  } else if (selectedValue === 'Other') {
    // If 'Other' is selected, remove 'd-none' to show the "other" container
    otherTypeContainer.classList.remove('d-none');
  }
}

/**
 * Renders the list of bills to the page.
 */
function renderBills() {
  // Define colors for each status using Bootstrap's text/background color classes
  const statusColors = {
    Paid: 'success',
    Unpaid: 'danger',
    Pending: 'warning'
  };

  // First, clear the existing list
  billsListContainer.innerHTML = '';

  // Check if the bills array is empty
  if (bills.length === 0) {
    billsListContainer.innerHTML = '<p class="text-center text-muted">Your bill list is empty. Add a bill to get started!</p>';
    return; // Exit the function if there's nothing to render
  }

  // Loop through the 'bills' array and create an HTML card for each bill
  const billsHtml = bills.map(bill => {
    // Determine the name to display (either streaming/other name or just the type)
    const displayName = bill.name || bill.type;

    // Create the HTML structure for each bill
    // Using template literals for cleaner HTML generation
  return `
    <div class="card mb-3">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <h5 class="card-title">${displayName}</h5>
            <h6 class="card-subtitle mb-2 text-muted">${bill.type} Bill</h6>
          </div>
          <span class="badge bg-${statusColors[bill.status]}">${bill.status}</span>
        </div>
        <p class="card-text">
          <strong>Amount:</strong> ${bill.amount.value.toFixed(2)} ${bill.amount.currency}
        </p>
        <p class="card-text">
          <strong>Payment Method:</strong> ${bill.paymentMethod}
        </p>
        
        <button class="btn btn-outline-danger btn-sm delete-btn" data-bill-id="${bill.id}">
          Delete Bill
        </button>

      </div>
    </div>
  `;
    }).join(''); // Join the array of HTML strings into one single string

  // Set the inner HTML of our container to the generated HTML
  billsListContainer.innerHTML = billsHtml;
}

/**
 * Calculates totals for each status category and renders them to the page.
 */
function calculateAndRenderTotal() {
  // 1. Set up the initial shape of our totals object.
  const initialTotals = {
    Paid: 0,
    Unpaid: 0,
    Pending: 0
  };

  // 2. Use .reduce() to calculate the totals for each category.
  const totals = bills.reduce((acc, bill) => {
    // Add the bill's amount to the correct category in the accumulator (acc).
    // For example, if bill.status is 'Paid', it adds to acc['Paid'].
    acc[bill.status] += bill.amount.value;
    return acc; // Return the updated accumulator for the next iteration.
  }, initialTotals); // Start with our initialTotals object.

  // 3. Update the text content for each total display element.
  totalPaidDisplay.textContent = `€${totals.Paid.toFixed(2)}`;
  totalPendingDisplay.textContent = `€${totals.Pending.toFixed(2)}`;
  totalUnpaidDisplay.textContent = `€${totals.Unpaid.toFixed(2)}`;
}

/**
 * Handles the form submission event.
 * @param {Event} event The form submission event.
 */
function handleSubmit(event) {
  // 1. Prevent the default browser behavior of reloading the page.
  event.preventDefault();
  
  // 2. Read the data from the form using the FormData API.
  const formData = new FormData(billForm);
  const billData = Object.fromEntries(formData.entries());

  // 3. Handle the conditional 'name' field.
  billData.name = billData['name-streaming'] || billData['name-other'];

  // 4. Create a new Bill instance using our class.
  const newBill = new Bill(billData);

  // 5. Add the new bill to our 'bills' array (our application state).
  bills.push(newBill);

  // 6. Log the results to the console to verify.
  console.log('New bill added:', newBill);
  console.log('All current bills:', bills);
  
  // 7. Reset the form for the next entry.
  billForm.reset();

  // 8. Manually trigger the change handler to hide any conditional fields.
  handleBillTypeChange();
  
  // 9. UPDATE THE WEBPAGE
  renderBills(); // This line is now active!
  calculateAndRenderTotal(); // We'll activate this one in the next step.
}

/**
 * Deletes a bill from the state and updates the UI.
 * @param {string} id The ID of the bill to delete.
 */
function deleteBill(id) {
  // Filter the bills array, keeping every bill except the one with the matching id.
  bills = bills.filter(bill => bill.id !== id);

  // Re-render the UI to reflect the changes.
  renderBills();
  calculateAndRenderTotal();
}

// --- EVENT LISTENERS ---
// This is where we tell our functions to run when the user interacts with the page.

billForm.addEventListener('submit', handleSubmit);
billTypeSelect.addEventListener('change', handleBillTypeChange);


billsListContainer.addEventListener('click', (event) => {
  // Check if the clicked element has the 'delete-btn' class
  if (event.target.classList.contains('delete-btn')) {
    // Get the bill ID from the 'data-bill-id' attribute
    const billId = event.target.dataset.billId;
    
    // Call our delete function
    deleteBill(billId);
  }
});


// --- INITIALIZATION ---
// This function runs once when the page first loads.
function init() {
  console.log('Application has started!');
  // Render the initial empty state of the list and total.
  renderBills();
  calculateAndRenderTotal();
}

// Kick off the application.
init();