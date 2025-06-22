package com.hatchgrid.thryve.form.application.find

import com.hatchgrid.common.domain.Service
import com.hatchgrid.thryve.form.domain.Form
import com.hatchgrid.thryve.form.domain.FormFinderRepository
import com.hatchgrid.thryve.form.domain.FormId
import com.hatchgrid.thryve.form.domain.exception.FormNotFoundException
import com.hatchgrid.thryve.workspace.domain.WorkspaceId
import org.slf4j.LoggerFactory

/**
 * This is a service class that handles the finding of forms.
 * It uses a [FormFinderRepository] to find a form by its ID.
 *
 * @property finder [FormFinderRepository] The repository to use for finding forms.
 */
@Service
class FormFinder(private val finder: FormFinderRepository) {
    /**
     * This function is used to find a form by its ID.
     *
     * @param workspaceId The workspace ID of the form to find.
     * @param formId The ID of the form to find.
     * @return The form if found, or throws a [FormNotFoundException] if not found.
     */
    suspend fun find(workspaceId: WorkspaceId, formId: FormId): Form? {
        log.debug("Finding form with ids: {}, {}", workspaceId, formId)
        return finder.findByFormIdAndWorkspaceId(workspaceId = workspaceId, formId = formId)
    }

    companion object {
        private val log = LoggerFactory.getLogger(FormFinder::class.java)
    }
}
