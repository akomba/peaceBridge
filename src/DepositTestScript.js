//require dependencies
var ethers = require('ethers');
var infuraAPI = '9744d40b99e34a57850802d4c6433ab8';
var provider = new ethers.providers.InfuraProvider(network='rinkeby', apiAccessToken=infuraAPI);
var fs = require('fs');
var solc = require('solc');

var input = {
    language: "Solidity",
    sources: {
        'DepositContract_flat.sol': fs.readFileSync('./DepositContract_flat.sol','utf8')
    }
}

var output = solc.compile(input, 1)
const bytecode = output.contracts['DepositContract_flat.sol:DepositContract'].bytecode;
const abi = JSON.parse(output.contracts['DepositContract_flat.sol:DepositContract'].interface);

//specify Monitor's account
var privateKey = '0x13410a539b4fdb8dabde37ff8d687cc23eea64ab11eaf348a2fd775ba71a31cc';
var publicAddress = '0xC33Bdb8051D6d2002c0D80A1Dd23A1c9d9FC26E4';
var wallet = new ethers.Wallet(privateKey, provider);

// //specify TokenContract
// var tokenContractAddress = '0xF22999d07Bf99C75112C292AB1B399423Cb770ce';
// var jsonFile = '../Contracts/tokenContract.json';
// var parsed = JSON.parse(fs.readFileSync(jsonFile));
// //var abi = parsed.abi
// var bytecodeFile = '../Contracts/tokenContract.txt';
// var bytecode = fs.readFileSync(bytecodeFile, "utf-8");


var deployTransaction = ethers.Contract.getDeployTransaction("0x"+bytecode, abi, publicAddress)
deployTransaction.gasLimit = 3080000;

async function deployContract(_deployTransaction){
    var tx = await wallet.sendTransaction(_deployTransaction)
    var txHash = tx['hash']
    console.log(txHash)
}

async function getAddr(_txHash){
    var tx = await provider.getTransactionReceipt(_txHash)
    var addr = await tx['contractAddress']
    console.log(addr)
}

// var depositContractAddress = '0x24f1a771C1918132f02584222033334e56fD9f61'
// var depositContract = new ethers.Contract(depositContractAddress, abi, wallet);

//--------------------------------------------------------------------------------
//Interacting with DepositContract


async function getTransactionReceipt(transactionHash) {
    var transactionReceipt = await provider.getTransactionReceipt(transactionHash);
    console.log(transactionReceipt);
}

async function ownerOfCall(_tokenIDInt) {
    var result = await tokenContract.ownerOf(_tokenIDInt);
    console.log(result);
}

async function transferCall() {
    var result = await tokenContract.transferFromTokenContract(
        '0x754eC60c051dF8524F9775712f8e46f36293Da9d',
        '0xC33Bdb8051D6d2002c0D80A1Dd23A1c9d9FC26E4',
        '68420091402644995921492871103118945056506363385934839950840550634224801461946'
        );
    console.log(result);
}

//----------------------------------------------------------------------------------
//Testing functions

// deployContract(deployTransaction)
getAddr('0xebf71bc0b63d64e33fbceaf6998f924899b17bc36c7053a29e0a23cb723c6c41')


var transferMethodID = '0xb22781db7a1c1a87b86b7215e93e2ad8791bb8cc984291af99060086f14f0b4a';
var tokenIDHex = '0x9744663e9ce4a436cbd897d62862050ac115b19e8069f51b444cafc7b756b6ba';
var tokenIDInt = '68420091402644995921492871103118945056506363385934839950840550634224801461946';

// transferHistory('0x9744663e9ce4a436cbd897d62862050ac115b19e8069f51b444cafc7b756b6ba');
// ownerOfCall('56064289943568641797652870540193695909662562700408150778951987980509060591558')
// ownerOfCall(tokenIDInt);
// mintCall()
