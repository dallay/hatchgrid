package com.hatchgrid.thryve.newsletter.subscriber.application.search.active

import com.hatchgrid.UnitTest
import com.hatchgrid.thryve.newsletter.subscriber.SubscriberStub
import com.hatchgrid.thryve.newsletter.subscriber.domain.SubscriberSearchRepository
import com.hatchgrid.thryve.workspace.application.security.WorkspaceAuthorizationService
import com.hatchgrid.thryve.workspace.domain.WorkspaceAuthorizationException
import com.hatchgrid.thryve.workspace.domain.WorkspaceMemberRepository
import io.kotest.assertions.throwables.shouldThrow
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import io.mockk.spyk
import java.util.UUID
import kotlinx.coroutines.test.runTest
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

@UnitTest
internal class SearchAllActiveSubscribersQueryHandlerTest {
    private lateinit var repository: SubscriberSearchRepository
    private lateinit var workspaceMemberRepository: WorkspaceMemberRepository
    private lateinit var workspaceAuthorizationService: WorkspaceAuthorizationService
    private lateinit var searcher: ActiveSubscriberSearcher
    private lateinit var searchAllActiveSubscribersQueryHandler: SearchAllActiveSubscribersQueryHandler
    private lateinit var workspaceId: UUID
    private lateinit var userId: UUID

    @BeforeEach
    fun setUp() {
        workspaceId = UUID.randomUUID()
        userId = UUID.randomUUID()
        repository = mockk()
        workspaceMemberRepository = mockk()
        searcher = ActiveSubscriberSearcher(repository)
        workspaceAuthorizationService = spyk(WorkspaceAuthorizationService(workspaceMemberRepository))
        searchAllActiveSubscribersQueryHandler =
            SearchAllActiveSubscribersQueryHandler(workspaceAuthorizationService, searcher)

        coEvery { repository.searchActive() } returns SubscriberStub.dummyRandomSubscribersList()
        coEvery {
            workspaceMemberRepository.existsByWorkspaceIdAndUserId(eq(workspaceId), eq(userId))
        } returns true
    }

    @Test
    fun `should search all active subscribers`() = runTest {
        // Given
        val query = SearchAllActiveSubscribersQuery(workspaceId.toString(), userId.toString())

        // When
        val response = searchAllActiveSubscribersQueryHandler.handle(query)

        // Then
        assertTrue(response.subscribers.isNotEmpty())
        assertEquals(10, response.subscribers.size)
        coVerify(exactly = 1) { repository.searchActive() }
    }

    @Test
    fun `should authorize workspace access`() = runTest {
        // Given
        val query = SearchAllActiveSubscribersQuery(workspaceId.toString(), userId.toString())

        // Ensure the dependency causes the spied service to throw the exception
        coEvery {
            workspaceMemberRepository.existsByWorkspaceIdAndUserId(eq(workspaceId), eq(userId))
        } returns false // This will make the real (spied) ensureAccess method throw

        // When
        shouldThrow<WorkspaceAuthorizationException> {
            searchAllActiveSubscribersQueryHandler.handle(query)
        }
        // Then
        coVerify(exactly = 1) { // This will now work
            workspaceAuthorizationService.ensureAccess(
                workspaceId.toString(),
                userId.toString(),
            )
        }
        coVerify(exactly = 0) { repository.searchActive() }
    }
}
