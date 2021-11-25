// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.4;

import "@connext/nxtp-contracts/contracts/interfaces/ITransactionManager.sol";
import "@connext/nxtp-contracts/contracts/lib/LibAsset.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract Router is Ownable {

  ITransactionManager public immutable transactionManager;

  address public recipient;

  address public signer;

  uint256 private immutable chainId;

  struct SignedRemoveLiquidityData {
    uint256 amount;
    address assetId;
    uint256 chainId; // For domain separation
    address signer; // For domain separation
  }

  constructor(address _transactionManager, address _signer, address _recipient, address _owner, uint256 _chainId) {
    transactionManager = ITransactionManager(_transactionManager);
    signer = _signer;
    recipient = _recipient;
    chainId = _chainId;
    transferOwnership(_owner);
  }

  function setRecipient(address _recipient) external onlyOwner {
    recipient = _recipient;
  }

  function setSigner(address _signer) external onlyOwner {
    signer = _signer;
  }

  function removeLiquidity(uint256 amount, address assetId, bytes calldata signature) external {
    if (msg.sender != signer) {
      SignedRemoveLiquidityData memory payload = SignedRemoveLiquidityData({
        amount: amount,
        assetId: assetId,
        chainId: chainId,
        signer: signer
      });
      address recovered = recoverSignature(abi.encode(payload), signature);
      require(recovered == signer, "Router signature is not valid");
    }

    return transactionManager.removeLiquidity(amount, assetId, payable(recipient));
  }

  function prepare(
    ITransactionManager.PrepareArgs calldata args, 
    bytes calldata signature
  ) payable external returns (ITransactionManager.TransactionData memory) {
    if (msg.sender != signer) {
      address recovered = recoverSignature(abi.encode(args), signature);
      require(recovered == signer, "Router signature is not valid");
    }

    return transactionManager.prepare{ value: LibAsset.isNativeAsset(args.invariantData.sendingAssetId) ? msg.value : 0 }(args);
  }

  function fulfill(
    ITransactionManager.FulfillArgs calldata args, 
    bytes calldata signature
  ) external returns (ITransactionManager.TransactionData memory) {
    if (msg.sender != signer) {
      address recovered = recoverSignature(abi.encode(args), signature);
      require(recovered == signer, "Router signature is not valid");
    }

    return transactionManager.fulfill(args);
  }

  function cancel(
    ITransactionManager.CancelArgs calldata args, 
    bytes calldata signature
  ) external returns (ITransactionManager.TransactionData memory) {
    if (msg.sender != signer) {
      address recovered = recoverSignature(abi.encode(args), signature);
      require(recovered == signer, "Router signature is not valid");
    }

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