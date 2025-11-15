import { toNano } from '@ton/core';
import { RandomWin } from '../wrappers/RandomWin';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const randomWin = provider.open(
        RandomWin.createFromConfig(
            {
                id: Math.floor(Math.random() * 10000),
                counter: 0,
            },
            await compile('RandomWin')
        )
    );

    await randomWin.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(randomWin.address);

    console.log('ID', await randomWin.getID());
}
