package com.hatchgrid.thryve.newsletter.subscriber.application.search.email

import com.hatchgrid.UnitTest
import com.hatchgrid.thryve.newsletter.subscriber.SubscriberStub
import com.hatchgrid.thryve.newsletter.subscriber.application.SubscriberResponse
import com.hatchgrid.thryve.newsletter.subscriber.domain.Subscriber
import com.hatchgrid.thryve.newsletter.subscriber.domain.SubscriberSearchRepository
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
internal class AllSubscribersByEmailQueryHandlerTest {
    private val repository = mockk<SubscriberSearchRepository>()
    private val allSubscribersByEmails = GetAllSubscribersByEmailService(repository)
    private val workspaceMemberRepository: WorkspaceMemberRepository = mockk()
    private val workspaceAuthorizationService: WorkspaceAuthorizationService =
        WorkspaceAuthorizationService(
            workspaceMemberRepository,
        )
    private val handler =
        AllSubscribersByEmailQueryHandler(workspaceAuthorizationService, allSubscribersByEmails)
    private val wsId = "27172d5a-b88e-451c-9787-312706f4570d"
    private val workspaceId = WorkspaceId(wsId)
    private val userId = UserId("c1b2df3e-4a5b-6c7d-8e9f-0a1b2c3d4e5f")
    private val subscribers = SubscriberStub.dummyRandomSubscribersList(30)
    private lateinit var emails: Set<String>

    @BeforeEach
    fun setUp() {
        emails = subscribers.map { it.email.value }.toSet()
        coEvery {
            workspaceMemberRepository.existsByWorkspaceIdAndUserId(
                eq(workspaceId.value),
                eq(userId.value),
            )
        } returns true
        coEvery {
            repository.searchAllByEmails(
                workspaceId,
                emails,
            )
        } returns subscribers
    }

    @Test
    fun `should search all subscribers by emails`(): Unit = runTest {
        // Given
        val query = AllSubscribersByEmailQuery(wsId, userId.value.toString(), emails)

        // When
        val result = handler.handle(query)

        // Then
        coVerify(exactly = 1) { repository.searchAllByEmails(workspaceId, emails) }
        assertEquals(
            subscribers.map {
                SubscriberResponse.from(it)
            },
            result.subscribers,
        )
    }

    @Test
    fun `should return empty list when no subscribers are found`(): Unit = runTest {
        // Given
        val query = AllSubscribersByEmailQuery(wsId, userId.value.toString(), emails)
        coEvery {
            repository.searchAllByEmails(
                workspaceId,
                emails,
            )
        } returns emptyList<Subscriber>()

        // When
        val result = handler.handle(query)

        // Then
        coVerify(exactly = 1) { repository.searchAllByEmails(workspaceId, emails) }
        assertEquals(emptyList<Subscriber>(), result.subscribers)
    }

    @Test
    fun `should return empty list when no emails are provided`(): Unit = runTest {
        // Given
        val query = AllSubscribersByEmailQuery(wsId, userId.value.toString(), emptySet())
        coEvery {
            repository.searchAllByEmails(
                workspaceId,
                emptySet(),
            )
        } returns emptyList()

        // When
        val result = handler.handle(query)

        // Then
        coVerify(exactly = 0) { repository.searchAllByEmails(workspaceId, emptySet()) }
        assertEquals(emptyList<Subscriber>(), result.subscribers)
    }
}
