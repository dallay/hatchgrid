package com.hatchgrid.thryve.form.application.delete

import com.hatchgrid.UnitTest
import com.hatchgrid.common.domain.bus.event.EventPublisher
import com.hatchgrid.thryve.form.FormStub
import com.hatchgrid.thryve.form.application.find.FormFinder
import com.hatchgrid.thryve.form.domain.Form
import com.hatchgrid.thryve.form.domain.FormFinderRepository
import com.hatchgrid.thryve.form.domain.FormId
import com.hatchgrid.thryve.form.domain.FormRepository
import com.hatchgrid.thryve.form.domain.event.FormDeletedEvent
import com.hatchgrid.thryve.form.domain.exception.FormNotFoundException
import com.hatchgrid.thryve.users.domain.UserId
import com.hatchgrid.thryve.workspace.application.security.WorkspaceAuthorizationService
import com.hatchgrid.thryve.workspace.domain.WorkspaceAuthorizationException
import com.hatchgrid.thryve.workspace.domain.WorkspaceId
import com.hatchgrid.thryve.workspace.domain.WorkspaceMemberRepository
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import io.mockk.mockkClass
import java.util.UUID
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows

@UnitTest
internal class DeleteFormCommandHandlerTest {
    private lateinit var eventPublisher: EventPublisher<FormDeletedEvent>
    private lateinit var formRepository: FormRepository
    private lateinit var formFinderRepository: FormFinderRepository
    private lateinit var formFinder: FormFinder
    private lateinit var formDestroyer: FormDestroyer
    private val workspaceMemberRepository: WorkspaceMemberRepository = mockk()
    private val workspaceAuthorizationService: WorkspaceAuthorizationService =
        WorkspaceAuthorizationService(workspaceMemberRepository)
    private lateinit var deleteFormCommandHandler: DeleteFormCommandHandler
    private lateinit var workspaceId: WorkspaceId
    private lateinit var formId: FormId
    private lateinit var userId: UserId
    private lateinit var form: Form

    @BeforeEach
    fun setUp() {
        eventPublisher = mockk()
        formRepository = mockkClass(FormRepository::class)
        formFinderRepository = mockkClass(FormFinderRepository::class)
        formFinder = FormFinder(formFinderRepository)
        formDestroyer = FormDestroyer(formRepository, formFinder, eventPublisher)
        deleteFormCommandHandler = DeleteFormCommandHandler(workspaceAuthorizationService, formDestroyer)

        workspaceId = WorkspaceId(UUID.randomUUID())
        formId = FormId(UUID.randomUUID())
        userId = UserId(UUID.randomUUID())
        form = FormStub.create(id = formId.value.toString(), workspaceId = workspaceId.value.toString())

        coEvery {
            workspaceMemberRepository.existsByWorkspaceIdAndUserId(
                eq(workspaceId.value),
                eq(userId.value),
            )
        } returns true
        coEvery { formFinderRepository.findByFormIdAndWorkspaceId(eq(formId), eq(workspaceId)) } returns form
        coEvery { formRepository.delete(any()) } returns Unit
        coEvery { eventPublisher.publish(any(FormDeletedEvent::class)) } returns Unit
    }

    @Test
    fun `should delete a form`() = runBlocking {
        // Given
        val command = DeleteFormCommand(
            workspaceId = workspaceId.value.toString(),
            formId = formId.value.toString(),
            userId = userId.value.toString(),
        )

        // When
        deleteFormCommandHandler.handle(command)

        // Then
        coVerify(exactly = 1) {
            formRepository.delete(
                withArg {
                    assert(it.value.toString() == formId.value.toString())
                },
            )
        }
        coVerify(exactly = 1) { eventPublisher.publish(ofType<FormDeletedEvent>()) }
    }

    @Test
    fun `should throw exception when user not authorized`(): Unit = runBlocking {
        // Given
        coEvery {
            workspaceMemberRepository.existsByWorkspaceIdAndUserId(any(), any())
        } returns false

        val command = DeleteFormCommand(
            workspaceId = workspaceId.value.toString(),
            formId = formId.value.toString(),
            userId = userId.value.toString(),
        )

        // When & Then
        assertThrows<WorkspaceAuthorizationException> {
            deleteFormCommandHandler.handle(command)
        }
    }

    @Test
    fun `should throw exception when form not found`(): Unit = runBlocking {
        // Given
        coEvery {
            formFinderRepository.findByFormIdAndWorkspaceId(any(), any())
        } returns null

        val command = DeleteFormCommand(
            workspaceId = workspaceId.value.toString(),
            formId = formId.value.toString(),
            userId = userId.value.toString(),
        )

        // When & Then
        assertThrows<FormNotFoundException> {
            deleteFormCommandHandler.handle(command)
        }
    }
}
