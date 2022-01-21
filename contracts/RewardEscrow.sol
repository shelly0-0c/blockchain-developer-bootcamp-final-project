//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.0;
pragma experimental ABIEncoderV2;         // enabled to encode and decode nested arrays and structs, code will be less optimized
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

// @title Escrow accounts holding ETH for rewards
// @author shelly
// @notice Use this contract for transferring/withdrawing ETH rewards
// @dev TODO: The contract functions are only executable from Survey Processor contract
contract RewardEscrow {

    using SafeMath for uint256;

    // @notice Reward pool belongs to survey creator
    // @dev if more attributes are needed, update accordingly
    struct RewardPoolInfo {
        address payable erc20Address;  // address of ERC20 token contract where the funds are withdrawn from, to distribute as reward 
        uint256 totalRewards;          // amount of ETH allocated for rewarding survey responses
        uint256 rewardPerResponse;     // ETH reward amount per survey response 
    }

    // @notice Survey processor contract address
    address payable internal agent;

    // @notice Surveys owned by survey creator
    mapping (string => address) internal surveyOwners;

    // @notice RewardPoolInfo for each survey id
    mapping (string => RewardPoolInfo) internal rewardPools;


    // @dev using mutual exclusion to prevent re-entrancy attack
    bool private lockBalances;


    /**
     * Events
     */

    // @notice Emitted when survey process contract address is set
    // @param account Survey Process Contract address
    event LogAssignedAgent(address account);

    // @notice Emitted when survey is created
    // @param surveyId ID of survey
    // @param by Survey Creator address
    event LogSurveyCreated(string surveyId, address by);

    // @notice Emitted when reward in DAI are deposited to RewardEscrow contract address
    // @param surveyId ID of survey
    // @param by Survey Creator address 
    // @param amount Total rewards in ETH
    event LogRewardDeposited(string surveyId, address by, uint256 amount);
    
    // @notice Emitted when unused rewards are refunded to Survey Creator
    // @param surveyId ID of survey
    // @param to Survey Creator address
    event LogReturnRemainingCredit(string surveyId, address to);
    
    // @notice Emitted when reward pool information is set by Survey Processor Contract
    // @param surveyId ID of survey
    // @param from Survey Creator Contract address
    // @param amount Total rewards in ETH
    event LogRewardPoolInfoSet(string surveyId, address from, uint256 amount);

    // @notice Emitted when reward pool information is retrieved by Survey Creator
    // @param surveyId ID of survey
    // @param surveyCreator Survey Creator address
    // @param amount Total rewards in ETH
    event LogRewardPoolInfoGet(string surveyId, address surveyCreator, uint256 amount);

    constructor() {
    }

    /**
     * Modifiers
     */
    modifier surveyOwnerExists(string memory _surveyId) {
        require(surveyOwners[_surveyId]!= address(0), "Survey Owner not found");
        _;
    }


    // @notice Total ETH in RewardEscrow contract address escrowed by Survey Creators
    // @return Balance of ETH in Reward Escrow contract
    function getEscrowContractBalance() public view returns(uint256) {
        return address(this).balance;
    }

    // @notice Retrieve Reward Pool Information of a particular survey
    // @param _surveyId Survey ID
    // @return pool Stored RewardPoolInfo struct
    function getRewardPoolInfo(string memory _surveyId) external view returns(RewardPoolInfo memory)  {
        return rewardPools[_surveyId];
    }

    // @notice Save Reward Pool Information belongs to Survey Creator
    // @param _rewardPool Information of Reward Pool
    // @param _surveyId Survey ID
    // @return true When all the steps are executed successfully
    function setRewardPoolInfo(RewardPoolInfo memory _rewardPool, string memory _surveyId) external payable returns (bool) {
        rewardPools[_surveyId] = _rewardPool;

        emit LogRewardPoolInfoSet(_surveyId, msg.sender, msg.value);
        return true;
    }

    // @notice Retrieve Survey Owner of a particular survey
    // @param _surveyId Survey ID
    function getSurveyOwner(string memory _surveyId) external view returns (address) {
        return surveyOwners[_surveyId];
    }

    // @notice Assign Survey Owner to Survey ID
    // @param _surveyId Survey ID
    function setSurveyOwner(string memory _surveyId, address _owner) public {
        surveyOwners[_surveyId] = _owner;
    }



    // @notice Claim cumulative rewards from surveys taken
    // @dev TODO: Only Survey Takers can call this function successfully, need to do deletegate call in survey processor
    // @param _surveyId Survey ID
    function redeemReward(string calldata _surveyId) external {
        //TODO
    }

    // @notice Refund excess ETH, allocated for survey to Survey Owner
    // @dev TODO: Only Survey Owners can call this function successfully, need to do delegate call in survey processor
    // @param _surveyId Survey ID
    // @param _totalResponses Total number of survey responses
    // @return true if the executions are successful and the end of the function is reached
    function refundRemaining(string memory _surveyId, uint256 _totalResponses) external payable returns (bool) {

        uint256 escrowContractBalanceBefore = getEscrowContractBalance();
        uint256 amountToRefund = rewardPools[_surveyId].totalRewards.sub(_totalResponses.mul(rewardPools[_surveyId].rewardPerResponse));
        
        require(!lockBalances);
        lockBalances = true;        
        
        payable(rewardPools[_surveyId].erc20Address).transfer(amountToRefund);
        
        if (_totalResponses > 0) {
            // if the transfer to Survey Owner succeeds, ETH balance of Reward Escrow before and after should be different
            assert(escrowContractBalanceBefore > getEscrowContractBalance());
        }

        lockBalances = false;        


        emit LogReturnRemainingCredit(_surveyId, rewardPools[_surveyId].erc20Address);
        
        return true;
    }

}
