const jsdom = require("jsdom");
const { JSDOM } = jsdom;

JSDOM.fromURL('https://www.kinopoisk.ru/comingsoon/digital/')
    .then(dom => {
        const { document } = dom.window;
        const releases = document.querySelectorAll('.premier_item')
        releases.forEach(release => {
            const date = release.querySelector('meta[itemProp="startDate"]').getAttribute('content');
            const name_ru = release.querySelector('.name a');
            const name_en = name_ru.parentNode.nextSibling.nextSibling;
            console.log(`${name_ru.textContent} | ${name_en.textContent.replace(/\s\(20[0-9]{2}\)/, '')} | ${new Date(date)}`)
        })
    })
    .catch(error => {
        console.log(error);
    });