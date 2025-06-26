/**
 * @file script.js
 * @description Main JavaScript file for the Bill Calculator application. This file handles all application state, DOM manipulation, event handling, and core logic.
 * @author [Clayton Crispim]
 * @version 9.0.0
 * @date 2025-06-26
 *
 * Distributed under the MIT License.
 */

// --- IMPORTS ---
import Bill from "./components/Bill.js";


// --- STATE ---
// The single source of truth for the application's data.

/**
 * The main array holding all bill objects.
 * It is initialized by loading data from localStorage on startup.
 */
let bills = loadBillsFromLocalStorage();

/**
 * The current filter applied to the list.
 *  * @type {'All' | 'Paid' | 'Unpaid' | 'Pending'}
 */
let currentFilter = 'All';

/**
 * The current sort order being applied to the list.
 *  @type {'default' | 'amount-high-low' | 'amount-low-high' | 'name-az'}
 * */
let currentSort = 'default';


// --- DOM ELEMENTS ---
// Caching references to DOM elements to avoid repeated queries in our functions.

// Main form and bill list container
const billForm = document.querySelector('#bill-form');
const billsListContainer = document.querySelector('#bills-list');

// Display elements for categorized totals
const totalPaidDisplay = document.querySelector('#total-paid');
const totalPendingDisplay = document.querySelector('#total-pending');
const totalUnpaidDisplay = document.querySelector('#total-unpaid');

// Form controls for filtering and sorting
const filterButtonsContainer = document.querySelector('#filter-buttons-container');
const billTypeSelect = document.querySelector('#billType');
const sortBySelect = document.querySelector('#sort-by');

// Containers for conditional fields in the main form
const streamingNameContainer = document.querySelector('#streamingName-container');
const otherTypeContainer = document.querySelector('#otherType-container');

// Elements related to the "Edit Bill" modal
const editModalEl = document.querySelector('#editBillModal');
const editBillForm = document.querySelector('#edit-bill-form');
const editBillIdInput = document.querySelector('#edit-bill-id');
const editAmountInput = document.querySelector('#edit-amount');
const editStatusSelect = document.querySelector('#edit-status');

/**
 * A JavaScript instance of the Bootstrap Modal class, created fron our modal element.
 * We use this instance to programmatically control the modal (e.g., `editModal.show()`).
 */
const editModal = new bootstrap.Modal(editModalEl);


// --- FUNCTIONS ---
/**
 * Saves the current 'bills' array to the browser's localStorage.
 * The array is converted to a JSON string because localStorage can only store strings.
 */
function saveBillsToLocalStorage() {
  const billsJson = JSON.stringify(bills);
  localStorage.setItem('myBills', billsJson);
}

/**
 * Loads bills from localStorage, parses the JSON string back into an array,
 * and returns it. If no bills are found in localStorage, it returns an empty array.
 * @returns {Array<object>} The array of bill objects from storage.
 */
function loadBillsFromLocalStorage() {
  const savedBillsJson = localStorage.getItem('myBills');
  return savedBillsJson ? JSON.parse(savedBillsJson) : [];
}

/**
 * Renders the list of bills to the page, applying the current filter and sort order.
 */
