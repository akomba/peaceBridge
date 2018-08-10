var keccak = require('./keccak256');
const Web3 = require('web3');
const web3 = new Web3();
const leftPad = require('./leftpad.js');

// var rawTx = "0xf9018a0a840c8458808316e360943133937d864831996584b674f3ae6abe7f4137ed80b90124c00c98be000000000000000000000000000000000000000000000000000000000000004007b7f7a16f74bf26228c0b9bfe8c38c71ff87cb36feb8d38326e1e83ba417cab00000000000000000000000000000000000000000000000000000000000000acf8aa8202e4847735940082943d94d4b36aadb0d90a32dbc15537db6e3054c52a3f6280b844a9059cbb0000000000000000000000009498f180620977eb5a6c1c07b0c68c370bd2e534000000000000000000000000000000000000000000000004e1003b28d92800001ca037f9cf5f5c5fc632989a86935d32131df28e34e17225998919554281658c500ca02a035446286a8ce6e69342d7341d3077bc107849212ac3b1bfb576a8d1e2dc0000000000000000000000000000000000000000002aa0b9af520b4b81b4f2f7c87e22861fe325ac4ded570d4f6cdd1fe851cbd9a095e4a0216bdf4460102e3f153a7d6e4cdaa076fdfa34897fd5788203eec02077db68a3";
// var data = "0xc00c98be000000000000000000000000000000000000000000000000000000000000004007b7f7a16f74bf26228c0b9bfe8c38c71ff87cb36feb8d38326e1e83ba417cab00000000000000000000000000000000000000000000000000000000000000acf8aa8202e4847735940082943d94d4b36aadb0d90a32dbc15537db6e3054c52a3f6280b844a9059cbb0000000000000000000000009498f180620977eb5a6c1c07b0c68c370bd2e534000000000000000000000000000000000000000000000004e1003b28d92800001ca037f9cf5f5c5fc632989a86935d32131df28e34e17225998919554281658c500ca02a035446286a8ce6e69342d7341d3077bc107849212ac3b1bfb576a8d1e2dc000000000000000000000000000000000000000000";

// var testFunc = "parse(bytes,bytes32)";


// console.log(web3.utils.sha3(leftPad((rawTx).toString(16), 64, 0), { encoding: 'hex' }))
// // console.log(web3.utils.sha3(leftPad((testFunc).toString(16), 64, 0), { encoding: 'hex' }))
// console.log(web3.utils.sha3(testFunc));
// // console.log(byte32);

module.exports.funcSigFormer = (funcString) => {
  var bytes32 = web3.utils.sha3(funcString);
  //https://github.com/ethereum/wiki/wiki/Ethereum-Contract-ABI
  return bytes32.slice(0,10);
}

  /**
   * @dev Initiates a withdrawal process. Starts the challenge period 
   * Requires the msg sender to stake a payment (payable function)
   // TODO: check amount to stake, decern challenge time
   * @param _to address to send withdrawal 
   * @param _mintHash uint256 ID of token on TokenContract
   * @param _rawTxBundle bytes bundle that takes in concatination of bytes _withdrawalTx, bytes _lastTx, bytes _custodianTx
   * @param _txLengths lengths of transactions in rawTxBundle, used for efficiency purposes
   * @param _txMsgHashes msghashes of transactions in bundle
   + @param _declaredNonce depth of chain of custody from token contract. IMPORTANT TO BE HONEST
  */