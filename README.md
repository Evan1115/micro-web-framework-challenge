# micro-web-framework-challenge
It is built with express.js to allow user to upload image

##The difference for the solution to handle average daily call count 5, 5K and 100K.

For 5 daily call , it will still be fine on a single server and Node js itself is an event driven based and non blocking I/O model. What I mean by that is it will not block with a single request, instead it will handle all the request by respond the data in promise/callback. For now, a monolith architecture with single server where the web app and database(not implement in my assignment but can be enhancement in future) are sharing the same resource(CPU,RAM etc) but it should more thant enough serve less than 10 calls per daily.

For number of call around 5k, we need to have horizontal scaling instead of vertical scaling by having multiple instances of the application. Besides, we also can set up load balancer like Elastic Load Balancer with Route 53 in AWS where it will route the request to different sever instance based on the workload on each server and it will perform health check so it wont route to a failing host. Moreover, we can store the staic file like JS, CSS, images etc in CDN to optimize the cross origin performance and lower the latency.

For number of call around 100k, instead having single code based to handle all the workload , we can further breaking it down into smaller pieces and scale each of them as we need. This is what we called microservice where each service is independently from each other and can be scaled  individually. Besides, we can also spread the instances across multiple availability zones and regions based on the traffic. For example, we see there is alot of traffic coming form Australia, then we can make you app available there to reduce latency.