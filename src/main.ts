import * as TwoCaptcha from '@2captcha/captcha-solver';
import puppeteer from 'puppeteer';
import { config } from './config';
import { readFileAsBase64 } from './file.util';

async function startApp() {
    const apiKey = config.rucaptchaKey;

    const solver = new TwoCaptcha.Solver(apiKey);

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    try {
        await page.goto(config.loginUrl);

        await page.type(config.selector.email, config.userData.email);

        await page.type(config.selector.password, config.userData.password);

        const captchaElement = await page.waitForSelector(
            config.selector.captchaSvg
        );

        if (captchaElement) {
            console.log('Капча найдена, решаем...');

            const captchaPath = './captcha.png';
            await captchaElement.screenshot({ path: captchaPath });

            const imageBase64 = readFileAsBase64(captchaPath);

            let attempt = 0;
            let captchaSolved = false;

            while (attempt < config.attempts && !captchaSolved) {
                attempt++;
                console.log(`Попытка решить капчу: ${attempt}`);

                try {
                    const ruCaptchaReq = await solver.imageCaptcha({
                        body: imageBase64,
                        numeric: 4,
                        min_len: 6,
                        max_len: 6,
                    });

                    console.log('Получаем решение капчи:', ruCaptchaReq.data);

                    await page.evaluate((selector) => {
                        const input = document.querySelector(
                            selector
                        ) as HTMLInputElement;
                        if (input) input.value = '';
                    }, config.selector.captchaInput);

                    await page.type(
                        config.selector.captchaInput,
                        ruCaptchaReq.data
                    );

                    await page.click(config.selector.buttonVerify);

                    await page.waitForSelector(config.selector.succesMessage, {
                        timeout: 5000,
                    });

                    console.log('Капча успешно решена!');
                    captchaSolved = true;
                } catch (error: any) {
                    console.error(
                        `Ошибка при решении капчи на попытке ${attempt}:`
                    );

                    if (attempt >= config.attempts) {
                        console.error(
                            'Превышено максимальное количество попыток решения капчи.'
                        );
                        throw new Error('Не удалось решить капчу.');
                    }
                }
            }

            if (!captchaSolved) {
                throw new Error('Капча не была решена после всех попыток.');
            }
        }

        //     console.log('Отправляем капчу в формате base64 на rucaptcha');

        //     const ruCaptchaReq = await solver.imageCaptcha({
        //         body: imageBase64,
        //         numeric: 4,
        //         min_len: 6,
        //         max_len: 6,
        //     });

        //     console.log('Получаем решение капчи:', ruCaptchaReq.data);

        //     await page.type(config.selector.captchaInput, ruCaptchaReq.data);
        // }

        // await page.click(config.selector.buttonVerify);

        // await page.waitForSelector(config.selector.succesMessage);

        await page.click('button[type="submit"]');

        await page.waitForNavigation();

        console.log('Авторизация завершена успешно!');
    } catch (error: any) {
        console.error('Ошибка приложения:', error.message);
    } finally {
        await browser.close();
    }
}

startApp();
