# Maslo Companion Server  

version: 1.02  
authors: Russel Foltz-Smith, Mark Ziler  
  



## Overview  
Maslo Companion Server is a set of signal processing APIs for numerous types of data  
  
Response formats: JSON  
Requires Authentication? Yes (user context only)  
Rate limited? Yes  
Request Formats: Requests should be either multipart/form-data or application/x-www-form-urlencoded or application/json POST formats  
  
## AnalyzeMedia  
**Purpose:** AnalyzeMedia accepts media files (currently images) and returns detailed signal analysis on the image quality, subject matter, scenic context, human subject pose/sentiment/emotion, etc.  

API endpoint: /analyzeMedia  POST  

### Request:  
| Field Name | Required? | Description | Example | Notes |
| ---------- | --------- | ----------- | ------- | ----- |
| media | Required | Raw binary of file to be uploaded.  Can include multiple, each to be analyzed individually. |  | max size = 30MB/file, max 50 files per payload.  Limited to image files currently |
| type | required | Type of media, as a backstop for mimetype detection problems.  values: image, video, audio. | "image" |  |
| originMediaID |  | originMediaID to be passed back in response. (GUID) | 062fea4d-efdd-4a7f-92b1-4039503efd5b | @Russ, how to handle this being a GUID vs. originImageID being an INT? |

**Sample JSON:**  
```javascript
media[] = POST BLOB
type[] = image/jpg
originMediaID[] = 062fea4d-efdd-4a7f-92b1-4039503efd5b

```


### Response:  
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
(will be included in response object)  

* 404/unfound URI
* MALFORMED REQUEST--log details within Maslo API logs, rather than returning verbose error response
* 503/service unavailable
* TIME OUT

### SLA:  
* Requests must be less than 50 MBs
* Response time out after 5 minutes


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
| originTextID | required | TextID for passback with response | 123213432 | @Russ, can we standardize this somehow vs. the GUID originMediaID? |

**Sample JSON:**  
```javascript
{
  "Request": [
    {
      "text": "text 1 to analyze",
      "type": "essay",
      "originTextID": 123213432
    },
    {
      "text": "text 2 to analyze",
      "type": "profile",
      "originTextID": 123213433
    }
  ]
}
```

### Response:  
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
