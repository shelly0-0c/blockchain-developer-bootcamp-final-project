let { constants, expectRevert, BN } = require("@openzeppelin/test-helpers");
const { web3 } = require("@openzeppelin/test-helpers/src/setup");

let SurveyProcessor = artifacts.require("SurveyProcessor");
let RewardEscrow = artifacts.require("RewardEscrow");

contract("SurveyProcessor", (accounts) => {
  // const [contractOwner, companyA, companyB, surveyTaker] = accounts;

  let spInstance;
  let reInstance;

  let contractOwner = accounts[0];
  let companyA = accounts[2];
  let companyB = accounts[3];
  let surveyTaker = accounts[4];

  beforeEach(async () => {
    reInstance = await RewardEscrow.new();
    spInstance = await SurveyProcessor.new(reInstance.address);
  });

  describe("parent contract dependency", () => {
    it("should have set Reward Escrow contract address", async () => {
      let escrowAddr = await spInstance.getEscrowAddress();
      assert.equal(reInstance.address, escrowAddr);
    });
  });

  describe("add new surveys", () => {
    let surveyId;
    let totalRewardsWei;
    let rewardWei;
    let closingDateUnix;

    let tx;

    beforeEach(async () => {
      reInstance = await RewardEscrow.new();
      spInstance = await SurveyProcessor.new(reInstance.address);

      surveyId = "13e484ae-6b21-11ec-90d6-0242ac120003";
      totalRewardsWei = "1000000000000000"; // 0.001 ETH
      rewardWei = "100000000000000"; // 0.0001 ETH
      closingDateUnix = "1643532271";

      tx = await spInstance.registerSurvey(
        surveyId,
        totalRewardsWei,
        rewardWei,
        closingDateUnix,
        { from: companyA, value: totalRewardsWei }
      );
    });

    it("should add survey, owned by survey creator to surveys mapping", async () => {
      let storedSurveyId = await spInstance.checkSurveyIdExists(
        surveyId,
        companyA
      );
      assert.equal(
        storedSurveyId,
        true,
        "surveys mapping is not updated successfully"
      );
    });

    it("should add RewardPoolInfo item for each survey ID to rewardPools mapping ", async () => {
      let storedOwnerAddress = await spInstance.getOwnerAddressOfSurvey(
        surveyId
      );

      assert.equal(
        storedOwnerAddress,
        companyA,
        "mismatched survey owner registered in rewardPoolInfo mapping"
      );

      let storedTotalRewards =
        await spInstance.getTotalDistributableRewardsOfSurvey(surveyId);

      assert.equal(
        storedTotalRewards,
        new BN(totalRewardsWei).toString(),
        "mismatched Total Rewards registered in rewardPoolInfo mapping"
      );

      let storedRewardPerResponse =
        await spInstance.getRewardPerResponseOfSurvey(surveyId);

      assert.equal(
        storedRewardPerResponse,
        new BN(rewardWei).toString(),
        "mismatched Reward per Response registered in rewardPoolInfo mapping"
      );
    });

    // it("should add all surveys for each address to surveyCreators mapping", async () => {
    //   const surveyId = "e91570ac-6b8f-11ec-90d6-0242ac120003";
    //   const totalRewardsWei = "20000000000000000"; // 0.02 ETH
    //   const rewardWei = "200000000000000"; // 0.0002 ETH
    //   const closingDateUnix = "1643752276";

    //   await spInstance.registerSurvey(
    //     surveyId,
    //     totalRewardsWei,
    //     rewardWei,
    //     closingDateUnix,
    //     { from: companyA, value: totalRewardsWei }
    //   );

    //   let storedSurveysByCreator = await spInstance.surveysOf(companyA);

    //   const expectedSurveys = [
    //     "13e484ae-6b21-11ec-90d6-0242ac120003",
    //     "e91570ac-6b8f-11ec-90d6-0242ac120003",
    //   ];

    //   expect(storedSurveysByCreator).to.have.members(expectedSurveys);
    // });

    it("should have reward in ETH deposited to Reward Escrow contract", async () => {
      let rewardEscrowBalanceAfter = await web3.eth.getBalance(
        reInstance.address
      );
      assert.equal(
        new BN(rewardEscrowBalanceAfter).toString(),
        new BN(totalRewardsWei).toString(),
        "Reward Escrow's balance should be increased by totalRewardsWei when new survey is registered"
      );

      const newSurveyId = "e91570ac-6b8f-11ec-90d6-0242ac120003";
      const newTotalRewardsWei = "20000000000000000"; // 0.02 ETH
      const newRewardWei = "200000000000000"; // 0.0002 ETH
      const newClosingDateUnix = "1643752276";

      await spInstance.registerSurvey(
        newSurveyId,
        newTotalRewardsWei,
        newRewardWei,
        newClosingDateUnix,
        { from: companyB, value: newTotalRewardsWei }
      );

      let rewardEscrowBalanceCombinedAfter = await web3.eth.getBalance(
        reInstance.address
      );

      assert.equal(
        new BN(rewardEscrowBalanceCombinedAfter).toString(),
        new BN(totalRewardsWei).add(new BN(newTotalRewardsWei)).toString(), // 0.021 ETH
        "Reward Escrow's balance should be increased by combined totalRewardsWei when multiple new surveys are registered"
      );
    });

    it("should emit following Log events if successful ", async () => {
      let firstEventEmitted = false;
      let secondEventEmitted = false;
      let thirdEventEmitted = false;

      if (tx.logs[0].event == "LogRewardPoolInfoSet") {
        firstEventEmitted = true;
      }

      assert.equal(
        firstEventEmitted,
        true,
        "adding a survey should emit LogRewardPoolInfoSet"
      );

      if (tx.logs[1].event == "LogRewardTransferToEscrow") {
        secondEventEmitted = true;
      }

      assert.equal(
        secondEventEmitted,
        true,
        "adding a survey should emit LogRewardTransferToEscrow"
      );

      if (tx.logs[2].event == "LogSurveyRegistered") {
        thirdEventEmitted = true;
      }

      assert.equal(
        thirdEventEmitted,
        true,
        "adding a survey should emit LogSurveyRegistered"
      );
    });

    it("should revert when survey owner does not paid enough when adding survey ", async () => {
      let newSurveyId = "c85daff4-6c62-11ec-90d6-0242ac120003";
      let newTotalRewardsWei = "200000000000000000"; // 0.2 ETH
      let newRewardWei = "500000000000000"; // 0.0005 ETH
      let newClosingDateUnix = "1643752276";

      await expectRevert(
        spInstance.registerSurvey(
          newSurveyId,
          newTotalRewardsWei, // 200 ETH
          newRewardWei,
          newClosingDateUnix,
          { from: companyB, value: "100000000000000000" } // 0.1 ETH
        ),
        "Not Paid Enough."
      );
    });
  });

  // TODO:

  describe("respond to new survey", () => {
    it("should record deductable amount from reward pool for each survey answer", async () => {});

    it("should record address who took the survey", async () => {});

    it("should not allow survey owner to take own survey", async () => {});

    it("should emit a Log", async () => {});
  });

  //   describe("same survey taker respond again to same survey", () => {
  //     it("should error that", async () => {});

  //     it("should revert ", async () => {});

  //     it("should emit a Log", async () => {});
  //   });

  describe("when survey is closed", () => {
    it("should only allow the owner who created the survey to withdraw remaining credits from reward escrow", async () => {});

    it("should remove survey from surveys mapping", async () => {});

    it("should remove survey from surveyOwners mapping", async () => {});

    it("should remove survey from rewardPools mapping", async () => {});

    it("should refund back the remaining amount from reward pool to survey owner after deductibles", async () => {});

    it("should emit a Log", async () => {});
  });

  //   describe("survey taker removes survey", () => {
  //     it("should error that the caller does not have the permission", async () => {});

  //     it("should revert ", async () => {});

  //     it("should emit a Log", async () => {});
  //   });
});
