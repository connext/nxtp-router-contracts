import { DeployFunction } from "hardhat-deploy/types";

/**
 * Hardhat task defining the contract deployments for nxtp
 *
 * @param hre Hardhat environment to deploy to
 */
const func: DeployFunction = async ({
  getNamedAccounts,
  deployments,
  getUnnamedAccounts,
}): Promise<void> => {

  let deployer;
  ({ deployer } = await getNamedAccounts());
  if (!deployer) {
    [deployer] = await getUnnamedAccounts();
  }

  await deployments.deploy("RouterFactory", {
    from: deployer,
    args: [],
    log: true,
  });
};
export default func;