function renderBills() {
  const statusColors = {
    Paid: 'success',
    Unpaid: 'danger',
    Pending: 'warning',
  };

  // 1. FILTERING: Create a temporary array based on the current filter.
  let filteredBills;
  if (currentFilter === 'All') {
    filteredBills = bills;
  } else {
    filteredBills = bills.filter(bill => bill.status === currentFilter);
  }

  // 2. SORTING: Sort the new 'filteredBills' array.
  // A copy is created with [...filteredBills] to ensure the original bills array order is preserved.
  const sortedAndFilteredBills = [...filteredBills].sort((a, b) => {
    switch (currentSort) {
      case 'amount-high-low':
        return b.amount.value - a.amount.value;
      case 'amount-low-high':
        return a.amount.value - b.amount.value;
      case 'name-az':
        const nameA = a.name || a.type;
        const nameB = b.name || b.type;
        return nameA.localeCompare(nameB);
      default:
        return 0; // 'default' case applies no sorting.
    }
  });

  // 3. RENDER: The rest of the function now uses the final 'sortedAndFilteredBills' array.
  billsListContainer.innerHTML = '';

  if (sortedAndFilteredBills.length === 0) {
    billsListContainer.innerHTML = '<p class="text-center text-muted">No bills to display.</p>';
    return;
  }

  const billsHtml = sortedAndFilteredBills.map(bill => {
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

  billsListContainer.innerHTML = billsHtml;
}


/**
 * Calculates totals for each status category (Paid, Unpaid, Pending)
 * and renders them ton the appropriate display elements on the page.
 */
function calculateAndRenderTotal() {
  // 1. Set up the initial shape of our totals object.
  const initialTotals = {
    Paid: 0,
    Unpaid: 0,
    Pending: 0
  };

  // 2. Use .reduce() to iterate through all bills and sum amounts into the correct category.
  const totals = bills.reduce((acc, bill) => {
    // Check if the status is a valid key in our accumulator object.
    if (acc.hasOwnProperty(bill.status)) {
      acc[bill.status] += bill.amount.value;
    }
    return acc; // Return the updated accumulator for the next iteration.
  }, initialTotals);

  // 3. Update the text content for each total display element on the page.
  totalPaidDisplay.textContent = `€${totals.Paid.toFixed(2)}`;
  totalPendingDisplay.textContent = `€${totals.Pending.toFixed(2)}`;
  totalUnpaidDisplay.textContent = `€${totals.Unpaid.toFixed(2)}`;
}

/**
 * Shows or hides conditional form fieldds ('Streaming Name' or 'Other Type')
 * based on the selection in the 'Bill Type' dropdown.
 */
function handleBillTypeChange() {
  const selectedValue = billTypeSelect.value;

  // By default, reset and hide bith conditional containers
  streamingNameContainer.classList.add('d-none');
  otherTypeContainer.classList.add('d-none');

  // Show the relevant container based on the selection
  if (selectedValue === 'Streaming') {
    streamingNameContainer.classList.remove('d-none');
  } else if (selectedValue === 'Other') {
    otherTypeContainer.classList.remove('d-none');
  }
}


/**
 * Deletes a bill from the state, saves the change to localStorage,
 * and triggers a UI update.
 * @param {string} id The unique ID of the bill to delete.
 */
function deleteBill(id) {
  // Filter the bills array, creating a new array that excludes the bill with the matching id.
  bills = bills.filter(bill => bill.id !== id);
  // Save the newly modified array to localStorage.
  saveBillsToLocalStorage();
  // Re-render the UI to reflect the changes.
  renderBills();
  calculateAndRenderTotal();
}


/**
 * Opens the edit modal and populates its form fields with the data from a specific bill.
 * @param {object} bill The bill object to be edited.
 */
function openEditModal(bill) {
  // 1. Fill the hidden ID input and visible form fields with the bill's existing data.
  editBillIdInput.value = bill.id;
  editAmountInput.value = bill.amount.value;
  editStatusSelect.value = bill.status;

  // 2. Programmatically open the Bootstrap modal using the instance we created.
  editModal.show();
}


/**
 * Handles the submission of the main 'Add Bill' form.
 * @param {Event} event The form submission event object provided by the browser.
 */
function handleSubmit(event) {
  // 1. Prevent the default browser behavior of reloading the page.
  event.preventDefault();
  
  // 2. Read all data from the form into a simple object.
  const formData = new FormData(billForm);
  const billData = Object.fromEntries(formData.entries());

  // 3. Consolidate the conditional 'name' fields into a single 'name' property.
  billData.name = billData['name-streaming'] || billData['name-other'];

  // 4. Create a new Bill instance using our class constructor.
  const newBill = new Bill(billData);

  // 5. Add the new bill to our main state array.
  bills.push(newBill);
  saveBillsToLocalStorage();

  // 6. Log the results to the console for debugging purposes.
  console.log('New bill added:', newBill);
  console.log('All current bills:', bills);
  
  // 7. Reset the form for the next entry and hide conditional fields
  billForm.reset();
  handleBillTypeChange();
  
  // 8. Re-render the UI to show the new bill.
  renderBills();
  calculateAndRenderTotal();
}

/**
 * Handles the submission of the 'Edit Bill' form within the modal.
 * @param {Event} event The form submission event object.
 */
function handleEditSubmit(event) {
  // 1. Prevent the page from reloading.
  event.preventDefault();

  // 2. Get the updated data from the modal's form.
  const formData = new FormData(editBillForm);
  const updatedData = Object.fromEntries(formData.entries());

  // 3. Find the bill in our main array and update it using .map().
  bills = bills.map(bill => {
    // If the bill's ID matches the one from the hidden form input...
    if (bill.id === updatedData.id) {
      // ...return a new object with the old properties spread (...) and the new ones overwritten.
      return {
        ...bill,
        amount: {
          ...bill.amount,
          value: parseFloat(updatedData.amount)
        },
        status: updatedData.status
      };
    }
    // Otherwise, return the bill unchanged.
    return bill;
  });

  // 4. Save the updated array, close the modal, and re-render the UI.
  saveBillsToLocalStorage();
  editModal.hide();
  renderBills();
  calculateAndRenderTotal();
}


// --- EVENT LISTENERS ---
// Attaching our handler functions to specific events on our DOM elements.

// Handles the submission of the main 'Add Bill' form.
billForm.addEventListener('submit', handleSubmit);

// Handles the submission of the 'Edit Bill' modal form.
editBillForm.addEventListener('submit', handleEditSubmit);

// Shows/hides conditional fields when the bill type dropdown changes.
billTypeSelect.addEventListener('change', handleBillTypeChange);

// Applies the selected sort order when the sort dropdown changes.
sortBySelect.addEventListener('change', (event) => {
  currentSort = event.target.value;
  renderBills();
});

// Uses event delegation to handle clicks on dynamic 'edit' and 'delete' buttons.
billsListContainer.addEventListener('click', (event) => {
  // Check if a DELETE button was clicked
  if (event.target.classList.contains('delete-btn')) {
    const billId = event.target.dataset.billId;
    deleteBill(billId);
  }
  // Check if an EDIT button was clicked
  else if (event.target.classList.contains('edit-btn')) {
    const billId = event.target.dataset.billId;
    const billToEdit = bills.find(bill => bill.id === billId);
    if (billToEdit) {
      openEditModal(billToEdit);
    }
  }
});


// Applies the selected filter when a filter button is clicked.
filterButtonsContainer.addEventListener('click', (event) => {
  // Check if a button with the 'filter-btn' class was clicked
  if (event.target.classList.contains('filter-btn')) {
    // This part handles the visual "active" state of the button
    const buttons = filterButtonsContainer.querySelectorAll('.filter-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // This part updates our application's state
    currentFilter = event.target.dataset.filter;

    // Finally, this re-draws the list with the new filter applied
    renderBills();
  }
});


// --- INITIALIZATION ---

/**
 * The main entry point for the application.
 * This function is called once when the script first loads.
 */
function init() {
  // Render the initial state of the bills list and totals from localStorage.
  renderBills();
  calculateAndRenderTotal();
}

// Kick off the application by calling the init function.
init();