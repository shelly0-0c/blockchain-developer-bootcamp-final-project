let { constants, expectEvent } = require("@openzeppelin/test-helpers");

const {
  items,
} = require("../../supply-chain-exercise-shelly0-0c/test/ast-helper");

let RewardEscrow = artifacts.require("RewardEscrow");

contract("RewardEscrow", (accounts) => {
  const [contractOwner, surveyMaker, surveyTaker, surveyProcessorContract] =
    accounts;

  let reInstance;

  before(async () => {
    reInstance = await RewardEscrow.new();
    reInstance.setAgent(surveyProcessorContract);
  });

  describe("Reward Pool Functionalities", () => {
    it("should have an agent address set", async () => {
      let agent = reInstance.getAgent();
      assert.equal(
        agent,
        surveyProcessorContract,
        "Agent address is not set correctly."
      );
    });
  });
});
