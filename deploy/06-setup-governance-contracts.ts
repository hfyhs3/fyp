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
        const escrowDeployment = await get("Escrow");

        const governanceToken = await ethers.getContractAt("GovernanceToken", governanceTokenDeployment.address);
        const timeLock = await ethers.getContractAt("TimeLock", timeLockDeployment.address);
        const governor = await ethers.getContractAt("GovernorContract", governorDeployment.address);
        const escrow = await ethers.getContractAt("Escrow", escrowDeployment.address);

        log("setting up Escrow contract");

        const setDAOAddressTx = await escrow.setDAOAddress(governor.address);
        await setDAOAddressTx.wait(1);
        log(`DAO address set on Escrow contract: ${governor.address}`);

        log("setting up governance rules");
        const proposerRole = await timeLock.PROPOSER_ROLE();
        const executorRole = await timeLock.EXECUTOR_ROLE();
        const adminRole = await timeLock.TIMELOCK_ADMIN_ROLE();

        log("granting roles");

        const adminRoleTx = await timeLock.grantRole(adminRole, deployerAddress);
        await adminRoleTx.wait(1);

        log("granting proposer role to governor");

        const proposerTx = await timeLock.grantRole(proposerRole, governor.address);
        await proposerTx.wait(1);

        log("granting executor role to address zero");

        const executorTx = await timeLock.grantRole(executorRole, ADDRESS_ZERO);
        await executorTx.wait(1);

        // log("transferring admin role to address zero");

        // const  transferAdminRole = await timeLock.grantRole(adminRole, ADDRESS_ZERO);
        // await transferAdminRole.wait(1);

        log("revoking deployer's admin role");
    
        const revokeTx = await timeLock.revokeRole(adminRole, deployerAddress);
        await revokeTx.wait(1);

        log("04- Roles setup");

    };

export default setupGovernorContract;
setupGovernorContract.tags = ["all", "setup"];