// SPDX-License-Identifier: MIT
pragma solidity >=0.5.16 <0.9.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./RewardEscrow.sol";

contract SurveyProcessor is RewardEscrow {

    using SafeMath for uint256;

    // @notice About survey 
    // @dev Describe the survey, new attributes should be extended here
    struct SurveyInfo {
        string surveyId;              // survey ID
        uint256 closingDate;          // survey closing date
    }

    struct ResponseResults {
        uint256 totalRecords;           // total records of survey responses
        ResponseInfo[] responses;      
    }
    struct ResponseInfo {
        address payable erc20Address;    // survey respondant address
        string metadata;                 // response metadata location
    }

    // @notice RewardEscrow contract address
    address payable escrowAddress;

    // @notice surveys owned by survey creator
    // @dev survey id mapped to survey owner key with SurveyInfo struct
    mapping (string => mapping(address => SurveyInfo)) surveys;

    // @notice survey responses metadata file location 
    // @dev survey id mapped to survey owner key with responses metadata location as values
    mapping (string => ResponseResults) responses;

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
    // @param totalResponses total number of responses for the survey
    event LogSurveyResponseSubmitted(address respondent, string surveyId, uint256 totalResponses);

    // @notice Emitted when survey response exists
    // @param respondent Survey Respondent address
    // @param surveyId CID of survey
    event LogSurveyResponseExists(address respondent, string surveyId);

    // @notice Emitted when rewards meant for survey are deposited into RewardEscrow Contract
    // @param surveyOwner Survey Creator address
    // @param amount Total Rewards
    event LogRewardTransferToEscrow(address surveyOwner, uint256 amount);

    // @notice Emitted when the reward is deducted from reward escrow account of the survey
    // @param surveyId CID of survey
    // @param amountDeducted Reward per response deducted
    event LogDeductBalanceFromPool(string surveyId, uint256 amountDeducted);

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
        require(block.timestamp >= surveys[_surveyId][msg.sender].closingDate, "Survey is still active.");
        _;
    }

    modifier surveyIsNotClosed(string memory _surveyId) {
        require(block.timestamp < surveys[_surveyId][msg.sender].closingDate, "Survey is closed");
        _;
    }

    modifier escrowAddrIsSet() {
        require(escrowAddress != address(0));
        _;
    }

    modifier validateReward(uint256 _reward) {
        require(_reward > 0, "Reward per response needs to be greater than 0.");
        _;
    }

    modifier paidEnough(uint256 _amount) {
        require(msg.value >= _amount, "Not Paid Enough.");
        _;
    }

    modifier balanceEnough(string memory _surveyId, uint256 _totalAmountToDeduct) {
        require(_totalAmountToDeduct < getTotalDistributableRewardsOfSurvey(_surveyId));
        _;
    }

    modifier validateDeposit(RewardPoolInfo memory _rewardPool) {
        require(_rewardPool.totalRewards <= address(msg.sender).balance , "Survey Creator's token balance is not enough.");
        require(_rewardPool.rewardPerResponse > 0, "Reward per response needs to be greater than 0.");
        _;
    }

    modifier onlySurveyOwner(string memory _surveyId) {
        require(RewardEscrow(escrowAddress).getSurveyOwner(_surveyId) == msg.sender , "Only allowed for Survey Owner.");
        _;
    }

    modifier exceptSurveyOwner(string memory _surveyId) {
        require(RewardEscrow(escrowAddress).getSurveyOwner(_surveyId) != msg.sender, "Survey Owner can't take own survey." );
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
    // @dev For the registration to work, Escrow Contract address must be assigned, _reward must not be 0 and 
    //      ETH amount specified in _totalRewards must be transferred
    // @param _surveyId Survey ID
    // @param _totalRewards Total ETH Rewards to distribute for survey
    // @param _reward Reward per survey response
    // @param _closingDate Survey closing date
    // @return  Boolean true/false for successful transaction
    function registerSurvey(string memory _surveyId, uint256 _totalRewards, uint256 _reward, uint256 _closingDate) external payable escrowAddrIsSet paidEnough(_totalRewards) validateReward(_reward) {
        RewardPoolInfo memory pool = RewardPoolInfo({erc20Address: payable(msg.sender), totalRewards: _totalRewards, rewardPerResponse: _reward});
        SurveyInfo memory survey = SurveyInfo({surveyId: _surveyId, closingDate: _closingDate});
        
        bool success = _deposit(pool, _surveyId);
        require(success);
        
        emit LogRewardTransferToEscrow(msg.sender, _totalRewards);

        surveys[_surveyId][msg.sender] = survey;

        RewardEscrow(escrowAddress).setSurveyOwner(_surveyId, msg.sender);
        emit LogSurveyRegistered(msg.sender, _surveyId);
    }


    // @notice Deposit ETH to Reward Escrow Contract, while saving Reward Pool Information 
    // @param _rewardPool Information of Reward Pool 
    // @param _surveyId Survey ID
    // @return success Boolean true/false for successful transaction
    function _deposit(RewardPoolInfo memory _rewardPool, string memory _surveyId) public paidEnough(_rewardPool.totalRewards) payable returns(bool) {
        RewardEscrow re = RewardEscrow(escrowAddress);
        return re.setRewardPoolInfo{value: _rewardPool.totalRewards}(_rewardPool, _surveyId);
    }

    // @notice Retrieve survey owner's address for survey
    // @param _surveyId Survey ID
    // @return Address of survey owner
    function getOwnerAddressOfSurvey(string memory _surveyId) public view returns(address) {
        return RewardEscrow(escrowAddress).getRewardPoolInfo(_surveyId).erc20Address;
    }

    // @notice Retrieve total rewards allocated for survey
    // @param _surveyId Survey ID
    // @return Total Rewards in Wei
    function getTotalDistributableRewardsOfSurvey(string memory _surveyId) public view returns(uint256) {
        return RewardEscrow(escrowAddress).getRewardPoolInfo(_surveyId).totalRewards;
    }

    // @notice Retrieve reward per survey response for survey
    // @param _surveyId Survey ID
    // @return Reward per Response in Wei
    function getRewardPerResponseOfSurvey(string memory _surveyId) public view returns(uint256) {
        return RewardEscrow(escrowAddress).getRewardPoolInfo(_surveyId).rewardPerResponse;
    }

    // @notice Remove survey when the survey period is closed
    // @dev Only Survey Owner can get the refund and can delete the survey when the survey period is closed
    // @param _surveyId Survey ID
    function refundOnSurveyClosed(string memory _surveyId) external onlySurveyOwner(_surveyId) escrowAddrIsSet surveyIsClosed(_surveyId) {
        
        uint256 totalResponses = responses[_surveyId].totalRecords;
        
        bool success = RewardEscrow(escrowAddress).refundRemaining(_surveyId, totalResponses);
        require(success, "Transfer failed.");

        // if the transfer to Survey Owner succeeds, ETH balance of Reward Escrow before and after should be different
        delete surveys[_surveyId][msg.sender];
        emit LogSurveyRemoved(msg.sender, _surveyId);
    }

    // @notice Store survey taker address, location of survey response metadata and update total response count when survey is answered
    // @dev TODO: Minting of ERC721 token on survey response metadata
    // @param _surveyId Survey ID
    // @param _responseMetadata Metadata file location of individual survey response
    function answerSurvey(string memory _surveyId, string memory _responseMetadata) external exceptSurveyOwner(_surveyId) escrowAddrIsSet {
        ResponseInfo memory response = ResponseInfo({erc20Address: payable(msg.sender), metadata: _responseMetadata});
        uint256 totalResponsesBeforeUpdate = responses[_surveyId].totalRecords;
        uint256 newTotal = totalResponsesBeforeUpdate + 1;

        require(newTotal.mul(getRewardPerResponseOfSurvey(_surveyId)) < getTotalDistributableRewardsOfSurvey(_surveyId));
        
        responses[_surveyId].totalRecords = totalResponsesBeforeUpdate + 1;
        responses[_surveyId].responses.push(response);
        emit LogSurveyResponseSubmitted(msg.sender, _surveyId, responses[_surveyId].totalRecords);
    }
    

}

