🇷🇺 Описание (Russian)
🎯 Контракт случайных розыгрышей в сети TON

Этот репозиторий содержит смарт-контракт TON, который позволяет проводить честные случайные розыгрыши среди участников. Каждый пользователь может присоединиться к розыгрышу, внести ставку (или участие без ставки — в зависимости от логики), после чего контракт определяет победителя с использованием детерминированного, но непредсказуемого источника случайности, основанного на данных блокчейна TON.

✨ Возможности

Создание и управление несколькими активными розыгрышами.

Прозрачный и проверяемый выбор победителя.

Участие любого пользователя, отправившего корректное сообщение.

Хранение текущих розыгрышей в контракте.

Честный выбор победителя на основе данных блоков

🛠 Технологии

TON blockchain

Tolk

Использование данных блоков и случайных значений из окружения валидаторов

📜 Цели проекта

Сделать максимально простую, прозрачную и универсальную логику для проведения случайных розыгрышей, полностью на смарт-контракте, без необходимости доверять владельцу или внешнему серверу.

🇺🇸 Description (English)
🎯 TON Smart Contract for Random Draws

This repository contains a TON smart contract that enables fair random draws between participants. Any user can join a draw by sending a valid message, and the contract selects a winner using a deterministic but unpredictable randomness source based on TON blockchain data.

✨ Features

Create and manage multiple active draws.

Fully transparent and verifiable winner selection.

Anyone can participate by interacting with the contract.

Storage and tracking of ongoing draws.

🛠 Technologies

TON blockchain

Tolk

Blockchain-based randomness from validator environment

📜 Project Purpose

The goal is to build a simple, transparent, and trustless mechanism for random draws executed entirely by a smart contract — with no backend, no trusted authority, and no centralized randomness.



## Project structure

-   `contracts` - source code of all the smart contracts of the project and their dependencies.
-   `wrappers` - wrapper classes (implementing `Contract` from ton-core) for the contracts, including any [de]serialization primitives and compilation functions.
-   `tests` - tests for the contracts.
-   `scripts` - scripts used by the project, mainly the deployment scripts.

## How to use

### Build

`npx blueprint build` or `yarn blueprint build`

### Test

`npx blueprint test` or `yarn blueprint test`

### Deploy or run another script

`npx blueprint run` or `yarn blueprint run`

### Add a new contract

`npx blueprint create ContractName` or `yarn blueprint create ContractName`
