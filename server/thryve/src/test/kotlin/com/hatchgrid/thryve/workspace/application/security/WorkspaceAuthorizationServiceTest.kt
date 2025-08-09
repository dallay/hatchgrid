package com.hatchgrid.thryve.workspace.application.security

import com.hatchgrid.UnitTest
import com.hatchgrid.thryve.workspace.domain.WorkspaceAuthorizationException
import com.hatchgrid.thryve.workspace.domain.WorkspaceMemberRepository
import io.mockk.coEvery
import io.mockk.mockk
import java.util.UUID
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows

@UnitTest
class WorkspaceAuthorizationServiceTest {

    private val workspaceMemberRepository: WorkspaceMemberRepository = mockk()
    private val workspaceAuthorizationService = WorkspaceAuthorizationService(workspaceMemberRepository)

    @Test
    fun should_allowAccess_when_userIsMemberOfWorkspace() = runBlocking {
        val workspaceId = UUID.randomUUID()
        val userId = UUID.randomUUID()

        coEvery { workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, userId) } returns true

        workspaceAuthorizationService.ensureAccess(workspaceId, userId)
    }

    @Test
    fun should_throwException_when_userIsNotMemberOfWorkspace() = runBlocking {
        val workspaceId = UUID.randomUUID()
        val userId = UUID.randomUUID()

        coEvery { workspaceMemberRepository.existsByWorkspaceIdAndUserId(workspaceId, userId) } returns false

        val exception = assertThrows<WorkspaceAuthorizationException> {
            workspaceAuthorizationService.ensureAccess(workspaceId, userId)
        }

        assertTrue(exception.message.contains("User $userId has no access to workspace $workspaceId"))
    }

    @Test
    fun should_throwException_when_invalidUUIDStringsProvided(): Unit = runBlocking {
        val invalidWorkspaceId = "invalid-uuid"
        val invalidUserId = "invalid-uuid"

        assertThrows<IllegalArgumentException> {
            workspaceAuthorizationService.ensureAccess(invalidWorkspaceId, invalidUserId)
        }
    }
}
