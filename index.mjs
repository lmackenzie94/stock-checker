import puppeteer from 'puppeteer';
import twilio from 'twilio';
import cron from 'node-cron';

// Products JSON
import products from './products.json' with { type: 'json' };

// Twilio config
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioFrom = process.env.TWILIO_FROM;
const twilioTo = process.env.TWILIO_TO;

const client = new twilio(accountSid, authToken);

async function checkProduct(product) {
  const { name, url, size } = product;
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  const sizeSelector = `input[type="radio"][value="${size}"]`;

  await page.waitForSelector(sizeSelector, {
    timeout: 10000
  });

  const isOutOfStock = await page.$eval(sizeSelector, el =>
    el.classList.contains('disabled')
  );

  await browser.close();

  return {
    name,
    size,
    isOutOfStock
  };
}

async function sendSMSNotification(summary) {
  try {
    const message = await client.messages.create({
      body: summary,
      from: twilioFrom,
      to: twilioTo
    });
    console.log('📱 SMS sent! SID:', message.sid);
  } catch (error) {
    console.error('🚨 Failed to send SMS:', error.message);
  }
}

// Run check at 9am and 9pm EST
cron.schedule(
  '0 9,21 * * *',
  () => {
    console.log(`⏰ Running check at ${new Date().toLocaleString()}`);
    checkStock();
  },
  {
    timezone: 'America/New_York'
  }
);

const getSummary = results => {
  return results
    .map(({ name, size, isOutOfStock }) =>
      isOutOfStock
        ? `❌ ${name} (Size ${size}) is still out of stock.`
        : `🔥 ${name} (Size ${size}) is BACK IN STOCK!`
    )
    .join('\n\n');
};

const checkStock = async () => {
  const results = [];

  for (const product of products) {
    const status = await checkProduct(product);
    results.push(status);
  }

  const summary = getSummary(results);

  await sendSMSNotification(summary);
};

// Run once on startup
checkStock();
