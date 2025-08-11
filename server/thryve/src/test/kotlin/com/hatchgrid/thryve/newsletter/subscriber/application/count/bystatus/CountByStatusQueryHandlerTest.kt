package com.hatchgrid.thryve.newsletter.subscriber.application.count.bystatus

import com.hatchgrid.UnitTest
import com.hatchgrid.thryve.newsletter.subscriber.domain.SubscriberStatsRepository
import com.hatchgrid.thryve.users.domain.UserId
import com.hatchgrid.thryve.workspace.application.security.WorkspaceAuthorizationService
import com.hatchgrid.thryve.workspace.domain.WorkspaceId
import com.hatchgrid.thryve.workspace.domain.WorkspaceMemberRepository
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.test.runTest
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

@UnitTest
internal class CountByStatusQueryHandlerTest {
    private val repository = mockk<SubscriberStatsRepository>()
    private val counter = SubscriberCountByStatus(repository)
    private val workspaceMemberRepository: WorkspaceMemberRepository = mockk()
    private val workspaceAuthorizationService: WorkspaceAuthorizationService =
        WorkspaceAuthorizationService(workspaceMemberRepository)
    private val handler = CountByStatusQueryHandler(workspaceAuthorizationService, counter)
    private val statuses = listOf("ENABLED" to 10L, "DISABLED" to 5L, "BLOCKLISTED" to 98L)
    private val wId = "27172d5a-b88e-451c-9787-312706f4570d"
    private val uId = "17140d5a-3879-4708-b7ca-097095a085fe"
    private val workspaceId = WorkspaceId(wId)
    private val userId = UserId(uId)

    @BeforeEach
    fun setUp() {
        coEvery {
            workspaceMemberRepository.existsByWorkspaceIdAndUserId(
                eq(workspaceId.value),
                eq(userId.value),
            )
        } returns true
        coEvery { repository.countByStatus(workspaceId) } returns statuses
    }

    @Test
    fun `should count subscribers by status`(): Unit = runTest {
        // Given
        val query = CountByStatusQuery(wId, uId)

        // When
        val result = handler.handle(query)

        // Then
        coVerify(exactly = 1) { repository.countByStatus(workspaceId) }
        assertEquals(3, result.data.size)
        assertEquals(10L, result.data.first { it.status == "ENABLED" }.count)
        assertEquals(5L, result.data.first { it.status == "DISABLED" }.count)
        assertEquals(98L, result.data.first { it.status == "BLOCKLISTED" }.count)
    }
}
