const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("FinancialModule", (m) => {
    const user = m.contract("UserManagement", []);

    const financial = m.contract("FinancialOporations", []);

    const loan = m.contract("LoanSystem", []);

    return {user, financial, loan};
});

//Address deploy UserManagement:0xd5eDA4edAF0AAB27f3472DDe020CdC2ac0023fB9
//               FinancialOporations:0x8BAc3208a0eD7Bf5C1412650BCb56E7d771346D1
//               LoanSystem: 0xa5bE8b955a3F3D4435F0E20904288c9ADF0B885f