import puppeteer, { Browser, Page } from 'puppeteer';
import { config } from '../utils/config';
import { CaptchaSolver } from './CaptchaSolver';

export class AuthService {
    private page: Page | undefined;
    private browser: Browser | undefined;

    constructor(private captchaSolver: CaptchaSolver) {}

    public async login(): Promise<void> {
        this.browser = await puppeteer.launch({
            headless: false,
            defaultViewport: {
                width: 0,
                height: 0,
                deviceScaleFactor: 4,
            },
        });
        this.page = await this.browser.newPage();

        try {
            await this.page.goto(config.loginUrl);
            console.log('Зашли на страницу авторизации.');
            await this.page.type(config.selectors.email, config.userData.email);
            await this.page.type(
                config.selectors.password,
                config.userData.password
            );

            const captchaElement = await this.page.waitForSelector(
                config.selectors.captchaSvg
            );

            if (captchaElement) {
                console.log('Капча найдена, решаем...');

                const captchaPath = './captcha.png';
                await captchaElement.screenshot({ path: captchaPath });

                let attempt = 0;
                let captchaSolved = false;

                while (attempt < config.attempts && !captchaSolved) {
                    attempt++;
                    console.log(`Попытка решить капчу: ${attempt}`);

                    try {
                        const ruCaptchaReq =
                            await this.captchaSolver.solveCaptcha(captchaPath);

                        await this.page.evaluate((selector) => {
                            const input = document.querySelector(
                                selector
                            ) as HTMLInputElement;
                            if (input) input.value = '';
                        }, config.selectors.captchaInput);

                        if (ruCaptchaReq) {
                            await this.page.type(
                                config.selectors.captchaInput,
                                ruCaptchaReq.data
                            );
                        }

                        await this.page.click(config.selectors.buttonVerify);

                        await this.page.waitForSelector(
                            config.selectors.succesMessage,
                            {
                                timeout: 1500,
                            }
                        );

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

            await this.page.click('button[type="submit"]');
            await this.page.waitForNavigation();
            await this.browser.close();
            console.log('Авторизация завершена успешно!');
        } catch (error: any) {
            console.error('Ошибка авторизации:', error.message);
            await this.browser.close();
        }
    }
}
