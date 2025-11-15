import "models"

tolk 1.1

struct Storage {
    owner: address
    fee: uint16
    drawDict: dict<uint32, Draw>
}

fun Storage.load() {
    return Storage.fromCell(contract.getData());
}

fun Storage.save(self) {
    contract.setData(self.toCell());
}
