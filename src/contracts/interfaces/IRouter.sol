// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.9;

interface IRouter {
    // TODO: Import from published nxtp-contracts package
    struct InvariantTransactionData {
        address receivingChainTxManagerAddress;
        address user;
        address router;
        address initiator;
        address sendingAssetId;
        address receivingAssetId;
        address sendingChainFallback;
        address receivingAddress;
        address callTo;
        uint256 sendingChainId;
        uint256 receivingChainId;
        bytes32 callDataHash;
        bytes32 transactionId;
    }
    struct TransactionData {
        address receivingChainTxManagerAddress;
        address user;
        address router;
        address initiator;
        address sendingAssetId;
        address receivingAssetId;
        address sendingChainFallback;
        address receivingAddress;
        address callTo;
        bytes32 callDataHash;
        bytes32 transactionId;
        uint256 sendingChainId;
        uint256 receivingChainId;
        uint256 amount;
        uint256 expiry;
        uint256 preparedBlockNumber;
    }

    struct PrepareArgs {
        InvariantTransactionData invariantData;
        uint256 amount;
        uint256 expiry;
        bytes encryptedCallData;
        bytes encodedBid;
        bytes bidSignature;
        bytes encodedMeta;
    }

    struct FulfillArgs {
        TransactionData txData;
        uint256 relayerFee;
        bytes signature;
        bytes callData;
        bytes encodedMeta;
    }

    struct CancelArgs {
        TransactionData txData;
        bytes signature;
        bytes encodedMeta;
    }

    // Liquidity management functions
    function addLiquidity(uint256 amount, address assetId) external payable;

    function removeLiquidity(uint256 amount, address assetId) external;

    function setRecipient(address recipient) external;

    // Transaction lifecycle functions
    function prepare(PrepareArgs calldata args)
        external
        payable
        returns (TransactionData memory);

    function fulfill(FulfillArgs calldata args)
        external
        returns (TransactionData memory);

    function cancel(CancelArgs calldata args)
        external
        returns (TransactionData memory);
}
