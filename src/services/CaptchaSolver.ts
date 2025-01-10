import * as TwoCaptcha from '@2captcha/captcha-solver';
import { readFileAsBase64 } from '../utils/file.util';

export class CaptchaSolver {
    private solver: TwoCaptcha.Solver;

    constructor(apiKey: string) {
        this.solver = new TwoCaptcha.Solver(apiKey);
    }

    public async solveCaptcha(imagePath: string) {
        const imageBase64 = readFileAsBase64(imagePath);

        try {
            const result = await this.solver.imageCaptcha({
                body: imageBase64,
                numeric: 4,
                min_len: 6,
                max_len: 6,
            });

            console.log('Получаем решение капчи:', result.data);
            return result;
        } catch (error: any) {
            console.error('Не удалось решить капчу.');
        }
    }
}
