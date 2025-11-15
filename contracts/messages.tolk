struct (0x0f8a7ea5) LuckRoll {
    queryId: uint64
    drawId: uint32
    answer: uint256
}

struct (0x2f8170a5) PayReward {
    queryId: uint64
    drawId: uint32
    winner: address
    hash: Cell<bytes128>?
}

struct (0x2f8110a1) CreateDraw {
    queryId: uint64
    drawId: uint32
    minEntryAmount: coins
    keyLength: uint256
}
