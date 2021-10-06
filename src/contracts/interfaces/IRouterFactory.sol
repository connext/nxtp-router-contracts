// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.9;

interface IRouterFactory {
  event RouterCreated(address router);

  function createRouter(address recipient) external returns (address);
}
