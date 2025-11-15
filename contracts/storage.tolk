tolk 1.1

struct Storage {
    id: uint32
    tonAmountToRoll: coins
    owner: address
    hash: bytes128?
}

fun Storage.load() {
    return Storage.fromCell(contract.getData());
}

fun Storage.save(self) {
    contract.setData(self.toCell());
}
