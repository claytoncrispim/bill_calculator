/**Bill Calculator 8.0
 * By Clayton Crispim
 */

import Bill from "./components/Bill.js";
import Total from "./components/Total.js";

const billsArray = [];
const billsSet = new Set();
const amountAibSet = new Set();
const amountBoiSet = new Set();

// Formats the amount to display the currency symbols accordingly
const formatter = (locale, currency, value) => {
  let formattedValue = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(value);

  return formattedValue;
};

// Generates new Bill objects and store them into their respective arrays
function createBillObj(type, acc, amount, status) {
  const aibBillsArray = [];
  const boiBillsArray = [];

  for (let i = 0; i < 1; i++) {
    const allBills = new Bill(type, acc, amount, status);
    allBills.checkEmpty(type);
    allBills.checkEmpty(acc);
    
    if (acc === "AIB") {
      aibBillsArray.push(allBills);
      billsArray.push(...aibBillsArray);
    } else {
      boiBillsArray.push(allBills);
      billsArray.push(...boiBillsArray);
    }
  }
}

// Sum function for Set's unique values
const sumAmounts = ((set) => {
  let sum = 0;
  set.forEach((value) => {
    sum += value;
  });
  console.log("sumAmounts result: ", sum);
  return sum;
});
// Regular sum function
const subtotalAmounts = ((a, b) => { 
    let result = a + b;
    return result;
});
// Division then subtraction function
const divideAmounts = ((a, b) => {
  let result = a/2 - b/2;
  return result;
});

// Creating a new form element
const billForm = document.createElement("form");
billForm.classList.add("topform");

// Gets the created element to display the form imput fields
billForm.innerHTML = `
    Bill type: <select name="type" id="type">
    <option disabled selected hidden>Select the bill type</option>
      <option value="">Management Fee</option>
      <option value="">Property Tax</option>
      <option value="">Mortgage</option>
      <option value="">Gas</option>
      <option value="">Electricity</option>
      <option value="">Streaming</option>
      <option value="">Broadband</option>
    </select>
    <br><br>
    Bank: <select name="acc" id="acc">
    <option disabled selected hidden>Select the bank</option>
      <option value="">AIB</option>
      <option value="">Bank of Ireland</option>      
    </select>
    <br><br>   
    Amount: <input type="decimal" name="amount" placeholder="Enter the amount due">
    <br><br>
    Status: <select name="status" id="status">
    <option disabled selected hidden>Select the status</option>
      <option value="">Paid</option>
      <option value="">Unpaid</option>      
    </select>
    <br><br> 
    <input type="submit" value="Submit"> <input type="reset" value="Reset">

`;

