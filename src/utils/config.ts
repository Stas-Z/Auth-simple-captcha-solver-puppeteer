interface IUserData {
    email: string;
    password: string;
}
interface ISelectors {
    email: string;
    password: string;
    captchaSvg: string;
    captchaInput: string;
    buttonVerify: string;
    succesMessage: string;
}
interface IConfig {
    loginUrl: string;
    selectors: ISelectors;
    userData: IUserData;
    attempts: number;
    rucaptchaKey: string;
}

export const config: IConfig = {
    loginUrl: 'http://localhost:8080/auth', // Укажите URL страницы авторизации
    selectors: {
        email: '#basic_email', // Селектор для инпута email
        password: '#basic_password', // Селектор для инпута пароля
        captchaSvg: '.captcha > div > svg', // Селектор для картинки капчи
        captchaInput: 'input[placeholder="Введите текст с картинки"]', // Селектор для инпута капчи
        buttonVerify: '.ant-input-search-button', // Селектор для кнопки проверки капчи
        succesMessage: '.ant-typography-success', // Селектор для email
    },
    userData: {
        email: 'test@test.ru', // Ваш email
        password: 'A2345678*', // Ваш пароль
    },
    attempts: 5, // количество попыток для решения капчи
    rucaptchaKey: 'YOUR_API_KEY', // Ваш API-ключ 2Captcha
};
