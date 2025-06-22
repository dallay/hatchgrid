package com.hatchgrid.thryve.form.application.update

import com.hatchgrid.common.domain.Service
import com.hatchgrid.common.domain.bus.event.EventBroadcaster
import com.hatchgrid.common.domain.bus.event.EventPublisher
import com.hatchgrid.thryve.form.domain.FormFinderRepository
import com.hatchgrid.thryve.form.domain.FormId
import com.hatchgrid.thryve.form.domain.FormRepository
import com.hatchgrid.thryve.form.domain.dto.FormConfiguration
import com.hatchgrid.thryve.form.domain.event.FormUpdatedEvent
import com.hatchgrid.thryve.form.domain.exception.FormNotFoundException
import com.hatchgrid.thryve.workspace.domain.WorkspaceId
import org.slf4j.LoggerFactory

/**
 * Service class responsible for updating forms.
 *
 * @property formRepository The repository for form data.
 * @property formFinderRepository The repository for finding forms.
 * @property eventPublisher The publisher for form update events.
 */
@Service
class FormUpdater(
    private val formRepository: FormRepository,
    private val formFinderRepository: FormFinderRepository,
    eventPublisher: EventPublisher<FormUpdatedEvent>
) {
    private val eventPublisher = EventBroadcaster<FormUpdatedEvent>()

    init {
        this.eventPublisher.use(eventPublisher)
    }

    /**
     * Updates a form with the given id and DTO.
     * Throws a FormNotFoundException if the form is not found.
     *
     * @param workspaceId The id of the workspace that owns the form.
     * @param formId The id of the form to update.
     * @param formConfiguration The DTO containing the new form data.
     */
    suspend fun update(workspaceId: WorkspaceId, formId: FormId, formConfiguration: FormConfiguration) {
        log.debug("Updating form with name: ${formConfiguration.name}")
        val form = formFinderRepository.findByFormIdAndWorkspaceId(formId, workspaceId)
            ?: throw FormNotFoundException("Form not found")
        val updatedForm = form.update(formConfiguration)
        if (form == updatedForm) {
            log.debug("No changes detected for form with id: {}", formId)
            return
        }
        formRepository.update(updatedForm)
        val domainEvents = updatedForm.pullDomainEvents()
        domainEvents.filterIsInstance<FormUpdatedEvent>().forEach {
            eventPublisher.publish(it)
        }
    }

    companion object {
        private val log = LoggerFactory.getLogger(FormUpdater::class.java)
    }
}
