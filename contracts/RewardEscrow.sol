//SPDX-License-Identifier: Unlicense
pragma solidity >=0.5.16 <0.9.0;
pragma experimental ABIEncoderV2;         // enabled to encode and decode nested arrays and structs, code will be less optimized

contract RewardEscrow {

    // @notice Reward pool belongs to survey creator
    // @dev if more attributes are needed, update accordingly
    struct RewardPoolInfo {
        address payable erc20Address;       // address of ERC20 token contract where the funds are withdrawn from to distribute as reward 
        uint256 totalRewards;            // amount of DAI allocated for rewarding survey responses
        uint256 rewardPerResponse;  // DAI reward amount per survey response 
    }

    // @notice Survey processor contract address
    address payable internal agent;

    // @notice Surveys owned by survey creator
    mapping (address => string[]) internal surveyOwners;

    // @notice RewardPoolInfo for each survey id
    mapping (string => RewardPoolInfo) internal rewardPools;

    /**
     * Events
     */

    // @notice Emitted when survey process contract address is set
    // @param account Survey Process Contract address
    event LogAssignedAgent(address account);

    // @notice Emitted when survey is created
    // @param surveyId CID of survey
    // @param by Survey Creator address
    event LogSurveyCreated(string surveyId, address by);

    // @notice Emitted when reward in DAI are deposited to RewardEscrow contract address
    // @param surveyId CID of survey
    // @param by Survey Creator address 
    // @param amount Total rewards in DAI
    event LogRewardDeposited(string surveyId, address by, uint256 amount);
    
    // @notice Emitted when unused rewards are refunded to Survey Creator
    // @param surveyId Survey Process Contract address
    // @param to Survey Creator address
    event LogUnusedRewardRefund(string surveyId, address to);
    
    // @notice Emitted when reward pool information is set by Survey Processor Contract
    // @param surveyId Survey Process Contract address
    // @param from Survey Creator Contract address
    // @param amount Total rewards in DAI
    event LogRewardPoolInfoSet(string surveyId, address from, uint256 amount);

    // @notice Emitted when reward pool information is retrieved by Survey Creator
    // @param surveyId Survey Process Contract address
    // @param surveyCreator Survey Creator address
    // @param amount Total rewards
    event LogRewardPoolInfoGet(string surveyId, address surveyCreator, uint256 amount);

    constructor() {
    }

    /**
     * Modifiers
     */

    modifier onlyAgent() {
        require(msg.sender == agent, "Not Agent");
        _;
    }

    modifier onlySurveyOwner() {
        require(surveyOwners[msg.sender].length > 0, "No surveys belong to this wallet address");
        _;
    }

    // @notice Assign Survey Processor Contract address to agent
    // @dev Only Survey Processor will have permission
    // @param _address Survey Processor Contract address
    function setAgent(address payable _address) public {
        agent = _address;
    }

    // @notice Retrieve address of Survey Processor Contract
    // @return agent Address of the Survey Processor Contract
    function getAgent() public view returns(address) {
        return agent;
    }

    // @notice Total ETH in RewardEscrow contract address escrowed by Survey Creators
    // @return Balance of ETH in Reward Escrow contract
    function getBalance() external view returns(uint256) {
        return address(this).balance;
    }

    // @notice Save Reward Pool Information belongs to Survey Creator
    // @param _rewardPool Information of Reward Pool
    // @param _surveyId Survey ID
    // @return true When all the steps are executed successfully
    function setRewardPoolInfo(RewardPoolInfo memory _rewardPool, string memory _surveyId) external payable returns (bool) {
        // bytes memory _surveyIdBytes = bytes(_surveyId);
        rewardPools[_surveyId] = _rewardPool;
        // RewardPoolInfo storage pool = rewardPools[_surveyId];
        // pool.erc20Address = _rewardPool.erc20Address;
        // pool.balance = _rewardPool.balance;
        // pool.rewardPerResponse = _rewardPool.rewardPerResponse;

        // uint256 _totalRewards = _rewardPool.balance;
        emit LogRewardPoolInfoSet(_surveyId, msg.sender, msg.value);

        return true;
    }

    // @notice Retrieve Reward Pool Information of a particular survey
    // @param _surveyId Survey ID
    // @return pool Stored RewardPoolInfo struct
    function getRewardPoolInfo(string memory _surveyId) external view returns(RewardPoolInfo memory)  {

        // RewardPoolInfo memory pool = rewardPools[_surveyId];
        // emit LogRewardPoolInfoGet(_surveyId, pool.erc20Address, pool.totalRewards);
        // RewardPoolInfo memory pool = rewardPools[_surveyId];
        return rewardPools[_surveyId];
    }

    // @notice
    // @dev
    // @param
    // @param
    function withdrawReward(string calldata _surveyId) external onlySurveyOwner {
    }

    // @notice
    // @dev
    // @param
    // @param
    function refundRemaining(string calldata _surveyId) external onlySurveyOwner {
        emit LogUnusedRewardRefund(_surveyId, msg.sender);
    }

}
