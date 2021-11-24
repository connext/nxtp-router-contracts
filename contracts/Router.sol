// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.4;

import "@connext/nxtp-contracts/contracts/interfaces/ITransactionManager.sol";
import "@connext/nxtp-contracts/contracts/lib/LibAsset.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract Router is Ownable {

  ITransactionManager public immutable transactionManager;

  address public recipient;

  address immutable public signer;

  struct SignedLiquidityData {
    uint256 amount;
    address assetId;// For domain separation
  }

  constructor(address _transactionManager, address _signer, address _recipient, address _owner) {
    transactionManager = ITransactionManager(_transactionManager);
    signer = _signer;
    recipient = _recipient;
    transferOwnership(_owner);
  }

  function setRecipient(address _recipient) external onlyOwner {
    recipient = _recipient;
  }

  function addLiquidity(uint256 amount, address assetId) external payable {
    SignedLiquidityData memory payload = SignedLiquidityData({
      amount: amount,
      assetId: assetId
    });
    address recovered = recoverSignature(abi.encode(payload), signature);
    require(recovered == signer, "Signature is not valid");

    return transactionManager.addLiquidity{ value: LibAsset.isNativeAsset(assetId) ? msg.value : 0 }(amount, assetId);
  }

  function removeLiquidity(uint256 amount, address assetId) external {
    SignedLiquidityData memory payload = SignedLiquidityData({
      amount: amount,
      assetId: assetId
    });
    address recovered = recoverSignature(abi.encode(payload), signature);
    require(recovered == signer, "Signature is not valid");

    return transactionManager.removeLiquidity(amount, assetId, payable(recipient));
  }

  function prepare(ITransactionManager.PrepareArgs calldata args) payable external returns (ITransactionManager.TransactionData memory) {
    ITransactionManager.PrepareArgs memory payload = ITransactionManager.PrepareArgs(args);
    address recovered = recoverSignature(abi.encode(payload), signature);
    require(recovered == signer, "Signature is not valid");

    return transactionManager.prepare{ value: LibAsset.isNativeAsset(args.invariantData.sendingAssetId) ? msg.value : 0 }(args);
  }

  function fulfill(ITransactionManager.FulfillArgs calldata args) external returns (ITransactionManager.TransactionData memory) {
    ITransactionManager.FulfillArgs memory payload = ITransactionManager.FulfillArgs(args);
    address recovered = recoverSignature(abi.encode(payload), signature);
    require(recovered == signer, "Signature is not valid");

    return transactionManager.fulfill(args);
  }

  function cancel(ITransactionManager.CancelArgs calldata args) external returns (ITransactionManager.TransactionData memory) {
    ITransactionManager.CancelArgs memory payload = ITransactionManager.CancelArgs(args);
    address recovered = recoverSignature(abi.encode(payload), signature);
    require(recovered == signer, "Signature is not valid");

    return transactionManager.cancel(args);
  }

  /**
    * @notice Holds the logic to recover the signer from an encoded payload.
    *         Will hash and convert to an eth signed message.
    * @param encodedPayload The payload that was signed
    * @param signature The signature you are recovering the signer from
    */
  function recoverSignature(bytes memory encodedPayload, bytes calldata  signature) internal pure returns (address) {
    // Recover
    return ECDSA.recover(
      ECDSA.toEthSignedMessageHash(keccak256(encodedPayload)),
      signature
    );
  }
}