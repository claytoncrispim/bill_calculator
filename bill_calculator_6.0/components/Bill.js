/**
 * Bill Object
 *
 * - ID
 * - Name
 * - Amount
 * - Status
 * - Debit account
 */

class Bill {
  constructor(
    id, 
    name, 
    amount, 
    status, 
    acc
  ) {
    this.id = id;
    this.name = name;
    this.amount = amount;
    this.status = status;
    this.acc = acc;
  }
  updateAmount(amount) {
    this.amount = amount;
  }
}

export default Bill;
