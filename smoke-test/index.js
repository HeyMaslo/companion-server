'use strict';
const axios = require('axios');
const fs = require('fs-extra');
const _ = require('lodash');
const FormData = require('form-data');
const async = require('async');
const path = require('path');
var os = require('os');
var flatten = require('flat');



(async function main() {

   const ws = fs.createWriteStream('./Bath-results.json');
   ws.on('error', function (err) {
      console.error(err);
   });

   try {
      const tasks = [];
      const files = await getFiles('./images/Bathroom Selfie');
      files.forEach((f) => tasks.push(async () => processImage(ws, f)));
      await async.parallelLimit(tasks, 1);
   }
   catch(err) {
      console.error(err);
   }
   finally {
      ws.close( );
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


async function processImage(ws,filePath) {
   console.log( `Processing ${filePath}` );
   try {
      const endpoint = "http://localhost:8080/analyzeMedia";
      const form = new FormData();
      form.append('media', fs.createReadStream(filePath));
      form.append('originMediaID',filePath);
      form.append('timeOut',25000);
      form.append('modelsToCall','{"imageMeta": 1,"imageSceneOut": 1,"imageObjects": 1,"imageTox": 1,"imagePose": 1,"faces": 1,"photoManipulation": 1}');
      //form.append()


      const response = await axios.post(endpoint, form, { headers: form.getHeaders() });
      await trackResult(ws, filePath, response);
      return response;
   }
   catch(e) {
      console.error(e);
   }
}

async function trackResult( ws, filePath, response) {
   ws.write(`${JSON.stringify(flatten(_.get(response,'data')),null,null)},${os.EOL}`);
}
