package com.hatchgrid.thryve.form.application.delete

import com.hatchgrid.common.domain.Service
import com.hatchgrid.common.domain.bus.event.EventBroadcaster
import com.hatchgrid.common.domain.bus.event.EventPublisher
import com.hatchgrid.thryve.form.application.find.FormFinder
import com.hatchgrid.thryve.form.domain.FormId
import com.hatchgrid.thryve.form.domain.FormRepository
import com.hatchgrid.thryve.form.domain.event.FormDeletedEvent
import com.hatchgrid.thryve.form.domain.exception.FormNotFoundException
import com.hatchgrid.thryve.workspace.domain.WorkspaceId
import org.slf4j.LoggerFactory

/**
 * This service class is responsible for deleting forms.
 *
 * @property formRepository The repository that handles the deletion of forms.
 * @property eventPublisher The publisher that handles the broadcasting of form deletion events.
 */
@Service
class FormDestroyer(
    private val formRepository: FormRepository,
    private val finder: FormFinder,
    eventPublisher: EventPublisher<FormDeletedEvent>
) {
    private val eventPublisher = EventBroadcaster<FormDeletedEvent>()

    init {
        this.eventPublisher.use(eventPublisher)
    }

    /**
     * Deletes a form with the given id.
     *
     * @param workspaceId The id of the workspace that owns the form.
     * @param formId The id of the form to be deleted.
     */
    suspend fun delete(workspaceId: WorkspaceId, formId: FormId) {
        log.debug("Deleting form with ids: {}, {}", workspaceId, formId)
        val form =
            finder.find(workspaceId, formId) ?: throw FormNotFoundException("Form not found")
        formRepository.delete(form.id).also {
            eventPublisher.publish(FormDeletedEvent(formId.value.toString()))
        }
    }

    companion object {
        private val log = LoggerFactory.getLogger(FormDestroyer::class.java)
    }
}
