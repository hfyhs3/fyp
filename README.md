This project is completely based on simple terminal run. Here's the way to run it correctly:

1. Open the terminal in VSCode and split the terminal into two.

2. In the first terminal, enter: `yarn hardhat node` and wait for the deploy scripts to successfuly run. It is important to run this before starting with the other scripts to deploy the contracts.
 
3. In the second terminal, enter: `yarn hardhat run scripts/propose.ts --network localhost` if you wish to create a campaign.
    The state of the proposal should change from PENDING to ACTIVE. 

NOTE: All the below scripts should be run in the second terminal.

4. Then, run: `yarn hardhat run scripts/vote.ts --network localhost`. This process is lengthy and will take time to finish (120-127 seconds).
     The state of the proposal should change from 1 (ACTIVE) to 4 (SUCCEEDED).

5. Now to simulate the donor side interaction, run `yarn hardhat run scripts/UserLogin.js --network localhost`. Take note, this is to simulate a very basic front-end and is more focused on how the DAO-Escrow should be working together. The session is logged in (eg. If youve logged in with userid '1', then the id will remain '1' and all the transactions are done from there).

6. Once user is logged in, run: `yarn hardhat run scripts/Category.js --network localhost`. This is where the user selects which campaign they wish to donate and how they would like it distributed.

7. OPTIONAL: The user can run: `yarn hardhat run scripts/ViewMilestone.js --network localhost` to check the milestone status of the campaign and also request for a refund if the campaign takes too long for the milestone to be completed.

8. Back to the campaign interaction: enter `yarn hardhat run scripts/serviceProviders.ts --network localhost`. Answer the questions accordingly to run it. This should be run 3 times to complete all the 3 milestones. The type of service request required should be written in lowercase i.e 'education' and the materials required should be named in propercase i.e. 'Books'. 


Scenario's to test:

1. Campaign requires 9 ETH per campaign where 20% of the donation amount will be released when serviceProviders script is run. This script will then end until the campaign requests service once again (user has to run the script again). 

2. If the spent amount is equal to milestone amount then only the money will be released. 

3. The campaign should be well funded to proceed otherwise the script will end with a message.

4. User can donate to multiple campaigns by selecting campaignId from the list provided i.e: 1, 2. 
 
