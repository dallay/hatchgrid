package com.hatchgrid.thryve.form.application.details

import com.hatchgrid.common.domain.Service
import com.hatchgrid.thryve.form.domain.Form
import com.hatchgrid.thryve.form.domain.FormFinderRepository
import com.hatchgrid.thryve.form.domain.FormId
import org.slf4j.LoggerFactory

/**
 * Service class responsible for fetching form details.
 *
 * @property finder The repository used to find forms by their ID.
 */
@Service
class DetailFormFetcher(private val finder: FormFinderRepository) {

    /**
     * Finds a form by its ID.
     *
     * @param formId The ID of the form to find.
     * @return The form if found, or null if not found.
     */
    suspend fun find(formId: FormId): Form? {
        log.debug("Finding form with id: {}", formId)
        return finder.findById(formId)
    }

    companion object {
        private val log = LoggerFactory.getLogger(DetailFormFetcher::class.java)
    }
}
