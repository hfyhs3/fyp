import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { ethers } from "hardhat";
import { ADDRESS_ZERO } from "../hardhat-helper-config";

const deployBox: DeployFunction = async(
    hre: HardhatRuntimeEnvironment) => 
    {
        const{ getNamedAccounts, deployments, network } = hre;
        const { deployer} = await getNamedAccounts();
        const {deploy, log, get} = deployments;

        log("deploying box contract");

        const box = await deploy("Box", {
            from: deployer,
            args: [deployer],
            log: true,
        });

        const timeLockDeployment = await get("TimeLock");

        const boxContract = await ethers.getContractAt("Box", box.address);
        const timeLock = await ethers.getContractAt("TimeLock", timeLockDeployment.address);

        const transferTx = await boxContract.transferOwnership(timeLock.address);
        await transferTx.wait(1);

        log("Ownership box is transferred to timelock");

        // const [deployer] = await ethers.getSigners();
        // const deployerAddress = await deployer.getAddress();
    }

export default deployBox;
deployBox.tags=["all", "box"];