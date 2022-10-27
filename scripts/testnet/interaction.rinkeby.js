const { time, timeStamp } = require("console");
const ethers = require("ethers");
const fs = require("fs");
const { waitForDebugger } = require("inspector");
const { mainModule } = require("process");
const rbProvider = new ethers.providers.JsonRpcProvider(
  "https://rpc.ankr.com/eth_rinkeby",
  { name: "rinkeby", chainId: 4, gasLimit: 2100000 }
);


const addrs = JSON.parse(fs.readFileSync("C:\\Users\\RaymondYuan\\workspace\\contract\\contract-demo\\scripts\\testnet\\address.json").toString().trim());
const privateKey = fs
  .readFileSync("C:\\Users\\RaymondYuan\\workspace\\contract\\contract-demo\\.env")
  .toString()
  .trim();

const wallet = new ethers.Wallet(privateKey, rbProvider);
const basePath =
  "C:\\Users\\RaymondYuan\\workspace\\contract\\contract-demo\\artifacts\\contracts\\";
const erc20Path = basePath + "mock\\DaiToken.json";
const lotteryTicketPath = basePath + "LotteryTicket.sol\\LotteryTicket.json";

console.log("address:", addrs)
const erc20Address = addrs.erc20;
const lotterTicketAddress = addrs.lotteryTicket;

async function getABI (_path) {
  let d = fs.readFileSync(_path, { encoding: "utf8", flag: "r" });
  return JSON.parse(d);
}

async function initOp () {
  let ltAbi = await getABI(lotteryTicketPath)
  let ltSigner = new ethers.Contract(lotterTicketAddress, ltAbi.abi, wallet)
  await ltSigner.setPlatform(wallet.address);
}
async function main () {
  let ltAbi = await getABI(lotteryTicketPath)
  let ltSigner = new ethers.Contract(lotterTicketAddress, ltAbi.abi, wallet)

  var fee = await ltSigner.fee()
  console.log("fee:", fee)
  // other operation input here

  var platform = await ltSigner.platform()
  console.log("platform:", platform)
}
initOp()
main()