// Add event listener to the form submit action
billForm.addEventListener("submit", (e) => {
  // Stop form from reloading the page
  e.preventDefault();

  // Get the value from the form select *** Different approach from Pto Calc - Source: https://stackoverflow.com/questions/1085801/get-selected-value-in-dropdown-list-using-javascript
  let type = document.getElementById("type");
  let textType = type.options[type.selectedIndex].text;
  let account = document.getElementById("acc");
  let textAcc = account.options[account.selectedIndex].text;
  let status = document.getElementById("status");
  let textStatus = status.options[status.selectedIndex].text;
  let amount = billForm.querySelector("input[name='amount']").value;
  //Checking if the values are being captured and stored in the variables
  console.log("Result: ", textType, textAcc, textStatus, amount, typeof(amount));
 
  // Creating a Bill obj to call its boolean method updateStatus
  const statusResult = new Bill();
  //It takes the values collected from the select dropdown menus and input and creates objects to be stored in an array
  createBillObj(textType, textAcc, amount, statusResult.updateStatus(textStatus));
  //Checking if the arrays are being populated accordingly
  console.log("Bills Array RESULT: ", billsArray);

  const content = billsArray.map((bill) => {

    // New bill article element
    let billArticle = document.createElement("article");
    billArticle.classList.add("bill");

    // Set div ID to the bill.id property
    billArticle.setAttribute("id", bill.type);
    console.log("The BILL STATUS is: ", typeof(bill.status), bill.status);   

    // Set innerHTML of billArticle using the bill object
    billArticle.innerHTML = `
      <h1 class="bill__name" style ="color:#003399;">${bill.type}</h1>
      <ul class="bill__features">
          <li class="feature bill__acc">Bank Account:<span class="bank__${bill.acc}"> ${
            bill.acc
          }</span></li>
          <li class="feature bill__amount">Amount:<span class="amount__number"> ${
            formatter("en-US", "EUR", bill.amount)
          }</span></li>
          <li class="feature bill__status">Status:<span class="bill__status__result"> ${
            bill.status
              ? "<span class= paid> Paid </span>"
              : "<span class= unpaid> Not paid </span>"
          }</span></li>         
      </ul>
      `;

    return billArticle;
  });

  content.forEach((bill) => {
    main.append(bill);
  });
  // Clear all the form fields - Source: https://stackoverflow.com/questions/49588862/how-to-reset-values-of-select-dropdown
  document.getElementById("type").selectedIndex = 0;
  document.getElementById("acc").selectedIndex = 0;
  document.getElementById("status").selectedIndex = 0;
  billForm.querySelector("input[name='amount']").value = "";

  console.log("Size of the array: ", billsArray.length);
  
  if (billsArray.length > 0) {
    // Removes the 1st entry from the array to avoid duplication and adds in the amountAibSet
    billsSet.add(billsArray.shift());    
        
    // Checks if there is a bill with status true(paid) and removes from the Set
    billsSet.forEach((bill) => {
      if (bill.acc === "AIB" && bill.status === false) {
        amountAibSet.add(parseFloat(bill.amount));
      } else if (bill.acc === "Bank of Ireland" && bill.status === false) {
        amountBoiSet.add(parseFloat(bill.amount));
      } else if (bill.status === true) {
        billsSet.delete(bill);
      }
    });    
    // Checking Arrays and Sets content to see if the values are being filtered and organised accordingly
    console.log("Bills Array final state: ", billsArray);
    console.log("billsSet final state: ", billsSet);  
    console.log("amountAibSet final state: ", amountAibSet);
    console.log("amountBoiSet final state: ", amountBoiSet);
  }

  /**
   * Total section related
   * The Total Object to be appended at the end of the bills
   */

  // Creates a new Total object
  const totalAmount = new Total(
    "bill-total",
    "Totals:",
    sumAmounts(amountAibSet),
    sumAmounts(amountBoiSet),
    subtotalAmounts(
      sumAmounts(amountAibSet),
      sumAmounts(amountBoiSet)
    ),
    divideAmounts(
      sumAmounts(amountAibSet),
      sumAmounts(amountBoiSet)
    )
  );

  // Creats the elements for the final balance at the end of the page
  let finalBal = document.createElement("total");
  finalBal.classList.add("final-balance");

  // Set div ID to the bill.id property
  finalBal.setAttribute("id", totalAmount.id);

  // Set innerHTML of billArticle using the bill object
  finalBal.innerHTML = `
      <h1 class="total__name">${totalAmount.name}</h1>
      <ul class="final-balance__features">
        <li class="feature total__amount-aib">Total amount AIB:<span class="amount__number"> ${
          formatter("en-US", "EUR", totalAmount.amtAib)
        }</span></li>
        <li class="feature total__amount-boi">Total amount BOI:<span class="amount__number"> ${
          formatter("en-US", "EUR", totalAmount.amtBoi)
        }</span></li>
        <li class="feature total__amount-subtotal">Total amount of both banks:<span class="amount__number"> ${
          formatter("en-US", "EUR", totalAmount.subTotal)
        }</span></li>
        <p> Amount due:
        <li class="feature total__amount-aib">Amount due to Clayton:<span class="amount__number"> ${
          formatter("en-US", "EUR", totalAmount.amtAib /2)
        }</span></li>
        <li class="feature total__amount-boi">Amount due to Francisco:<span class="amount__number"> ${
          formatter("en-US", "EUR", totalAmount.amtBoi /2)
        }</span></li>
        <li class="feature total__due-amount">Due Amount:<span class="amount__number__highlight"> ${
          formatter("en-US", "EUR", totalAmount.total)
        }</span></li>        
      </ul>
  `;

  // It gets the element that holds the total, check if it is not null, which means if there is already an element "bill-total" there, and removes it to avoid duplication before appending a new one
  const element = document.getElementById("bill-total");
  if (element != null) {
    element.remove();
  }
  // Appends the total element
  const total = document.querySelector(".maincontent");
  total.append(finalBal);
});

billForm.addEventListener("reset", () => {
  location.reload();
});

// Gets the main
const main = document.querySelector(".maincontent");
main.append(billForm);