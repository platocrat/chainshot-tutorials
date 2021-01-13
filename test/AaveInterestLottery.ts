import { expect } from "chai"
import { ethers } from 'hardhat'
import getDai from './getDai'

describe('AaveInterestLottery', () => {
  let aaveInterestLottery: any,
    dai: any,
    aDai: any,
    purchasers: any

  const ticketPrice = ethers.utils.parseEther('100')

  before(async () => {
    dai = await ethers.getContractAt('IERC20', '0x6b175474e89094c44da98b954eedeac495271d0f')
    aDai = await ethers.getContractAt('IERC20', '0x028171bCA77440897B824Ca71D1c56caC55b68A3')

    purchasers = (await ethers.provider.listAccounts()).slice(1, 4)
    await getDai(dai, purchasers)

    const AaveInterestLottery = await ethers.getContractFactory('AaveInterestLottery')

    aaveInterestLottery = await AaveInterestLottery.deploy()

    await aaveInterestLottery.deployed()
  })

  it('should set the lottery drawing', async () => {
    const drawing = await aaveInterestLottery.drawing()

    expect(drawing)
  })

  /** @dev Step 2:  Purchasing */
  // describe('after multiple purchases from the same address', () => {
  //   before(async () => {
  //     const signer = await ethers.provider.getSigner(5)

  //     await getDai(dai, [await signer.getAddress()])
  //     await dai.connect(signer).approve(aaveInterestLottery.address, ticketPrice)
  //     await aaveInterestLottery.connect(signer).purchase()
  //   })

  //   /** @dev Step 2: Purchasing */
  //   it('should revert on the second purchase attempt', async () => {
  //     let ex: any

  //     try {
  //       await dai.connect(signer).approve(aaveInterestLottery.address, ticketPrice)
  //       await aaveInterestLottery.connect(signer).purchase()
  //     } catch (_ex) {
  //       ex = _ex
  //     }

  //     expect(
  //       ex,
  //       'Expected the transaction to revert when an address attempts a second purchase'
  //     )
  //   })
  // })

  /** @dev Step 2: Purchasing */
  describe('after multiple purchases from different addresses', async () => {
    before(async () => {
      for (let i = 0; i < purchasers.length; i++) {
        const signer = await ethers.provider.getSigner(purchasers[i])
        await dai.connect(signer).approve(aaveInterestLottery.address, ticketPrice)
        await aaveInterestLottery.connect(signer).purchase()
      }
    })

    /** @dev Step 2: Purchasing */
    // it('should have a DAI balance', async () => {
    //   const balance = await dai.balanceOf(aaveInterestLottery.address)

    //   expect(
    //     balance.gte(ticketPrice.mul(purchasers.length)),
    //     'Expected the contract to have DAI for each purchase'
    //   )
    // })

    /** @dev Step 3: Earn Interest */
    it('should have an aDai balance', async () => {
      const balance = await aDai.balanceOf(aaveInterestLottery.address)

      expect(
        balance.gte(ticketPrice.mul(purchasers.length)),
        "Expected the contract to have an aDai for each purchase"
      )
    })

    /** @dev Step 4: Pick Winner */
    describe('after picking a winner', () => {
      let tx: any

      before(async () => {
        const unixSeconds = Date.now() / 1000
        const oneWeek = 8 * 24 * 60 * 60

        await hre.network.provider.request({
          method: 'evm_setNextBlockTimestamp',
          params: [unixSeconds + oneWeek]
        })

        await hre.network.provider.request({ method: 'evm_mine' })

        let response = await aaveInterestLottery.pickWinner()

        tx = await response.await()
      })

      it('should emit an event', async () => {
        const winnerEvent = tx.events.find(x => x.event == 'Winner')

        expect(winnerEvent, 'Expected a winner event to be emitted')
      })
    })
  })
})