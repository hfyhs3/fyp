import { deployments, ethers, network } from "hardhat";
import { keccak256 } from "ethers/lib/utils";
import { DESCRIPTON, FUNC, FUNC_ARGS, MIN_DELAY, developmentChains } from "../hardhat-helper-config";
import { moveBlocks, moveTime } from "../helpers";

export async function queueAndExec(campaignId: number, milestoneIndex: number, proposalDescription: string) {

    const { get } = deployments;

    // const boxDeployment = await get("Box");
    // const boxAddress = boxDeployment.address;

    //  const box = await ethers.getContractAt("Box", boxAddress);

    const escrowDeploy = await get("Escrow");
    const escrowAddress = escrowDeploy.address;

    const escrow = await ethers.getContractAt("Escrow", escrowAddress);

    const encodedFunctionCall = escrow.interface.encodeFunctionData("releaseFundsToCampaign", [campaignId, milestoneIndex]);

    const descriptionHash = keccak256(ethers.utils.toUtf8Bytes(proposalDescription));

    const governorDeployment = await get("GovernorContract");
    const governorAddress = governorDeployment.address;

    const governor = await ethers.getContractAt("GovernorContract", governorAddress);

    const queueTx = await governor.queue(
        [escrowAddress],
        [0],
        [encodedFunctionCall],
        descriptionHash
    );

    await queueTx.wait(1);
    console.log("proposal in queue.");

    if(developmentChains.includes(network.name)){
        await moveTime(MIN_DELAY +1);
        await moveBlocks(1);
    }

    const executeTX = await governor.execute(
        [escrowAddress],
        [0],
        [encodedFunctionCall],
        descriptionHash
    );

    await executeTX.wait(1);

    console.log("executed.");

    console.log('box value is ' + await escrow.retrieve());

}

const campaignId = 1; 
const milestoneIndex = 0; 
const proposalDescription = "Release funds for milestone 1 of campaign 1"; // Match your proposal's description

queueAndExec(campaignId, milestoneIndex, proposalDescription).then(() => process.exit(0)).catch(err => {console.log(err), process.exit(1)});