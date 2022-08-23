import React, { FC, useEffect, useState, useCallback, ReactNode } from 'react'
import {
  useCollection,
  useTokenDetails,
  useEthConversion,
  useReservoirClient,
  useTokenOpenseaBanned,
  useWethBalance,
} from '../../hooks'
import { useAccount, useBalance, useSigner } from 'wagmi'

import { BigNumber } from 'ethers'
import { Execute } from '@reservoir0x/reservoir-kit-client'
import { ExpirationOption } from '../../types/ExpirationOption'
import defaultExpirationOptions from '../../lib/defaultExpirationOptions'

const expirationOptions = [
  ...defaultExpirationOptions,
  {
    text: 'Custom',
    value: 'custom',
    relativeTime: null,
    relativeTimeUnit: null,
  },
]

export enum TokenOfferStep {
  SetPrice,
  Swap,
  Offering,
  Complete,
}

type ChildrenProps = {
  token:
    | false
    | NonNullable<NonNullable<ReturnType<typeof useTokenDetails>>['data']>[0]
  collection: ReturnType<typeof useCollection>['data']
  bidAmount: string
  tokenOfferStep: TokenOfferStep
  hasEnoughEth: boolean
  ethUsdPrice: ReturnType<typeof useEthConversion>
  isBanned: boolean
  balance?: BigNumber
  wethBalance?: BigNumber
  transactionError?: Error | null
  expirationOptions: ExpirationOption[]
  expirationOption: ExpirationOption
  setTokenOfferStep: React.Dispatch<React.SetStateAction<TokenOfferStep>>
  setBidAmount: React.Dispatch<React.SetStateAction<string>>
  setExpirationOption: React.Dispatch<React.SetStateAction<ExpirationOption>>
  placeBid: () => void
}

type Props = {
  open: boolean
  tokenId?: string
  collectionId?: string
  children: (props: ChildrenProps) => ReactNode
}

export const TokenOfferModalRenderer: FC<Props> = ({
  open,
  tokenId,
  collectionId,
  children,
}) => {
  const { data: signer } = useSigner()
  const [tokenOfferStep, setTokenOfferStep] = useState<TokenOfferStep>(
    TokenOfferStep.SetPrice
  )
  const [transactionError, setTransactionError] = useState<Error | null>()
  const [bidAmount, setBidAmount] = useState<string>('')
  const [expirationOption, setExpirationOption] = useState<ExpirationOption>(
    expirationOptions[0]
  )

  const { data: tokens } = useTokenDetails(
    open && {
      tokens: [`${collectionId}:${tokenId}`],
      includeTopBid: true,
    }
  )
  const { data: collection } = useCollection(
    open && {
      id: collectionId,
      includeTopBid: true,
    }
  )
  let token = !!tokens?.length && tokens[0]

  const ethUsdPrice = useEthConversion(open ? 'USD' : undefined)
  // const feeUsd = referrerFee * (ethUsdPrice || 0)
  // const totalUsd = totalPrice * (ethUsdPrice || 0)

  const client = useReservoirClient()

  const { address } = useAccount()
  const { data: balance } = useBalance({
    addressOrName: address,
    watch: open,
  })

  const { data: wethBalance } = useWethBalance({
    addressOrName: address,
    watch: open,
  })

  useEffect(() => {
    if (!open) {
      //cleanup
      setTokenOfferStep(TokenOfferStep.SetPrice)
      setExpirationOption(expirationOptions[0])
    }
  }, [open])

  const isBanned = useTokenOpenseaBanned(
    open ? collectionId : undefined,
    tokenId
  )

  const placeBid = useCallback(() => {
    if (!signer) {
      const error = new Error('Missing a signer')
      setTransactionError(error)
      throw error
    }

    if (!tokenId || !collectionId) {
      const error = new Error('Missing tokenId or collectionId')
      setTransactionError(error)
      throw error
    }

    if (!client) {
      const error = new Error('ReservoirClient was not initialized')
      setTransactionError(error)
      throw error
    }

    setTokenOfferStep(TokenOfferStep.Offering)

    client.actions
      .placeBid({
        signer,
        bids: [],
        onProgress: (steps: Execute['steps']) => {},
      })
      .catch((e: any) => {
        const transactionError = new Error(e?.message || '', {
          cause: e,
        })
        setTransactionError(transactionError)
        setTokenOfferStep(TokenOfferStep.SetPrice)
        console.log(e)
      })
  }, [tokenId, collectionId, client, signer])

  return (
    <>
      {children({
        token,
        collection,
        ethUsdPrice,
        isBanned,
        balance: balance?.value,
        wethBalance: wethBalance?.value,
        bidAmount,
        tokenOfferStep,
        hasEnoughEth: false,
        transactionError,
        expirationOption,
        expirationOptions,
        setTokenOfferStep,
        setBidAmount,
        setExpirationOption,
        placeBid,
      })}
    </>
  )
}
