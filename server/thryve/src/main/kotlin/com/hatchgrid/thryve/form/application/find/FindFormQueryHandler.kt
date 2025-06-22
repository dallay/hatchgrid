package com.hatchgrid.thryve.form.application.find

import com.hatchgrid.common.domain.Service
import com.hatchgrid.common.domain.bus.query.QueryHandler
import com.hatchgrid.thryve.form.application.FormResponse
import com.hatchgrid.thryve.form.domain.FormId
import com.hatchgrid.thryve.form.domain.exception.FormNotFoundException
import com.hatchgrid.thryve.workspace.domain.WorkspaceId
import org.slf4j.LoggerFactory

/**
 * Service class responsible for handling form find queries.
 *
 * @property finder [FormFinder] The service for finding forms.
 */
@Service
class FindFormQueryHandler(
    private val finder: FormFinder
) : QueryHandler<FindFormQuery, FormResponse> {

    /**
     * Handles a form find query.
     * Logs the id of the form being found, finds the form using the finder service, and returns a [FormResponse].
     * If the form is not found, a [FormNotFoundException] is thrown.
     *
     * @param query The form find query to handle.
     * @return The [FormResponse] for the xfound form.
     * @throws [FormNotFoundException] If the form is not found.
     */
    override suspend fun handle(query: FindFormQuery): FormResponse {
        log.debug("Finding form with ids: ${query.workspaceId}, ${query.formId}")
        val formId = FormId(query.formId)
        val workspaceId = WorkspaceId(query.workspaceId)
        val form = finder.find(workspaceId, formId) ?: throw FormNotFoundException("Form not found")
        return FormResponse.from(form)
    }

    companion object {
        private val log = LoggerFactory.getLogger(FindFormQueryHandler::class.java)
    }
}
