const hre = require("hardhat");
const fs = require("fs");

console.log(__dirname)

async function main () {
  const privateKey = fs
    .readFileSync('C:\\Users\\RaymondYuan\\workspace\\contract\\contract-demo\\.env')
    .toString()
    .trim();
  const owner = new ethers.Wallet(privateKey);
  this.owner = owner;
  // ========== step 1 deploy erc20 token ==========
  const ERC20Token = await ethers.getContractFactory("DaiToken");
  const erc20Token = await ERC20Token.deploy();
  await erc20Token.deployed();
  this.erc20Token = erc20Token;
  console.log("erc20:", this.erc20Token.address)
  // ========== step 2 deploy lotterTicket ==========
  const LotteryTicket = await ethers.getContractFactory("LotteryTicket");
  const lotteryTicket = await upgrades.deployProxy(
    LotteryTicket,
    [this.erc20Token.address]);
  await lotteryTicket.deployed();

  this.lotteryTicket = lotteryTicket;
  console.log("lotteryTicket:", lotteryTicket.address)


  // ========== 2.1 set platform address ========= 
  this.lotteryTicket.setPlatform(this.owner.address);

}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
