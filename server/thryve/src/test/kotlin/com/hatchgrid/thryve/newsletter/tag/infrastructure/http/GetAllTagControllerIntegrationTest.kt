package com.hatchgrid.thryve.newsletter.tag.infrastructure.http

import com.hatchgrid.ControllerIntegrationTest
import org.junit.jupiter.api.Test
import org.springframework.test.context.jdbc.Sql

internal class GetAllTagControllerIntegrationTest : ControllerIntegrationTest() {
    private val workspaceId = "a0654720-35dc-49d0-b508-1f7df5d915f1"
    private val uri = "/api/workspace/$workspaceId/tag"

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
    fun `should get all tags for a specific workspace`() {
        webTestClient.get()
            .uri(uri)
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.data").isArray
            .jsonPath("$.data.length()").isEqualTo(4)
            .jsonPath("$.data[0].id").isEqualTo("1e50f6bb-9d83-4047-8643-74d4ea2e2411")
            .jsonPath("$.data[0].name").isEqualTo("Test: Default")
            .jsonPath("$.data[0].color").isEqualTo("default")
            .jsonPath("$.data[0].workspaceId").isEqualTo(workspaceId)
            .jsonPath("$.data[0].subscribers").isArray
            .jsonPath("$.data[0].subscribers.length()").isEqualTo(0)
            .jsonPath("$.data[0].createdAt").isEqualTo("2024-09-18T00:14:14.156")
            .jsonPath("$.data[0].updatedAt").isEqualTo("2024-09-18T00:14:14.176")
            .jsonPath("$.data[1].id").isEqualTo("331afd9a-b3b4-47b3-83cf-3fcb3ab9f926")
            .jsonPath("$.data[1].name").isEqualTo("Test: Premium")
            .jsonPath("$.data[1].color").isEqualTo("red")
            .jsonPath("$.data[1].workspaceId").isEqualTo(workspaceId)
            .jsonPath("$.data[1].subscribers").isArray
            .jsonPath("$.data[1].subscribers.length()").isEqualTo(1)
            .jsonPath("$.data[1].subscribers[0]").isEqualTo("john.doe@test.com")
            .jsonPath("$.data[1].createdAt").isEqualTo("2024-09-18T00:14:13.156")
            .jsonPath("$.data[1].updatedAt").isEqualTo("2024-09-18T00:14:13.176")
            .jsonPath("$.data[2].id").isEqualTo("d667bf8b-69d7-4e32-9488-8ad9865fc644")
            .jsonPath("$.data[2].name").isEqualTo("Test: Pay")
            .jsonPath("$.data[2].color").isEqualTo("blue")
            .jsonPath("$.data[2].workspaceId").isEqualTo(workspaceId)
            .jsonPath("$.data[2].subscribers").isArray
            .jsonPath("$.data[2].subscribers.length()").isEqualTo(1)
            .jsonPath("$.data[2].subscribers[0]").isEqualTo("john.doe@test.com")
            .jsonPath("$.data[2].createdAt").isEqualTo("2024-09-15T21:06:17.829")
            .jsonPath("$.data[2].updatedAt").isEqualTo("2024-09-15T21:06:17.850")
            .jsonPath("$.data[3].id").isEqualTo("16f86bda-45ac-4f9f-9658-4b359a1b98bf")
            .jsonPath("$.data[3].name").isEqualTo("Test: Free")
            .jsonPath("$.data[3].color").isEqualTo("purple")
            .jsonPath("$.data[3].workspaceId").isEqualTo(workspaceId)
            .jsonPath("$.data[3].subscribers").isArray
            .jsonPath("$.data[3].subscribers.length()").isEqualTo(2)
            .jsonPath("$.data[3].subscribers[0]").isEqualTo("john.doe@test.com")
            .jsonPath("$.data[3].subscribers[1]").isEqualTo("jana.doe@test.com")
            .jsonPath("$.data[3].createdAt").isEqualTo("2024-09-15T21:04:16.833")
            .jsonPath("$.data[3].updatedAt").isEqualTo("2024-09-15T21:04:16.861")
            .consumeWith(::println)
    }

    @Test
    @Sql(
        "/db/user/users.sql",
        "/db/workspace/all-workspaces.sql",
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
    fun `should return empty list when there are no tags for a specific workspace`() {
        val workspaceWithoutTags = "894812b3-deb9-469f-b988-d8dfa5a1cf52"
        webTestClient.get()
            .uri("/api/workspace/$workspaceWithoutTags/tag")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.data").isArray
            .jsonPath("$.data.length()").isEqualTo(0)
            .consumeWith(::println)
    }
}
