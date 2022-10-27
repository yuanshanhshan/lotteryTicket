const { expect } = require("chai");
const { ethers } = require("hardhat");
const helps = require("./helps");
const {
  balance,
  BN,
  ether,
  expectRevert,
  send,
  // eslint-disable-next-line @typescript-eslint/no-var-requires
} = require("@openzeppelin/test-helpers");

describe("Greeter", function () {


  beforeEach(async function () {
    const [owner, player1, platform] = await hre.ethers.getSigners();
    this.owner = owner;
    this.player1 = player1;
    this.platform = platform;
    // ========== step 1 deploy erc20 token ==========
    const ERC20Token = await ethers.getContractFactory("DaiToken");
    const erc20Token = await ERC20Token.deploy();
    await erc20Token.deployed();
    this.erc20Token = erc20Token;

    // mint for owner
    var amount = await ethers.utils.parseEther('1000')
    await this.erc20Token.mint(this.owner.address, amount)
    await this.erc20Token.mint(this.player1.address, amount)
    console.log(this.erc20Token.address)
    // ========== step 2 deploy math contract ==========
    // const Math = await ethers.getContractFactory("Math");
    // const math = await Math.deploy(this.lotteryTicket.address);
    // await math.deployed();
    // this.math = math;
    // console.log(this.math.address)

    // =========== step 4 set math address ===========

    // ========== step 2 deploy lotterTicket ==========
    const LotteryTicket = await ethers.getContractFactory("LotteryTicket");
    const lotteryTicket = await upgrades.deployProxy(
      LotteryTicket,
      [this.erc20Token.address]);
    await lotteryTicket.deployed();

    this.lotteryTicket = lotteryTicket;
    console.log(lotteryTicket.address)


    // ========== 2.1 set platform address ========= 
    this.lotteryTicket.setPlatform(this.platform.address);

  });

  it("lauchActivity to Claim Asset ", async function () {
    var price = await ethers.utils.parseEther('5')
    var start = await helps.getBlockTimestamp()
    // launch 1s activity

    await this.lotteryTicket.lauchActivity(
      start,
      1,
      price
    );
    await helps.mineBlocks(1)

    // launch 2s activity
    await expect(this.lotteryTicket.lauchActivity(
      start,
      1,
      price
    )).to.be.revertedWith("Exist an activity is running......");
    await helps.mineBlocks(1)


    var acInf = await this.lotteryTicket.activityMap(1)
    console.log(acInf)

    // ower buy ticket 
    console.log("user balance dai:", await this.erc20Token.balanceOf(this.owner.address))
    await this.erc20Token.approve(this.lotteryTicket.address, ethers.utils.parseEther('100'))
    await this.lotteryTicket.buyTicket(1, 4871, 20)
    var acInf = await this.lotteryTicket.activityMap(1)
    console.log("after user buy", acInf)
    // player1 buy tickey 2 times 
    await this.erc20Token.connect(this.player1).approve(this.lotteryTicket.address, ethers.utils.parseEther('1000'))
    await this.lotteryTicket.connect(this.player1).buyTicket(1, 4870, 20)
    var acInf = await this.lotteryTicket.connect(this.player1).activityMap(1)
    console.log("after user buy", acInf)

    await this.lotteryTicket.connect(this.player1).buyTicket(1, 4870, 20)
    var acInf = await this.lotteryTicket.connect(this.player1).activityMap(1)

    var play1Inf = await this.lotteryTicket.userMap(1, this.player1.address)

    console.log("playInf:", play1Inf)

    await helps.setBlockTime(start + 86400)
    await helps.mineBlocks(1)
    console.log("currentTime:", start, "//", await helps.getBlockTimestamp())

    // claim RandomNumber
    await this.lotteryTicket.claimRandom(1);
    var acInf = await this.lotteryTicket.activityMap(1)
    console.log(acInf)


    // activity end and contine buy ==> revert
    // player1 buy tickey
    // await this.erc20Token.connect(this.player1).approve(this.lotteryTicket.address, ethers.utils.parseEther('100'))
    // await this.lotteryTicket.connect(this.player1).buyTicket(1, 4870, 2)
    // var acInf = await this.lotteryTicket.connect(this.player1).activityMap(1)
    // console.log("after user buy", acInf)

    // user claim his asset
    await this.lotteryTicket.connect(this.player1).claimAsset(1)

    expect(await this.erc20Token.balanceOf(this.lotteryTicket.address)).to.equal(
      ethers.utils.parseEther('100')
    )
    expect((await this.erc20Token.balanceOf(this.player1.address)).sub(ethers.utils.parseEther('800'))).
      to.eq(
        ethers.utils.parseEther('160')
      )

    expect(await this.erc20Token.balanceOf(this.platform.address)).
      to.eq(
        ethers.utils.parseEther('40')
      )


    // get lucky code and winner address
    let luckyAndwinner = await this.lotteryTicket.getLuckyCodeAndWinner(1)
    expect(luckyAndwinner[0]).to.eq(4870)
    expect(luckyAndwinner[1]).to.eq(this.player1.address)



  });

});
