package com.hatchgrid.thryve.form.infrastructure.http

import com.hatchgrid.ControllerIntegrationTest
import com.hatchgrid.IntegrationTest
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Test
import org.springframework.test.context.jdbc.Sql

@IntegrationTest
internal class FindFormControllerIntegrationTest : ControllerIntegrationTest() {
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
    fun `should return form when form is found`(): Unit = runBlocking {
        val formId = "1659d4ae-402a-4172-bf8b-0a5c54255587"
        webTestClient.get()
            .uri("/api/workspace/$workspaceId/form/$formId")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.id").isEqualTo(formId)
            .jsonPath("$.name").isEqualTo("Programming newsletter v1")
            .jsonPath("$.header").isEqualTo("Juan's Newsletter")
            .jsonPath("$.description").isEqualTo("\uD83D\uDFE2 Some description \uD83D\uDD34")
            .jsonPath("$.inputPlaceholder").isEqualTo("Enter your email")
            .jsonPath("$.buttonText").isEqualTo("Subscribe")
            .jsonPath("$.buttonColor").isEqualTo("#2C81E5")
            .jsonPath("$.backgroundColor").isEqualTo("#DFD150")
            .jsonPath("$.textColor").isEqualTo("#222222")
            .jsonPath("$.buttonTextColor").isEqualTo("#FFFFFF")
            .jsonPath("$.createdAt").isNotEmpty
            .jsonPath("$.updatedAt").isNotEmpty
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
    fun `should return 404 when form is not found`(): Unit = runBlocking {
        val formId = "94be1a32-cf2e-4dfc-892d-bdd8ac7ad354"
        webTestClient.get()
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
            .jsonPath("$.timestamp").isNotEmpty
    }
}
