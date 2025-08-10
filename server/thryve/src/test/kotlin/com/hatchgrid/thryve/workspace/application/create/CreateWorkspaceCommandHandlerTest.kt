package com.hatchgrid.thryve.workspace.application.create

import com.hatchgrid.UnitTest
import com.hatchgrid.common.domain.bus.event.EventPublisher
import com.hatchgrid.thryve.workspace.domain.WorkspaceRepository
import com.hatchgrid.thryve.workspace.domain.event.WorkspaceCreatedEvent
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import java.util.*
import kotlinx.coroutines.test.runTest
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

@UnitTest
internal class CreateWorkspaceCommandHandlerTest {
    private lateinit var eventPublisher: EventPublisher<WorkspaceCreatedEvent>
    private lateinit var workspaceRepository: WorkspaceRepository
    private lateinit var workspaceCreator: WorkspaceCreator
    private lateinit var createWorkspaceCommandHandler: CreateWorkspaceCommandHandler

    @BeforeEach
    fun setUp() {
        eventPublisher = mockk()
        workspaceRepository = mockk()
        workspaceCreator = WorkspaceCreator(workspaceRepository, eventPublisher)
        createWorkspaceCommandHandler = CreateWorkspaceCommandHandler(workspaceCreator)

        coEvery { workspaceRepository.create(any()) } returns Unit
        coEvery { eventPublisher.publish(any<WorkspaceCreatedEvent>()) } returns Unit
    }

    @Test
    fun `should create workspace and publish event when handle is called`() = runTest {
        // Given
        val workspaceId = UUID.randomUUID().toString()
        val ownerId = UUID.randomUUID().toString()
        val name = "Test Workspace"
        val command = CreateWorkspaceCommand(
            id = workspaceId,
            name = name,
            description = "A test workspace",
            ownerId = ownerId,
        )

        // When
        createWorkspaceCommandHandler.handle(command)

        // Then
        coVerify {
            workspaceRepository.create(
                withArg {
                    assertEquals(workspaceId, it.id.value.toString())
                    assertEquals(name, it.name)
                    assertEquals("A test workspace", it.description)
                    assertEquals(ownerId, it.ownerId.value.toString())
                    assertEquals(1, it.members.size) // Owner is added as a member
                    assertEquals(ownerId, it.members.first().value.toString())
                },
            )
        }
        coVerify { eventPublisher.publish(ofType<WorkspaceCreatedEvent>()) }
    }
}
