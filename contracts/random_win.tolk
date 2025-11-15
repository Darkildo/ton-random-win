import "@stdlib/tvm-dicts"
import "errors"
import "messages"

tolk 1.1

type AllowedMessage = LuckRoll | PayReward

fun onInternalMessage(in: InMessage) {
    val msg = lazy AllowedMessage.fromSlice(in.body);
    var storage = lazy Storage.load();
    match (msg) {
        LuckRoll => {
            if (storage.tonAmountToRoll > in.valueCoins) {
                throw ERROR_INVALID_TON_AMOUNT_TO_ROLL;
            }
        }

        PayReward => {
            if (in.senderAddress != storage.owner) {
                throw ERROR_NOT_OWNER;
            }
            if (msg.hash != storage.hash) {
                throw ERROR_INVALID_HASH;
            }
        }
        else => {
            assert (in.body.isEmpty()) throw ERROR_WRONG_OP;
        }
    }
}

fun onBouncedMessage(in: InMessageBounced) {}
