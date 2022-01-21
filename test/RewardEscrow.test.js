let { constants, expectEvent } = require("@openzeppelin/test-helpers");

let RewardEscrow = artifacts.require("RewardEscrow");

contract("RewardEscrow", (accounts) => {
  const [contractOwner, surveyMaker, surveyTaker, surveyProcessorContract] =
    accounts;

  let reInstance;

  before(async () => {
    reInstance = await RewardEscrow.new();
  });

  // TODO
  // describe("Reward Pool Functionalities", () => {});
});
