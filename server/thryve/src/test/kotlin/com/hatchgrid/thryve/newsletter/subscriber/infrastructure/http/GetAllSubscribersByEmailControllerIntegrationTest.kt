package com.hatchgrid.thryve.newsletter.subscriber.infrastructure.http

import com.hatchgrid.ControllerIntegrationTest
import io.kotest.assertions.print.print
import org.junit.jupiter.api.Test
import org.springframework.test.context.jdbc.Sql

internal class GetAllSubscribersByEmailControllerIntegrationTest : ControllerIntegrationTest() {
    private val workspaceId = "a0654720-35dc-49d0-b508-1f7df5d915f1"
    private val uri = "/api/workspace/$workspaceId/newsletter/subscriber/find-all-by-emails"
    private val emails = listOf("jana.doe@test.com", "john.doe@test.com")

    @Test
    @Sql(
        "/db/user/users.sql",
        "/db/workspace/workspace.sql",
        "/db/subscriber/subscriber.sql",
    )
    @Sql(
        "/db/subscriber/clean.sql",
        "/db/workspace/clean.sql",
        "/db/user/clean.sql",
        executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD,
    )
    fun `should get all subscribers by email`() {
        webTestClient
            .get()
            .uri { uriBuilder ->
                uriBuilder
                    .path(uri)
                    .queryParam("emails", emails)
                    .build()
            }
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.subscribers").isArray
            .jsonPath("$.subscribers[0].id").isEqualTo("d73e2961-ec29-4f19-b5c4-b9c2dc7f1dee")
            .jsonPath("$.subscribers[0].email").isEqualTo("john.doe@test.com")
            .jsonPath("$.subscribers[0].name").isEqualTo("John Doe")
            .jsonPath("$.subscribers[0].status").isEqualTo("ENABLED")
            .jsonPath("$.subscribers[0].workspaceId").isEqualTo("a0654720-35dc-49d0-b508-1f7df5d915f1")
            .jsonPath("$.subscribers[1].id").isEqualTo("d73e2961-ec29-4f19-b5c4-b9c2dc7f1def")
            .jsonPath("$.subscribers[1].email").isEqualTo("jana.doe@test.com")
            .jsonPath("$.subscribers[1].name").isEqualTo("Jana Doe")
            .jsonPath("$.subscribers[1].status").isEqualTo("ENABLED")
            .jsonPath("$.subscribers[1].workspaceId").isEqualTo("a0654720-35dc-49d0-b508-1f7df5d915f1")
            .consumeWith {
                println(it.responseBody?.print())
            }
    }

    @Test
    @Sql(
        "/db/user/users.sql",
        "/db/workspace/workspace.sql",
        "/db/subscriber/subscriber.sql",
    )
    @Sql(
        "/db/subscriber/clean.sql",
        "/db/workspace/clean.sql",
        "/db/user/clean.sql",
        executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD,
    )
    fun `should return bad request when emails list is empty`() {
        val emails = emptyList<String>()
        webTestClient
            .get()
            .uri { uriBuilder ->
                uriBuilder
                    .path(uri)
                    .queryParam("emails", emails)
                    .build()
            }
            .exchange()
            .expectStatus().isBadRequest
            .expectBody()
            .jsonPath("$.title").isEqualTo("Bad Request")
            .jsonPath("$.status").isEqualTo(400)
            .jsonPath("$.detail").isEqualTo("Required query parameter 'emails' is not present.")
            .jsonPath("$.instance").isEqualTo(uri)
            .consumeWith {
                println(it.responseBody?.print())
            }
    }

    @Test
    @Sql(
        "/db/user/users.sql",
        "/db/workspace/workspace.sql",
        "/db/subscriber/subscriber.sql",
    )
    @Sql(
        "/db/subscriber/clean.sql",
        "/db/workspace/clean.sql",
        "/db/user/clean.sql",
        executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD,
    )
    fun `should return empty response when no subscribers are found`() {
        val emails = listOf("superemail@notfound.com")
        webTestClient
            .get()
            .uri { uriBuilder ->
                uriBuilder
                    .path(uri)
                    .queryParam("emails", emails)
                    .build()
            }
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.subscribers").isEmpty
    }
}
