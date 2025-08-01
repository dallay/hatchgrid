package com.hatchgrid.thryve.form.infrastructure.http

import com.hatchgrid.ControllerIntegrationTest
import com.hatchgrid.thryve.form.FormStub
import java.util.*
import org.junit.jupiter.api.Test
import org.springframework.http.MediaType
import org.springframework.security.test.web.reactive.server.SecurityMockServerConfigurers.csrf
import org.springframework.test.context.jdbc.Sql

internal class CreateFormControllerIntegrationTest : ControllerIntegrationTest() {
    private val workspaceId = "a0654720-35dc-49d0-b508-1f7df5d915f1"

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
    fun `should create a new form`() {
        val request = FormStub.generateRequest()
        val id = UUID.randomUUID().toString()
        webTestClient.mutateWith(csrf()).put()
            .uri("/api/workspace/$workspaceId/form/$id")
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
        "/db/form/form.sql",
    )
    @Sql(
        "/db/form/clean.sql",
        "/db/workspace/clean.sql",
        "/db/user/clean.sql",
        executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD,
    )
    fun `should fail when the form already exists`() {
        val request = FormStub.generateRequest()
        val id = "1659d4ae-402a-4172-bf8b-0a5c54255587"
        webTestClient.mutateWith(csrf()).put()
            .uri("/api/workspace/$workspaceId/form/$id")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(request)
            .exchange()
            .expectStatus().isBadRequest
            .expectBody()
            .jsonPath("$.type").isEqualTo("https://hatchgrid.com/errors/bad-request")
            .jsonPath("$.title").isEqualTo("Bad request")
            .jsonPath("$.status").isEqualTo(400)
            .jsonPath("$.detail").isEqualTo("Error creating form")
            .jsonPath("$.instance").isEqualTo("/api/workspace/$workspaceId/form/$id")
            .jsonPath("$.errorCategory").isEqualTo("BAD_REQUEST")
            .jsonPath("$.timestamp").isNumber
    }
}
