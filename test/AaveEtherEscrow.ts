/**
 * @dev This test file compiles with the following error, an error which I am
 * yet unable to solve:
 * ```
 * Error: Transaction reverted: function call to a non-contract account
 *   at AaveEtherEscrow.constructor (contracts/AaveEtherEscrow.sol:33)
 * ```
 * 
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

  /** @dev Step 1 */
  const deposit = ethers.utils.parseEther('1')
  /** @dev Step 2 */
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

  /** @dev Step 1 */
  it('should not have an ether balance', async () => {
    const balance = await ethers.provider.getBalance(aaveEtherEscrow.address)

    expect(balance.toString()).to.equal("0")
  })

  /** @dev Step 1 */
  it("should have aWETH", async () => {
    const balance = await aWETH.balanceOf(aaveEtherEscrow.address)

    expect(balance.toString()).to.equal(deposit.toString())
  })

  /** @dev Step 2 */
  // describe('approving as the beneficiary', () => {
  //   it('should not be allowed', async () => {
  //     let ex: any

  //     try {
  //       const signer = await ethers.provider.getSigner(beneficiary)
  //       await aaveEtherEscrow.connect(signer).approve()
  //     } catch (_ex) {
  //       ex = _ex
  //     }

  //     expect(
  //       ex,
  //       "Expected the transaction to revert when the beneficiary calls approve!"
  //     )
  //   })
  // })

  /** @dev Step 2 */
  describe('after approving', () => {
    let balanceBefore: any

    before(async () => {
      balanceBefore = await ethers.provider.getBalance(beneficiary)

      const thousandDays = 1000 * 24 * 60 * 60

      await hre.network.provider.request({
        method: "evm_increaseTime",
        params: [thousandDays]
      })
    })

    /** @dev Step 2 */
    // it('should give the WETH gateway allowance to spend the initial deposit', async () => {
    //   const allowance = await aWETH.allowance(
    //     aaveEtherEscrow.address, wethGatewayAddress
    //   )

    //   expect(
    //     allowance.gte(deposit),
    //     "Expected an allowance on the WETH Gateway!"
    //   )
    // })


    /** @dev Step 3 */
    // it('should withdraw the ether balance to the contract', async () => {
    //   const balance = await ethers.provider.getBalance(aaveEtherEscrow.address)

    //   expect(balance.gt(deposit))
    // })

    /** @dev Step 4 */
    async function computeBalanceAfter(_party: any) {
      const balanceBefore = await ethers.provider.getBalance(_party)
      const arbiterSigner = ethers.provider.getSigner(arbiter)

      await aaveEtherEscrow.connect(arbiterSigner).withdraw()

      const balanceAfter = await ethers.provider.getBalance(_party)
      const diff = balanceAfter.sub(balanceBefore)

      return diff
    }

    it('should provide the principal to the beneficiary', async () => {
      expect(
        computeBalanceAfter(beneficiary).toString()
      ).to.equal(deposit.toString())
    })

    it('should provide the accrued interest to the depositor', async () => {
      const diff = await computeBalanceAfter(depositor)

      expect(diff.gt(0))
    })
  })
})