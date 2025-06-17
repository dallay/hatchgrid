package com.hatchgrid.thryve.newsletter.tag.infrastructure.http

import com.hatchgrid.ControllerTest
import com.hatchgrid.common.domain.presentation.PageResponse
import com.hatchgrid.thryve.newsletter.tag.TagStub
import com.hatchgrid.thryve.newsletter.tag.application.TagResponse
import com.hatchgrid.thryve.newsletter.tag.application.list.GetAllTagsQuery
import io.mockk.coEvery
import io.mockk.coVerify
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.test.web.reactive.server.WebTestClient
import org.springframework.test.web.reactive.server.expectBody

/**
 *
 * @created 22/9/24
 */
internal class GetAllTagControllerTest : ControllerTest() {
    private lateinit var controller: GetAllTagController
    override lateinit var webTestClient: WebTestClient
    private val workspaceId = "a0654720-35dc-49d0-b508-1f7df5d915f1"
    private val tags = TagStub.randomTagsList(30)
    private lateinit var tagResponses: List<TagResponse>
    private val uri = "/api/workspace/$workspaceId/tag"

    @BeforeEach
    override fun setUp() {
        super.setUp()
        tagResponses = tags.map { TagResponse.from(it) }
        coEvery { mediator.send(GetAllTagsQuery(workspaceId, userId.toString())) } returns PageResponse(tagResponses)
        controller = GetAllTagController(mediator)
        webTestClient = WebTestClient.bindToController(controller).build()
    }

    @Test
    fun `should get all tags for a specific workspace`() {
        webTestClient.get()
            .uri(uri)
            .exchange()
            .expectStatus().isOk
            .expectBody<PageResponse<TagResponse>>()
            .consumeWith {
                val actualPageResponse = it.responseBody!!
                assertEquals(tagResponses, actualPageResponse.data)
            }

        coVerify(exactly = 1) { mediator.send(GetAllTagsQuery(workspaceId, userId.toString())) }
    }

    @Test
    fun `should return empty list when there are no tags for a specific workspace`() {
        coEvery { mediator.send(GetAllTagsQuery(workspaceId, userId.toString())) } returns PageResponse(emptyList())

        webTestClient.get()
            .uri(uri)
            .exchange()
            .expectStatus().isOk
            .expectBody<PageResponse<TagResponse>>()
            .consumeWith {
                val actualPageResponse = it.responseBody!!
                assertEquals(emptyList<TagResponse>(), actualPageResponse.data)
            }

        coVerify(exactly = 1) { mediator.send(GetAllTagsQuery(workspaceId, userId.toString())) }
    }
}
