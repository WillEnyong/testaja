const puppeteer = require('puppeteer');
const { CronJob } = require('cron');
const axios = require('axios');
const readlineSync = require('readline-sync');
require('colors');

// URL faucet yang akan digunakan
const faucetUrl = 'https://faucet-app-pi.vercel.app/';

// Payload yang diperlukan
const payload = {
  address: "0x77ceaf3787263cf5407de2004de8f87b88e22c55",
  id: "48bc1eff-e7e2-4dc4-a6db-07cbc9d56fad",
  provider: "X",
  token: "0.o4C4k3yqTSVBf2I3Qj3bZwMJTHH97T53q5yqXrCHnNp-RpU-o-fNJtaL6DQD1bTWTDAG0SvOp_PxiAQVkheLJmrVAPkEOhfREraCd5RMgp4c9cLl7EOiE9NLDSCHaJsQt55B3b6q1z_Y6JX-kCc0ciHUvxx12VC8QfEDKqlPNZ6QT04yyiS8fG4leOFUInHp8BBOu8s0fH2aD-sL5CM_SORlzvjWBVKO4hUImEC4Mmokd6UNviApeRBlQBqL5-YZThtjfW0tthLR-0-QZMibccdXPz-IuGHrFxSg6RFe_F2hly-rWj-n1QWMjL9Ne5rKq_bjov3poCXHoIB6Z-QTPfDGZyGNfW-6JZ3aLglrYU2fl_Bppd7kcJDUAuzhMZkusNUiYaMAcB1GiMRr9cgnGnd8YI7aV1ZCpW5Kvftob_vxRHyHu_S3WL_WRmMwV230.rzOSZsHrzyQgh4EsZi7eVg.ecf7f12377a9e981cc2c86d4cbffbf99668caaf493b28d265ba236fdd2d104bc"
};

async function checkWebsite() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.goto(faucetUrl);

  // Isi formulir dengan payload
  await page.type('input[name="address"]', payload.address);
  await page.type('input[name="id"]', payload.id);
  await page.type('input[name="provider"]', payload.provider);
  await page.type('input[name="token"]', payload.token);

  // Kirim formulir
  await page.click('button[type="submit"]');

  // Tunggu dan tangani respons dari formulir
  try {
    await page.waitForSelector('div[role="alert"]', { timeout: 5000 });
    const alertElement = await page.$('div[role="alert"]');
    const alertMessage = await page.evaluate(el => el.textContent, alertElement);

    if (alertMessage.includes('success')) {
      console.log('Success: '.green + alertMessage.green);
    } else {
      console.log('Error: '.red + alertMessage.red);
    }
  } catch (error) {
    console.log('No alert found or timeout');
  } finally {
    await browser.close();
  }
}

function scheduleCronJob() {
  const job = new CronJob('0 */8 * * *', () => {
    console.log('Running cron job'.yellow);
    checkWebsite().then(() => {
      console.log('Cron job completed'.blue);
    }).catch(err => {
      console.log('Cron job failed: '.red + err.message);
    });
  });

  job.start();
  console.log('Cron job scheduled'.blue);
}

checkWebsite().then(() => {
  console.log('Initial status:'.cyan + ' Completed'.cyan);
  scheduleCronJob();
}).catch(err => {
  console.log('Initial check failed: '.red + err.message);
});
