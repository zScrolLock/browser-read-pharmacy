const express = require('express');
const puppeteer = require('puppeteer');
const dotenv = require('dotenv/config')

const app = express();

app.get("/:url/:session/:type/:pageNumber", async (request, response) => {
	const { url, session, type, pageNumber } = request.params;
    if(!url || !session || !type) return response.status(400).json({
        ok: false,
        status: 404,
        message: 'params should be send'
    })

    try {
        let browserInstance = await puppeteer.launch({
	        headless: false,
	        args: ["--disable-setuid-sandbox"],
	        'ignoreHTTPSErrors': true
	    });

        let page = await browserInstance.newPage();
		await page.goto(`https://${url}/${session}/${type}/c${pageNumber === '' ? '' : `?pagina=${pageNumber}`}`);

		const titleList = await page.evaluate(() => {
			const elements = document.querySelectorAll('div div h2 a span');
			const array = [...elements];
			const list = array.map(title => title.innerText)
			console.log(list)

			return list;
		});

        await browserInstance.close();

        return response.status(200).json({
            ok: true,
            code: 200,
            list: titleList
        })

	} catch (err) {
	    console.log("Could not create a browser instance => : ", err);
	}
})

app.listen(process.env.PORT, () => console.log(`Server is Running on ${process.env.PORT}`))