// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.4;

// import "";
import "./interfaces/IRouter.sol";
import "./interfaces/ITransactionManager.sol";

contract Router is IRouter, Ownable {

  ITransactionManager public immutable transactionManager;

  address public recipient;

  constructor(address _transactionManager, address _recipient, address _owner) {
    transactionManager = TransactionManager(_transactionManager);
    recipient = _recipient;
    setOwner(_owner);
  }

  function setRecipient(address _recipient) external onlyOwner {
    recipient = _recipient;
  }

  function addLiquidity(uint256 amount, address assetId) external payable {
    return transactionManager.addLiquidity{ value: LibAsset.isNativeAsset(assetId ? value : 0) }(amount, assetId);
  }

  function removeLiquidity(uint256 amount, address assetId) external {
    return transactionManager.removeLiquidity(amount, assetId, recipient);
  }

  function prepare(PrepareArgs calldata args) external returns (TransactionData memory) {
    return transactionManager.prepare(args);
  }

  function fulfill(FulfillArgs calldata args) external returns (TransactionData memory) {
    return transactionManager.fulfill(args);
  }

  function cancel(CancelArgs calldata args) external returns (TransactionData memory) {
    return transactionManager.cancel(args);
  }
}