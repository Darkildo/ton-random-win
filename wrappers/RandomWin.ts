import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode, Dictionary } from '@ton/core';

export type RandomWinConfig = {
    owner: Address;
    fee: number;
};

export function randomWinConfigToCell(config: RandomWinConfig): Cell {
    return beginCell()
        .storeAddress(config.owner)
        .storeUint(config.fee, 16)
        .storeDict(Dictionary.empty())
        .endCell();
}

export const Opcodes = {
    OP_LUCK_ROLL: 0x0f8a7ea5,
    OP_PAY_REWARD: 0x2f8170a5,
    OP_CREATE_DRAW: 0xd372118a,
    OP_SET_WIN_HASH: 0x2f8116a1,
    TOP_UP: 0xd372158c,
};

export class RandomWin implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) { }

    static createFromAddress(address: Address) {
        return new RandomWin(address);
    }

    static createFromConfig(config: RandomWinConfig, code: Cell, workchain = 0) {
        const data = randomWinConfigToCell(config);
        const init = { code, data };
        return new RandomWin(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendCreateDraw(
        provider: ContractProvider,
        via: Sender,
        opts: {
            queryId: bigint;
            drawId: number;
            minEntryAmount: bigint;
            keyLength: bigint;
            value: bigint;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.OP_CREATE_DRAW, 32)
                .storeUint(opts.queryId, 64)
                .storeUint(opts.drawId, 32)
                .storeCoins(opts.minEntryAmount)
                .storeUint(opts.keyLength, 256)
                .endCell(),
        });
    }

    async sendLuckRoll(
        provider: ContractProvider,
        via: Sender,
        opts: {
            queryId: bigint;
            drawId: number;
            answer: bigint;
            value: bigint;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.OP_LUCK_ROLL, 32)
                .storeUint(opts.queryId, 64)
                .storeUint(opts.drawId, 32)
                .storeUint(opts.answer, 256)
                .endCell(),
        });
    }

    async sendPayReward(
        provider: ContractProvider,
        via: Sender,
        opts: {
            queryId: bigint;
            drawId: number;
            winner: Address;
            hash?: Cell;
            value: bigint;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.OP_PAY_REWARD, 32)
                .storeUint(opts.queryId, 64)
                .storeUint(opts.drawId, 32)
                .storeAddress(opts.winner)
                .storeMaybeRef(opts.hash)
                .endCell(),
        });
    }

    async sendSetWinHash(
        provider: ContractProvider,
        via: Sender,
        opts: {
            queryId: bigint;
            drawId: number;
            winHash: Cell;
            value: bigint;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.OP_SET_WIN_HASH, 32)
                .storeUint(opts.queryId, 64)
                .storeUint(opts.drawId, 32)
                .storeRef(opts.winHash)
                .endCell(),
        });
    }

    async getOwner(provider: ContractProvider): Promise<Address> {
        const result = await provider.get('get_owner', []);
        return result.stack.readAddress();
    }

    async getDraw(provider: ContractProvider, drawId: number) {
        const result = await provider.get('get_draw', [{ type: 'int', value: BigInt(drawId) }]);
        // Assuming it returns the draw data
        return result.stack;
    }
}
