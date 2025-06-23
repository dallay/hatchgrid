package com.hatchgrid.thryve.form.infrastructure.http

import com.hatchgrid.ControllerIntegrationTest
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Test
import org.springframework.security.test.web.reactive.server.SecurityMockServerConfigurers.csrf
import org.springframework.test.context.jdbc.Sql

internal class DeleteFormControllerIntegrationTest : ControllerIntegrationTest() {
    private val workspaceId = "a0654720-35dc-49d0-b508-1f7df5d915f1"

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
    fun `should delete form when form is found`(): Unit = runBlocking {
        val formId = "1659d4ae-402a-4172-bf8b-0a5c54255587"
        webTestClient.mutateWith(csrf()).delete()
            .uri("/api/workspace/$workspaceId/form/$formId")
            .exchange()
            .expectStatus().isOk
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
    fun `should not delete form when form is not found`(): Unit = runBlocking {
        val formId = "94be1a32-cf2e-4dfc-892d-bdd8ac7ad354"
        webTestClient.mutateWith(csrf()).delete()
            .uri("/api/workspace/$workspaceId/form/$formId")
            .exchange()
            .expectStatus().isNotFound
            .expectBody()
            .jsonPath("$.type").isEqualTo("https://hatchgrid.com/errors/entity-not-found")
            .jsonPath("$.title").isEqualTo("Entity not found")
            .jsonPath("$.status").isEqualTo(404)
            .jsonPath("$.detail").isEqualTo("Form not found")
            .jsonPath("$.instance").isEqualTo("/api/workspace/$workspaceId/form/$formId")
            .jsonPath("$.errorCategory").isEqualTo("NOT_FOUND")
            .jsonPath("$.timestamp").isNumber
    }
}
