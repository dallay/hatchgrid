package com.hatchgrid.thryve.simulation

import io.gatling.javaapi.core.*
import io.gatling.javaapi.core.CoreDsl.*
import io.gatling.javaapi.http.*
import io.gatling.javaapi.http.HttpDsl.*
import java.time.Duration

class SubscriberSimulation : Simulation() {
    private val httpProtocol = http
        .baseUrl("http://localhost:8080")
        .acceptHeader("application/json")
        .contentTypeHeader("application/json")
        .userAgentHeader("Gatling/PerformanceTest")

    private val tokenFeeder = csv("token.csv").random()
    private val workspaceIdFeeder = csv("workspace_ids.csv").random()
    private val newsletterIdFeeder = csv("newsletter_ids.csv").random()
    private val subscriberEmailsFeeder = csv("subscribers.csv").random()

    private val scn = scenario("Subscriber Management API")
        .feed(tokenFeeder)
        .feed(workspaceIdFeeder)
        .feed(newsletterIdFeeder)
        .feed(subscriberEmailsFeeder)
        .exec(
            http("Add Subscriber")
                .post("/api/workspace/#{workspaceId}/newsletter/#{newsletterId}/subscriber")
                .header("Authorization", "#{token}")
                .body(StringBody("{\"email\": \"#{email}\"}")).asJson() // Corrected StringBody
                .check(status().`is`(201)),
        )
        .pause(Duration.ofMillis(500))
        .exec(
            http("Get Subscribers")
                .get("/api/workspace/#{workspaceId}/newsletter/#{newsletterId}/subscribers")
                .header("Authorization", "#{token}")
                .check(status().`is`(200)),
        )

    init {
        setUp(
            scn.injectOpen(atOnceUsers(10)),
        ).protocols(httpProtocol)
            .assertions(
                global().responseTime().max().lt(1200),
                global().successfulRequests().percent().gt(90.0),
            )
    }
}
