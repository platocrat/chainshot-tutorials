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

  before(async () => {
    const AaveEtherEscrow = await ethers.getContractFactory('AaveEtherEscrow');

    [depositor, arbiter, beneficiary] = await ethers.provider.listAccounts()

    aaveEtherEscrow = await AaveEtherEscrow.deploy(arbiter, beneficiary, {
      value: deposit
    })

    // await aaveEtherEscrow.deployed()

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
})