# @heymaslo/companionserver

![](https://cdn-images-1.medium.com/max/1600/1*Gm7A7w4vJZeNXKHJQxhq7Q.gif)

version: 1.03  
authors: Russel Foltz-Smith, Mark Ziler

## Overview of the APIs
Maslo Companion Server is a set of signal processing APIs for numerous types of data  
  
Response formats: JSON  
Requires Authentication? Yes (user context only)  
Rate limited? Yes, but up to you
Request Formats: Requests should be either multipart/form-data or application/x-www-form-urlencoded or application/json POST formats 

### Limits and Assumptions

Right now the default setting is a 10 second timeout for any response.

There's no file size limit really, but once you get above 20MB image files you get much slower responses, and will need to hit individual facet APIs

## TODOS as of 8/5/2020

* perform much more rigorous smoke tests

  
## AnalyzeMedia  

**Purpose:** AnalyzeMedia accepts media files (currently images) and returns detailed signal analysis on the image quality, subject matter, scenic context, human subject pose/sentiment/emotion, etc.  

API endpoint: /analyzeMedia  POST  

### Request:  
| Field Name | Required? | Description | Example | Notes |
| ---------- | --------- | ----------- | ------- | ----- |
| media | Required | Raw binary of file to be uploaded.  Can include multiple, each to be analyzed individually. |  | max size = 30MB/file, max 50 files per payload.  Limited to image files currently |
| type | required | Type of media, as a backstop for mimetype detection problems.  values: image, video, audio. | "image" |  |
| originMediaID |  | originMediaID to be passed back in response. (GUID) | 062fea4d-efdd-4a7f-92b1-4039503efd5b | GUID or INT |

**Sample cURL Post:**  
```javascript

curl --location --request POST 'http://localhost:8080/analyzeMedia' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'media=fileBlob' \
--data-urlencode 'type=image/jpg' \
--data-urlencode 'originalMediaID=sadfadsfasdfasdfasdf'

```

Call with specifying parsers... set them to 1 or 0.
```javascript
curl --location --request POST 'localhost:8080/analyzeMedia' \
--form 'media=@/home/bigdatakane/Downloads/russ.jpg' \
--form 'type=image/jpeg' \
--form 'originMediaID=sdfsadfasdf' \
--form 'modelsToCall={"imageMeta": 1,"imageSceneOut": 1,"imageObjects": 1,"imageTox": 1,"imagePose": 1,"faces": 1,"photoManipulation": 1}'
```

```javascript
curl --location --request POST 'localhost:8080/analyzeText' \
--form 'media=this is some next to parse out' \
--form 'originTextID=sdfsadfasdf'
```



### Response:  

#### Development JSON to see everything that you can get

  ````json
    {
      "originMediaID": "sdfsadfasdf",
      "mediaID": 1596611292388,
      "imageMeta": {
          "mediaDominantColors": [
              "#241c3c",
              "#e8e2e5",
              "#ca6b93",
              "#797284",
              "#8c8c9c"
          ],
          "mediaImageResolution": {
              "height": 6100,
              "width": 4826
          },
          "mediaColorComponents": 3,
          "mediaVisualFocus": {
              "sharpness": 2.58286836559248,
              "entropy": 0.32326588085663843
          },
          "mediaFileSize": 29438600,
          "mediaCompressionSize": 1786168,
          "mediaCompressionPercentage": 0.5962136981399615
      },
      "imageScene": {
          "timeOfDay": [
              {
                  "label": "day",
                  "prob": 0.3596724569797516
              },
              {
                  "label": "night",
                  "prob": 0.640327513217926
              }
          ],
          "mediaEstimatedCreationDate": 2018,
          "scenes": [
              {
                  "className": "web site, website, internet site, site",
                  "probability": 0.36944136023521423
              },
              {
                  "className": "oscilloscope, scope, cathode-ray oscilloscope, CRO",
                  "probability": 0.27173900604248047
              },
              {
                  "className": "menu",
                  "probability": 0.06177492067217827
              }
          ]
      },
      "imageObjects": {
          "objects": [],
          "isAnimal": {},
          "objectCountsbyClass": {}
      },
      "personsClothed": {
          "nsfw": [
              {
                  "className": "Drawing",
                  "probability": 0.6883856654167175
              },
              {
                  "className": "Neutral",
                  "probability": 0.28163206577301025
              },
              {
                  "className": "Hentai",
                  "probability": 0.0251615010201931
              },
              {
                  "className": "Porn",
                  "probability": 0.004142370540648699
              },
              {
                  "className": "Sexy",
                  "probability": 0.0006782863638363779
              }
          ]
      },
      "poses": {
          "pose": "unknown",
          "poseLandmarks": {
              "score": 0.004558422986198874,
              "keypoints": [
                  {
                      "score": 0.0023506879806518555,
                      "part": "nose",
                      "position": {
                          "x": 3170.9326599358587,
                          "y": 1713.030538358577
                      }
                  },
                  {
                      "score": 0.0033444464206695557,
                      "part": "leftEye",
                      "position": {
                          "x": 3332.4935913085938,
                          "y": 1666.5859401123998
                      }
                  },
                  {
                      "score": 0.003358393907546997,
                      "part": "rightEye",
                      "position": {
                          "x": 3320.5679392536326,
                          "y": 1708.5808736007039
                      }
                  },
                  {
                      "score": 0.002811521291732788,
                      "part": "leftEar",
                      "position": {
                          "x": 3386.722567665902,
                          "y": 1685.7760700864087
                      }
                  },
                  {
                      "score": 0.0033711791038513184,
                      "part": "rightEar",
                      "position": {
                          "x": 3272.513660475438,
                          "y": 1726.2544016559764
                      }
                  },
                  {
                      "score": 0.0041789710521698,
                      "part": "leftShoulder",
                      "position": {
                          "x": 3440.5527908978297,
                          "y": 1728.6306225965923
                      }
                  },
                  {
                      "score": 0.003952294588088989,
                      "part": "rightShoulder",
                      "position": {
                          "x": 3359.777214554961,
                          "y": 1701.4062147326044
                      }
                  },
                  {
                      "score": 0.001736968755722046,
                      "part": "leftElbow",
                      "position": {
                          "x": 6104.130951996443,
                          "y": 3513.10699557887
                      }
                  },
                  {
                      "score": 0.0017170906066894531,
                      "part": "rightElbow",
                      "position": {
                          "x": -140.22285168272975,
                          "y": 4992.490869425615
                      }
                  },
                  {
                      "score": 0.0018764734268188477,
                      "part": "leftWrist",
                      "position": {
                          "x": 6085.711527427347,
                          "y": 3518.3393174702096
                      }
                  },
                  {
                      "score": 0.0017620325088500977,
                      "part": "rightWrist",
                      "position": {
                          "x": 311.55222733197047,
                          "y": 4997.30669168554
                      }
                  },
                  {
                      "score": 0.0053012073040008545,
                      "part": "leftHip",
                      "position": {
                          "x": 5611.601304822395,
                          "y": 3473.210314798912
                      }
                  },
                  {
                      "score": 0.0069543421268463135,
                      "part": "rightHip",
                      "position": {
                          "x": 364.5528919501991,
                          "y": 5071.319038361427
                      }
                  },
                  {
                      "score": 0.0103912353515625,
                      "part": "leftKnee",
                      "position": {
                          "x": 4142.0902831081285,
                          "y": 5329.176133211485
                      }
                  },
                  {
                      "score": 0.012447476387023926,
                      "part": "rightKnee",
                      "position": {
                          "x": 4091.5801051989606,
                          "y": 5314.236834693048
                      }
                  },
                  {
                      "score": 0.006208509206771851,
                      "part": "leftAnkle",
                      "position": {
                          "x": 3811.0542030186043,
                          "y": 5303.668609262904
                      }
                  },
                  {
                      "score": 0.005730360746383667,
                      "part": "rightAnkle",
                      "position": {
                          "x": 4196.607911818686,
                          "y": 5360.081492383193
                      }
                  }
              ]
          }
      },
      "faces": {
          "allFaces": [],
          "faceCount": 0,
          "personsCount": 0,
          "primarySubjectFaceVisible": {
              "visibility": 0
          },
          "secondarySubjectFaceVisible": {
              "visibility": 0
          }
      },
      "photoManipulation": {
          "manipulations": [
              {
                  "label": "selfie",
                  "prob": 0.022118110209703445
              },
              {
                  "label": "photoshop",
                  "prob": 0.7302350401878357
              },
              {
                  "label": "candid",
                  "prob": 0.08618035167455673
              },
              {
                  "label": "instagram",
                  "prob": 0.13251258432865143
              },
              {
                  "label": "snapchat",
                  "prob": 0.028953898698091507
              }
          ]
      }
  }
  ````


#### The "Summarized" JSON
| Field Name | Required? | Description | Example | Notes |
| ---------- | --------- | ----------- | ------- | ----- |
| originMediaID | Required | Echo back originMediaID that was passed in | 062fea4d-efdd-4a7f-92b1-4039503efd5b |  |
| mediaID | Required | Will be an auto-generated fingerprinted/hash GUID of media analyzed. | 062fea4d-efdd-4a7f-92b1-4039503efd5b |  |
| scenes |  | Scene contexts returned as tags with salience values | "travel photo", "outside" |  |
| timeOfDay |  | Tag for general daypart: night, evening, afternoon, midday, morning | "morning" |  |
| emotionTags |  |  Emotion label(s) returned as tags with salience values | "sad", "happy", "laughing" | Suppress responses with personsCount > 2.  For future tuning, we can suppress responses with salience < threshold. |
| sentiment |  | Floating point from -1 to 1, where -1 is negative. | 0.6 |  |
| facialExpressions |  | Emotion label(s) returned as tags with salience values | "smiling", "frowning", "anger", "surprise" | Suppress responses with personsCount > 2.  For future tuning, we can suppress responses with salience < threshold. |
| faceCount |  | How many human faces are in the photo? | 4 | May differ from personsCount (e.g. faces on t-shirts) |
| personsCount |  | How many human bodies are in the photo? | 4 |  |
| personsClothed |  | 0-1 float, 1 being most clothed | 0.8 | Partner can bucket these based on observations during testing.  May require tuning to accout for gender and skintone bias |
| mediaImageResolution |  | height and width | {"height":1000,"width":1000} |  |
| mediaFileSize |  | In MB | 2.1 |  |
| mediaDominantColors |  | Nested list of HTML Color values, include % of area | {"color": "#FFFFFF","area": 0.35}, {"color": "#EEEEEE","area": 0.12 } |  |
| mediaCompressionSize |  | in MB | 1.8 |  |
| mediaVisualFocus |  | Possible values: blurry, out_of_focus, depth_focus_issues, noise/grain | "blurry" |  |
| mediaEstimatedCreationDate |  | YYYY estimate | 2018 |  |
| mediaInterestingness |  | 0-1 float, 1 being most interesting | 0.3 |  |
| primarySubjectFaceVisible |  |  % visible overall, with bounding box (xy, height/width) | {"visibility": 0.6, "boundingX": 225, "boundingY": 52, "boundingHeight": 375, "boundingWidth": 280} | Suppress responses where personsCount > 2 |
| secondarySubjectFaceVisible |  |  % visible overall, with bounding box (xy, height/width) | {"visibility": 0.6, "boundingX": 225, "boundingY": 52, "boundingHeight": 375, "boundingWidth": 280} | Suppress responses where personsCount > 2 |
| isAnimal |  | Animal type, salience | {"tag": "dog","salience": 0.89},{"tag": "tiger","salience": 0.25} | Suppress responses for animals > 2 |
| primarySubjectGender |  | Only for personsCount = 1 | "female" |  |
| pose |  | Tags for different poses and numeric tilt | {"tag": "selfie","tilt": 15} |  |"
| composition |  | Tags describing composition in general categories | "rule of thirds"} |  |
| photoManipulation |  | 0-1 float, 1 being highest manipulation | 0.7 | Examples: artificial backgrounds, retouching, compositing, etc. |
| photoFilter |  |  Tags identifying common social media/artificial filters, with salience values | {"tag": "instagram","salience": 0.98} |  |

