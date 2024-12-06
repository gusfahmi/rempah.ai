const { LanguageServiceClient } = require('@google-cloud/language');
const { Translate } = require('@google-cloud/translate').v2;
const _ = require('lodash');
const data = require('./data/data_en.json');
const data_id = require('./data/data.json');

const languageClient = new LanguageServiceClient();
const translateClient = new Translate();

async function translateToEnglish(text) {
    const [translation] = await translateClient.translate(text, 'en');
    return translation;
}
    

async function analyzeSymptoms(input) {
    const document = {
        content: input,
        type: 'PLAIN_TEXT',
    };

    const [result] = await languageClient.analyzeEntities({ document });
    return result.entities.map((entity) => entity.name.toLowerCase());
}

function findMatchingSpices(entities) {
    const matches = [];

    entities.forEach((entity) => {
        data.forEach((item, index) => {  // Track index
            const matchedDiseases = item.diseases.filter(disease =>
                disease.toLowerCase().includes(entity)
            );

            if (matchedDiseases.length > 0) {
                matches.push({
                    index,   // Save the index of the matched item
                    relevance: matchedDiseases.length // Jumlah kecocokan
                });
            }
        });
    });

    // Urutkan berdasarkan relevansi (jumlah penyakit yang cocok) secara menurun
    const sortedMatches = _.orderBy(matches, ['relevance'], ['desc']);

    // Ambil hanya 3 hasil teratas
    return sortedMatches.slice(0, 3).map(match => match.index);  // Return only the indices
}



async function run(symptoms) {
    try {
        // Step 1: Translate symptoms to English
        const translatedSymptoms = await translateToEnglish(symptoms);

        // Step 2: Analyze symptoms in English
        const entities = await analyzeSymptoms(translatedSymptoms);

        // Step 3: Find matching spices and get the indices
        const matchingIndices = findMatchingSpices(entities);

        // Step 4: Return only the indices of the matched items
        console.log(matchingIndices); 
        matchingIndices.map((dataSpice) => {
            console.log(data_id[dataSpice])
        })


    } catch (error) {
        console.error(error);
    }
}

run("mata lelah dan sulit tidur");
