package com.hatchgrid.thryve.newsletter.subscriber.application.count.bytags

import com.hatchgrid.UnitTest
import com.hatchgrid.thryve.newsletter.subscriber.domain.SubscriberStatsRepository
import com.hatchgrid.thryve.users.domain.UserId
import com.hatchgrid.thryve.workspace.application.security.WorkspaceAuthorizationService
import com.hatchgrid.thryve.workspace.domain.WorkspaceId
import com.hatchgrid.thryve.workspace.domain.WorkspaceMemberRepository
import io.kotest.common.runBlocking
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

@UnitTest
internal class CountByTagsQueryHandlerTest {
    private val repository = mockk<SubscriberStatsRepository>()
    private val counter = SubscriberCountByTags(repository)
    private val workspaceMemberRepository: WorkspaceMemberRepository = mockk()
    private val workspaceAuthorizationService: WorkspaceAuthorizationService =
        WorkspaceAuthorizationService(workspaceMemberRepository)
    private val handler = CountByTagsQueryHandler(workspaceAuthorizationService, counter)
    private val tags = listOf("tag1" to 10L, "tag2" to 5L, "tag3" to 98L)
    private val wId = "27172d5a-b88e-451c-9787-312706f4570d"
    private val uId = "17140d5a-3879-4708-b7ca-097095a085fe"
    private val workspaceId = WorkspaceId(wId)
    private val userId = UserId(uId)

    @BeforeEach
    fun setUp() {
        coEvery {
            workspaceMemberRepository.existsByWorkspaceIdAndUserId(
                eq(workspaceId.value),
                eq(userId.value)
            )
        } returns true
        coEvery { repository.countByTag(workspaceId) } returns tags
    }

    @Test
    fun `should count subscribers by tags`(): Unit = runBlocking {
        // Given
        val query = CountByTagsQuery(wId, uId)

        // When
        val result = handler.handle(query)

        // Then
        coVerify(exactly = 1) { repository.countByTag(workspaceId) }
        assertEquals(3, result.data.size)
        assertEquals(10L, result.data.first { it.tag == "tag1" }.count)
        assertEquals(5L, result.data.first { it.tag == "tag2" }.count)
        assertEquals(98L, result.data.first { it.tag == "tag3" }.count)
    }
}
