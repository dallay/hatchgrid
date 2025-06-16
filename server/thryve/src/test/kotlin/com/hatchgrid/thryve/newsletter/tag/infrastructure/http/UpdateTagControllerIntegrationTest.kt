package com.hatchgrid.thryve.newsletter.tag.infrastructure.http

import com.hatchgrid.ControllerIntegrationTest
import com.hatchgrid.thryve.newsletter.tag.TagStub
import org.junit.jupiter.api.Test
import org.springframework.http.MediaType
import org.springframework.security.test.web.reactive.server.SecurityMockServerConfigurers.csrf
import org.springframework.test.context.jdbc.Sql

internal class UpdateTagControllerIntegrationTest : ControllerIntegrationTest() {
    private val workspaceId = "a0654720-35dc-49d0-b508-1f7df5d915f1"
    private val tagId = "331afd9a-b3b4-47b3-83cf-3fcb3ab9f926"
    private val url = "/api/workspace/$workspaceId/tag/$tagId/update"

    @Test
    @Sql("/db/subscriber/subscriber.sql", "/db/tag/tag.sql")
    @Sql(
        "/db/subscriber/clean.sql",
        "/db/tag/clean.sql",
        executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD,
    )
    fun `should update a tag`() {
        val request = TagStub.generateTagRequest(isUpdate = true)
        webTestClient.mutateWith(csrf()).put()
            .uri(url)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(request)
            .exchange()
            .expectStatus().isOk
            .expectBody(String::class.java)
            .isEqualTo("Tag updated")
            .consumeWith(::println)
    }

    @Sql("/db/subscriber/subscriber.sql", "/db/tag/tag.sql")
    @Sql(
        "/db/subscriber/clean.sql",
        "/db/tag/clean.sql",
        executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD,
    )
    @Test
    fun `should not update a tag if not found`() {
        val request = TagStub.generateTagRequest(isUpdate = true)
        val missingTagId = "dcb38685-4367-42ea-a942-734bae0a8d78"
        val uriTagIdMissing =
            "/api/workspace/$workspaceId/tag/$missingTagId/update"
        val errorMessage =
            "Tag with id $missingTagId not found for workspace $workspaceId"
        webTestClient.mutateWith(csrf()).put()
            .uri(uriTagIdMissing)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(request)
            .exchange()
            .expectStatus().isBadRequest
            .expectBody()
            .jsonPath("$.type").isEqualTo("https://hatchgrid.com/errors/bad-request")
            .jsonPath("$.title").isEqualTo("Bad request")
            .jsonPath("$.status").isEqualTo(400)
            .jsonPath("$.detail")
            .isEqualTo(errorMessage)
            .jsonPath("$.instance")
            .isEqualTo(uriTagIdMissing)
            .jsonPath("$.errorCategory").isEqualTo("BAD_REQUEST")
            .jsonPath("$.timestamp").isNumber
            .consumeWith(::println)
    }
}
