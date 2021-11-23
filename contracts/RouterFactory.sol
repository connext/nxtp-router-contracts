// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.4;

import "./interfaces/IRouterFactory.sol";
import "@connext/nxtp-contracts/contracts/interfaces/ITransactionManager.sol";
import "./Router.sol";

contract RouterFactory is IRouterFactory {

  ITransactionManager public immutable transactionManager;

  constructor(address _transactionManager) {
    transactionManager = ITransactionManager(_transactionManager);
  }

  function createRouter(address recipient) override external returns (address) {
    Router router = new Router(address(transactionManager), recipient, msg.sender);
    emit RouterCreated(address(router));
    return address(router);
  }

  function createRouterAndAddLiquidity(address recipient, address assetId, uint256 amount) external payable returns (address) {
    Router router = Router(this.createRouter(recipient));
    router.addLiquidity{value: LibAsset.isNativeAsset(assetId) ? amount : 0 }(
      amount,
      assetId
    );
    return address(router);
  }
}
