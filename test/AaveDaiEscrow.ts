/**
 * @dev This escrow uses DAI as the underlying asset instead of ETH.
 */
import { expect } from 'chai'
import { ethers } from 'hardhat'

describe('AaveDaiEscrow', function () {
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

  it('should hold DAI', async function () {
    const balance = await dai.balanceOf(aaveDaiEscrow.address)

    expect(balance.toString()).to.equal(deposit.toString())
  })
})