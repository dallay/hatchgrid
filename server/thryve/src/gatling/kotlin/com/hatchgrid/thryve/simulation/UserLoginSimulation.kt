package com.hatchgrid.thryve.simulation

import io.gatling.javaapi.core.* // Wildcard for Core types
import io.gatling.javaapi.core.CoreDsl.* // Wildcard for Core DSL
import io.gatling.javaapi.http.* // Wildcard for HTTP types
import io.gatling.javaapi.http.HttpDsl.* // Wildcard for HTTP DSL
import java.time.Duration

class UserLoginSimulation : Simulation() {
    private val httpProtocol = http // from HttpDsl.*
        .baseUrl("http://localhost:8080")
        .acceptHeader("application/json")
        .contentTypeHeader("application/json")
        .userAgentHeader("Gatling/PerformanceTest")

    private val usersFeeder = csv("users.csv").circular() // from CoreDsl.*

    private val scn = scenario("User Login") // from CoreDsl.*
        .feed(usersFeeder) // .feed is a method on ScenarioBuilder
        .exec(
            http("Login Request") // from HttpDsl.*
                .post("/api/auth/login")
                .body(
                    StringBody("""{"username": "#{username}", "password": "#{password}"}"""),
                ).asJson() // StringBody from CoreDsl.*
                .check(status().`is`(200)) // status from HttpDsl.*
                .check(jsonPath("$.token").exists().saveAs("authToken")), // jsonPath from HttpDsl.* // Removed potentially problematic trailing comma
        )
        .exec { session ->
            // println("User #" + session.userId() + " logged in with token: " + session.getString("authToken"))
            session
        }

    init {
        setUp(
            scn.injectOpen(
                rampUsers(10).during(Duration.ofSeconds(10)), // rampUsers from CoreDsl.* // Trailing comma added
            ), // Trailing comma added
        ).protocols(httpProtocol)
            .assertions(
                global().responseTime().max().lt(1000), // global from CoreDsl.*
                global().successfulRequests().percent().gt(90.0), // Trailing comma added
            )
    }
}
