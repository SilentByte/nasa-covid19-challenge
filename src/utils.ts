/*
 * WHALE IN SPACE | NASA SPACE APPS COVID-19 CHALLENGE
 * Copyright (c) 2020 by SilentByte <https://silentbyte.com/>
 */

export function timeout(duration: number) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), duration);
    });
}
