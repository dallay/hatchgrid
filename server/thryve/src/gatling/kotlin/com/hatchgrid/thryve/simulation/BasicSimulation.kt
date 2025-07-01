package com.hatchgrid.thryve.simulation

import io.gatling.javaapi.core.*
import io.gatling.javaapi.core.CoreDsl.* // For scenario, exec
import io.gatling.javaapi.http.*
import io.gatling.javaapi.http.HttpDsl.* // For http, status

class BasicSimulation : Simulation() {
    private val httpProtocol = http
        .baseUrl("http://localhost:8080")
        .acceptHeader("application/json")
        .userAgentHeader("Gatling/PerformanceTest")

    private val scn = scenario("Basic Health Check")
        .exec(
            http("Health Check Request")
                .get("/actuator/health")
                .check(status().`is`(200)), // Trailing comma added
        )

    init {
        setUp(
            scn.injectOpen(atOnceUsers(10)), // Using atOnceUsers from CoreDsl // Trailing comma added
        ).protocols(httpProtocol)
            .assertions(
                global().responseTime().max().lt(500), // global from CoreDsl
                global().successfulRequests().percent().gt(95.0), // Trailing comma added
            )
    }
}
