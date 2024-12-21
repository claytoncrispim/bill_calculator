/**Bill Calculator 3.0
 * By Clayton Crispim
 */




import billsArray from "./components/data.js";
import Total from "./components/Total.js";

const formatter = (locale, currency, value) => {
  let formattedValue = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(value);

  return formattedValue;
};

const statusToggle = function (event, button, newArg) {
  console.log(event);
  console.log(newArg);

  //Find the current Bill object in billsArray
  let billObject = billsArray.find(
    ({ id }) => id === button.parentElement.id
)

  // Toggle status display
  billObject.status == true
      ? (billObject.status = false)
      : (billObject.status = true);

  // Toggle button text
  button.innerText == "Pay Bill"
      ? (button.innerText = "Withdraw payment")
      : (button.innerText = "Pay Bill");
  
  // Set visible property status text
  let status = button.parentElement.querySelector("bill__status__result");
  status.innerText == "not paid"
      ? (status.innerText = "paid")
      : (status.innerText = "not paid");
  
};

/**
 * Update amount
 */
// const newAmountValue = (amountArray) => {
//   // Looping through each element on the list
//   amountArray.forEach((listElement) => {
//     // Get the amount
//     let amount = listElement.getElementsByClassName("amount__number");
//     let name = listElement.getElementsByClassName("bill__name");

//     // Create a new form element
//     const amountForm = document.createElement("form");
//     amountForm.classList.add(`${amount}value`);

//     // Populate form with an input and a button
//     amountForm.innerHTML = `
//       <input type="number" name="${name}Value" placeholder="New ${name} amount">
//       <button>Update</button>
//     `;

//     // Add event listener to the form submit action
//     amountForm.addEventListener("submit", (e) =>{
//       // Stop form from reloading the page
//       e.preventDefault();

//       // Get the value from the form input
//       let newValue = amountForm.querySelector("input").value;

//       // Set the value of the field      
//       listElement.querySelector("span").innerHTML = `${formatter("en-US", "EUR", newValue)}`;

//       // Clear the form input
//       amountForm.querySelector("input").value = "";
//     });

//     // Add form to the end of the list element
//     listElement.append(amountForm);
//   });
// };

const content = billsArray.map((bill) => {
  // New bill
  let billArticle = document.createElement("article");
  billArticle.classList.add("bill");

  // Set div ID to the bill.id property
  billArticle.setAttribute("id", bill.id);


  // Set innerHTML of billArticle using the bill object
  billArticle.innerHTML = `
      <h1 class="bill__name" style ="color:#003399;">${bill.name}</h1>
      <ul class="bill__features">
        <li class="feature bill__amount">Amount:<span class="amount__number" data-amountfrom="${bill.name}"> ${
          formatter("en-US", "EUR", bill.amount)
        }</span></li>
        <li class="feature bill__status">Status:<span class="bill__status__result"> ${
          bill.status ? 
          "<span class= paid> paid </span>" : 
          "<span class= unpaid> not paid </span>"
        }</span></li>    
        <li class="feature bill__acc">Bank Account:<span class="bank__name"> ${
          bill.acc
        }</span></li>
      </ul>
      <button class="billstatus-toggle">Pay Bill</button>
    `; 
    
    // Find the amount in amount__number class and Calling the newAmoutValue function and pass on the amountValue node list
    let amountValue = billArticle.querySelectorAll(".amount__number"); 
    // newAmountValue(amountValue);

    let button = billArticle.querySelector(".billstatus-toggle");
    let newArg = "Supercalifragilexpetialidoutious";

    // Add event listner
    button.addEventListener("click", (event) => {
      statusToggle(event, button, newArg);
    });

    return billArticle;
});

// Get the main
const main = document.querySelector(".maincontent");

// Loop through the content array to append each bill.
content.forEach((bill) => {
  main.append(bill);
});


// Bills sections end here


/**
 * NEXT STEP
 * Collect only AIB and BOI amounts and store in separated arrays
 * It needs to check if bank is AIB or BOI
 */

const amountAib = [];
const amountBoi = [];

// Checking if bank is AIB or BOI and saving respectives amounts in the arrays above
billsArray.map((amt) => {  

  if (amt.acc == "AIB" && amt.status == false) {

    amountAib.push(amt.amount);

  } if (amt.acc == "BOI" && amt.status == false) {

    amountBoi.push(amt.amount);
    
  }
});

console.log("AIB & BOI Arrays themselves:", amountAib, amountBoi);



/**
 * NEXT STEP
 * Sum each amounts of each array separately
 * Substract from AIB total BOI total
 * Display on the browser 
 * 
 */

function sumArray(array) {
  let sum = 0;

  for (let i = 0; i < array.length; i += 1) {

    sum += array[i];
  }

  console.log("sumArray result: ", sum);

  return sum;
}

const totalAib = sumArray(amountAib);
const totalBoi = sumArray(amountBoi);
const subTotal = totalAib + totalBoi;
console.log("Sub-total", subTotal);
const finalBalance = totalAib/2 - totalBoi/2;


/**
 * The Total Object to be appended at the end of the bills
 */
const totalAmount = new Total(
  "bill-total",
  "Totals:",
  totalAib,
  totalBoi,
  subTotal,
  finalBalance
);

  // New bill
  let finalBal = document.createElement("total");
  finalBal.classList.add("final-balance");

  // Set div ID to the bill.id property
  finalBal.setAttribute("id", totalAmount.id);


  // Set innerHTML of billArticle using the bill object
  finalBal.innerHTML = `
      <h1 class="total__name">${totalAmount.name}</h1>
      <ul class="final-balance__features">
      <li class="feature total__amount-aib">Total amount AIB:<span class="amount__number"> ${
        formatter("en-US", "EUR", totalAib)
      }</span></li>
      <li class="feature total__amount-aib">Total amount BOI:<span class="amount__number"> ${
        formatter("en-US", "EUR", totalBoi)
      }</span></li>
      <li class="feature total__amount-aib">Total amount both banks:<span class="amount__number"> ${
        formatter("en-US", "EUR", subTotal)
      }</span></li>
      <p> Amount due:
      <li class="feature total__amount-aib">Amount AIB due to Clayton:<span class="amount__number"> ${
        formatter("en-US", "EUR", totalAib /2)
      }</span></li>
      <li class="feature total__amount-boi">Amount BOI due to Francisco:<span class="amount__number"> ${
        formatter("en-US", "EUR", totalBoi /2)
      }</span></li>

      <li class="feature total__due-amount">Due Amount:<span class="amount__number__highlight"> ${
        formatter("en-US", "EUR", finalBalance)
      }</span></li>        
      </ul>
    `;  
const total = document.querySelector(".maincontent");
total.append(finalBal);