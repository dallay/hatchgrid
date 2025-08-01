package com.hatchgrid.thryve.newsletter.tag.infrastructure.http

import com.hatchgrid.ControllerIntegrationTest
import com.hatchgrid.thryve.newsletter.tag.TagStub
import java.util.UUID
import org.junit.jupiter.api.Test
import org.springframework.http.MediaType
import org.springframework.security.test.web.reactive.server.SecurityMockServerConfigurers.csrf
import org.springframework.test.context.jdbc.Sql

internal class CreateTagControllerIntegrationTest : ControllerIntegrationTest() {
    private val tagId = UUID.randomUUID()
    private val workspaceId = "a0654720-35dc-49d0-b508-1f7df5d915f1"
    private val url = "/api/workspace/$workspaceId/tag/$tagId"

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
    fun `should create a new tag`() {
        val request = TagStub.generateTagRequest()
        webTestClient.mutateWith(csrf()).put()
            .uri(url)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(request)
            .exchange()
            .expectStatus().isCreated
            .expectBody().isEmpty
    }

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
    fun `should create a new tag with default color`() {
        webTestClient.mutateWith(csrf()).put()
            .uri(url)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue("""{"name": "Test Tag"}""")
            .exchange()
            .expectStatus().isCreated
            .expectBody().isEmpty
    }
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
    fun `should not create a new tag if name is empty`() {
        val request = TagStub.generateTagRequest(name = "")
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
            .consumeWith(::println)
    }
}
