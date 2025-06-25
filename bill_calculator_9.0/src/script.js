/**Bill Calculator 8.0
 * By Clayton Crispim
 */

import Bill from "./components/Bill.js";
// console.log(Bill);

// --- STATE ---
// It's an array that loads bills from localStorage or starts empty.
let bills = loadBillsFromLocalStorage();
let currentFilter = 'All'; // Possible values: 'All', 'Paid', 'Unpaid', 'Pending'
let currentSort = 'default';


// --- DOM ELEMENTS ---
const billForm = document.querySelector('#bill-form');
const billsListContainer = document.querySelector('#bills-list');
const totalPaidDisplay = document.querySelector('#total-paid');
const totalPendingDisplay = document.querySelector('#total-pending');
const totalUnpaidDisplay = document.querySelector('#total-unpaid');
const billTypeSelect = document.querySelector('#billType');
const streamingNameContainer = document.querySelector('#streamingName-container');
const otherTypeContainer = document.querySelector('#otherType-container');
// Modal elements for editing bills
const editModalEl = document.querySelector('#editBillModal');
const editBillForm = document.querySelector('#edit-bill-form');
const editBillIdInput = document.querySelector('#edit-bill-id');
const editAmountInput = document.querySelector('#edit-amount');
const editStatusSelect = document.querySelector('#edit-status');
// This creates a JavaScript instance of the Bootstrap modal component
const editModal = new bootstrap.Modal(editModalEl);
// Filter buttons container
const filterButtonsContainer = document.querySelector('#filter-buttons-container');
// Add this new DOM reference
const sortBySelect = document.querySelector('#sort-by');

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
 * Renders the list of bills to the page, applying the current filter.
 */
