package com.hatchgrid.thryve.form.infrastructure.http

import com.hatchgrid.ControllerIntegrationTest
import com.hatchgrid.thryve.form.FormStub
import kotlinx.coroutines.test.runTest
import org.junit.jupiter.api.Test
import org.springframework.http.MediaType
import org.springframework.security.test.web.reactive.server.SecurityMockServerConfigurers.csrf
import org.springframework.test.context.jdbc.Sql

internal class UpdateFormControllerIntegrationTest : ControllerIntegrationTest() {
    private val workspaceId = "a0654720-35dc-49d0-b508-1f7df5d915f1"

    @Test
    @Sql(
        "/db/user/users.sql",
        "/db/workspace/workspace.sql",
        "/db/form/form-batch.sql",
    )
    @Sql(
        "/db/form/clean.sql",
        "/db/workspace/clean.sql",
        "/db/user/clean.sql",
        executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD,
    )
    fun `should update an existing form`(): Unit = runTest {
        val formId = "1659d4ae-402a-4172-bf8b-0a5c54255587"
        val request = FormStub.generateRequest()
        webTestClient.mutateWith(csrf()).put()
            .uri("/api/workspace/$workspaceId/form/$formId/update")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(request)
            .exchange()
            .expectStatus().isOk
            .expectBody().isEmpty
    }

    @Test
    @Sql(
        "/db/user/users.sql",
        "/db/workspace/workspace.sql",
        "/db/form/form-batch.sql",
    )
    @Sql(
        "/db/form/clean.sql",
        "/db/workspace/clean.sql",
        "/db/user/clean.sql",
        executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD,
    )
    fun `should return 404 when form is not found`(): Unit = runTest {
        val id = "a5533c80-61f4-4db2-9fb7-191caa94e2bc"
        val request = FormStub.generateRequest()
        webTestClient.mutateWith(csrf()).put()
            .uri("/api/workspace/$workspaceId/form/$id/update")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(request)
            .exchange()
            .expectStatus().isNotFound
            .expectBody()
            .jsonPath("$.type").isEqualTo("https://hatchgrid.com/errors/entity-not-found")
            .jsonPath("$.title").isEqualTo("Entity not found")
            .jsonPath("$.status").isEqualTo(404)
            .jsonPath("$.detail").isEqualTo("Form not found")
            .jsonPath("$.instance").isEqualTo("/api/workspace/$workspaceId/form/$id/update")
            .jsonPath("$.errorCategory").isEqualTo("NOT_FOUND")
            .jsonPath("$.timestamp").isNotEmpty
    }
}