### Errors:  
(will be included in response object, if desired.)  

* 408 Requestion Time out
* 404/unfound URI
* MALFORMED REQUEST--log details within Maslo API logs, rather than returning verbose error response
* 503/service unavailable

### SLA:  
* Requests must be less than 50 MBs
* Response time out after 10 seconds


**Sample JSON Response:**  
```javascript
{
  "originMediaID": "062fea4d-efdd-4a7f-92b1-4039503efd5b",
  "mediaID": 3919454996583159000,
  "scenes": [
    {
      "tag": "travel photo",
      "salience": 0.85
    },
    {
      "tag": "outside",
      "salience": 0.65
    }
  ],
  "timeOfDay": {
    "tag": "morning",
    "salience": 0.88
  },
  "emotionTags": [
    {
      "tag": "sad",
      "salience": 0.98
    },
    {
      "tag": "happy",
      "salience": 0.82
    },
    {
      "tag": "laughing",
      "salience": 0.76
    }
  ],
  "sentiment": 0.6,
  "facialExpressions": [
    {
      "tag": "smiling",
      "salience": 0.92
    },
    {
      "tag": "frowning",
      "salience": 0.78
    },
    {
      "tag": "anger",
      "salience": 0.51
    },
    {
      "tag": "surprise",
      "salience": 0.24
    }
  ],
  "faceCount": 4,
  "personsCount": 4,
  "personsClothed": 0.8,
  "mediaImageResolution": {
    "height": 1000,
    "width": 1000
  },
  "mediaFileSize": 23432,
  "mediaDominantColors": [
    {
      "color": "#FFFFFF",
      "area": 0.35
    },
    {
      "color": "#EEEEEE",
      "area": 0.12
    }
  ],
  "mediaCompressionSize": 120,
  "mediaVisualFocus": [
    "blurry"
  ],
  "mediaEstimatedCreationDate": 2018,
  "mediaInterestingness": 0.3,
  "primarySubjectFaceVisible": {
    "visibility": 0.6,
    "boundingX": 225,
    "boundingY": 52,
    "boundingHeight": 375,
    "boundingWidth": 280
  },
  "secondarySubjectFaceVisible": {
    "visibility": 0.6,
    "boundingX": 225,
    "boundingY": 52,
    "boundingHeight": 375,
    "boundingWidth": 280
  },
  "isAnimal": [
    {
      "tag": "dog",
      "salience": 0.89
    },
    {
      "tag": "tiger",
      "salience": 0.25
    }
  ],
  "primarySubjectGender": {
    "tag": "female",
    "salience": 0.95
  },
  "pose": {
    "tag": "selfie",
    "tilt": 15
  },
  "composition": [
    "rule of thirds",
    "portrait",
    "landscape",
    "etc."
  ],
  "photoManipulation": 0.7,
  "photoFilter": {
    "tag": "instagram",
    "salience": 0.98
  }
}
```  

