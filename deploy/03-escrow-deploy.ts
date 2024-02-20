import { ethers } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/dist/types";

const deployEscrow: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    log("Deploying Escrow contract");
    const [ daoAccount, escrowAccount] = await ethers.getSigners();
    const daoAddress = daoAccount.address;
    const escAccount = escrowAccount.address;
    const initialOwner = deployer;

    const escrow = await deploy("Escrow", {
        from: deployer,
        args: [initialOwner, daoAddress, escAccount],
        log: true,
    });

    log(`Escrow Contract deployed at ${escrow.address}`);
};
        
export default deployEscrow;
deployEscrow.tags = ["all", "escrow"];
