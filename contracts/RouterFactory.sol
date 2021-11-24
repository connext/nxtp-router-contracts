// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.4;

import "./interfaces/IRouterFactory.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@connext/nxtp-contracts/contracts/interfaces/ITransactionManager.sol";
import "./Router.sol";

contract RouterFactory is IRouterFactory, Ownable {

  ITransactionManager public transactionManager;

  constructor(address _transactionManager) {
    transactionManager = ITransactionManager(_transactionManager);
  }

  function setTransactionManager(address _transactionManager) external onlyOwner {
    transactionManager = ITransactionManager(_transactionManager);
  }

  function createRouter(address signer, address recipient) override external returns (address) {
    Router router = new Router(address(transactionManager), signer, recipient, msg.sender);
    emit RouterCreated(address(router));
    return address(router);
  }
}