## AnalyzeText  
**Purpose:** AnalyzeText accepts text samples and returns detailed signal analysis on tone/sentiment and grammar and vocabulary sophistication.


API endpoint: /analyzeText  POST  

### Request:  
| Field Name | Required? | Description | Example | Notes |
| ---------- | --------- | ----------- | ------- | ----- |
| text | required | Raw text to be analyzed |  |  |
| type | required | Type of text--might be used later to perform different ML pipes.  Values can be [profile field name], text_message | "profile text" |  |
| originTextID | required | TextID for passback with response | 123213432 | GUID or INT|

**Sample Requests to API**  

  ```javascript

BASH
curl --location --request POST 'localhost:41960/analyzeText' \
--form 'media=sup my dude!' \
--form 'originTextID=sdfsadfasdf'

NODEJS/JAVASCRIPT
var request = require('request');
var options = {
  'method': 'POST',
  'url': 'localhost:41960/analyzeText',
  'headers': {
  },
  formData: {
    'media': 'sup my dude!',
    'originTextID': 'sdfsadfasdf'
  }
};
request(options, function (error, response) {
  if (error) throw new Error(error);
  console.log(response.body);
});



  ```

### Developmental Response JSON

  ```json
  {
    "originTextID": "sdfsadfasdf",
    "nsfwLanguage": [
        {
            "label": "identity_attack",
            "results": [
                {
                    "probabilities": {
                        "0": 0.9999537467956543,
                        "1": 0.00004630253533832729
                    },
                    "match": false
                }
            ]
        },
        {
            "label": "insult",
            "results": [
                {
                    "probabilities": {
                        "0": 0.999702513217926,
                        "1": 0.00029748358065262437
                    },
                    "match": false
                }
            ]
        },
        {
            "label": "obscene",
            "results": [
                {
                    "probabilities": {
                        "0": 0.9998780488967896,
                        "1": 0.00012194774171803147
                    },
                    "match": false
                }
            ]
        },
        {
            "label": "severe_toxicity",
            "results": [
                {
                    "probabilities": {
                        "0": 1,
                        "1": 3.543096482871988e-8
                    },
                    "match": false
                }
            ]
        },
        {
            "label": "sexual_explicit",
            "results": [
                {
                    "probabilities": {
                        "0": 0.999951958656311,
                        "1": 0.000048023168346844614
                    },
                    "match": false
                }
            ]
        },
        {
            "label": "threat",
            "results": [
                {
                    "probabilities": {
                        "0": 0.9999116659164429,
                        "1": 0.00008833845640765503
                    },
                    "match": false
                }
            ]
        },
        {
            "label": "toxicity",
            "results": [
                {
                    "probabilities": {
                        "0": 0.9992731213569641,
                        "1": 0.0007269426132552326
                    },
                    "match": false
                }
            ]
        }
    ],
    "readability": {
        "letterCount": 9,
        "syllableCount": 3,
        "wordCount": 3,
        "sentenceCount": 1,
        "polysyllabicWordCount": 0,
        "daleChallDifficultWordCount": 2,
        "daleChall": 17,
        "ari": -5.8,
        "colemanLiau": -8.03,
        "fleschKincaid": -2.62,
        "smog": 3.13,
        "gunningFog": 1.2
    },
    "sentimentScore": {
        "score": 0,
        "comparative": 0,
        "calculation": [],
        "tokens": [
            "sup",
            "my",
            "dude"
        ],
        "words": [],
        "positive": [],
        "negative": []
    }
}
  ```


