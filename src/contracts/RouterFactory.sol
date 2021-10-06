// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.9;

import "./interfaces/IRouterFactory.sol";
import "./Router.sol";

contract RouterFactory is IRouterFactory {

  TransactionManager public immutable transactionManager;

  constructor(address _transactionManager) {
    transactionManager = TransactionManager(_transactionManager);
  }

  function createRouter(address recipient) external returns (address) {
    Router router = new Router(transactionManager, recipient, msg.sender);
    emit RouterCreated(address(router));
    return router;
  }

  function createRouterAndAddLiquidity(address recipient, address assetId, uint256 amount) external payable returns (address) {
    router = createRouter(recipient);
    router.addLiquidity{value: LibAsset.isNative(assetId) ? amount : 0 }(
      assetId,
      amount
    );
  }
}
