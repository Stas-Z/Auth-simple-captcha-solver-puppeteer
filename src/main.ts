import { AuthService } from './services/AuthService';
import { CaptchaSolver } from './services/CaptchaSolver';
import { config } from './utils/config';

async function startApp() {
    const solver = new CaptchaSolver(config.rucaptchaKey);
    const authService = new AuthService(solver);

    try {
        await authService.login();
    } catch (error: any) {
        console.error('Ошибка приложения:', error.message);
    }
}

startApp();
