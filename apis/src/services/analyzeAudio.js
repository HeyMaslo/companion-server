"use strict";
const cb = async function (error, retval) {
    if (error) {
        console.log(error);
        return;
    }
    console.log(retval);
    return retval;
}

const isValidAudioFile = function (fileName) {
    return fileName.toLowerCase().match(/\.(wav|mp3|m4a|ogg|aac)$/)
}

module.exports = async function analyzeAudio(req, res) {
    const speech = require('@google-cloud/speech');
    const fs = require('fs');
    const ffmpeg_static = require('ffmpeg-static');
    const ffmpeg = require('fluent-ffmpeg');
    const client = new speech.SpeechClient();
    const { textParse } = require('./analyzeText');

    // Validate audio file is present
    if (req.file === undefined) {
        res.status(500).send("nothing to do without any signal. which is fine.")
        return cb(new Error('no signal detected.'), false);
    }

    // Validate valid audio formats
    if (!isValidAudioFile(req.file.originalname)) {
        res.status(500).send("File fomrat not supported. Supported formats: MP3, WAV, M4A, AAC and OGG");
        return cb(new Error('File Format not supported'), false);
    }

    // Save Input file
    const audioFile = req.file;
    const originalFileName = `${Date.now()}${req.file.originalname}`;
    const originalFilePath = `./${originalFileName}`;
    let outputFile = originalFilePath;
    fs.writeFileSync(originalFilePath, audioFile.buffer);

    // Convert Audio file to LINEAR16 (.wav) If file is not in LINEAR16 (.wav) format
    if (!req.file.originalname.match(/\.(wav|WAV)$/)) {
        outputFile = './output.wav';
        try {
            await new Promise((resolve, reject) => {
                ffmpeg(originalFilePath)
                    .setFfmpegPath(ffmpeg_static)
                    .outputOptions([
                        '-channel_layout mono'
                    ])
                    .output(outputFile)
                    .on('end', () => { resolve(outputFile) })
                    .on('error', (error) => { reject(error); })
                    .run();
            });
        } catch (error) {
            res.status(500);
            return cb(new Error(error), false);
        }
    }

    // Porcess Audio File
    const file = fs.readFileSync(outputFile);
    const audioBytes = file.toString('base64');
    const audio = {
        content: audioBytes
    };
    const config = {
        model: 'default',
        maxAlternatives: 1,
        languageCode: 'en-US'
    };
    const request = {
        audio: audio,
        config: config
    };

    try {
        const [response] = await client.recognize(request);
        const transcription = response.results
            .map(result => result.alternatives[0].transcript)
            .join('\n');
        console.log(`Transcription: ${transcription}`);
        textParse(transcription, req, res);
    } catch (error) {
        console.log(error);
        res.status(500);
    } finally {
        // Delete used files
        fs.unlinkSync(originalFilePath);
        originalFilePath !== outputFile && fs.unlinkSync(outputFile);
    }
}