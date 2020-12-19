const express = require('express')
const app = express()
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const cors = require("cors");

const port = 3000

const { FormRecognizerClient, FormTrainingClient, AzureKeyCredential } = require("@azure/ai-form-recognizer");
const fs = require("fs");
var bodyParser = require('body-parser')

//swagger defination
const options = {
    swaggerDefinition: {
      info: {
        title: "Form Recognizer Azure API",
        version: "1.0.0",
        description: "Receipt text Recognizer ",
      },
      host: "localhost:3000",
      basePath: "/",
    },
    apis: ["./index.js"],
  };

const specs = swaggerJsdoc(options);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));


app.use(cors());

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

app.use(bodyParser.json())


const endpoint = "https://chandrakanth.cognitiveservices.azure.com/";
const apiKey = "e6bc561975194241b03fb9eb5110292f";


const trainingClient = new FormTrainingClient(endpoint, new AzureKeyCredential(apiKey));
const client = new FormRecognizerClient(endpoint, new AzureKeyCredential(apiKey));

app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())


//By this route you will get the form content

 /**
 * @swagger
 * /content:
 *    get:
 *      description: Enter the URL of the Receipt to recognize
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: Got response 
 *          500:
 *              description: Error
 *      parameters:
 *          - name: query
 *            in: path
 *            required: true
 *            type: string
 *
 */

//form content
app.get('/content',async (req, res) => {
 
    const formUrl = req.body.content;

    console.log(formUrl);

    const poller = await client.beginRecognizeContentFromUrl(formUrl);
    const pages = await poller.pollUntilDone();

    if (!pages || pages.length === 0) {
        throw new Error("Expecting non-empty list of pages!");
    }
    res.send(pages)
    for (const page of pages) {
        console.log(page)
        
    }

})



//This route will recognize receipts

/**
 * @swagger
 * /receipts:
 *    get:
 *      description: Enter the URL of the Receipt to recognize
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: Got response 
 *          500:
 *              description: Error
 *      parameters:
 *          - name: query
 *            in: path
 *            required: true
 *            type: string
 *
 */

app.get('/receipts',async (req, res) => {
    
    
        receiptUrl = req.body.receipt;
        const poller = await client.beginRecognizeReceiptsFromUrl(receiptUrl, {
            onProgress: (state) => { console.log(`status: ${state.status}`); }
        });
    
        const receipts = await poller.pollUntilDone();
    
        if (!receipts || receipts.length <= 0) {
            throw new Error("Expecting at lease one receipt in analysis result");
        }
        
        res.send(receipts)


    //     const receipt = receipts[0];
    //     console.log("First receipt:");
    //     const receiptTypeField = receipt.fields["ReceiptType"];
    //     if (receiptTypeField.valueType === "string") {
    //         console.log(`  Receipt Type: '${receiptTypeField.value || "<missing>"}', with confidence of ${receiptTypeField.confidence}`);
    //     }
    //     const merchantNameField = receipt.fields["MerchantName"];
    //     if (merchantNameField.valueType === "string") {
    //         console.log(`  Merchant Name: '${merchantNameField.value || "<missing>"}', with confidence of ${merchantNameField.confidence}`);
    //     }
    //     const transactionDate = receipt.fields["TransactionDate"];
    //     if (transactionDate.valueType === "date") {
    //         console.log(`  Transaction Date: '${transactionDate.value || "<missing>"}', with confidence of ${transactionDate.confidence}`);
    //     }
    //     const itemsField = receipt.fields["Items"];
    //     if (itemsField.valueType === "array") {
    //         for (const itemField of itemsField.value || []) {
    //             if (itemField.valueType === "object") {
    //                 const itemNameField = itemField.value["Name"];
    //                 if (itemNameField.valueType === "string") {
    //                     console.log(` Item Name: '${itemNameField.value || "<missing>"}', with confidence of ${itemNameField.confidence}`);
    //                 }
    //             }
    //         }
    //     }
    //     const totalField = receipt.fields["Total"];
    //     if (totalField.valueType === "number") {
    //         console.log(`  Total: '${totalField.value || "<missing>"}', with confidence of ${totalField.confidence}`);
    //     }
    
    
    // recognizeReceipt().catch((err) => {
    //     console.error("The sample encountered an error:", err);
    // });
   
})


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})