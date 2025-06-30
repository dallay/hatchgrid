package com.hatchgrid.thryve.simulation

import io.gatling.javaapi.core.*
import io.gatling.javaapi.http.*
import io.gatling.javaapi.core.CoreDsl.*
import io.gatling.javaapi.http.HttpDsl.*
import java.time.Duration

class UserLoginSimulation : Simulation() {
    private val httpProtocol = http
        .baseUrl("http://localhost:8080")
        .acceptHeader("application/json")
        .contentTypeHeader("application/json")
        .userAgentHeader("Gatling/PerformanceTest")

    private val users = csv("users.csv").circular()

    private val scn = scenario("User Login")
        .feed(users)
        .exec(
            http("Login Request")
                .post("/api/auth/login")
                .body(StringBody("""{"username": "#{username}", "password": "#{password}"}""")).asJson()
                .check(status().`is`(200))
                .check(jsonPath("$.token").exists().saveAs("authToken"))
        )
        .exec { session ->
            println("User #" + session.userId() + " logged in with token: " + session.getString("authToken"))
            session
        }

    init {
        setUp(
            scn.injectOpen(rampUsers(10).during(Duration.ofSeconds(10)))
        ).protocols(httpProtocol)
         .assertions(
             global().responseTime().max().lt(1000),
             global().successfulRequests().percent().gt(90.0)
         )
    }
}
