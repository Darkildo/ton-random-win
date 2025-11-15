import "errors"
import "messages"
import "models"
import "storage"

type AllowedMessage = LuckRoll | PayReward | CreateDraw

fun onInternalMessage(in: InMessage) {
    val msg = lazy AllowedMessage.fromSlice(in.body);
    var storage = lazy Storage.load();
    match (msg) {
        LuckRoll => {
            var drawMap = storage.drawMap.get(msg.drawId);

            if (!drawMap.isFound) {
                throw ERROR_DRAW_NOT_FOUND;
            }

            var draw = drawMap.loadValue();

            if (draw.minEntryAmount > in.valueCoins) {
                throw ERROR_INVALID_TON_AMOUNT_TO_ROLL;
            }

            if (draw.winner != null) {
                throw ERROR_WINNER_ALREADY_FINDED;
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
            var drawMap = storage.drawMap.uDictGet(sizeof(msg.drawId), msg.drawId);

            if (drawMap.1) {
                throw ERROR_DRAW_ALREADY_EXISTS;
            }
            var draw = Draw {
                minEntryAmount: msg.minEntryAmount,
                hash: null,
                winner: null,
            };

            storage.drawMap.iDictSet(sizeof(msg.drawId), msg.drawId, draw);

            storage.save();
        }

        else => {
            assert (in.body.isEmpty()) throw ERROR_WRONG_OP;
        }
    }
}

fun onBouncedMessage(in: InMessageBounced) {}
