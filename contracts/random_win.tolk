import "errors"
import "messages"
import "models"
import "storage"

type AllowedMessage = LuckRoll | PayReward | CreateDraw | SetWinHash | TopUpTons

fun onInternalMessage(in: InMessage) {
    if (in.body.isEmpty()) {
        return;
    }
    val msg = lazy AllowedMessage.fromSlice(in.body);
    var storage = lazy Storage.load();

    match (msg) {
        LuckRoll => {
            var drawResult = storage.drawMap.get(msg.drawId);

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

            draw.poolSum += in.valueCoins;

            storage.drawMap.set(msg.drawId, draw);

            storage.save();
        }
        SetWinHash => {
            var drawResult = storage.drawMap.get(msg.drawId);

            if (in.senderAddress != storage.owner) {
                throw ERROR_NOT_OWNER;
            }

            if (!drawResult.isFound) {
                throw ERROR_DRAW_NOT_FOUND;
            }
            var draw = drawResult.loadValue();

            draw.hash = msg.winHash;

            storage.drawMap.set(msg.drawId, draw);

            storage.save();
        }
        PayReward => {
            var drawResult = storage.drawMap.get(msg.drawId);

            if (in.senderAddress != storage.owner) {
                throw ERROR_NOT_OWNER;
            }

            if (!drawResult.isFound) {
                throw ERROR_DRAW_NOT_FOUND;
            }

            var draw = drawResult.loadValue();

            if (msg.hash == null || draw.hash == null) {
                throw ERROR_VALIDATION_HASH_NOT_SET;
            }

            if (draw.winner != null) {
                throw ERROR_WINNER_ALREADY_PAYED;
            }

            if (!msg.hash.beginParse().bitsEqual(draw.hash.beginParse())) {
                throw ERROR_INVALID_HASH;
            }
            draw.winner = msg.winner.toCell();

            storage.drawMap.set(msg.drawId, draw);

            storage.save();
        }
        CreateDraw => {
            var drawResult = storage.drawMap.get(msg.drawId);

            if (drawResult.isFound) {
                throw ERROR_DRAW_ALREADY_EXISTS;
            }
            var draw = Draw {
                minEntryAmount: msg.minEntryAmount,
                hash: null,
                winner: null,
                poolSum: in.valueCoins,
            };

            storage.drawMap.set(msg.drawId, draw);

            storage.save();
        }
        TopUpTons => {
            return;
        }
        else => {
            throw ERROR_WRONG_OP;
        }
    }
}

fun onBouncedMessage(in: InMessageBounced) {}

get fun get_owner() {
    return Storage.load().owner;
}

get fun get_draw(drawId: uint32) {
    var storage = lazy Storage.load();
    var drawResult = storage.drawMap.get(drawId);

    if (!drawResult.isFound) {
        return null;
    }
    return drawResult.loadValue();
}
