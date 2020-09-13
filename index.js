const fs = require('fs')
const puppeteer = require('puppeteer')

let link = 'https://meduza.io'

const parseWebView = async (click) => {
    try {
        //setting puppeteer
        const browser = await puppeteer.launch({
            headless: true,
            slowMo: 100,
            devtools: true
        });
        const page = await browser.newPage();
        await page.setViewport({
            width: 1920,
            height: 1080
        })
        await page.goto(link);
        //give selector in page
        const selector = await page.$('div.InfoPanel-switcher')
        await selector.click()
        await page.waitForSelector('div.Chronology-wrapper')
        //click button show more
        for (let i = 0; i < click; i++) {
            const button = await page.$('button.Button-root.Button-default.Button-gold')
            await button.click()
        }
        let html = await page.evaluate(async () => {
            let result = []
            let container = await document.querySelectorAll('div.Chronology-item')
            //method forEach for element of massive
            container.forEach(element => {
                let title = element.querySelector('div.ChronologyItem-header').innerText
                let time = element.querySelector('time.Timestamp-root').innerText
                let link = element.querySelector('a.ChronologyItem-link').href
                let img
                try {
                    img = element.querySelector('div.ChronologyItem-image').getAttribute('style')
                } catch (error) {
                    img = null
                }
                //add atrtribute to massive
                result.push({ title, time, link, img })
            });
            return result
        })
        //go to link news in page cycle
        for (let i = 0; i < html.length; i++) {
            await page.goto(html[i].link, { waitUntil: 'domcontentloaded' })
            await page.waitForSelector('div.GeneralMaterial-article').catch(err => console.log(err))
            //step in console
            console.log(i)
            let article = await page.evaluate(async () => {
                let article = null
                try {
                    article = document.querySelector('div.GeneralMaterial-article').innerText
                } catch (error) {
                    article = null
                }
                return article
            })
            html[i]['text'] = article
        }
        // console.log('news length -', html.length);
        //write file with json formate
        fs.writeFile('medusa.json', JSON.stringify({html}), function (err) {
            if (err) throw err
            console.log('Saved file medusa.json');
        })
        //result and exit for browser
        await page.screenshot({ path: 'example.png' });
        await browser.close();
    } catch (error) {
        console.log(error);
        await browser.close();
    }
}
parseWebView(0)