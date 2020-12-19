const { FormRecognizerClient, FormTrainingClient, AzureKeyCredential } = require("@azure/ai-form-recognizer");
const fs = require("fs");
const request = require('request');
const express = require("express");
const router = express.Router();
const endpoint = "https://chandrakanth.cognitiveservices.azure.com/";
const apiKey = "e6bc561975194241b03fb9eb5110292f";

const trainingClient = new FormTrainingClient(endpoint, new AzureKeyCredential(apiKey));
const client = new FormRecognizerClient(endpoint, new AzureKeyCredential(apiKey));



const recognizeContent= async function (req, res) {
    console.log('in this path')
    if(req.body && req.body.url){
        const poller = await client.beginRecognizeContentFromUrl(req.body.url);
        const pages = await poller.pollUntilDone();
        if (!pages || pages.length === 0) {
            throw new Error("Expecting non-empty list of pages!");
        }       
        res.status(200).json(pages);
    }  
    else{
        res.status(400).send("No input parameters");
    }
}

const recognizeReceipt= async function (req, res) {
    if(req.body && req.body.url){
        const poller = await client.beginRecognizeReceiptsFromUrl(req.body.url, {
            onProgress: (state) => { console.log(`status: ${state.status}`); }
        });
    
        const receipts = await poller.pollUntilDone();
    
        if (!receipts || receipts.length <= 0) {
            throw new Error("Expecting at lease one receipt in analysis result");
        }

        res.status(200).json(receipts);
    }
    else{
        res.status(400).send("No input parameters");
    } 
}

/**
* @swagger
* /api/v1/recognizeContent:
*   post:
*     description: Recognizes the form data when an url of an file is passed.
*     parameters:
 *       - name: url
 *         in: formData
 *         type: string
 *         required: true     
*     responses:
*       '200':
*         description: OK
*/
router.post('/recognizeContent', recognizeContent);

/**
* @swagger
* /api/v1/recognizeReceipt:
*   post:
*     description: Recognizes the data from the receipts when an url is passed.
*     parameters:
 *       - name: url
 *         in: formData
 *         type: string
 *         required: true     
*     responses:
*       '200':
*         description: OK
*/
router.post('/recognizeReceipt', recognizeReceipt);

module.exports = router;