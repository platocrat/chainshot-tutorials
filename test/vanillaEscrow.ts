/**
 * @dev Safely ignore these package errors:
 * `Cannot find module 'chai' or its corresponding type declarations.`
 * `Cannot find module 'hardhat' or its corresponding type declarations.`
 */
import { expect } from "chai"
import { ethers } from 'hardhat'

describe('Contract', function () {
  let contract: any,
    arbiter: any,
    beneficiary: any,
    depositor: any

  const deposit = ethers.utils.parseEther("1")

  beforeEach(async () => {
    [depositor, arbiter, beneficiary] = await ethers.provider.listAccounts()

    const Contract = await ethers.getContractFactory("Escrow")

    contract = await Contract.deploy(arbiter, beneficiary, { value: deposit })

    await contract.deployed()
  })

  it('should be funded', async () => {
    let balance = await ethers.provider.getBalance(contract.address)

    expect(balance.toString()).to.equal(deposit.toString())
  })

  describe("on approval from address other than the arbiter", () => {
    it("should revert", async () => {
      let ex

      try {
        await contract.connect(beneficiary).approve()
      }
      catch (_ex) {
        ex = _ex
      }

      expect(ex,
        "Attempted to approve the Escrow from the beneficiary address. Expected transaction to revert!"
      )
    })
  })

  describe("after approval from the arbiter", () => {
    let beforeBalance: any

    before(async () => {
      beforeBalance = await ethers.provider.getBalance(beneficiary)

      const signer = await ethers.provider.getSigner(arbiter)

      await contract.connect(signer).approve()
    })

    it("should transfer balance to beneficiary", async () => {
      const after = await ethers.provider.getBalance(beneficiary)

      expect(after.sub(beforeBalance).toString())
        .to.equal(deposit.toString())
    })
  })
})