### Summary Response:  
| Field Name | Required? | Description | Example | Notes |
| ---------- | --------- | ----------- | ------- | ----- |
| originTextID | Required | Echo back originTextID that was passed in | 123213432 |  |
| writingLevel |  | score from 0-100 as a measure of overall writing sophistication. 100 being top 1% of writers | 78 |  |
| ageLevel |  | 0-25 (years) assessed age level of author (not age detection, but just expected writing level by a given age) | 18 |  |
| educationGradeLevel |  | 0-15, grade level, where 12 is senior year of high school | 11 |  |
| vocabularyComplexity |  | 0-1, where 1 would be total noise, and 0 would be no words or repeating., a "good" level is between .6 and .7 | 0.6 |  |
| sentimentScore |  | -1 to 1, where -1 is very negative and 1 is very positive, 0 is neutral | -0.25 |  |
| emotionalChargedLanguage |  | 0 or 1, assessment if language is highly emotiational | 1 |  |
| genderCodedLanguage |  | male, female, somewhat male, somewhat female, gender neutral | "somewhat female" |  |
| nsfwLanguage |  | 0 or 1, it is 1 if text contains Not Safe For Work phrasing and slang  | 1 |  |
| emotionalTone |  | Tag describing emotional tone of text | "sad" |  |

**Sample JSON:**  
```javascript
{
  "originTextID": 123213432,
  "writingLevel": 78,
  "ageLevel": 18,
  "educationGradeLevel": 11,
  "vocabularyComplexity": 0.6,
  "sentimentScore": -0.25,
  "emotionalChargedLanguage": 1,
  "genderCodedLanguage": [
    "somewhat female"
  ],
  "nsfwLanguage": 1,
  "emotionalTone": [
    "sad",
    "happy",
    "upbeat",
    "etc"
  ]
}
```


### Errors:  
(will be included in response object)  

* 404/unfound URI
* MALFORMED REQUEST--log details within Maslo API logs, rather than returning verbose error response
* 503/service unavailable
* TIME OUT

### SLA:  
* Requests must be less than 1 MBs
* Response time out after 120 seconds
