package com.hatchgrid.thryve.simulation

import io.gatling.javaapi.core.*
import io.gatling.javaapi.http.*
import io.gatling.javaapi.core.CoreDsl.*
import io.gatling.javaapi.http.HttpDsl.*
import java.time.Duration

class NewsletterSimulation : Simulation() {

    private val httpProtocol = http
        .baseUrl("http://localhost:8080")
        .acceptHeader("application/json")
        .contentTypeHeader("application/json")
        .userAgentHeader("Gatling/PerformanceTest")

    // Placeholder for token and workspaceId
    // These would typically be fed from a previous simulation or a CSV file
    private val tokenFeeder = feeder(mapOf("token" to "Bearer <TOKEN_VALIDO>")).circular()
    private val workspaceFeeder = feeder(mapOf("workspaceId" to "<WORKSPACE_ID>")).circular() // Replace <WORKSPACE_ID> with a valid ID

    private val scn = scenario("Newsletter API")
        .feed(tokenFeeder)
        .feed(workspaceFeeder)
        .exec(
            http("Create Newsletter")
                .post("/api/workspace/#{workspaceId}/newsletter")
                .header("Authorization", "#{token}")
                .body(StringBody("""{"name": "GatlingTest Newsletter", "content": "Test content"}""")).asJson()
                .check(status().`is`(201))
                .check(jsonPath("$.id").exists().saveAs("newsletterId"))
        )
        .pause(Duration.ofSeconds(1))
        .exec(
            http("Get Newsletters by Workspace")
                .get("/api/workspace/#{workspaceId}/newsletter")
                .header("Authorization", "#{token}")
                .check(status().`is`(200))
        )

    init {
        setUp(
            scn.injectOpen(atOnceUsers(5))
        ).protocols(httpProtocol)
         .assertions(
             global().responseTime().max().lt(1000),
             global().successfulRequests().percent().gt(90.0)
         )
    }
}
