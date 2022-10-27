
// scripts/create-box.js
const { hexStripZeros } = require("ethers/lib/utils");
const { ethers, upgrades, hardhatArguments } = require("hardhat");
const { Web3 } = require("web3");
const { inputFile } = require("hardhat/internal/core/params/argumentTypes");
// const { ethers } = require("ethers");
const Web3Token = require('web3-token');
const { InfuraProvider } = require("@ethersproject/providers");
require('dotenv').config();


async function claimConft(vaultId, opcode, signerIndex) {
    const assetVault = await getContractInstance(
        "AssetVaultV3Airdrop",
        process.env.IPLAND_ASSET_VAULT_BSC_TEST_ADDRESS,
        signerIndex
    );

    console.log(`Star sign asset, vaultId: ${vaultId}, opcode: ${opcode}`);
    await assetVault.signAsset(vaultId, opcode).then(async tx => {
        const receipt = await tx.wait();
        console.log("[starClaimNft] TxHash:", receipt.transactionHash);
        receipt.events.forEach(e => {
            if (e.event === 'LogSignAsset') {
                // console.log("event: ", e.args);
                console.log(`
                [starClaimNft] LogSignAsset: 
                    aId:       ${e.args.aId}
                    recipient: ${e.args.recipient}
                    account:   ${e.args.account}
                    nftAddrs:  ${e.args.nftAddrs}
                    tId:       ${e.args.tId}
                    opCode:    ${e.args.opCode}
                `);
            }
        })
    });
}

async function createOrder(assetAddress, tokenId, tokenAmount, assetType, price, paymentToken, signerIndex) {
    let orderId;
    const market = await getContractInstance(
        "IplandMarket",
        process.env.IPALND_MARKET_BSC_TEST_ADDRESS,
        signerIndex
    );
    /* appove nft to market  */

    const nft = await getContractInstance(
        "IplandNft",
        process.env.IPLAND_NFT_CONTRACT_BSC_TEST_ADDRESS,
        signerIndex
    );

    await nft.approve(
        process.env.IPALND_MARKET_BSC_TEST_ADDRESS,
        tokenId
    )

    await market.createOrder(
        assetAddress,
        tokenId,
        tokenAmount,
        assetType,
        price,
        paymentToken,
    ).then(async tx => {
        let receipt = await tx.wait();
        receipt.events.forEach(e => {
            if (e.event === 'LogCreateOrder') {
                console.log(`
            Create order => LogCreateOrder
            txHash:         ${receipt.transactionHash}
            market:         ${e.args.market}
            orderId:        ${e.args.orderId}
            nftAddr:        ${e.args.nftAddr}
            tokenId:        ${e.args.tokenId}
            tokenAmount:    ${e.args.tokenAmount}
            assetType:      ${e.args.assetType}
            seller:         ${e.args.seller}
            price:          ${e.args.price}
            paymentToken:   ${e.args.paymentToken}
            status:         ${e.args.status}
          `)
                orderId = e.args.orderId;
            }
        })

    });
    return orderId;
}

async function buyTheItem(orderId, signerIndex) {
    const market = await getContractInstance(
        "IplandMarket",
        process.env.IPALND_MARKET_BSC_TEST_ADDRESS,
        signerIndex
    );

    const info = await market.orderList(orderId);
    const price = info.price;
    console.log("PaymentToken: ", info.paymentToken);
    console.log("PaymentToken: ", info.price);


    if (info.paymentToken == process.env.ADDRESS_ONE) {
        await market.buyOne(orderId, { value: price }).then(async tx => {
            let receipt = await tx.wait();
            receipt.events.forEach(e => {
                if (e.event === 'LogBuyOne') {
                    console.log(`4. LogBuyOne : "
                    txHash          :${receipt.transactionHash}
                    orderId         :${e.args.orderId}
                    marketAddress   :${e.args.marketAddress}
                    Buyer           :${e.args.Buyer}
                    nftAddress      :${e.args.nftAddress}
                    tokenId         :${e.args.tokenId}
                    tokenAmount     :${e.args.tokenAmount}
                    assetType       :${e.args.assetType}
                `)
                }
            })
        });
        return;
    }


    /* approve Erc20 payment Token to market  */
    const erc20Token = await getContractInstance(
        "IpValueERC20",
        info.paymentToken,
        signerIndex
    );

    await erc20Token.approve(
        process.env.IPALND_MARKET_BSC_TEST_ADDRESS,
        info.price
    );

    await market.buyOne(orderId).then(async tx => {
        let receipt = await tx.wait();
        receipt.events.forEach(e => {
            if (e.event === 'LogBuyOne') {
                console.log(`4. LogBuyOne : "
                orderId         :${e.args.orderId}
                marketAddress   :${e.args.marketAddress}
                Buyer           :${e.args.Buyer}
                nftAddress      :${e.args.nftAddress}
                tokenId         :${e.args.tokenId}
                tokenAmount     :${e.args.tokenAmount}
                assetType       :${e.args.assetType}
          `)
            }
        })
    });

}

