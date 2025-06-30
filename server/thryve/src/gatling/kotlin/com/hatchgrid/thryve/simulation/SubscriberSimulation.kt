package com.hatchgrid.thryve.simulation

import io.gatling.javaapi.core.*
import io.gatling.javaapi.http.*
import io.gatling.javaapi.core.CoreDsl.*
import io.gatling.javaapi.http.HttpDsl.*
import java.time.Duration

class SubscriberSimulation : Simulation() {

    private val httpProtocol = http
        .baseUrl("http://localhost:8080")
        .acceptHeader("application/json")
        .contentTypeHeader("application/json")
        .userAgentHeader("Gatling/PerformanceTest")

    // Placeholders for token, workspaceId, and newsletterId
    private val tokenFeeder = feeder(mapOf("token" to "Bearer <TOKEN_VALIDO>")).circular()
    private val workspaceIdFeeder = feeder(mapOf("workspaceId" to "<WORKSPACE_ID>")).circular()
    private val newsletterIdFeeder = feeder(mapOf("newsletterId" to "<NEWSLETTER_ID>")).circular()
    private val subscriberEmails = csv("subscribers.csv").random()

    private val scn = scenario("Subscriber Management API")
        .feed(tokenFeeder)
        .feed(workspaceIdFeeder)
        .feed(newsletterIdFeeder)
        .feed(subscriberEmails)
        .exec(
            http("Add Subscriber")
                .post("/api/workspace/#{workspaceId}/newsletter/#{newsletterId}/subscriber")
                .header("Authorization", "#{token}")
                .body(StringBody("""{"email": "#{email}"}""")).asJson()
                .check(status().`is`(201)) // Assuming 201 for successful creation
        )
        .pause(Duration.ofMillis(500)) // Pause between adding and listing
        .exec(
            http("Get Subscribers")
                .get("/api/workspace/#{workspaceId}/newsletter/#{newsletterId}/subscribers")
                .header("Authorization", "#{token}")
                .check(status().`is`(200))
        )

    init {
        setUp(
            scn.injectOpen(atOnceUsers(10))
        ).protocols(httpProtocol)
         .assertions(
             global().responseTime().max().lt(1200),
             global().successfulRequests().percent().gt(90.0)
         )
    }
}
