# Maslo Companion Server  

version: 1.02  
authors: Russel Foltz-Smith, Mark Ziler  
  
## Overview  
Maslo Companion Server is a signal processing and machine learning server deployable to major cloud providers and private data centers.

Original server was using lower level code with WolframEngine, python, tensorflow but it has been simplified and smallified for maintanence and portability reasons.

### APIs

head to the docs folder or https://heymaslo.github.io/companionserver/#/ for full documentation on the APIs

### What Are The Algos?
Machine Learning models :)... documentation on each one here:  



Default

Mostly Tensflow
* Image Scene: https://github.com/tensorflow/tfjs-models/tree/master/mobilenet
Object Detection: https://github.com/tensorflow/tfjs-models/tree/master/coco-ssd
Body Landmarks: https://github.com/tensorflow/tfjs-models/tree/master/body-pix
Body Post: https://github.com/tensorflow/tfjs-models/tree/master/posenet
Text Toxicity: https://github.com/tensorflow/tfjs-models/tree/master/toxicity
Face Detection: https://github.com/tensorflow/tfjs-models/tree/master/blazeface
Image Segmentation: https://github.com/tensorflow/tfjs-models/tree/master/deeplab
Faceland Mark Detection: https://github.com/tensorflow/tfjs-models/tree/master/facemesh
Hand pose: https://github.com/tensorflow/tfjs-models/tree/master/handpose
Emotions and More: https://justadudewhohacks.github.io/face-api.js/docs/index.html#getting-started-nodejs
Face Data: http://shuoyang1213.me/WIDERFACE/

Some AutoML models loaded into tensorflow
https://cloud.google.com/blog/products/gcp/how-to-classify-images-with-tensorflow-using-google-cloud-machine-learning-and-cloud-dataflow
https://cloud.google.com/vision/automl/docs/edge-quickstart
https://github.com/tensorflow/tfjs/tree/master/tfjs-automl
https://cloud.google.com/vision/automl/docs/tensorflow-js-tutorial
* https://heartbeat.fritz.ai/automl-vision-edge-loading-and-running-a-tensorflow-js-model-part-2-9b4d62a7d5cc

and some Onxy
https://github.com/Microsoft/onnxjs


note:  To speed things up dramatically, install our node backend, which binds to TensorFlow C++, by running npm i @tensorflow/tfjs-node, or npm i @tensorflow/tfjs-node-gpu if you have CUDA. Then call require('@tensorflow/tfjs-node'); (-gpu suffix for CUDA) at the start of your program. Visit https://github.com/tensorflow/tfjs-node for more details.

this is an optional advanced thing:
https://github.com/justadudewhohacks/opencv4nodejs#examples

Facial Expression Data: R Vemulapalli, A Agarwala, “A Compact Embedding for Facial Expression Similarity”, CoRR, abs/1811.11283, 2018.

https://lionbridge.ai/datasets/5-million-faces-top-15-free-image-datasets-for-facial-recognition/


### Containers and Installations

Simple info on packaging up docker and node.  https://nodejs.org/en/docs/guides/nodejs-docker-webapp/

#### docker

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