async function checkLoyalty(tokenAddr, twitterName, signerIndex) {
    const tokenVault = await getContractInstance(
        "IplandVaultV4",
        process.env.IPALND_TOKEN_VAULT_BSC_TEST_ADDRESS,
        signerIndex
    );

    const amount = await tokenVault.assetLoyalty(tokenAddr, twitterName)
    console.log(`${twitterName}'s loyalty amount = ${amount}`);
}

async function huntStarNft() {
    const provider = await getProvider();
    let ADMIN_WALLET = await new ethers.Wallet(IPLAND_ADMIN_PRIVATE_KEY, provider) // ipland admin
    const Contract = await ethers.getContractFactory("IplandVaultV4");

    /* 1. get IplandVault inst */
    console.log("[huntStarNft] get iplandValut instans ...");
    const tokenVaultAdmin = await Contract.attach(process.env.IPALND_TOKEN_VAULT_BSC_TEST_ADDRESS).connect(ADMIN_WALLET);
    // const iplandVault = await new ethers.Contract(
    //   IPLAND_TOKEN_VAULT_TEST_ADDRESS,
    //   tokenVaultAbi.abi,
    //   ADMIN_WALLET
    // )

    // console.log(
    //   "[huntStarNft] Token valut instance address: ",
    //   tokenVaultAdmin.address
    // );

    // console.log("[huntStarNft] Get pSiger from Contract: ", pSigner);
    // const pSigner = await tokenVaultAdmin.pSigner();
    // console.log("pSigner: ", pSigner);



    /* 2. call huntFor */
    const _name = "@z2m2020";
    const _tokenId = 7870
    const _amount = 1000
    const _order = 10000;
    const signature
        = "0xc4f6f2ca69f51a54476d7b778ea54b2990eaa3766b773f297e3e30636dbe4ea06ef2f344cbee799c7c826c28e2fddd404029fff43d4ef2eccc160261211c0e0f1c"
    await tokenVaultAdmin.huntForStar()
}

async function getContractInstance(constractName, contractAddr, signerIndex) {
    const signers = await ethers.getSigners();
    const signer = signers[signerIndex];
    console.log("Signer address: ", signer.address);


    const Contract = await ethers.getContractFactory(constractName);
    return await Contract.attach(contractAddr).connect(signer);
}


/* =====================  Market Test ========================== */
// const vaultId = 55;
// const opcode = 0;
// const signerIndex = 1;

// claimConft(
//     vaultId,
//     opcode,
//     signerIndex    
// )

// ==> Create Order
async function makeOrder(tokenId, fromIndex) {
    const assetAddress = process.env.IPLAND_NFT_CONTRACT_BSC_TEST_ADDRESS;
    const tokenAmount = 1;
    const assetType = '0x4e46543732310000000000000000000000000000000000000000000000000000';  //nft 721
    const price = ethers.utils.parseEther("0.005");
    const paymentToken = process.env.ADDRESS_ONE;
    // const paymentToken = process.env.IPLAND_IPV_TEST_BSC_TEST_ADDRESS; 
    const signerIndex = fromIndex;
    const orderId = await createOrder(
        assetAddress,
        tokenId,
        tokenAmount,
        assetType,
        price,
        paymentToken,
        signerIndex
    )
    return orderId;
}

async function trading() {
    // const orderId = await makeOrder(55, 0);
    let orderId = 19;

    await buy(orderId, 0)

    const tokenAddr = process.env.ADDRESS_ONE;
    const name = '@z2m2020';
    await checkLoyalty(tokenAddr, name, 0)

    orderId = await makeOrder(55, 0);
    await buy(orderId, 0)

    await checkLoyalty(tokenAddr, name, 1)
}



//  Create Order <=================

// ==> BuyTheOrder
async function buy(orderId, buyerIndex) {
    const ADMIN = 0;
    const TESTER01 = 1;
    await buyTheItem(orderId, buyerIndex)
}


/* ================================ */

// ==> Check loyalty

// const tokenAddr = process.env.ADDRESS_ONE;
// const name = '@z2m2020';
// checkLoyalty(tokenAddr, name, 0)
    /* ================================ */
// buy(16, 1)
trading()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
