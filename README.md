# Maslo Companion Server  

version: 1.03  
authors: Russell Foltz-Smith @un1crom, Mark Ziler  
  
## Overview  
Maslo Companion Server is a self contained signal processing and machine learning server deployable to major cloud providers and private data centers OR TO YOUR OWN COMPUTER.  Original server was using lower level code with WolframEngine, python, tensorflow but it has been simplified and smallified for maintanence and portability reasons.

The companion server can easily be attached to other systems by way to passing in images or text to it.  In response the companion server supplies back out a set of JSON. 

## Coming soon
A lot.  Generative things.  Hyperobject things.

### Audio
We will be adding audio processing to this.  It requires a slightly different approach to some of these algo approaches due to strange world of audio codecs and issues of speech to text, etc.  All very solvable and we have solved them in different ways but not without more horsepower than a little old nodejs server.

### Video
Video is just Lots of Pictures (moving pictures aka "frames") and Audio.  It follows naturally.  

### Biomarkers and IoT
Generally pretty easy.  Coming very soon.

### Story telling and Generative Art
We are already connecting this server up to Story Writing APIs, chatbots and more.

## Use Cases

* tagging all your content
* reorgnizating your photos
* analyzing your companies data
* making social media image filters
* learning
* anything

## APIs

head to the docs folder or https://heymaslo.github.io/companionserver/#/ for full documentation on the APIs


## NodeJS, ExpressJS, and Tensorflow
The package.json has all the details on what's in play.

Please note there are sometimes some bugs in NPM modules.  In particular, DeepLab tensorflow model has

## What Are The Algos?
Machine Learning models of various kinds.  All implemented in nodejs/javascript.

### Very Important Note About Machine Learning and Bias and Training Data and Assumptions

ALL DATA IS BIASED.  Biased by the era in which it was produced, biased by the systems used to produce it, limited by the measurement technology involved.  More problematically ALL DATA IS BIASED by our mostly arbitrary ways of reducing and categorizing the world.  All data is built upon assumptions about how the world could possible be categorized, divided, generalized or specified.  While this can be useful and sometimes move us towards understanding and scientific fact, that is very rare.

Developers rarely write anything from scratch so they carry on the bias from the past where they don't have time or attention to change it.  It is no different with this server and its originating code, datasets and models.

This doesn't mean the server isn't useful or "good" or "bad.".   It is a server and it takes on the capabilities of the context it is put to use in.

The machine learning models included in this server are public and built from reasearch/public datasets.  All of it is inspectable and changeable.   And you should inspect it and change it.

Transparency and engagment is the only possible ethical stance for machine learning and big data systems.

If this server is useful for anything education might be its only major claim.  Minor claims to be made about interestingness and utilitiy, depending on what you're looking for in life.

### The Libraries and Algos

Mostly Tensflow
* Most obvious publicly available models for Tensorflow can be found here: https://tfhub.dev/
* Image Scene: https://github.com/tensorflow/tfjs-models/tree/master/mobilenet
* Object Detection: https://github.com/tensorflow/tfjs-models/tree/master/coco-ssd
* Body Landmarks: https://github.com/tensorflow/tfjs-models/tree/master/body-pix
* Body Post: https://github.com/tensorflow/tfjs-models/tree/master/posenet
* Text Toxicity: https://github.com/tensorflow/tfjs-models/tree/master/toxicity
* Readability Scores: https://www.npmjs.com/package/readability-scores
* Face Detection: https://github.com/tensorflow/tfjs-models/tree/master/blazeface
* Image Segmentation: https://github.com/tensorflow/tfjs-models/tree/master/deeplab
* Faceland Mark Detection: https://github.com/tensorflow/tfjs-models/tree/master/facemesh
* Hand pose: https://github.com/tensorflow/tfjs-models/tree/master/handpose
* Emotions and More: https://justadudewhohacks.github.io/face-api.js/docs/index.html#getting-started-nodejs
* Face Data: http://shuoyang1213.me/WIDERFACE/
* body part segmentation: https://github.com/tensorflow/tfjs-models/pull/63
* MediaPipe: https://github.com/google/mediapipe/tree/master/mediapipe/models
* NSFW https://github.com/infinitered/nsfwjs#node-js-app
* Gemder Model: https://github.com/bharathvaj1995/gender-detection-tensorflowjs

