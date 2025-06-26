/**Bill Calculator 9.0
 * By Clayton Crispim
 */

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

  // 2. Sort the filtered bills based on the current sort order.
  // A copy is created with [...filteredBills] to avoid modifying the original array order.
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
        return 0; // 'default' case does no sorting.
    }
  });

  // 3. Clear the existing list to prepare for re-rendering.
  billsListContainer.innerHTML = '';

  // 4. If the final list is empty, display a message and exit the function.
  if (sortedAndFilteredBills.length === 0) {
    billsListContainer.innerHTML = '<p class="text-center text-muted">No bills to display.</p>';
    return;
  }

  // 5. Generate the HMTL for each bill card using the .map() method.
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

  // 6. Set the inner HTML of our container to the generated bill cards.
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