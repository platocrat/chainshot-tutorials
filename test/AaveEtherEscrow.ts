/**
 * @dev Safely ignore these package errors:
 * `Cannot find module 'chai' or its corresponding type declarations.`
 * `Cannot find module 'hardhat' or its corresponding type declarations.`
 */
import { expect } from "chai"
import { ethers } from 'hardhat'

describe('AaveEtherEscrow', () => {
  let aaveEtherEscrow: any,
    aWETH: any,
    arbiter: any,
    beneficiary: any,
    depositor: any

  const deposit = ethers.utils.parseEther('1')
  const wethGatewayAddress = "0xDcD33426BA191383f1c9B431A342498fdac73488"

  before(async () => {
    const AaveEtherEscrow = await ethers.getContractFactory('AaveEtherEscrow');

    [depositor, arbiter, beneficiary] = await ethers.provider.listAccounts()

    aaveEtherEscrow = await AaveEtherEscrow.deploy(arbiter, beneficiary, {
      value: deposit
    })

    await aaveEtherEscrow.deployed()

    aWETH = await ethers.getContractAt(
      'IERC20', '0x030bA81f1c18d280636F32af80b9AAd02Cf0854e'
    )
  })

  it('should not have an ether balance', async () => {
    const balance = await ethers.provider.getBalance(aaveEtherEscrow.address)

    expect(balance.toString()).to.equal("0")
  })

  it("should have aWETH", async () => {
    const balance = await aWETH.balanceOf(aaveEtherEscrow.address)

    expect(balance.toString()).to.equal(deposit.toString())
  })

  describe('approving as the beneficiary', () => {
    it('should not be allowed', async () => {
      let ex: any

      try {
        const signer = await ethers.provider.getSigner(beneficiary)
        await aaveEtherEscrow.connect(signer).approve()
      } catch (_ex) {
        ex = _ex
      }

      expect(
        ex,
        "Expected the transaction to revert when the beneficiary calls approve!"
      )
    })
  })

  describe('after approving', () => {
    before(async () => {
      const thousandDays = 1000 * 24 * 60 * 60

      await hre.network.provider.request({
        method: "evm_increaseTime",
        params: [thousandDays]
      })

      const arbiterSigner = await ethers.provider.getSigner(arbiter)

      await aaveEtherEscrow.connect(arbiterSigner).approve()
    })

    it('should give the WETH gateway allowance to spend the initial deposit', async () => {
      const allowance = await aWETH.allowance(
        aaveEtherEscrow.address, wethGatewayAddress
      )

      expect(
        allowance.gte(deposit),
        "Expected an allowance on the WETH Gateway!"
      )
    })
  })
})