Some AutoML models loaded into tensorflow
* https://cloud.google.com/blog/products/gcp/how-to-classify-images-with-tensorflow-using-google-cloud-machine-learning-and-cloud-dataflow
* https://cloud.google.com/vision/automl/docs/edge-quickstart
* https://github.com/tensorflow/tfjs/tree/master/tfjs-automl
* https://cloud.google.com/vision/automl/docs/tensorflow-js-tutorial
* https://heartbeat.fritz.ai/automl-vision-edge-loading-and-running-a-tensorflow-js-model-part-2-9b4d62a7d5cc

and some Onxy
https://github.com/Microsoft/onnxjs

and some Wolfram and MXnet:
https://www.oreilly.com/content/apache-mxnet-in-the-wolfram-language/

### Models and Datasets in addition to the Libraries and Algos
ROS and Image Segmentation
https://github.com/ethz-asl/deeplab_ros

Candid Photos
https://grail.cs.washington.edu/projects/candid_video_portraits/paper.pdf
https://grail.cs.washington.edu/projects/candid_video_portraits/


Photo Manipulation Data
https://www5.cs.fau.de/research/data/image-manipulation/
https://data.mendeley.com/datasets/dk84bmnyw9/2
http://www.eurecom.fr/en/publication/5973/download/sec-publi-5973.pdf

Era of Photo
https://link.springer.com/chapter/10.1007/978-3-319-56608-5_57
https://www.radar-service.eu/radar/en/dataset/tJzxrsYUkvPklBOw#
http://people.ee.ethz.ch/~ihnatova/
https://lesc.dinfo.unifi.it/en/datasets

lots more training datasets
http://homepages.inf.ed.ac.uk/rbf/CVonline/Imagedbase.htm

Cities
https://gombru.github.io/2018/08/01/InstaCities1M/

Images with Questions
https://visualqa.org/

full licensed dataset
https://www.radar-service.eu/radar-backend/archives/toiMGdrQfZcWpnjy/versions/1/content

[1] Eric Müller, Matthias Springstein, and Ralph Ewerth: 
"When Was This Picture Taken?" - Image Date Estimation in the Wild. 
In: Advances in Information Retrieval: Proceedings of 39th European Conference on Information Retrieval (ECIR), 
Aberdeen (UK), Lecture Notes on Computer Science (LNCS), Vol. 10193, Springer, pp. 619-625, 2017.

Gender Coded Word Lists
https://github.com/pcbouman-eur/gender-decoder-js

this is an optional advanced thing:
https://github.com/justadudewhohacks/opencv4nodejs#examples

Facial Expression Data: R Vemulapalli, A Agarwala, “A Compact Embedding for Facial Expression Similarity”, CoRR, abs/1811.11283, 2018.

https://lionbridge.ai/datasets/5-million-faces-top-15-free-image-datasets-for-facial-recognition/

Some very fun shadow detection/time of day stuff:
https://research.cs.cornell.edu/shadows/files/wehrwein_3dv15_shadows.pdf
https://github.com/ivclab/Day_Night_dataset_list

Algos for Image Lines:
https://towardsdatascience.com/lines-detection-with-hough-transform-84020b3b1549

Intents
https://github.com/snipsco/nlu-benchmark/tree/master/2017-06-custom-intent-engines

Tinder Data:
https://techcrunch.com/2017/04/28/someone-scraped-40000-tinder-selfies-to-make-a-facial-dataset-for-ai-experiments/

Get More Data:
https://storage.googleapis.com/openimages/web/visualizer/index.html?set=train&type=detection&c=%2Fm%2F01d380

These demos are always useful to understand some of the models:
https://nanonets.com/blog/object-detection-tensorflow-js/

### Maslo Trained Models

Maslo.ai trained some models directly for use in javascript

