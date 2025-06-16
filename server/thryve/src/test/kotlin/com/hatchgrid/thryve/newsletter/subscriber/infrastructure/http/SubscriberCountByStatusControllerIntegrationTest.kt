package com.hatchgrid.thryve.newsletter.subscriber.infrastructure.http

import com.hatchgrid.ControllerIntegrationTest
import org.junit.jupiter.api.Test
import org.springframework.test.context.jdbc.Sql

internal class SubscriberCountByStatusControllerIntegrationTest : ControllerIntegrationTest() {
    private val workspaceId = "a0654720-35dc-49d0-b508-1f7df5d915f1"

    @Test
    @Sql(
        "/db/user/users.sql",
        "/db/workspace/workspace.sql",
        "/db/subscriber/subscriber-stats.sql",
    )
    @Sql(
        "/db/subscriber/clean.sql",
        "/db/workspace/clean.sql",
        "/db/user/clean.sql",
        executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD,
    )
    fun `should count subscribers by status`() {
        webTestClient.get()
            .uri("/api/workspace/$workspaceId/newsletter/subscriber/count-by-status")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .consumeWith { response -> println(String(response.responseBody!!)) }
            .jsonPath("$.data").isArray
            .jsonPath("$.data.length()").isEqualTo(3)
            .jsonPath("$.data[0].status").isEqualTo("ENABLED")
            .jsonPath("$.data[0].count").isEqualTo(12)
            .jsonPath("$.data[1].status").isEqualTo("DISABLED")
            .jsonPath("$.data[1].count").isEqualTo(10)
            .jsonPath("$.data[2].status").isEqualTo("BLOCKLISTED")
            .jsonPath("$.data[2].count").isEqualTo(5)
    }
}
