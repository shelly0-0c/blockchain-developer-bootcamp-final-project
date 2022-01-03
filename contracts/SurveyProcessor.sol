// SPDX-License-Identifier: MIT
pragma solidity >=0.5.16 <0.9.0;
pragma experimental ABIEncoderV2;

import "./RewardEscrow.sol";

contract SurveyProcessor is RewardEscrow {

    // @notice About survey 
    // @dev Describe the survey, new attributes should be extended here
    struct SurveyInfo {
        string surveyId;              // survey ID
        uint256 closingDate;           // survey closing date
    }


    // @notice RewardEscrow contract address
    address payable escrowAddress;

    // @notice surveys owned by survey creator
    mapping (string => mapping(address => SurveyInfo)) surveys;

    /**
     * Events
     */

    // @notice Emitted when survey is created successfully
    // @param surveyOwner Survey Creator address
    // @param surveyId CID of survey
    event LogSurveyRegistered(address surveyOwner, string surveyId);

    // @notice Emitted when survey is removed successfully
    // @param surveyOwner Survey Creator address
    // @param surveyId CID of survey
    event LogSurveyRemoved(address surveyOwner, string surveyId);

    // @notice Emitted when survey response is submitted successfully
    // @param respondent Survey Respondent address
    // @param surveyId CID of survey
    event LogSurveyResponseSubmitted(address respondent, string surveyId);

    // @notice Emitted when survey response exists
    // @param respondent Survey Respondent address
    // @param surveyId CID of survey
    event LogSurveyResponseExists(address respondent, string surveyId);

    // @notice Emitted when rewards meant for survey are deposited into RewardEscrow Contract
    // @param surveyOwner Survey Creator address
    // @param amount Total Rewards
    event LogRewardTransferToEscrow(address surveyOwner, uint256 amount);

    /**
     * Modifiers
     */

    modifier surveyExists(string memory _surveyId) {
        require(bytes(surveys[_surveyId][msg.sender].surveyId).length != 0, "Survey does not exist.");
        _;
    }
    
    modifier surveyResponseExists(string memory _surveyId) {
        // TODO: check if survey response exists
        _;
    }

    modifier surveyIsClosed(string memory _surveyId) {
        require(block.timestamp >= surveys[_surveyId][msg.sender].closingDate, "Survey is closed.");
        _;
    }

    modifier escrowAddrIsSet() {
        require(escrowAddress != address(0));
        _;
    }

    // modifier validateBalance(uint256 _totalRewards) {
    //     require(_totalRewards < address(msg.sender).balance, "Survey Owner's ETH balance is not enough.");
    //     _;
    // }

    modifier validateReward(uint256 _reward) {
        require(_reward > 0, "Reward per response needs to be greater than 0.");
        _;
    }

    modifier paidEnough(uint256 _amount) {
        require(msg.value >= _amount, "Not Paid Enough.");
        _;
    }

    modifier validateDeposit(RewardPoolInfo memory _rewardPool) {
        require(_rewardPool.totalRewards <= address(msg.sender).balance , "Survey Creator's token balance is not enough.");
        require(_rewardPool.rewardPerResponse > 0, "Reward per response needs to be greater than 0.");
        _;
    }


    constructor(address payable _escrowAddress) {
        escrowAddress = _escrowAddress;
    }

    // @notice For overwriting Reward Escrow contract address
    // @param _address Reward Escrow contract address
    function setEscrowAddress(address payable _address) external {
        escrowAddress = _address;
    }

    // @notice Retrieve Reward Escrow contract address
    // @return Reward Escrow contract address
    function getEscrowAddress() external view returns (address){
        return escrowAddress;
    }

    // @notice For overwriting Survey Processor Contract address in Reward Escrow Contract
    // @param _address Survey Processor contract address
    function setSurveyProcessorAddress(address payable _address) public {
        RewardEscrow(escrowAddress).setAgent(_address);
    }

    // @notice Check if Survey ID is stored
    // @dev Survey ID is stored in surveys mapping, and Survey ID cannot be empty string
    // @param _surveyId Survey ID
    // @param _surveyOwner Address of survey creator
    // @return Survey ID
    function checkSurveyIdExists(string memory _surveyId, address _surveyOwner) external view returns (bool) {
        if (bytes(surveys[_surveyId][_surveyOwner].surveyId).length > 0) {
            return true;
        }

        return false;
        // return surveys[_surveyId][_surveyOwner].surveyId;
    }
 

    // @notice Deposit ETH to Reward Escrow Contract, while saving Reward Pool Information 
    // @dev Escrow Contract address must be assigned
    // @param _surveyId Survey ID
    // @param _totalRewards Total ETH Rewards to distribute for survey
    // @param _reward Reward per survey response
    // @param _closingDate Survey closing date
    // @return  Boolean true/false for successful transaction
    function registerSurvey(string memory _surveyId, uint256 _totalRewards, uint256 _reward, uint256 _closingDate) external payable escrowAddrIsSet paidEnough(_totalRewards) validateReward(_reward) {

        RewardPoolInfo memory pool = RewardPoolInfo({erc20Address: payable(msg.sender), totalRewards: _totalRewards, rewardPerResponse: _reward});
        SurveyInfo memory survey = SurveyInfo({surveyId: _surveyId, closingDate: _closingDate});
        bool success = deposit(pool, _surveyId);
        require(success);
        emit LogRewardTransferToEscrow(msg.sender, _totalRewards);

        surveys[_surveyId][msg.sender] = survey;
        surveyOwners[msg.sender].push(_surveyId);
        emit LogSurveyRegistered(msg.sender, _surveyId);
    }


    // @notice Deposit ETH to Reward Escrow Contract, while saving Reward Pool Information 
    // @param _rewardPool Information of Reward Pool 
    // @param _surveyId Survey ID
    // @return success Boolean true/false for successful transaction
    function deposit(RewardPoolInfo memory _rewardPool, string memory _surveyId) public paidEnough(_rewardPool.totalRewards) payable returns(bool) {
        RewardEscrow re = RewardEscrow(escrowAddress);
        return re.setRewardPoolInfo{value: _rewardPool.totalRewards}(_rewardPool, _surveyId);
    }

    // @notice Retrieve a list of surveys owned by Survey Creator
    // @param _surveyOwner Address of Survey Creator
    // @return Array of surveys owned by Survey Creator
    function surveysOf(address _surveyOwner) external view returns(string[] memory){
        return surveyOwners[_surveyOwner];
    }

    // @notice Retrieve survey owner's address for survey
    // @param _surveyId Survey ID
    // @return Address of survey owner
    function getOwnerAddressOfSurvey(string memory _surveyId) external view returns(address) {
        // return rewardPools[_surveyId];
        return RewardEscrow(escrowAddress).getRewardPoolInfo(_surveyId).erc20Address;
    }

    // @notice Retrieve total rewards allocated for survey
    // @param _surveyId Survey ID
    // @return Total Rewards in Wei
    function getTotalDistributableRewardsOfSurvey(string memory _surveyId) external view returns(uint256) {
        // return rewardPools[_surveyId];
        return RewardEscrow(escrowAddress).getRewardPoolInfo(_surveyId).totalRewards;
    }

    // @notice Retrieve reward per survey response for survey
    // @param _surveyId Survey ID
    // @return Reward per Response in Wei
    function getRewardPerResponseOfSurvey(string memory _surveyId) external view returns(uint256) {
        // return rewardPools[_surveyId];
        return RewardEscrow(escrowAddress).getRewardPoolInfo(_surveyId).rewardPerResponse;
    }

    // @notice Remove survey when the survey period is closed
    // @dev Only Survey Owner can delete the survey from the surveys mapping when the survey period is closed
    function removeSurvey(string calldata _surveyId) external onlySurveyOwner escrowAddrIsSet surveyIsClosed(_surveyId) {
        RewardEscrow(escrowAddress).refundRemaining(_surveyId);
        delete surveys[_surveyId][msg.sender];
        emit LogSurveyRemoved(msg.sender, _surveyId);
    }

    function answerSurvey(string calldata _surveyId) external {
        emit LogSurveyResponseSubmitted(msg.sender, _surveyId);
    }

}

