interface IVulnerable {
    function balanceOf(address user) external returns(uint256);
    function deposit() payable external;
    function setLockingPeriod(uint256 newPeriod) external;
    function withdraw(uint256 amount) external;
}