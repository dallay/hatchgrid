package com.hatchgrid.thryve.workspace.infrastructure.persistence

import com.hatchgrid.UnitTest
import com.hatchgrid.thryve.users.domain.UserId
import com.hatchgrid.thryve.workspace.WorkspaceStub
import com.hatchgrid.thryve.workspace.domain.Workspace
import com.hatchgrid.thryve.workspace.domain.WorkspaceException
import com.hatchgrid.thryve.workspace.infrastructure.persistence.mapper.WorkspaceMapper.toEntity
import com.hatchgrid.thryve.workspace.infrastructure.persistence.repository.WorkspaceMemberR2dbcRepository
import com.hatchgrid.thryve.workspace.infrastructure.persistence.repository.WorkspaceR2dbcRepository
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import java.util.*
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.dao.DuplicateKeyException
import org.springframework.dao.TransientDataAccessResourceException

@UnitTest
internal class WorkspaceStoreR2DbcRepositoryTest {
    private val workspaceRepository: WorkspaceR2dbcRepository = mockk()
    private val workspaceMemberRepository: WorkspaceMemberR2dbcRepository = mockk()
    private val workspaceStoreR2dbcRepository =
        WorkspaceStoreR2DbcRepository(workspaceRepository, workspaceMemberRepository)
    private lateinit var workspace: Workspace

    @BeforeEach
    fun setUp() {
        workspace = WorkspaceStub.create()
    }

    @Test
    fun `should create workspace`() = runBlocking {
        // Given
        coEvery { workspaceRepository.save(any()) } returns workspace.toEntity()
        coEvery { workspaceMemberRepository.save(any()) } returns mockk()

        // When
        workspaceStoreR2dbcRepository.create(workspace)

        // Then
        coVerify(exactly = 1) { workspaceRepository.save(workspace.toEntity()) }
        // Verify that each member is saved
        workspace.members.forEach { memberId ->
            coVerify(exactly = 1) {
                workspaceMemberRepository.save(match {
                    it.workspaceId == workspace.id.value && it.userId == memberId.value
                })
            }
        }
    }

    @Test
    fun `should handle duplicate workspace creation gracefully`(): Unit = runBlocking {
        // Given
        coEvery { workspaceRepository.save(any()) } throws DuplicateKeyException("Duplicate key")
        coEvery { workspaceMemberRepository.save(any()) } returns mockk()

        // When / Then
        assertThrows<WorkspaceException> {
            workspaceStoreR2dbcRepository.create(workspace)
        }
    }

    @Test
    fun `should update workspace`() = runBlocking {
        // Given
        coEvery { workspaceRepository.save(any()) } returns workspace.toEntity()

        // When
        workspaceStoreR2dbcRepository.update(workspace)

        // Then
        coVerify(exactly = 1) { workspaceRepository.save(workspace.toEntity()) }
    }

    @Test
    fun `should handle unexpected error during workspace update`(): Unit = runBlocking {
        // Given
        coEvery { workspaceRepository.save(any()) } throws RuntimeException("Unexpected error")

        // When / Then
        assertThrows<RuntimeException> {
            workspaceStoreR2dbcRepository.update(workspace)
        }
    }

    @Test
    fun `should handle error when the form does not exist`(): Unit = runBlocking {
        // Given
        coEvery { workspaceRepository.save(any()) } throws TransientDataAccessResourceException("Unexpected error")

        // When / Then
        assertThrows<WorkspaceException> {
            workspaceStoreR2dbcRepository.update(workspace)
        }
    }

    @Test
    fun `should delete workspace`() = runBlocking {
        // Given
        coEvery { workspaceRepository.deleteById(any()) } returns Unit

        // When
        workspaceStoreR2dbcRepository.delete(workspace.id)

        // Then
        coVerify(exactly = 1) { workspaceRepository.deleteById(workspace.id.value) }
    }

    @Test
    fun `should find workspace by id`() = runBlocking {
        // Given
        coEvery { workspaceRepository.findById(any()) } returns workspace.toEntity()

        // When
        val result = workspaceStoreR2dbcRepository.findById(workspace.id)

        // Then
        coVerify(exactly = 1) { workspaceRepository.findById(workspace.id.value) }
        assertEquals(workspace, result)
    }

    @Test
    fun `should find all workspaces`() = runBlocking {
        // Given
        val userId = UserId(UUID.randomUUID())
        coEvery { workspaceRepository.findByMemberId(any()) } returns flowOf(workspace.toEntity())

        // When
        val result = workspaceStoreR2dbcRepository.findByMemberId(UserId(userId.value))

        // Then
        coVerify(exactly = 1) { workspaceRepository.findByMemberId(userId.value) }
        assertTrue(result.isNotEmpty())
        assertEquals(workspace, result.first())
    }
}
