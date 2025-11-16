struct (0x0f1a3ea5) LuckRoll {
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

struct (0x7e8764ef) CreateDraw {
    queryId: uint64
    drawId: uint32
    minEntryAmount: coins
    keyLength: uint8
}
struct (0x2f8116a1) SetWinHash {
    queryId: uint64
    drawId: uint32
    winHash: Cell<bytes128>
}
struct (0xd372158c) TopUpTons {}
