// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.4;

import "./interfaces/IRouterFactory.sol";
import "@connext/nxtp-contracts/contracts/interfaces/ITransactionManager.sol";
import "./Router.sol";

contract RouterFactory is IRouterFactory {

  ITransactionManager public transactionManager;

  constructor() {}

  function init(address _transactionManager) public {
    transactionManager = ITransactionManager(_transactionManager);
  }

  function createRouter(address signer, address recipient) override external returns (address) {
    Router router = new Router(address(transactionManager), signer, recipient, msg.sender);
    emit RouterCreated(address(router));
    return address(router);
  }

  function createRouterAndAddLiquidity(address signer, address recipient, address assetId, uint256 amount, bytes calldata signature) external payable returns (address) {
    Router router = Router(this.createRouter(signer, recipient));
    router.addLiquidity{value: LibAsset.isNativeAsset(assetId) ? amount : 0 }(
      amount,
      assetId,
      signature
    );
    return address(router);
  }
}
