package com.hatchgrid.thryve.simulation

import io.gatling.javaapi.core.*
import io.gatling.javaapi.core.CoreDsl.* // Wildcard import
import io.gatling.javaapi.http.*
import io.gatling.javaapi.http.HttpDsl.* // Wildcard import
import java.time.Duration

class WorkspaceSimulation : Simulation() {

    private val httpProtocol = http
        .baseUrl("http://localhost:8080")
        .acceptHeader("application/json")
        .contentTypeHeader("application/json")
        .userAgentHeader("Gatling/PerformanceTest")

    // WORKAROUND: Using csv feeder instead of map-based feeder
    private val tokenFeeder = csv("token.csv").random()

    private val scn = scenario("Workspace API")
        .feed(tokenFeeder)
        .exec(
            http("Get All Workspaces")
                .get("/api/workspaces")
                .header("Authorization", "#{token}")
                .check(status().`is`(200)),
        )
        .pause(Duration.ofSeconds(1))
        .exec(
            http("Create Workspace")
                .post("/api/workspaces")
                .header("Authorization", "#{token}")
                .body(StringBody("{\"name\": \"GatlingTest Workspace\"}")).asJson()
                .check(status().`is`(201))
                .check(jsonPath("$.id").exists().saveAs("workspaceId")),
        )
        .pause(Duration.ofSeconds(1))
        .exec(
            http("Get Workspace by ID")
                .get("/api/workspaces/#{workspaceId}")
                .header("Authorization", "#{token}")
                .check(status().`is`(200)),
        )

    init {
        setUp(
            scn.injectOpen(atOnceUsers(5)),
        ).protocols(httpProtocol)
            .assertions(
                global().responseTime().max().lt(1500),
                global().successfulRequests().percent().gt(90.0),
            )
    }
}
