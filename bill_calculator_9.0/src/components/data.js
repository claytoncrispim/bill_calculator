import Bill from "./Bill.js";

/**
 * Beginning of the year's bills
 * 
 * Management fee
 * Property Tax
 */
const managementFee = new Bill(
    "bill01",
    "Management Fee",
    1469.45,
    true,
    "AIB"
);

const propertyTax = new Bill(
    "bill02",
    "Property Tax",
    191,
    true,
    "AIB"
);


/**
 * Monthly bills
 */
const mortgage = new Bill(
    "bill03",
    "Mortgage",
    334.27,
    false,
    "AIB"
);

const gas = new Bill(
    "bill04",
    "Gas",
    60.02,
    false,
    "AIB"
);

const electricity = new Bill(
    "bill05",
    "Electricity",
    71.70,
    false,
    "AIB"
);

const amazonPrime = new Bill(
    "bill06",
    "Amazon Prime",
    10.46,
    false,
    "AIB"
);

const netflix = new Bill(
    "bill07",
    "Netflix",
    14.99,
    false,
    "BOI"
);

const discoveryPlus = new Bill(
    "bill08",
    "Discovery+",
    4.99,
    false,
    "BOI"
);

const virginMedia = new Bill(
    "bill09",
    "Virgin Media",
    74.99,
    false,
    "BOI"
);

const hboMax = new Bill(
    "bill10",
    "HBO Max",
    6.34,
    false,
    "BOI"
);


//Adding objects into an array

const billsArray = [managementFee, propertyTax, mortgage, gas, electricity, netflix, virginMedia, hboMax];

export default billsArray;