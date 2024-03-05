export const VOTING_DELAY = 1;
export const VOTING_PERIOD = 50400;
export const QUORUM_PERCENTAGE = 4;

export const MIN_DELAY = 3600; // For example, 1 hour delay
export const proposers: string[] = []; 
export const executors: string[] = [];

​export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";


export const campaignId = 1;
export const milestoneIndex = 1;
// testing purposes only
export const FUNC = "releaseMilestone";
export const FUNC_ARGS = [campaignId, milestoneIndex];
export const DESCRIPTON = `Release milestone ${milestoneIndex} for campaign ${campaignId}`;

export const developmentChains = ["hardhat", "localhost"];

export const PROPOSAL_FILE = "proposal.json";