function renderBills() {
  const statusColors = {
    Paid: 'success',
    Unpaid: 'danger',
    Pending: 'warning'
  };

  // 1. Determine which bills to show based on the current filter
  let filteredBills;
  if (currentFilter === 'All') {
    filteredBills = bills; // Show all bills
  } else {
    // Show only the bills whose status matches the current filter
    filteredBills = bills.filter(bill => bill.status === currentFilter);
  }

    // 2. NEW: Sorting
  // We create a copy with [...filteredBills] before sorting to avoid changing the original order.
  const sortedAndFilteredBills = [...filteredBills].sort((a, b) => {
    switch (currentSort) {
      case 'amount-high-low':
        return b.amount.value - a.amount.value;
      case 'amount-low-high':
        return a.amount.value - b.amount.value;
      case 'name-az':
        // localeCompare is the standard way to sort strings alphabetically.
        const nameA = a.name || a.type;
        const nameB = b.name || b.type;
        return nameA.localeCompare(nameB);
      default:
        return 0; // 'default' case does no sorting.
    }
  });

  // 3. Clear the existing list (same as before)
  billsListContainer.innerHTML = '';

  // 4. Check if the final list is empty (now checks sortedAndFilteredBills)
  if (sortedAndFilteredBills.length === 0) {
    billsListContainer.innerHTML = '<p class="text-center text-muted">No bills to display.</p>';
    return;
  }

  // 5. Loop through the 'sortedAndFilteredBills' array to create HTML
  const billsHtml = sortedAndFilteredBills.map(bill => {
    // ...The .map() callback is exactly the same as before...
    const displayName = bill.name || bill.type;
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
          <button class="btn btn-outline-secondary btn-sm edit-btn me-2" data-bill-id="${bill.id}">
            Edit
          </button>
          <button class="btn btn-outline-danger btn-sm delete-btn" data-bill-id="${bill.id}">
            Delete Bill
          </button>
        </div>
      </div>
    `;
  }).join('');

  // 5. Set the inner HTML of our container to the generated HTML
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
  saveBillsToLocalStorage();

  // 6. Log the results to the console to verify.
  console.log('New bill added:', newBill);
  console.log('All current bills:', bills);
  
  // 7. Reset the form for the next entry.
  billForm.reset();

  // 8. Manually trigger the change handler to hide any conditional fields.
  handleBillTypeChange();
  
  // 9. UPDATE THE WEBPAGE
  renderBills();
  calculateAndRenderTotal();
}

/**
 * Deletes a bill from the state and updates the UI.
 * @param {string} id The ID of the bill to delete.
 */
function deleteBill(id) {
  // Filter the bills array, keeping every bill except the one with the matching id.
  bills = bills.filter(bill => bill.id !== id);
  
  saveBillsToLocalStorage();

  // Re-render the UI to reflect the changes.
  renderBills();
  calculateAndRenderTotal();
}

/**
 * Opens the edit modal and populates it with data from a specific bill.
 * @param {object} bill The bill object to edit.
 */
function openEditModal(bill) {
  // 1. Fill the form fields with the bill's existing data.
  editBillIdInput.value = bill.id;
  editAmountInput.value = bill.amount.value;
  editStatusSelect.value = bill.status;

  // 2. Programmatically open the Bootstrap modal.
  editModal.show();
}

/**
 * Handles the submission of the edit form.
 * @param {Event} event The form submission event.
 */
function handleEditSubmit(event) {
  // 1. THIS IS THE CRUCIAL FIX: Prevent the page from reloading.
  event.preventDefault();

  // 2. Get the updated data from the modal's form.
  const formData = new FormData(editBillForm);
  const updatedData = Object.fromEntries(formData.entries());

  // 3. Find the bill in our main 'bills' array and update it.
  bills = bills.map(bill => {
    if (bill.id === updatedData.id) {
      return {
        ...bill,
        amount: {
          ...bill.amount,
          value: parseFloat(updatedData.amount)
        },
        status: updatedData.status
      };
    }
    return bill;
  });

  saveBillsToLocalStorage();

  // 4. Close the modal.
  editModal.hide();

  // 5. Re-render the entire UI to show the changes.
  renderBills();
  calculateAndRenderTotal();
}


/**
 * Saves the current 'bills' array to the browser's localStorage.
 */
function saveBillsToLocalStorage() {
  // We must convert our JavaScript array into a JSON string to store it.
  const billsJson = JSON.stringify(bills);
  // Save the string in localStorage under the key 'myBills'.
  localStorage.setItem('myBills', billsJson);
}

/**
 * Loads bills from localStorage and returns them as a JavaScript array.
 * @returns {Array} The array of bills from storage, or an empty array.
 */
function loadBillsFromLocalStorage() {
  // Get the saved JSON string from localStorage.
  const savedBillsJson = localStorage.getItem('myBills');
  
  // If there are saved bills, parse the string back into an array.
  // Otherwise, return an empty array for the first visit.
  return savedBillsJson ? JSON.parse(savedBillsJson) : [];
}

// --- EVENT LISTENERS ---
// This is where we tell our functions to run when the user interacts with the page.

billForm.addEventListener('submit', handleSubmit);
billTypeSelect.addEventListener('change', handleBillTypeChange);

billsListContainer.addEventListener('click', (event) => {
  // Check if a DELETE button was clicked
  if (event.target.classList.contains('delete-btn')) {
    const billId = event.target.dataset.billId;
    deleteBill(billId);
  } 
  // Check if an EDIT button was clicked
  else if (event.target.classList.contains('edit-btn')) {
    const billId = event.target.dataset.billId;
    
    // Find the bill object in the array that matches the ID
    const billToEdit = bills.find(bill => bill.id === billId);

    // If the bill is found, open the modal with its data
    if (billToEdit) {
      openEditModal(billToEdit);
    }
  }
});

// Add this line
editBillForm.addEventListener('submit', handleEditSubmit);

// Filter buttons event listener
filterButtonsContainer.addEventListener('click', (event) => {
  // Check if a filter button was clicked
  if (event.target.classList.contains('filter-btn')) {
    // 1. Remove the 'active' class from all filter buttons
    const buttons = filterButtonsContainer.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    // 2. Add the 'active' class to the button that was just clicked
    event.target.classList.add('active');
    
    // 3. Update our filter state with the value from the data-filter attribute
    currentFilter = event.target.dataset.filter;

    // 4. Re-render the bills list to apply the new filter
    renderBills();
  }
});

// Sort by dropdown event listener
sortBySelect.addEventListener('change', (event) => {
  // 1. Update our sort state with the new value from the dropdown
  currentSort = event.target.value;
  // 2. Re-render the bills list to apply the new sort order
  renderBills();
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