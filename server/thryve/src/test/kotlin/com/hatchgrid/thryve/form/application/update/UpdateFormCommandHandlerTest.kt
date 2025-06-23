package com.hatchgrid.thryve.form.application.update

import com.hatchgrid.UnitTest
import com.hatchgrid.common.domain.bus.event.EventPublisher
import com.hatchgrid.thryve.form.FormStub
import com.hatchgrid.thryve.form.domain.Form
import com.hatchgrid.thryve.form.domain.FormFinderRepository
import com.hatchgrid.thryve.form.domain.FormId
import com.hatchgrid.thryve.form.domain.FormRepository
import com.hatchgrid.thryve.form.domain.event.FormUpdatedEvent
import com.hatchgrid.thryve.form.domain.exception.FormNotFoundException
import com.hatchgrid.thryve.users.domain.UserId
import com.hatchgrid.thryve.workspace.application.security.WorkspaceAuthorizationService
import com.hatchgrid.thryve.workspace.domain.WorkspaceId
import com.hatchgrid.thryve.workspace.domain.WorkspaceMemberRepository
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.mockk
import java.util.UUID
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows

@UnitTest
internal class UpdateFormCommandHandlerTest {
    private lateinit var eventPublisher: EventPublisher<FormUpdatedEvent>
    private lateinit var formRepository: FormRepository
    private lateinit var formFinderRepository: FormFinderRepository
    private lateinit var formUpdater: FormUpdater
    private val workspaceMemberRepository: WorkspaceMemberRepository = mockk()
    private val workspaceAuthorizationService: WorkspaceAuthorizationService =
        WorkspaceAuthorizationService(workspaceMemberRepository)
    private lateinit var updateFormCommandHandler: UpdateFormCommandHandler
    private lateinit var form: Form
    private lateinit var workspaceId: WorkspaceId
    private val userId = UserId("17140d5a-3879-4708-b7ca-097095a085fe")

    @BeforeEach
    fun setUp() {
        eventPublisher = mockk(relaxed = true)
        formRepository = mockk(relaxed = true)
        formFinderRepository = mockk(relaxed = true)
        formUpdater = FormUpdater(formRepository, formFinderRepository, eventPublisher)
        updateFormCommandHandler = UpdateFormCommandHandler(workspaceAuthorizationService, formUpdater)
        form = FormStub.generateRandomForm()
        workspaceId = form.workspaceId
        form.pullDomainEvents()
        coEvery {
            workspaceMemberRepository.existsByWorkspaceIdAndUserId(
                eq(workspaceId.value),
                eq(userId.value),
            )
        } returns true
        coEvery {
            formFinderRepository.findByFormIdAndWorkspaceId(
                any(),
                any(),
            )
        } returns form
    }

    @Test
    fun `should update a form`() = runBlocking {
        val command = UpdateFormCommand(
            id = form.id.value.toString(),
            name = "Updated Form Name",
            header = "Updated Form Header",
            description = "Updated Form Description",
            inputPlaceholder = "Updated Placeholder",
            buttonText = "Updated Button Text",
            buttonColor = "#FF5733",
            backgroundColor = "#FFFFFF",
            textColor = "#000000",
            buttonTextColor = "#FFFFFF",
            workspaceId = form.workspaceId.value.toString(),
            userId = userId.value.toString(),
        )

        updateFormCommandHandler.handle(command)

        coVerify(exactly = 1) { formRepository.update(any()) }
        coVerify(exactly = 1) { eventPublisher.publish(any(FormUpdatedEvent::class)) }
    }
    @Test
    fun `should do nothing when the form has no changes`() = runBlocking {
        val command = UpdateFormCommand(
            id = form.id.value.toString(),
            name = form.name,
            header = form.header,
            description = form.description,
            inputPlaceholder = form.inputPlaceholder,
            buttonText = form.buttonText,
            buttonColor = form.buttonColor.value,
            backgroundColor = form.backgroundColor.value,
            textColor = form.textColor.value,
            buttonTextColor = form.buttonTextColor.value,
            workspaceId = form.workspaceId.value.toString(),
            userId = userId.value.toString(),
        )

        updateFormCommandHandler.handle(command)

        coVerify(exactly = 0) { formRepository.update(any()) }
        coVerify(exactly = 0) { eventPublisher.publish(any(FormUpdatedEvent::class)) }
    }
    @Test
    fun `should throw an exception when the form is not found`() {
        val formId = FormId(UUID.randomUUID())
        val command = UpdateFormCommand(
            id = formId.value.toString(),
            name = "Updated Form Name",
            header = "Updated Form Header",
            description = "Updated Form Description",
            inputPlaceholder = "Updated Placeholder",
            buttonText = "Updated Button Text",
            buttonColor = "#FF5733",
            backgroundColor = "#FFFFFF",
            textColor = "#000000",
            buttonTextColor = "#FFFFFF",
            workspaceId = workspaceId.value.toString(),
            userId = userId.value.toString(),
        )
        coEvery {
            formFinderRepository.findByFormIdAndWorkspaceId(
                formId,
                workspaceId,
            )
        } returns null

        runBlocking {
            val exception = assertThrows<FormNotFoundException> {
                updateFormCommandHandler.handle(command)
            }
            assertEquals("Form not found", exception.message)
        }
    }
}
