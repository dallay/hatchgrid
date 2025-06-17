package com.hatchgrid.thryve.newsletter.subscriber.infrastructure.http

import com.hatchgrid.ControllerIntegrationTest
import org.junit.jupiter.api.Test
import org.springframework.test.context.jdbc.Sql

internal class SubscriberCountByTagsControllerIntegationTest : ControllerIntegrationTest() {
    private val workspaceId = "a0654720-35dc-49d0-b508-1f7df5d915f1"

    @Test
    @Sql(
        "/db/user/users.sql",
        "/db/workspace/workspace.sql", "/db/subscriber/subscriber-stats.sql",
    )
    @Sql(
        "/db/subscriber/clean.sql",
        "/db/workspace/clean.sql",
        "/db/user/clean.sql",
        executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD,
    )
    fun `should count subscribers by tags`() {
        webTestClient.get()
            .uri("/api/workspace/$workspaceId/newsletter/subscriber/count-by-tags")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .consumeWith { response -> println(String(response.responseBody!!)) }
            .jsonPath("$.data").isArray
            .jsonPath("$.data.length()").isEqualTo(19)
            .apply {
                listOf(
                    "tag2" to 2, "tag51" to 1, "tag89" to 1, "tag46" to 1, "tag14" to 1,
                    "tag61" to 1, "tag11" to 1, "tag5" to 9, "tag18" to 1, "tag3" to 12,
                    "tag21" to 1, "tag1" to 6, "tag99" to 1, "tag41" to 1, "tag4" to 11,
                    "tag7" to 1, "tag25" to 1, "tag63" to 1, "tag6" to 2,
                ).forEachIndexed { index, (tag, count) ->
                    jsonPath("$.data[$index].tag").isEqualTo(tag)
                    jsonPath("$.data[$index].count").isEqualTo(count)
                }
            }
    }
}
