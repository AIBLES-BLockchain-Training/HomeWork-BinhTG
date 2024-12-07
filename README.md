# LENDING AND BORROWING
## Introduction
Welcome to **Lending and Borrowing**, a decentralized finance (DeFi) application where users can participate as depositors or borrowers. Depositors provide liquidity to the market to earn passive income, while borrowers can borrow collateralized
. The platform is designed to manage loans, collateral, and interest rates in a decentralized and transparent system.

👉 **Visit the website at:** [https://felabfinal.vercel.app/home](https://felabfinal.vercel.app/home)

## Key Features
- **Price Oracle**: Price feeds and automation through Chainlink ensure data accuracy and reliable execution of contract functions.
- **Collateral Management**: The platform supports dynamic collateral management with real-time monitoring and liquidation mechanisms.
- **Lending Pool**: Users can deposit digital assets into the lending pool and earn interest over time.
- **Borrowing**: Users can borrow assets by providing collateral. The loan amount depends on the value of the collateral and the health factor.
- **Automated Interest Calculation**: Interest rates are calculated based on supply and demand, with automatic updates for lenders and borrowers.
- **Secure Liquidation**: If a loan's health factor drops below a certain threshold, the system triggers liquidation to protect lenders.
## Technology Stack
- **Smart Contracts**: Built on the Ethereum blockchain using Solidity.
- **Hardhat**: Development environment for writing and testing smart contracts.
- **Chainlink Oracles**: For fetching off-chain data such as asset prices.
- **ChainLink Automation**: Automate important tasks sush as Health Factor Monitoring  and Automatic Liquidation
- **React**: Frontend framework for user interface and interaction.
- **Next.js**: Framework for building server-side rendering and static web applications.
- **Wagmi**: React hooks library for Ethereum, used for blockchain interactions.
## Usage
#### Lending
- Navigate to the "Lending Pool" section of the platform.
- Select the asset you want to lend (View the allowed assets in 'Get Allowed Tokens' section).
- Approve and deposit the desired amount into the lending pool.
- Include the exact service fee (View in 'Get Service Fee' section)
- Earn interest based on the pool's utilization rate.
#### Add Collaterals
- Navigate to the "Collateral Manager" section of the platform.
- Select the asset you want to use as collateral (View the allowed assets in 'Get Allowed Tokens' section).
- Approve and deposit your desired amount into.
- Include the exact service fee (View in 'Get Service Fee' section).
- View your provided collateral and manage it dynamically.
- If the health factor falls below 1, the system will automatically trigger liquidation to protect the loan.
#### Borrowing
- Navigate to the 'Borrower' section of the platform. 
- Choose the asset you wish to borrow (Refer to the allowed assets in the 'Get Allowed Tokens' section)
- Input the desired borrowing amount.
- Select the collateral address for the asset you'll be using as collateral. 
- Include the exact service fee (View in 'Get Service Fee' section).
- The system will automatically calculate the Health Factor of the loan.
- Proceed to borrow the asset and manage repayments as per the loan terms.
## License
This project is licensed under the MIT License. See the LICENSE file for details.
## Contact
For any questions, feel free to reach out:

Email: [truonggiabinh1231@gmail.com](truonggiabinh1231@gmail.com)

GitHub: [https://github.com/TGBinh](https://github.com/TGBinh)
