package com.hatchgrid.thryve.form.application.details

import com.hatchgrid.common.domain.Service
import com.hatchgrid.common.domain.bus.query.QueryHandler
import com.hatchgrid.thryve.form.application.FormResponse
import com.hatchgrid.thryve.form.domain.FormId
import com.hatchgrid.thryve.form.domain.exception.FormNotFoundException
import org.slf4j.LoggerFactory

/**
 * Query handler for fetching form details.
 *
 * @property finder The service used to fetch form details.
 */
@Service
class DetailFormQueryHandler(
    private val finder: DetailFormFetcher
) : QueryHandler<DetailFormQuery, FormResponse> {

    /**
     * Handles the query to fetch form details.
     *
     * @param query The query containing the form ID.
     * @return The response containing form details.
     * @throws FormNotFoundException if the form is not found.
     */
    override suspend fun handle(query: DetailFormQuery): FormResponse {
        log.debug("Finding form with id: ${query.formId}")
        val formId = FormId(query.formId)
        val form = finder.find(formId) ?: throw FormNotFoundException("Form not found")
        return FormResponse.from(form)
    }

    companion object {
        private val log = LoggerFactory.getLogger(DetailFormQueryHandler::class.java)
    }
}
