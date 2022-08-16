"use strict";

const { ethers } = require("hardhat");

function parseEth(amount, unit) {
    if (unit == undefined) {
        unit = "ether";
    }
    return ethers.utils.parseUnits(amount.toString(),unit);
}

async function balanceToHex(amount) {
    let balance = ethers.utils.hexStripZeros(amount.toHexString());
    return balance;
}

// returns the current block timestamp
async function getBlockchainTime(block="latest") {
    if (block == "latest") {
        return (await ethers.provider.getBlock("latest")).timestamp;
    } else {
        return (await ethers.provider.getBlock(block)).timestamp;
    }  
}

// sets the block timestamp and mine the blocks till that
async function setBlockchainTime(newTime, mine) {
    if (typeof mine === "undefined") {
        mine = true;
    }
    await ethers.provider.send("evm_setNextBlockTimestamp", [newTime]);
    if (mine) {
        await ethers.provider.send("evm_mine", []);
    }
}

module.exports = {
    parseEth,
    balanceToHex,
    getBlockchainTime,
    setBlockchainTime
}