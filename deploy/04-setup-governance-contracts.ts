import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { ethers } from "hardhat";
import { ADDRESS_ZERO } from "../hardhat-helper-config";

const setupGovernorContract: DeployFunction = async(
    hre: HardhatRuntimeEnvironment) => 
    {
        const{ getNamedAccounts, deployments, network } = hre;
        // const { deployer} = await getNamedAccounts();
        const {log, get} = deployments;

        const [deployer] = await ethers.getSigners();
        const deployerAddress = await deployer.getAddress();

        const governanceTokenDeployment = await get("GovernanceToken");
        const timeLockDeployment = await get("TimeLock");
        const governorDeployment = await get("GovernorContract");

        const governanceToken = await ethers.getContractAt("GovernanceToken", governanceTokenDeployment.address, deployer);
        const timeLock = await ethers.getContractAt("TimeLock", timeLockDeployment.address, deployer);
        const governor = await ethers.getContractAt("GovernorContract", governorDeployment.address, deployer);

        log("setting up governance rules");
        const proposerRole = await timeLock.PROPOSER_ROLE();
        const executorRole = await timeLock.EXECUTOR_ROLE();
        const adminRole = await timeLock.DEFAULT_ADMIN_ROLE();

        log("granting roles");

        const proposerTx = await timeLock.grantRole(proposerRole, governor.address);
        await proposerTx.wait(1);
        
        const executorTx = await timeLock.grantRole(executorRole, ADDRESS_ZERO);
        await executorTx.wait(1);
    
        const revokeTx = await timeLock.revokeRole(adminRole, deployerAddress);
        await revokeTx.wait(1);

        log("04- Roles setup");

    };

export default setupGovernorContract;
setupGovernorContract.tags = ["all", "setup"];