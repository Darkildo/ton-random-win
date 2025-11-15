import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano, beginCell } from '@ton/core';
import { RandomWin } from '../wrappers/RandomWin';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('RandomWin', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('RandomWin');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let randomWin: SandboxContract<RandomWin>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        deployer = await blockchain.treasury('deployer');

        randomWin = blockchain.openContract(
            RandomWin.createFromConfig(
                {
                    owner: deployer.address,
                    fee: 0,
                },
                code
            )
        );

        const deployResult = await randomWin.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: randomWin.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and randomWin are ready to use
    });

    describe('CreateDraw', () => {
        it('should create a new draw successfully', async () => {
            const drawId = 1;
            const minEntryAmount = toNano('1');
            const keyLength = BigInt(256);

            const result = await randomWin.sendCreateDraw(deployer.getSender(), {
                queryId: BigInt(1),
                drawId,
                minEntryAmount,
                keyLength,
                value: toNano('0.05'),
            });

            expect(result.transactions).toHaveTransaction({
                from: deployer.address,
                to: randomWin.address,
                success: true,
            });
        });

        it('should fail when draw already exists', async () => {
            const drawId = 1;
            const minEntryAmount = toNano('1');
            const keyLength = BigInt(256);

            // Create first
            await randomWin.sendCreateDraw(deployer.getSender(), {
                queryId: BigInt(1),
                drawId,
                minEntryAmount,
                keyLength,
                value: toNano('0.05'),
            });

            // Try to create again
            const result = await randomWin.sendCreateDraw(deployer.getSender(), {
                queryId: BigInt(2),
                drawId,
                minEntryAmount,
                keyLength,
                value: toNano('0.05'),
            });

            expect(result.transactions).toHaveTransaction({
                from: deployer.address,
                to: randomWin.address,
                success: false,
                exitCode: 1004, // ERROR_DRAW_ALREADY_EXISTS
            });
        });
    });

    describe('LuckRoll', () => {
        beforeEach(async () => {
            // Pre-create a draw
            await randomWin.sendCreateDraw(deployer.getSender(), {
                queryId: BigInt(1),
                drawId: 1,
                minEntryAmount: toNano('1'),
                keyLength: BigInt(256),
                value: toNano('0.05'),
            });
        });

        it('should roll successfully with sufficient amount', async () => {
            const roller = await blockchain.treasury('roller');

            const result = await randomWin.sendLuckRoll(roller.getSender(), {
                queryId: BigInt(1),
                drawId: 1,
                answer: BigInt(123),
                value: toNano('2'), // > minEntryAmount
            });

            expect(result.transactions).toHaveTransaction({
                from: roller.address,
                to: randomWin.address,
                success: true,
            });
        });

        it('should fail when draw does not exist', async () => {
            const roller = await blockchain.treasury('roller');

            const result = await randomWin.sendLuckRoll(roller.getSender(), {
                queryId: BigInt(1),
                drawId: 999,
                answer: BigInt(123),
                value: toNano('2'),
            });

            expect(result.transactions).toHaveTransaction({
                from: roller.address,
                to: randomWin.address,
                success: false,
                exitCode: 1009, // ERROR_DRAW_NOT_FOUND
            });
        });

        it('should fail when amount is insufficient', async () => {
            const roller = await blockchain.treasury('roller');

            const result = await randomWin.sendLuckRoll(roller.getSender(), {
                queryId: BigInt(1),
                drawId: 1,
                answer: BigInt(123),
                value: toNano('0.5'), // < minEntryAmount
            });

            expect(result.transactions).toHaveTransaction({
                from: roller.address,
                to: randomWin.address,
                success: false,
                exitCode: 449, // ERROR_INVALID_TON_AMOUNT_TO_ROLL
            });
        });

        it('should fail when winner already found', async () => {
            // First, simulate a winner by setting hash and winner, but since we can't directly, assume after PayReward
            // For now, skip or mock. Actually, since PayReward sets winner, but in test we can't easily set it.
            // Perhaps this test is hard to do without direct storage access. Maybe omit or assume.
            // The contract checks if draw.winner != null
            // Since initial is null, and PayReward sets it, but in test, we need to call PayReward first.
            // Let's add a test that calls PayReward first, then tries LuckRoll again.

            const roller = await blockchain.treasury('roller');

            // First roll
            await randomWin.sendLuckRoll(roller.getSender(), {
                queryId: BigInt(1),
                drawId: 1,
                answer: BigInt(123),
                value: toNano('2'),
            });

            // Pay reward to set winner
            const hash = beginCell().storeUint(123, 256).endCell();
            await randomWin.sendPayReward(deployer.getSender(), {
                queryId: BigInt(2),
                drawId: 1,
                winner: roller.address,
                hash,
                value: toNano('0.05'),
            });

            // Try to roll again
            const result = await randomWin.sendLuckRoll(roller.getSender(), {
                queryId: BigInt(3),
                drawId: 1,
                answer: BigInt(456),
                value: toNano('2'),
            });

            expect(result.transactions).toHaveTransaction({
                from: roller.address,
                to: randomWin.address,
                success: false,
                exitCode: 2009, // ERROR_WINNER_ALREADY_FINDED
            });
        });
    });

    describe('PayReward', () => {
        beforeEach(async () => {
            // Pre-create a draw and roll
            await randomWin.sendCreateDraw(deployer.getSender(), {
                queryId: BigInt(1),
                drawId: 1,
                minEntryAmount: toNano('1'),
                keyLength: BigInt(256),
                value: toNano('0.05'),
            });

            const roller = await blockchain.treasury('roller');
            await randomWin.sendLuckRoll(roller.getSender(), {
                queryId: BigInt(2),
                drawId: 1,
                answer: BigInt(123),
                value: toNano('2'),
            });
        });

        it('should pay reward successfully with correct hash', async () => {
            const roller = await blockchain.treasury('roller');
            const hash = beginCell().storeUint(123, 256).endCell();

            const result = await randomWin.sendPayReward(deployer.getSender(), {
                queryId: BigInt(3),
                drawId: 1,
                winner: roller.address,
                hash,
                value: toNano('0.05'),
            });

            expect(result.transactions).toHaveTransaction({
                from: deployer.address,
                to: randomWin.address,
                success: true,
            });
        });

        it('should fail when sender is not owner', async () => {
            const nonOwner = await blockchain.treasury('nonOwner');
            const roller = await blockchain.treasury('roller');
            const hash = beginCell().storeUint(123, 256).endCell();

            const result = await randomWin.sendPayReward(nonOwner.getSender(), {
                queryId: BigInt(3),
                drawId: 1,
                winner: roller.address,
                hash,
                value: toNano('0.05'),
            });

            expect(result.transactions).toHaveTransaction({
                from: nonOwner.address,
                to: randomWin.address,
                success: false,
                exitCode: 73, // ERROR_NOT_OWNER
            });
        });

        it('should fail when draw does not exist', async () => {
            const roller = await blockchain.treasury('roller');
            const hash = beginCell().storeUint(123, 256).endCell();

            const result = await randomWin.sendPayReward(deployer.getSender(), {
                queryId: BigInt(3),
                drawId: 999,
                winner: roller.address,
                hash,
                value: toNano('0.05'),
            });

            expect(result.transactions).toHaveTransaction({
                from: deployer.address,
                to: randomWin.address,
                success: false,
                exitCode: 1009, // ERROR_DRAW_NOT_FOUND
            });
        });

        it('should fail when hash is not set', async () => {
            const roller = await blockchain.treasury('roller');

            const result = await randomWin.sendPayReward(deployer.getSender(), {
                queryId: BigInt(3),
                drawId: 1,
                winner: roller.address,
                // hash not provided
                value: toNano('0.05'),
            });

            expect(result.transactions).toHaveTransaction({
                from: deployer.address,
                to: randomWin.address,
                success: false,
                exitCode: 2001, // ERROR_VALIDATION_HASH_NOT_SET
            });
        });

        it('should fail when hash is invalid', async () => {
            const roller = await blockchain.treasury('roller');
            const wrongHash = beginCell().storeUint(456, 256).endCell(); // wrong

            const result = await randomWin.sendPayReward(deployer.getSender(), {
                queryId: BigInt(3),
                drawId: 1,
                winner: roller.address,
                hash: wrongHash,
                value: toNano('0.05'),
            });

            expect(result.transactions).toHaveTransaction({
                from: deployer.address,
                to: randomWin.address,
                success: false,
                exitCode: 449, // ERROR_INVALID_HASH
            });
        });
    });
});
