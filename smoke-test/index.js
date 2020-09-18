'use strict';
const axios = require('axios');
const fs = require('fs-extra');
const _ = require('lodash');
const FormData = require('form-data');
const async = require('async');
const path = require('path');
var os = require('os');
var flatten = require('flat');
const minimist = require('minimist');
const ora = require('ora');
const logSymbols = require('log-symbols');

const args = minimist(process.argv.slice(2))
const help = `
   USAGE: 
   node index.js <options>

   --source, -s ..... Images source directory
   --output, -o ..... Output file (optional, default is [UTC Date in ms].json)
   --port, -p   ..... The port of the local hosted instance to run against (optional, default = 8080)
`

if (args.s === undefined) {
   console.log(help);
   process.exit(0);
}
const sourceFolder = args.source || args.s;
const outputFile = (args.output === undefined && args.o === undefined) ?`${Date.now().toString()}.json` : args.output || args.o;
const port = (args.port === undefined && args.p === undefined) ? 8080 : args.port || args.p;
let totalFiles = 0, totalSuccess = 0, totalError = 0, processed = 0;

(async function main() {

   const ws = fs.createWriteStream(`./${outputFile}`);
   ws.on('error', function (err) {
      console.error(err);
   });

   try {
      var i = 0;
      const tasks = [];
      const files = await getFiles(sourceFolder);
      totalFiles = files.length;
      const spinner = ora({text: `Processing ${totalFiles} images`, spinner: 'star'});
      spinner.render();
      files.forEach((f) => tasks.push(async () => processImage(ws, f, spinner)));
      //spinner.stop();
      await async.parallelLimit(tasks, 1);
   }
   catch (err) {
      console.error(err);
   }
   finally {
      ws.close();
      console.log(`
:: RESULTS ::
 - ${logSymbols.info} Total images processed: ${totalFiles}
 - ${logSymbols.success} Total success: ${totalSuccess}
 - ${logSymbols.error} Total errors: ${totalError}
      `);
   }
})();


async function getFiles(dir) {
   function flatten(arr) {
      return arr.reduce((flat, toFlatten) => flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten), []);
   }

   const files = await fs.readdir(dir);
   return Promise.all(files
      .map(f => path.join(dir, f))
      .map(async f => {
         const stats = await fs.stat(f);
         return stats.isDirectory() ? getFiles(f) : f;
      })).then(flatten);
}


async function processImage(ws, filePath, spinner) {   
   try {
      const endpoint = `http://localhost:${port}/analyzeMedia`;
      const form = new FormData();
      form.append('media', fs.createReadStream(filePath));
      form.append('originMediaID', filePath);
      form.append('timeOut', 25000);
      form.append('modelsToCall', '{"imageMeta": 1,"imageSceneOut": 1,"imageObjects": 1,"imageTox": 1,"imagePose": 1,"faces": 1,"photoManipulation": 1}');     
      spinner.start(`Processing ${filePath}`);

      const response = await axios.post(endpoint, form, { headers: form.getHeaders() });
      totalSuccess++;
      processed = totalError + totalSuccess;     
      spinner.succeed(`${filePath} processed successfully, ${processed}/${totalFiles}`);
      await trackResult(ws, filePath, response);
      return response;
   }
   catch (e) {
      spinner.fail(`${filePath} processing failed, ${processed}/${totalFiles}`);
      totalError++;
      processed = totalError + totalSuccess;     
   } finally {
      //spinner.stop();
      // console.clear();
      // console.log(`Processed ${processed}/${totalFiles}`);
      // console.log(`Total Success: ${totalSuccess}`);
      // console.log(`Total Error: ${totalError}`);
   }
}

async function trackResult(ws, filePath, response) {
   ws.write(`${JSON.stringify(flatten(_.get(response, 'data')), null, null)},${os.EOL}`);
}
