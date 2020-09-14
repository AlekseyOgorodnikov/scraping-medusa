const fs = require('fs')
const axios = require('axios')
const cheerio = require('cheerio')

const link = 'https://www.muztorg.ru/category/akusticheskie-gitary?page='

const parseMuztorg = async () => {
    try {
        let arrayProducts = []
        let i = 1
        let flag = false
        while (true) {
            console.log('step - ', i)
            await axios.get(link + i).then(res => res.data).then(res => {
                let html = res
                $ = cheerio.load(html)
                let pagination = $('li.next.disabled').html()
                $(html).find('section.product-thumbnail').each((index, element) => {
                    let item = {
                        price: $(element).find('p.price').text().replace(/\s+/g, ''), //delete symbol
                        name: $(element).find('div.title').text().trim(), //delet symbol
                        img: $(element).find('img.img-responsive').attr('data-src')
                    }
                    arrayProducts.push(item)
                })
                //checking the end of pagination
                if (pagination !== null) {
                    flag = true
                }
            })
                .catch(error => console.log(error))
            // exite if flag true
            if (flag) {
                console.log(('Value product items', arrayProducts.length));
                fs.writeFile('./json/muztorg.json', JSON.stringify({ arrayProducts }), function (error) {
                    if (error) throw error
                    console.log('FILE SAVED');
                })
                break
            }
            i++
        }
    } catch (error) {
        console.log('ERROR__PROGRAM', error);
    }
}
parseMuztorg()