import "errors"
import "messages"
import "models"
import "storage"

type AllowedMessage = LuckRoll | PayReward | CreateDraw

fun onInternalMessage(in: InMessage) {
    val msg = lazy AllowedMessage.fromSlice(in.body);
    var storage = lazy Storage.load();
    var drawResult = storage.drawMap.get(msg.drawId);
    match (msg) {
        LuckRoll => {
            if (!drawResult.isFound) {
                throw ERROR_DRAW_NOT_FOUND;
            }

            var draw = drawResult.loadValue();

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

            if (!drawResult.isFound) {
                throw ERROR_DRAW_NOT_FOUND;
            }

            var draw = drawResult.loadValue();

            if (msg.hash != draw.hash) {
                throw ERROR_INVALID_HASH;
            }

            storage.save();
        }
        CreateDraw => {
            if (drawResult.isFound) {
                throw ERROR_DRAW_ALREADY_EXISTS;
            }
            var draw = Draw {
                minEntryAmount: msg.minEntryAmount,
                hash: null,
                winner: null,
            };

            storage.drawMap.set(msg.drawId, draw);

            storage.save();
        }

        else => {
            assert (in.body.isEmpty()) throw ERROR_WRONG_OP;
        }
    }
}

fun onBouncedMessage(in: InMessageBounced) {}
