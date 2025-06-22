/**
 * Total Object:
 * ID
 * Name
 * Amount AIB
 * Amount BOI
 * Sub-total
 * Total (less Amount BOI)
 */

class Total {
  constructor(
    id, 
    name, 
    amtAib, 
    amtBoi,
    subTotal, 
    total
  ) {
    this.id = id;
    this.name = name;
    this.amtAib = amtAib;
    this.amtBoi = amtBoi;
    this.subTotal = subTotal;
    this.total = total;
  }
}

export default Total;