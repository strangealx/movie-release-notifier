const kinopoiskDigitalReleaseParser = require('./app/Parser/KinopoiskDigitalReleaseParser');
const metacriticReleaseParser = require('./app/Parser/MetacriticReleaseParser');
const db = require('./app/db/connection');
const Release = require('./app/db/models/ReleaseModel');

const parses = [
    kinopoiskDigitalReleaseParser.getList(),
    metacriticReleaseParser.getList()
];

Promise.all(parses)
    .then((release_list) => {
        unique_list = Array.prototype
            .concat(...release_list)
            .filter((release, filter_index, self) => {
                return !(self.find((item, find_index) => {
                    return (
                        (
                            item.name.en && item.name.en === release.name.en ||
                            item.name.ru && item.name.ru === release.name.ru
                        ) && 
                        filter_index !== find_index
                    )
                }));
            });
        unique_list.forEach((release, index) => {
            const tmp = new Release(release);
            tmp.saveOrUpdate() 
                .then((doc) => {
                    console.log(index, doc)      
                })
                .catch(console.error.bind(console, 'saveOrUpdate error: '));
        })
    })
    .catch(console.error.bind(console, 'parse error: '));