* ferFace - a very basic model for classifying faces, using many of the available Fer datasets floating around: https://github.com/microsoft/FERPlus etc
* photoManipulation - a very basic image classification dataset to classify photos manipulated by instagram, snapchat, photoshop etc.
* Era of Photos - a large dataset of predicting what year/decade an image was created (using the qualities of the image without metadata)
* Day or Night - simple classification of images from night or day.  could definitely ramp that up



#### libraries/thinks worth worth knowing about

note:  To speed things up dramatically, install our node backend, which binds to TensorFlow C++, by running npm i @tensorflow/tfjs-node, or npm i @tensorflow/tfjs-node-gpu if you have CUDA. Then call require('@tensorflow/tfjs-node'); (-gpu suffix for CUDA) at the start of your program. Visit https://github.com/tensorflow/tfjs-node for more details.

https://meowni.ca/posts/on-tfjs-datasync/

might use this:
https://github.com/inspirit/jsfeat

mildly interesting data
https://towardsdatascience.com/my-friends-gave-me-their-tinder-data-7fcd2621c140

Interesting image javascript
https://29a.ch/libs



### Containers and Installations

Simple info on packaging up docker and node.  https://nodejs.org/en/docs/guides/nodejs-docker-webapp/

https://www.aber.ac.uk/~dcswww/Dept/Teaching/CourseNotes/current/CS34110/hough.html

#### Important notes
Some of the node_modules have bugs for tensorflow running local models etc.
One issue in Deeplab here: https://github.com/tensorflow/tfjs/issues/3723

It is important to bring these EXACT node modules contained in this image until that bug is fixed.

Additionally, if you want a full blackbox experience with NO outside internet access you must load all models from LOCAL FILE storage or a LOCAL/Internal URL.

The code shows a couple of ways to do this.  It's not that fun to track it all down.

#### Getting a Docker Container

basic image build of app/models:

    docker build -t un1crom/maslocompanionserver

tag build for dockerhub push:

    docker tag un1crom/maslocompanionserver:latest un1crom/maslocompanionserver:1.0.1

push to docker hub

    docker push un1crom/maslocompanionserver:1.0.1

run from dockerhub

    docker run un1crom/maslocompanionserver:1.0.1

pull from docker

    docker pull un1crom/maslocompanionserver:1.0.1


#### Private Clouds/Data Centers
##### kubernetes
For kubernets orchestration... standard approaches should work.  this is a very simple, stateless nodejs/expressjs container.

###### simple deployment and service will do it

YAMLs for the kube/minikube spin up for testing

deployment

    apiVersion: apps/v1
    kind: Deployment
    metadata:
    name: maslocompanionserver
    spec:
    replicas: 1
    selector:
        matchLabels:
        app: maslocompanionserver
    template:
        metadata:
        labels:
            app: maslocompanionserver
        spec:
        containers:
            - name: app
            image: un1crom/maslo:1.0.0
            ports:
                - containerPort: 8080
            imagePullPolicy: Always
        imagePullSecrets:
            - name: regcred

service

    apiVersion: v1
    kind: Service
    metadata:
        name: maslocompanionserver
    spec:
        type: NodePort
        selector:
            app: maslocompanionserver
        ports:
        -   protocol: TCP
            port: 3000
            targetPort: 8080
            
            ### dockerizing nodejs apps


https://nodejs.org/en/docs/guides/nodejs-docker-webapp/

* kubernets for the uninitiated
https://learnk8s.io/nodejs-kubernetes-guide

* kubernets, nodejs, docker on Oracle Cloud
https://medium.com/faun/how-to-deploy-a-express-node-js-app-on-kubernetes-and-an-intro-to-containerisation-205b5c647426

* automated builds to docker
https://docs.docker.com/docker-hub/builds/

* make private repositories available to kubernets
https://kubernetes.io/docs/concepts/containers/images/#specifying-imagepullsecrets-on-a-pod

#### Public Clouds
* kubernetes on google cloud
https://codelabs.developers.google.com/codelabs/cloud-running-a-nodejs-container/index.html?index=..%2F..index

