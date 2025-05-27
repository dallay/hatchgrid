package com.hatchgrid.thryve.workspace.application.update

import com.hatchgrid.UnitTest
import com.hatchgrid.thryve.workspace.WorkspaceStub
import com.hatchgrid.thryve.workspace.domain.Workspace
import com.hatchgrid.thryve.workspace.domain.WorkspaceFinderRepository
import com.hatchgrid.thryve.workspace.domain.WorkspaceRepository
import com.hatchgrid.thryve.workspace.domain.event.WorkspaceUpdatedEvent
import com.hatchgrid.common.domain.bus.event.EventPublisher
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

@UnitTest
internal class UpdateCreateWorkspaceCommandHandlerTest {
    private lateinit var eventPublisher: EventPublisher<WorkspaceUpdatedEvent>
    private lateinit var workspaceRepository: WorkspaceRepository
    private lateinit var workspaceFinderRepository: WorkspaceFinderRepository
    private lateinit var workspaceUpdater: WorkspaceUpdater
    private lateinit var updateWorkspaceCommandHandler: UpdateWorkspaceCommandHandler
    private lateinit var workspace: Workspace
    @BeforeEach
    fun setUp() {
        eventPublisher = mockk()
        workspaceRepository = mockk()
        workspaceFinderRepository = mockk()
        workspaceUpdater = WorkspaceUpdater(workspaceRepository, workspaceFinderRepository, eventPublisher)
        updateWorkspaceCommandHandler = UpdateWorkspaceCommandHandler(workspaceUpdater)
        workspace = WorkspaceStub.create()

        coEvery { workspaceRepository.update(any()) } returns Unit
        coEvery { workspaceFinderRepository.findById(any()) } returns workspace
        coEvery { eventPublisher.publish(any(WorkspaceUpdatedEvent::class)) } returns Unit
    }

    @Test
    fun `should update an workspace`() = runBlocking {
        // Given
        val command = UpdateWorkspaceCommand(
            id = workspace.id.value.toString(),
            name = workspace.name,
            description = workspace.description,
        )

        // When
        updateWorkspaceCommandHandler.handle(command)

        // Then
        coVerify(exactly = 1) {
            workspaceRepository.update(
                withArg {
                    assert(it.id.value.toString() == workspace.id.value.toString())
                    assert(it.name == workspace.name)
                    assert(it.description == workspace.description)
                    assert(it.ownerId == workspace.ownerId)
                    assert(it.members.size == 1) // Owner is added as a member
                    assert(it.members.first().value.toString() == workspace.ownerId.value.toString())
                },
            )
        }
        coVerify(exactly = 1) { eventPublisher.publish(ofType<WorkspaceUpdatedEvent>()) }
    }
}
