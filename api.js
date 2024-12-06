const express = require('express');
const { LanguageServiceClient } = require('@google-cloud/language');
const { Translate } = require('@google-cloud/translate').v2;
const _ = require('lodash');
const cors = require("cors");

const data = require('./data/data_en.json'); // Dataset bahasa Inggris
const data_id = require('./data/data.json'); // Dataset bahasa Indonesia

const app = express();
app.use(cors())
app.use(express.json())
const port = 3000;

const languageClient = new LanguageServiceClient();
const translateClient = new Translate();

// Middleware untuk parsing JSON
app.use(express.json());

/**
 * Terjemahkan teks dari bahasa Indonesia ke Inggris
 */
async function translateToEnglish(text) {
    const [translation] = await translateClient.translate(text, 'en');
    return translation;
}

/**
 * Analisis gejala menggunakan Google NLP
 */
async function analyzeSymptoms(input) {
    const document = {
        content: input,
        type: 'PLAIN_TEXT',
    };

    const [result] = await languageClient.analyzeEntities({ document });
    return result.entities.map((entity) => entity.name.toLowerCase());
}

/**
 * Cari data terkait rempah berdasarkan entitas yang diidentifikasi
 */
function findMatchingSpices(entities) {
    const matches = [];

    entities.forEach((entity) => {
        data.forEach((item, index) => {
            const matchedDiseases = item.diseases.filter((disease) =>
                disease.toLowerCase().includes(entity)
            );

            if (matchedDiseases.length > 0) {
                matches.push({
                    index,
                    relevance: matchedDiseases.length,
                });
            }
        });
    });

    // Urutkan berdasarkan relevansi
    const sortedMatches = _.orderBy(matches, ['relevance'], ['desc']);

    // Ambil hanya 3 hasil teratas
    return sortedMatches.slice(0, 3).map((match) => data_id[match.index]);
}

/**
 * Endpoint POST untuk prediksi
 */
app.post('/predict', async (req, res) => {
    try {
        const { symptoms } = req.body;
        if (!symptoms) {
            return res.status(400).json({ error: 'Symptoms are required.' });
        }

        // Step 1: Terjemahkan gejala ke Inggris
        const translatedSymptoms = await translateToEnglish(symptoms);

        // Step 2: Analisis gejala dengan NLP
        const entities = await analyzeSymptoms(translatedSymptoms);

        // Step 3: Cari data terkait rempah
        const matchingResults = findMatchingSpices(entities);

        // Step 4: Kembalikan hasil dalam format JSON
        return res.json({
            symptoms,
            entities,
            results: matchingResults,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while processing the request.' });
    }
});

/**
 * Start server
 */
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
