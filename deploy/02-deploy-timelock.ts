import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { ethers } from "hardhat";
import { MIN_DELAY, proposers, executors } from "../hardhat-helper-config";

const deployTimeLock: DeployFunction = async(
    hre: HardhatRuntimeEnvironment) => 
    {
        const{ getNamedAccounts, deployments, network } = hre;
        const { deployer} = await getNamedAccounts();
        const {deploy, log} = deployments;

        const admin = deployer;

        log("deployinng timelock");
        const timelock = deploy("TimeLock", {
            from: deployer,
            args: [MIN_DELAY, proposers, executors, admin],
            log: true,
        });

        log("02- deployed "+ (await timelock).address)
    };

export default deployTimeLock;
deployTimeLock.tags = ['all', "timelock"];


