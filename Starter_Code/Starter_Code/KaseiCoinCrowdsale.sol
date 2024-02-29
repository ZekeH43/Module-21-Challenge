pragma solidity ^0.5.5;

//  Import the following contracts from the OpenZeppelin library:
//    * `ERC20`
//    * `ERC20Detailed`
//    * `ERC20Mintable`
import "./KaseiCoin.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v2.5.0/contracts/crowdsale/Crowdsale.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v2.5.0/contracts/crowdsale/emission/MintedCrowdsale.sol";

// Create a constructor for the KaseiCoin contract and have the contract inherit the libraries that you imported from OpenZeppelin.
contract KaseiCoinCrowdsale is Crowdsale, MintedCrowdsale {
    constructor(
        uint256 rate,
        address payable wallet,
        KaseiCoin token

    ) public Crowdsale(rate, wallet, token) {}
}

contract KaseiCoinCrowdsaleDeployer {
    address public kasei_token_address;
    address public kasei_crowdsale_address;
    constructor(
        string memory name,
        string memory symbol,
        address payable wallet
    ) public {
        KaseiCoin token = new KaseiCoin(name, symbol, 0);
        kasei_token_address = address(token);
        KaseiCoinCrowdsale kasei_crowdsale = new KaseiCoinCrowdsale(1, wallet, token);
        kasei_crowdsale_address = address(kasei_crowdsale);
        token.addMinter(kasei_crowdsale_address);
        token.renounceMinter();
    }
}