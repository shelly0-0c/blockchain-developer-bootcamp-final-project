var RewardEscrow = artifacts.require("./RewardEscrow.sol");
var SurveyProcessor = artifacts.require("./SurveyProcessor.sol");

module.exports = (deployer) => {
  deployer.deploy(RewardEscrow).then(() => {
    return deployer.deploy(SurveyProcessor, RewardEscrow.address);
  });
};
