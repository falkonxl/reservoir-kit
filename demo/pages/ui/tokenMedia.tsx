import { NextPage } from 'next'
import { TokenMedia, useTokens } from '@reservoir0x/reservoir-kit-ui'
import { createRef, useState } from 'react'

const DEFAULT_COLLECTION_ID =
  process.env.NEXT_PUBLIC_DEFAULT_COLLECTION_ID ||
  '0xe14fa5fba1b55946f2fa78ea3bd20b952fa5f34e'
const DEFAULT_TOKEN_ID = process.env.NEXT_PUBLIC_DEFAULT_TOKEN_ID || '2'

const FallbackElement = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        border: '1px solid grey',
        borderRadius: 4
      }}
    >
      Fallback Content
    </div>
  )
}

const TokenMediaPage: NextPage = () => {
  const [collectionId, setCollectionId] = useState(DEFAULT_COLLECTION_ID)
  const [tokenId, setTokenId] = useState(DEFAULT_TOKEN_ID)
  const [preview, setPreview] = useState(false)
  const [showGrid, setShowGrid] = useState(true)

  const { data: tokens } = useTokens(
    showGrid
      ? {
          collection: collectionId,
        }
      : {
          tokens: [`${collectionId}:${tokenId}`],
        }
  )

  return (
    <div
      style={{
        display: 'flex',
        height: 50,
        width: '100%',
        gap: 12,
        padding: 24,
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 150,
      }}
    >
      <nav style={{ display: 'flex', gap: 15, marginBottom: 20 }}>
        <a
          style={
            !showGrid
              ? { textDecoration: 'underline', cursor: 'pointer' }
              : undefined
          }
          onClick={() => setShowGrid(true)}
        >
          Grid View
        </a>
        <a
          style={
            showGrid
              ? { textDecoration: 'underline', cursor: 'pointer' }
              : undefined
          }
          onClick={() => setShowGrid(false)}
        >
          Token View
        </a>
      </nav>
      <div>
        <label>Collection Id: </label>
        <input
          placeholder="Collection Id"
          type="text"
          value={collectionId}
          onChange={(e) => setCollectionId(e.target.value)}
          style={{ width: 250 }}
        />
      </div>
      {!showGrid && (
        <div>
          <label>Token Id: </label>
          <input
            placeholder="Token Id"
            type="text"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            style={{ width: 250 }}
          />
        </div>
      )}
      <div>
        <label>Preview: </label>
        <input
          type="checkbox"
          checked={preview}
          onChange={(e) => {
            setPreview(e.target.checked)
          }}
        />
      </div>
      {showGrid ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 14,
          }}
        >
          {tokens.map((token, i) => (
            <TokenMedia
              key={i}
              style={{
                width: '200px',
                minHeight: '200px',
                borderRadius: 4,
              }}
              token={token.token}
              preview={preview}
              fallback={<FallbackElement />}
            />
          ))}
        </div>
      ) : (
        <TokenMedia
          style={{
            width: 'auto',
            minWidth: '400px',
            minHeight: '400px',
            borderRadius: 4,
          }}
          token={tokens && tokens[0] ? tokens[0].token : undefined}
          preview={preview}
          fallback={<FallbackElement />}
        />
      )}
    </div>
  )
}

export default TokenMediaPage