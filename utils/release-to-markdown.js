// TODO: add test and comments

const releaseToMarkdown = (release) => {
    let output = '';
    const { name, rating } = release;
    const { ru: nameRu, en: nameEn } = name || {};
    const {
        kinopoisk_score: kpScore,
        metacritic_score: mcScore,
        metacritic_user_score: mcuScore,
    } = rating || {};
    output += `Теперь "*${nameRu || nameEn}" ${nameRu && nameEn ? `(${nameEn})` : ''}* доступен в качестве.\r\n`;
    if (kpScore) output += `_Кинопоиск: ${kpScore}_\r\n`;
    if (mcScore) output += `_Метакритик: ${mcScore}${mcuScore ? ` | ${mcuScore}` : ''}_`;
    return output;
};

module.exports = releaseToMarkdown;
