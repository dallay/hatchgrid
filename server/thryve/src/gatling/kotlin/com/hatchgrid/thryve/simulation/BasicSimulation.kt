package com.hatchgrid.thryve.simulation

import io.gatling.javaapi.core.*
import io.gatling.javaapi.http.*
import io.gatling.javaapi.core.CoreDsl.*
import io.gatling.javaapi.http.HttpDsl.*
import java.time.Duration

class BasicSimulation : Simulation() {
    private val httpProtocol = http
        .baseUrl("http://localhost:8080")
        .acceptHeader("application/json")
        .userAgentHeader("Gatling/PerformanceTest")

    private val scn = scenario("Basic Health Check")
        .exec(
            http("Health Check Request")
                .get("/actuator/health")
                .check(status().`is`(200))
        )

    init {
        setUp(
            scn.injectOpen(atOnceUsers(10))
        ).protocols(httpProtocol)
         .assertions(
             global().responseTime().max().lt(500),
             global().successfulRequests().percent().gt(95.0)
         )
    }
}
