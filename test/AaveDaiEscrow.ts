/**
 * @dev This escrow uses DAI as the underlying asset instead of ETH.
 */
import { expect } from 'chai'
import { ethers } from 'hardhat'

describe('AaveDaiEscrow', () => {
  let aaveDaiEscrow: any,
    depositorAddr: string = '0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503',
    depositorSigner: any,
    arbiter: any,
    beneficiary: any,
    dai: any,
    aDai: any

  const deposit = ethers.utils.parseEther('500')

  before(async () => {
    const signer = await ethers.provider.getSigner(0)

    signer.sendTransaction({
      to: depositorAddr,
      value: ethers.utils.parseEther('1')
    })

    await hre.network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [depositorAddr]
    })

    depositorSigner = await ethers.provider.getSigner(depositorAddr)
    dai = await ethers.getContractAt(
      'IERC20',
      '0x6b175474e89094c44da98b954eedeac495271d0f',
      depositorSigner
    )
    aDai = await ethers.getContractAt(
      'IERC20',
      '0x028171bCA77440897B824Ca71D1c56caC55b68A3'
    )

    const aaveDaiEscrowAddress = ethers.utils.getContractAddress({
      from: depositorAddr,
      nonce: (await ethers.provider.getTransactionCount(depositorAddr)) + 1
    })

    // Semi-colon is required
    await dai.approve(aaveDaiEscrowAddress, deposit);

    [arbiter, beneficiary] = await ethers.provider.listAccounts()

    const AaveDaiEscrow = await ethers.getContractFactory(
      'AaveDaiEscrow',
      depositorSigner
    )

    aaveDaiEscrow = await AaveDaiEscrow.deploy(arbiter, beneficiary, deposit)

    await aaveDaiEscrow.deployed()
  })

  /** @dev Step 1 */
  // it('should hold DAI', async function () {
  //   const balance = await dai.balanceOf(aaveDaiEscrow.address)

  //   expect(balance.toString()).to.equal(deposit.toString())
  // })

  /** @dev Step 2 */
  // it('should not hold DAI', async () => {
  //   const balance = await dai.balanceOf(aaveDaiEscrow.address)

  //   expect(balance.toString()).to.equal("0")
  // })

  /** @dev Step 2 */
  // it('should hold DAI', async () => {
  //   const balance = await aDai.balanceOf(aaveDaiEscrow.address)

  //   expect(balance.toString()).to.equal(deposit.toString())
  // })

  /** @dev Step 3: Approve & Withdraw */
  // describe('approving as the beneficiary', () => {
  //   it('should not be allowed', async () => {
  //     let ex: any

  //     try {
  //       const signer = await ethers.provider.getSigner(beneficiary)

  //       await aaveDaiEscrow.connect(signer).approve()
  //     } catch (_ex) {
  //       ex = _ex
  //     }

  //     expect(
  //       ex,
  //       'Expected the transaction to revert when the beneficiary calls approve!'
  //     )
  //   })

  /** @dev Step 3: Approve & Withdraw */
  describe('after approving', () => {
    /** @dev Step 4: Approve Interest */
    let balanceBefore: any

    before(async () => {
      /** @dev Step 4: Approve Interest */
      balanceBefore = await dai.balanceOf(depositorAddr)

      const thousandDays: number = 1000 * 24 * 60 * 60

      await hre.network.provider.request({
        method: 'evm_increaseTime',
        params: [thousandDays]
      })

      const arbiterSigner = await ethers.provider.getSigner(arbiter)

      await aaveDaiEscrow.connect(arbiterSigner).approve()
    })

    /** @dev Step 4: Approve Interest */
    it('should provide interest to the depositor', async () => {
      let balanceAfter = await dai.balanceOf(depositorAddr)

      // This method of assertion is NOT recommended! Instead, assert the 
      // expected value.
      expect(balanceAfter).to.be.above(balanceBefore)
    })

    /** @dev Step 3: Approve & Withdraw */
    it('should provide the principal to the beneficiary', async () => {
      const balance = await dai.balanceOf(beneficiary)

      expect(balance.toString()).to.equals(deposit.toString())
    })
  })
})