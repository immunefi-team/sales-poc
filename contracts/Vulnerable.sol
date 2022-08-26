// SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.4;

contract Vulnerable {
    address public owner;
    uint256 private lockingPeriod;

    mapping(address => uint256) public balances;
    mapping(address => uint256) public unlockTime;

    event Deposited(address depositor,uint256 amount); 

    /// @notice deployer will be the owner and default lockingPeriod sets to 7 days.
    constructor() {
        owner = msg.sender;
        lockingPeriod = 7 days;
    }

    modifier onlyOwner() {
        require(msg.sender == owner,"not owner");
        _;
    }

    /// @notice transfers the native amount to the contract.
    /// @dev records the deposited amount on the contract.
    function deposit() payable external {
        require(msg.value > 0,'no ether sent');
        balances[msg.sender] += msg.value;
        unlockTime[msg.sender] = lockingPeriod;
        emit Deposited(msg.sender,msg.value);
    }

    /// @notice returns the total deposited amount of the user.
    function balanceOf(address user) external view returns(uint256) {
        return balances[user];
    }

    /// @notice function is only callable by owner address.
    /// @dev sets the new unlocking period of the contract.
    function setLockingPeriod(uint256 newPeriod) external onlyOwner {
        lockingPeriod = newPeriod;
    }

    /// @notice withdraws the native balance from the contract to the user.
    /// @dev unlockable after the lock period.
    function withdraw(uint256 amount) external {
        // CHECKS
        require(block.timestamp >= unlockTime[msg.sender],"wait until lock period ends");
        require(balances[msg.sender] >= amount,"amount to withdraw exceeds balance");

        // INTERACTION
        (bool sent,) = msg.sender.call{value: amount}("");
        require(sent, "failed to send eth");

        // EFFECTS
        unlockTime[msg.sender] = 0;
        if(amount >= balances[msg.sender]) {
            balances[msg.sender] = 0;
        } else {
            balances[msg.sender] -= amount;
}

    }

    /// @notice receives eth on this contract.
    receive() external payable {}
}