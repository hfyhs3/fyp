import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { ethers } from "hardhat";
import { VOTING_DELAY, VOTING_PERIOD, QUORUM_PERCENTAGE } from "../hardhat-helper-config";

const deployGovernorContract: DeployFunction = async(
    hre: HardhatRuntimeEnvironment) => 
    {
        const{ getNamedAccounts, deployments, network } = hre;
        const { deployer} = await getNamedAccounts();
        const {deploy, log, get} = deployments;

        const governanceToken = await get("GovernanceToken");
        const timeLock = await get("TimeLock");

        const governorContract = await deploy("GovernorContract", {
            from: deployer,
            args: [
                governanceToken.address, 
                timeLock.address, 
                VOTING_DELAY, 
                VOTING_PERIOD, 
                QUORUM_PERCENTAGE ],
            log:true,
        });

        log("03-Governor Contract deployed");
    };

export default deployGovernorContract;
deployGovernorContract.tags = ['all', "governor"];