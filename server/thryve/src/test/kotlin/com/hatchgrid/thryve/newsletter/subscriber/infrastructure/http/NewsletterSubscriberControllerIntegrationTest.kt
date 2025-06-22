package com.hatchgrid.thryve.newsletter.subscriber.infrastructure.http

import com.hatchgrid.ControllerIntegrationTest
import com.hatchgrid.thryve.newsletter.subscriber.SubscriberStub.generateRequest
import java.util.*
import org.junit.jupiter.api.Test
import org.springframework.http.MediaType
import org.springframework.security.test.web.reactive.server.SecurityMockServerConfigurers.csrf
import org.springframework.test.context.jdbc.Sql

internal class NewsletterSubscriberControllerIntegrationTest : ControllerIntegrationTest() {
    private val workspaceId = "a0654720-35dc-49d0-b508-1f7df5d915f1"
    private val url = "/api/workspace/$workspaceId/newsletter/subscriber/${UUID.randomUUID()}"

    @Sql(
        "/db/user/users.sql",
        "/db/workspace/workspace.sql",
    )
    @Sql(
        "/db/workspace/clean.sql",
        "/db/user/clean.sql",
        executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD,
    )
    @Test
    fun `should subscribe a new subscriber`() {
        val request = generateRequest()
        webTestClient.mutateWith(csrf()).put()
            .uri(url)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(request)
            .exchange()
            .expectStatus().isCreated
            .expectBody().isEmpty
    }

    @Test
    @Sql(
        "/db/user/users.sql",
        "/db/workspace/workspace.sql",
    )
    @Sql(
        "/db/workspace/clean.sql",
        "/db/user/clean.sql",
        executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD,
    )
    fun `should not subscribe a new subscriber if email is invalid`() {
        val request = generateRequest(email = "invalid-email")
        webTestClient.mutateWith(csrf()).put()
            .uri(url)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(request)
            .exchange()
            .expectStatus().isBadRequest
            .expectBody()
            .jsonPath("$.title")
            .isEqualTo("Bad Request")
            .jsonPath("$.status")
            .isEqualTo(400)
            .jsonPath("$.instance").isNotEmpty

    }
}
