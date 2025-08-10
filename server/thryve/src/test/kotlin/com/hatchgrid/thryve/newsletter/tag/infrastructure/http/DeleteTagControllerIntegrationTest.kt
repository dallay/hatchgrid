package com.hatchgrid.thryve.newsletter.tag.infrastructure.http

import com.hatchgrid.ControllerIntegrationTest
import kotlinx.coroutines.test.runTest
import org.junit.jupiter.api.Test
import org.springframework.security.test.web.reactive.server.SecurityMockServerConfigurers.csrf
import org.springframework.test.context.jdbc.Sql

internal class DeleteTagControllerIntegrationTest : ControllerIntegrationTest() {
    private val workspaceId = "a0654720-35dc-49d0-b508-1f7df5d915f1"

    @Test
    @Sql(
        "/db/user/users.sql",
        "/db/workspace/workspace.sql",
        "/db/subscriber/subscriber.sql",
        "/db/tag/tag.sql",
    )
    @Sql(
        "/db/subscriber/clean.sql",
        "/db/tag/clean.sql",
        "/db/workspace/clean.sql",
        "/db/user/clean.sql",
        executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD,
    )
    fun `should delete tag when tag is found`(): Unit = runTest {
        val tagId = "d667bf8b-69d7-4e32-9488-8ad9865fc644"
        webTestClient.mutateWith(csrf()).delete()
            .uri("/api/workspace/$workspaceId/tag/$tagId")
            .exchange()
            .expectStatus().isOk
            .expectBody().isEmpty
    }
}
