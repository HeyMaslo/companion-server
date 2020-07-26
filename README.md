# Maslo Companion Server  

version: 1.02  
authors: Russel Foltz-Smith, Mark Ziler  
  
## Overview  
Maslo Companion Server is a signal processing and machine learning server deployable to major cloud providers and private data centers.

Original server was using lower level code with WolframEngine, python, tensorflow but it has been simplified and smallified for maintanence and portability reasons.

### APIs

head to the docs folder or https://heymaslo.github.io/companionserver/#/ for full documentation on the APIs

### Containers and Installations

Simple info on packaging up docker and node.  https://nodejs.org/en/docs/guides/nodejs-docker-webapp/

#### docker

basic image build of app/models:

    docker build -t un1crom/maslocompanionserver

tag build for dockerhub push:

    docker tag un1crom/maslocompanionserver:latest un1crom/maslo:1.0.0

push to docker hub

    docker push un1crom/maslo:1.0.0

run from dockerhub

    docker run un1crom/maslo:1.0.0


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

