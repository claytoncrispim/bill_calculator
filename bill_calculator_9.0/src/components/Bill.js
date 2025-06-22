/**
 * Bill Object
 *
 * - Type
 * - Payment method
 * - Amount
 * - Status
 */

class Bill {
  constructor( 
    type, 
    method, 
    amount, 
    status
  ) {
    this.type = type;
    this.method = method;
    this.amount = amount;
    this.status = status;
  }
  updateAmount(amount) {
    this.amount = amount;

    return this.amount;
  }
  updateStatus(status) {
    if (status === "Paid") {
        return true;
    } else if (status === "Unpaid") {
        return false;
    }
  }
  checkEmpty(property) {
    const defaultText = ["The field ", " cannot be empty!"];
    const textProperties = ["bill type", "bank", "amount", "status"];
    switch (property) {
      case "Select the bill type":
        alert(defaultText[0]+textProperties[0]+defaultText[1]);
        location.reload();
        break;
      case "Select the bank":
        alert(defaultText[0]+textProperties[1]+defaultText[1]);
        location.reload();
        break; 
    }
  }
}

export default Bill;
