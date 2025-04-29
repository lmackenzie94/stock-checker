# Black Toe Stock Checker

Checks the stock of Black Toe Running products, using

- `Puppeteer` (to scrape the website)
- `Twilio` (to send myself text messages)
- `Node.js` (to run the script)
- `PM2` (to manage the script)
- `node-cron` (to run the script at 10am and 6pm EST every day)
- a `.json` file of products to check

## Setup (on AWS EC2)

- SSH into the EC2 instance (`ssh -i "aws-ec2-lukes-macbook.pem" [instance Public DNS]`)
- update packages: `sudo apt update`
- upgrade packages: `sudo apt upgrade -y`
- clone the repo: `git clone https://github.com/luke-s-macbook/stock-checker.git`
- `cd stock-checker`
- install dependencies: `npm install`
- add `.env` file
- install Chromium browser (`sudo apt install -y chromium-browser`)
- install Puppeteer dependencies (see list [here](https://www.browserless.io/blog/puppeteer-on-aws-ec2))
- start the script with PM2: `pm2 start index.mjs --interpreter node --name "stock-checker"`
- save the PM2 config: `pm2 save`
- configure PM2 to start on boot: `pm2 startup`

### Helpful PM2 commands

- `pm2 list`
- `pm2 logs stock-checker`
- `pm2 stop stock-checker`
- `pm2 delete stock-checker`

## Deployment (to AWS EC2)

- `ssh -i "aws-ec2-lukes-macbook.pem" [instance Public DNS]`
- `cd stock-checker`
- `git pull`
- `pm2 restart stock-checker`
