pragma solidity ^0.4.24;

import "./SafeMath.sol";
import "./Ownable.sol";
import "./RLP.sol";
import "./BytesLib.sol";
import "./ERC721Basic.sol";
import "./ERC721BasicToken.sol";

contract TokenContract is ERC721BasicToken {
  using SafeMath for uint256;
  using RLP for RLP.RLPItem;
  using RLP for RLP.Iterator;
  using RLP for bytes;
  using BytesLib for bytes;

  string contractState = "preStaked";
  address depositContract;
  address custodian;
  address custodianETH;
  uint256 stakedAmount;
  uint256 mintCap;
  uint256 mintedAmount;
  mapping (bytes32 => uint8) public mintLog;
  mapping (bytes32 => uint8) public burnLog;

  constructor (address _custodian) {
    custodian = _custodian;
  }

  modifier onlyCustodian() {
    if (custodian == msg.sender) {
      _;
    }
  }

  modifier statePreStaked () {
    if (keccak256(contractState) == keccak256("preStaked"))  {
      _;
    }
  }

  modifier stateStaked () {
    if (keccak256(contractState) == keccak256("staked"))  {
      _;
    }
  }

  event Mint(uint256 amount, address indexed depositedTo, uint256 nonce, bytes32 mintHash);
  event Withdraw(uint256 tokenId);
  event TransferRequest(address indexed from, address indexed to, uint256 indexed _tokenId, bytes32 approvalHash);

  function setDepositContract(address _depositContract) onlyCustodian statePreStaked public {
    depositContract = _depositContract;
  }

  function finalizeStake () onlyCustodian statePreStaked public {
    stakedAmount = address(this).balance;
    mintCap = address(this).balance.div(2);

    contractState = "staked";
  }

  uint32 public mintNonce = 0;

  function mint(uint256 _value, address _to) public {
    //might have to log the value, to, Z details
    bytes memory value = uint256ToBytes(_value);
    bytes memory to = addressToBytes(_to);
    bytes memory Z = uint256ToBytes(mintNonce);
    bytes32 mintHash = keccak256(value.concat(to).concat(Z));
    mintLog[mintHash] = 1;
    _mint(_to, bytes32ToUint256(mintHash));
    emit Mint(_value, _to, mintNonce, mintHash);
    mintNonce += 1;
  }


  //USED TO ANNOUNCE A WITHDRAWL (DOESNT NECESSISTATE SUBMISSION)
  function withdraw(uint256 _tokenId) public {
    emit Withdraw(_tokenId);
  }


  /* ERC721 Related Functions --------------------------------------------------*/
  // Mapping from token ID to approved address
  mapping (bytes32 => address) public custodianApproval;
  
  /**
   * @dev Requests transfer of ownership of a given token ID to another address
   * Usage of this method is discouraged, use `safeTransferFrom` whenever possible
   * Requires the msg sender to be the owner, approved, or operator
   * @param _from current owner of the token
   * @param _to address to receive the ownership of the given token ID
   * @param _tokenId uint256 ID of the token to be transferred
   * @param _declaredNonce uint256 nonce, depth of transaction
  */
  function transferFrom(
    address _from,
    address _to,
    uint256 _tokenId,
    uint256 _declaredNonce
  )
    public
  {
    require(isApprovedOrOwner(msg.sender, _tokenId));
    require(_from != address(0));
    require(_to != address(0));
    //TODO: do we need to check if declared nonce constantly increases

    clearApproval(_from, _tokenId);
    //TODO: Double check if hash is secure, no chance of collision
    bytes32 approvalHash = keccak256(uint256ToBytes(_tokenId).concat(uint256ToBytes(_declaredNonce)));
    custodianApproval[approvalHash] = _to;
    emit TransferRequest(_from, _to, _tokenId, approvalHash);
  }

  function custodianApprove(uint256 _tokenId, uint256 _declaredNonce) onlyCustodian public {
    require(exists(_tokenId));
    bytes32 approvalHash = keccak256(uint256ToBytes(_tokenId).concat(uint256ToBytes(_declaredNonce)));
    address _to = custodianApproval[approvalHash];
    address _from = ownerOf(_tokenId);
    removeTokenFrom(_from, _tokenId);
    addTokenTo(_to, _tokenId);
    emit Transfer(_from, _to, _tokenId);
    clearCustodianApproval(approvalHash);
  }

  function revertTransfer(uint256 _tokenId, uint256 _declaredNonce) public {
    require(isApprovedOrOwner(msg.sender, _tokenId), "no approval/ not owner");
    clearCustodianApproval(keccak256(uint256ToBytes(_tokenId).concat(uint256ToBytes(_declaredNonce))));
  }


  /* View functions --------------------------------------------------*/
  function viewTransferRequest(bytes32 _approvalHash) public view returns(address) {
    return custodianApproval[_approvalHash];
  }

  /* Util functions --------------------------------------------------*/
  /**
   * @dev Internal function to clear current custodian approval of a given token ID
   * @param _approvalHash bytes32 ID of the token to be transferred
   */
  function clearCustodianApproval(bytes32 _approvalHash) internal {
    if (custodianApproval[_approvalHash] != address(0)) {
      custodianApproval[_approvalHash] = address(0);
    }
  }

  function bytesToBytes32(bytes b, uint offset) private pure returns (bytes32) {
    bytes32 out;
    for (uint i = 0; i < 32; i++) {
      out |= bytes32(b[offset + i] & 0xFF) >> (i * 8);
    }
    return out;
  }

  function stringToBytes( string s) internal returns (bytes memory b3){
    b3 = bytes(s);
    return b3;
  }

  // Nick Johnson https://ethereum.stackexchange.com/questions/4170/how-to-convert-a-uint-to-bytes-in-solidity
  function uint256ToBytes(uint256 x) internal returns (bytes b) {
    b = new bytes(32);
    assembly { mstore(add(b, 32), x) }
  }

  // Tjaden Hess https://ethereum.stackexchange.com/questions/884/how-to-convert-an-address-to-bytes-in-solidity
  function addressToBytes(address a) internal returns (bytes b) {
    assembly {
        let m := mload(0x40)
        mstore(add(m, 20), xor(0x140000000000000000000000000000000000000000, a))
        mstore(0x40, add(m, 52))
        b := m
    }
  }

  // https://ethereum.stackexchange.com/questions/6498/how-to-convert-a-uint256-type-integer-into-a-bytes32
  function bytes32ToUint256(bytes32 n) internal returns (uint256) {
    return uint256(n);
  }

}
