import { expect } from 'chai'
import { ethers } from 'hardhat'
import getDai from './getDai'
import poolABI from './abi.json'

describe('AaveCollateralGroup', () => {
  const daiAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
  const depositAmount = ethers.utils.parseEther("10000")

  let contract: any,
    members: any,
    dai: any

  before(async () => {
    dai = await ethers.getContractAt("IERC20", daiAddress)

    const accounts = await ethers.provider.listAccounts()
    const deployer = accounts[0]

    members = accounts.slice(1, 4)

    await getDai(dai, members)

    const groupAddress = ethers.utils.getContractAddress({
      from: deployer,
      nonce: (await ethers.provider.getTransactionCount(deployer))
    })

    for (let i = 0; i < members.length; i++) {
      const signer = await ethers.provider.getSigner(members[i])

      await dai.connect(signer).approve(groupAddress, depositAmount)
    }

    const AaveCollateralGroup = await ethers.getContractFactory("AaveCollateralGroup")

    contract = await AaveCollateralGroup.deploy(members)

    await contract.deployed()
  })

  describe('after deployment', () => {
    it('should have dai in the smart contract', async () => {
      const balance = await dai.balanceOf(contract.address)

      expect(balance.eq(depositAmount.mul(members.length)))
    })
  })
})