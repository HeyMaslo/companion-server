# Companion Server Enterprise Edition 2021

Maslo Companion Server is a product created to provide our partners with an easy to use and easy to integrate Companion Service for clouds, desktop computers or on device.

The main idea of a Companion Server, is "algorithms and data without a end user display User Interface". Literally old school meaning of server.

The companion server can be deployed as:
* a stand alone containerized blackbox service with no internet/network access (only whitelisted i/o)
* a react native SDK for inclusion in mobile applications
* a cloud deployed server with micro service interfaces
* a batch processing component in a larger data platform/streaming data stack

The Maslo Companion Server is a lightweight, highly configurable, highly transparent collection of algorithms (machine learning and signal processing) and data.   


## Core Features and Values

Cloud agnostic/Hybrid Cloud Enable
Highly configurable / customizable
Process different signals (Video, Audio, Text, Biomarkers, etc.)
Output can be tweak for each partner
Wizard-like setup or power users
Database adapters 
Have different models deployed independently
Set of configurations handled per-partner that adapt the functionality of the MCS for each partner.
Chaining together different models
Generic/Abstracted API Interface

### Popular enterprise solutions for Hybrid Clouds
https://www.h2o.ai/hybrid-cloud/



## Deployment Requirements
By Default interops with Maslo Companion Kit (can power all algorithm/API services of MCK)
Deployment per partner
Can be hosted by Maslo, by Partner or Hybrid
HA/HS
Monitoring / Error logging
Pre trained Models vs Partner trained Models
Stand-alone vs Cloud hosted
How to deliver new features to existing clients

## Signal Processing, Modalities and Specific Metrics

### Backgrounders on Digital Phenotyping and Behavioral Monitoring

https://www.sciencedirect.com/science/article/pii/S1566253518305244

### Smartphone Passive Data Signal Possibilities
https://docs.google.com/spreadsheets/d/1-aJOOwlUdFxI79goz_U3NrdSvXyL-Szke0ClXemEwwE/edit#gid=0

### Existing Maslo Platform Algorithm/Signal Modality Drilldown
https://docs.google.com/spreadsheets/d/1lQS37kgDH1v0pdHKyWQse0NSxx0g1gkIsRi_mdUDKKM/edit#gid=441694671

### Audio APIs for inspriation
https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

https://alemangui.github.io/pizzicato/

https://howlerjs.com/

http://joesul.li/van/beat-detection-using-web-audio/

### Audio

#### Types
Voice -   a track with primarily a human voice or voices
Music - a track featuring instrumentation (and singing voices)
Sounds - a non musical track without human voices

#### Signal or File Formats
AAC
MP3
WAV
ogg?
mVa?

#### Metrics/Composite/Synthesis

##### Speech to Text
* google api: https://cloud.google.com/speech-to-text
* wolfram function (can be deployed as API to wolframcloud): https://reference.wolfram.com/language/ref/SpeechRecognize.html
* aws api: https://aws.amazon.com/transcribe/

##### Mood 

##### Sentiment

##### Emotions

##### Intention

##### Energy (Mel Freq)

##### Tone

##### Overall Content Identity (high level labels: landscape, people, portrait, scene, movement)

##### Composition Metrics (pitch, tempo)

##### Likely Location (not gps, but scenic, interior, exterior)

##### Possible Genders, Ages, Emotions

##### Complexity/Dynamism (measure of how the audio is in an Information Theory context)

##### Doctored after capture  (assessment of post production manipulation)

##### Copyright Possible

##### Quality Score (scoring of overall assessment of quality based on other metrics above)

##### Speaker Recognition (not identity, but has this voice been capture before)

##### Musical Stems - https://audioshake.medium.com/announcing-audioshake-an-ai-to-open-up-music-for-new-uses-179a924afb83

##### Breathing Rates

##### Speaking Rates

##### Markers for Speech Disorders (only flags, not provided to end users, and only for partners with HIPPA compliance)

##### Markers for Mental Health Disorders (only flags, not provided to end users, and only partners with HIPPA compliance)

## Project/Platform Milestones
Check in with Russ about architecture
Define MVP Scope (Launch Partner input)
Complete SDD
Approval of SDD
Start of development
Delivery

## Technical Architecture and Stack Choices
### Service Levels / Production Requirements

### Components
SOA? Microservices? Monolith?

NodeJS + NestJS

Monolith could be a good starting point

API Gateway - We could use this to provision access for new partners and have control over billing/throttling/rate limiting/etc. Also we could have free trials (?)

Return response to the user / Store the data somewhere

Database adapters, support for some of the most popular databases

Docker? App Engine (or equivalent)

### NFRs
Unit testing

Error logging (Sentry)

CI / CD (Github Actions?)

Development / Testing environments

Authentication / Authorization

### Architecture Visualizations (High Level)

## Project Timeline as of January 2021
### Phase 1: (March 2021?)
Project Definition

MVP Definition

MVP Development starts

Partner MVP delivered

### Phase 2: (June 2021?)
Partner delivered

New signals added

### Phase 3: (???)
Implementation of new features

New partners 



