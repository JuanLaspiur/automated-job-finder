require('dotenv').config();
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false, // Desactiva el modo headless para simular un navegador real
    executablePath: 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
    defaultViewport: null,
    args: ['--start-maximized'],
  });

  const page = await browser.newPage();

  // Establecer un user-agent realista
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  );

  // Deshabilitar características que pueden indicar que es una automatización
  await page.evaluateOnNewDocument(() => {
    // Evitar que Puppeteer sea detectable
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });

  // Accedemos a la página de inicio de sesión de LinkedIn
  await page.goto('https://www.linkedin.com/login', { waitUntil: 'domcontentloaded' });

  // Ingresar el correo electrónico
  await page.type('input[name="session_key"]', process.env.LINKEDIN_EMAIL); 

  
  // Ingresar la contraseña desde el archivo .env
  await page.type('input[name="session_password"]', process.env.LINKEDIN_PASSWORD); 
  
  // Esperamos que el botón "Iniciar sesión" sea visible y hacemos clic
  await page.waitForSelector('.btn__primary--large', { visible: true, timeout: 10000 });
  await page.click('.btn__primary--large');
  
  // Esperamos un poco para asegurarnos de que la sesión se haya iniciado
  await new Promise(resolve => setTimeout(resolve, 3000));

  await page.goto('https://www.linkedin.com/jobs', { waitUntil: 'domcontentloaded' });

  // Aceptar cookies si aparecen
  try {
    await page.click('button[aria-label="Aceptar cookies"]');
  } catch (e) {}

  // Esperamos input
  const inputSelector = 'input[placeholder="Cargo, aptitud o empresa"]';
  await page.waitForSelector(inputSelector, { visible: true });

  // Enfocar y escribir
  await page.click(inputSelector);
  await page.type(inputSelector, 'Desarrollador React');
  await page.keyboard.press('Enter');

  // Esperamos resultados
  await new Promise(resolve => setTimeout(resolve, 5000));

  await page.waitForSelector('.job-card-container__link', { visible: true, timeout: 10000 });

  const jobTitles = await page.evaluate(() => {
    const titles = [];
    document.querySelectorAll('.job-card-container__link').forEach(el => {
      const title = el.querySelector('h3, span, div');
      if (title) {
        titles.push(title.innerText.trim());
      }
    });
    return titles;
  });

  console.log('Trabajos encontrados:', jobTitles);
})();
