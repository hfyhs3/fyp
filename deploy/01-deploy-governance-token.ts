import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { ethers } from "hardhat";


const deployGovernanceToken: DeployFunction = async(
    hre: HardhatRuntimeEnvironment) => 
    {
        const{ getNamedAccounts, deployments, network } = hre;
        const { deployer} = await getNamedAccounts();
        const {deploy, log} = deployments;

        log("Deploying Token");
        const governanceToken = await deploy("GovernanceToken", {
            from: deployer,
            args: [],
            log:true,
        });

        log('01- Deployed Class Token at ${governanceToken.address}');

        await delegate(governanceToken.address, deployer);
        log('02- delegated');
    }   

export default deployGovernanceToken;
deployGovernanceToken.tags = ['all', "governanceToken"];

const delegate = async(
    governanceTokenAddress: string,
     delegatedAccount: string,
    ) => {


    const governanceToken = await ethers.getContractAt(
        'GovernanceToken', 
        governanceTokenAddress,
        );

    const txResponse = await governanceToken.delegate(delegatedAccount);
    await txResponse.wait(1);
    
    const checkpoint = await governanceToken.numCheckpoints(delegatedAccount);
    console.log('Checkpoints: '+ checkpoint)
};