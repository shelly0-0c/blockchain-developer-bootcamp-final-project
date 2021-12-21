var RewardEscrow = artifacts.require("./RewardEscrow.sol");
var SurveyProcessor = artifacts.require("./SurveyProcessor.sol");

module.exports = (deployer, network, accounts) => {
  deployer.deploy(RewardEscrow).then(() => {
    return deployer.deploy(SurveyProcessor, RewardEscrow.address);
  });
};
