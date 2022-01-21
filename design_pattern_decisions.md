## Design patterns used

### Inter-contract Execution

The ```SurveyProcessor``` is interacting with ```RewardEscrow``` contract to store ETH in the custody of RewardEscrow contract and holds information about the individual reward pool information belonging to each survey. ```SurveyProcessor``` manages the function calls to ```RewardEscrow```.

### Inheritance and Interfaces

The ```SurveyProcessor``` is inheriting from ```RewardEscrow``` contract, which is responsible for keeping Reward Pool information of each survey. Mappings <mark>surveyOwners</mark> and <mark>rewardPools</mark> are referenced by the ```SurveyProcessor``` contract and they are updated when new survey is registered.

### Access Control Design Patterns

There are custom access control implemented in ```SurveyProcessor``` and ```RewardEscrow``` contract. There are two user roles ```SurveyOwner``` and ```SurveyTaker``` and based on their roles, survey owner has the ability to register/delete survey, to withdraw excess rewards from escrow contract and to extract survey responses. Survey taker can answer surveys and redeem rewards.