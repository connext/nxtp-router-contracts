// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.4;

import "./interfaces/ITransactionManager.sol";
import "./lib/LibAsset.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Router is Ownable {

  ITransactionManager public immutable transactionManager;

  address public recipient;

  constructor(address _transactionManager, address _recipient, address _owner) {
    transactionManager = ITransactionManager(_transactionManager);
    recipient = _recipient;
    transferOwnership(_owner);
  }

  function setRecipient(address _recipient) external onlyOwner {
    recipient = _recipient;
  }

  function addLiquidity(uint256 amount, address assetId) external payable {
    return transactionManager.addLiquidity{ value: LibAsset.isNativeAsset(assetId) ? msg.value : 0 }(amount, assetId);
  }

  function removeLiquidity(uint256 amount, address assetId) external {
    return transactionManager.removeLiquidity(amount, assetId, payable(recipient));
  }

  function prepare(ITransactionManager.PrepareArgs calldata args) payable external returns (ITransactionManager.TransactionData memory) {
    return transactionManager.prepare{ value: LibAsset.isNativeAsset(args.invariantData.sendingAssetId) ? msg.value : 0 }(args);
  }

  function fulfill(ITransactionManager.FulfillArgs calldata args) external returns (ITransactionManager.TransactionData memory) {
    return transactionManager.fulfill(args);
  }

  function cancel(ITransactionManager.CancelArgs calldata args) external returns (ITransactionManager.TransactionData memory) {
    return transactionManager.cancel(args);
  }
}