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
* get anything you want here: https://tfhub.dev/

* Image Scene: https://github.com/tensorflow/tfjs-models/tree/master/mobilenet
Object Detection: https://github.com/tensorflow/tfjs-models/tree/master/coco-ssd
* Body Landmarks: https://github.com/tensorflow/tfjs-models/tree/master/body-pix
* Body Post: https://github.com/tensorflow/tfjs-models/tree/master/posenet
* Text Toxicity: https://github.com/tensorflow/tfjs-models/tree/master/toxicity
* Face Detection: https://github.com/tensorflow/tfjs-models/tree/master/blazeface
* Image Segmentation: https://github.com/tensorflow/tfjs-models/tree/master/deeplab
* Faceland Mark Detection: https://github.com/tensorflow/tfjs-models/tree/master/facemesh
* Hand pose: https://github.com/tensorflow/tfjs-models/tree/master/handpose
* Emotions and More: https://justadudewhohacks.github.io/face-api.js/docs/index.html#getting-started-nodejs
* Face Data: http://shuoyang1213.me/WIDERFACE/
* body part segmentation: https://github.com/tensorflow/tfjs-models/pull/63

* MediaPipe: https://github.com/google/mediapipe/tree/master/mediapipe/models
https://github.com/infinitered/nsfwjs#node-js-app

Some AutoML models loaded into tensorflow
* https://cloud.google.com/blog/products/gcp/how-to-classify-images-with-tensorflow-using-google-cloud-machine-learning-and-cloud-dataflow
https://cloud.google.com/vision/automl/docs/edge-quickstart
https://github.com/tensorflow/tfjs/tree/master/tfjs-automl
https://cloud.google.com/vision/automl/docs/tensorflow-js-tutorial
* https://heartbeat.fritz.ai/automl-vision-edge-loading-and-running-a-tensorflow-js-model-part-2-9b4d62a7d5cc

and some Onxy
https://github.com/Microsoft/onnxjs

Gemder Model:
https://github.com/bharathvaj1995/gender-detection-tensorflowjs

backstory on some of this:
https://www.oreilly.com/content/apache-mxnet-in-the-wolfram-language/

Photo Manipulation Data
https://www5.cs.fau.de/research/data/image-manipulation/
https://data.mendeley.com/datasets/dk84bmnyw9/2
http://www.eurecom.fr/en/publication/5973/download/sec-publi-5973.pdf

Era of Photo
https://link.springer.com/chapter/10.1007/978-3-319-56608-5_57
https://www.radar-service.eu/radar/en/dataset/tJzxrsYUkvPklBOw#

full licensed dataset
https://www.radar-service.eu/radar-backend/archives/toiMGdrQfZcWpnjy/versions/1/content

[1] Eric Müller, Matthias Springstein, and Ralph Ewerth: 
"When Was This Picture Taken?" - Image Date Estimation in the Wild. 
In: Advances in Information Retrieval: Proceedings of 39th European Conference on Information Retrieval (ECIR), 
Aberdeen (UK), Lecture Notes on Computer Science (LNCS), Vol. 10193, Springer, pp. 619-625, 2017.



note:  To speed things up dramatically, install our node backend, which binds to TensorFlow C++, by running npm i @tensorflow/tfjs-node, or npm i @tensorflow/tfjs-node-gpu if you have CUDA. Then call require('@tensorflow/tfjs-node'); (-gpu suffix for CUDA) at the start of your program. Visit https://github.com/tensorflow/tfjs-node for more details.

this is an optional advanced thing:
https://github.com/justadudewhohacks/opencv4nodejs#examples

Facial Expression Data: R Vemulapalli, A Agarwala, “A Compact Embedding for Facial Expression Similarity”, CoRR, abs/1811.11283, 2018.

https://lionbridge.ai/datasets/5-million-faces-top-15-free-image-datasets-for-facial-recognition/

Some very fun shadow detection/time of day stuff:
https://research.cs.cornell.edu/shadows/files/wehrwein_3dv15_shadows.pdf
https://github.com/ivclab/Day_Night_dataset_list

image lines:
https://towardsdatascience.com/lines-detection-with-hough-transform-84020b3b1549

#### libraries/thinks worth worth knowing about

https://meowni.ca/posts/on-tfjs-datasync/

might use this:
https://github.com/inspirit/jsfeat


### Containers and Installations

Simple info on packaging up docker and node.  https://nodejs.org/en/docs/guides/nodejs-docker-webapp/

https://www.aber.ac.uk/~dcswww/Dept/Teaching/CourseNotes/current/CS34110/hough.html

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

