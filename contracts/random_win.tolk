import "@stdlib/tvm-dicts"
import "errors"
import "messages"
import "models"
import "storage"

tolk 1.1

type AllowedMessage = LuckRoll | PayReward | CreateDraw

fun onInternalMessage(in: InMessage) {
    val msg = lazy AllowedMessage.fromSlice(in.body);
    var storage = lazy Storage.load();
    match (msg) {
        LuckRoll => {
            var drawMap = storage.drawDict.uDictGet(sizeof(msg.drawId), msg.drawId);

            if (!drawMap.1) {
                throw ERROR_DRAW_NOT_FOUND;
            }

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
        CreateDraw => {
            var drawMap = storage.drawDict.uDictGet(sizeof(msg.drawId), msg.drawId);

            if (drawMap.1) {
                throw ERROR_DRAW_ALREADY_EXISTS;
            }
            var draw = Draw {
                minEntryAmount: msg.minEntryAmount,
                hash: null,
                winner: null,
            };

            storage.drawDict.iDictSet(sizeof(msg.drawId), msg.drawId, draw);

            storage.save();
        }

        else => {
            assert (in.body.isEmpty()) throw ERROR_WRONG_OP;
        }
    }
}

fun onBouncedMessage(in: InMessageBounced) {}
