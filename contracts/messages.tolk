import "notcoin/contracts/storage"

tolk 1.1

type ForwardPayloadRemainder = RemainingBitsAndRefs

struct (0x0f8a7ea5) LuckRoll {
    queryId: uint64
    value: uint256
}

struct (0x2f8170a5) PayReward {
    queryId: uint64
    winner: address
    hash: bytes128?
}
