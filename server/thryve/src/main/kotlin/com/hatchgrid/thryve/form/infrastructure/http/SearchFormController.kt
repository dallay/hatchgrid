package com.hatchgrid.thryve.form.infrastructure.http

import com.hatchgrid.common.domain.bus.Mediator
import com.hatchgrid.common.domain.criteria.Criteria
import com.hatchgrid.common.domain.criteria.and
import com.hatchgrid.common.domain.error.InvalidFilterOperator
import com.hatchgrid.common.domain.presentation.pagination.CursorPageResponse
import com.hatchgrid.common.domain.presentation.pagination.CursorRequestPageable
import com.hatchgrid.common.domain.presentation.pagination.FilterCondition
import com.hatchgrid.common.domain.presentation.pagination.LogicalOperator
import com.hatchgrid.spring.boot.ApiController
import com.hatchgrid.spring.boot.presentation.filter.RHSFilterParserFactory
import com.hatchgrid.spring.boot.presentation.sort.SortParserFactory
import com.hatchgrid.thryve.AppConstants.Paths.API
import com.hatchgrid.thryve.AppConstants.UUID_PATTERN
import com.hatchgrid.thryve.form.application.FormResponse
import com.hatchgrid.thryve.form.application.search.SearchFormsQuery
import com.hatchgrid.thryve.form.infrastructure.persistence.entity.FormEntity
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import jakarta.validation.constraints.Pattern
import kotlin.reflect.KProperty1
import kotlin.reflect.full.memberProperties
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

/**
 * This is a REST controller for searching forms.
 * It extends the ApiController class and uses the Mediator design pattern for handling requests.
 * It uses the RHSFilterParserFactory and SortParserFactory for parsing filters and sorting parameters.
 */
@RestController
@RequestMapping(value = [API], produces = ["application/vnd.api.v1+json"])
class SearchFormController(
    mediator: Mediator,
    rhsFilterParserFactory: RHSFilterParserFactory,
    sortParserFactory: SortParserFactory,
) : ApiController(mediator) {
    private val rhsFilterParser = rhsFilterParserFactory.create(FormEntity::class)
    private val sortParser = sortParserFactory.create(FormEntity::class)

    @Operation(summary = "Search forms")
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Forms found"),
        ApiResponse(responseCode = "400", description = "Bad request"),
        ApiResponse(responseCode = "500", description = "Internal server error"),
    )
    @GetMapping("/workspace/{workspaceId}/form/search")
    suspend fun search(
        @Parameter(
            description = "ID of the workspace to be found",
            required = true,
            schema = Schema(type = "string", format = "uuid"),
        )
        @Pattern(
            regexp = UUID_PATTERN,
            message = "Invalid UUID format",
        )
        @PathVariable workspaceId: String,
        @Parameter(
            description = "Cursor request pageable for pagination, filtering and sorting",
            required = true,
            schema = Schema(implementation = CursorRequestPageable::class),
        )
        @Validated cursorRequestPageable: CursorRequestPageable
    ): ResponseEntity<CursorPageResponse<FormResponse>> {
        val sanitizedWorkspaceId = sanitizePathVariable(workspaceId)
        log.debug("Searching forms in workspace with id: {}", sanitizedWorkspaceId)
        val userId = userId() ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()
        val criteria: Criteria = criteria(cursorRequestPageable).and(Criteria.Equals("workspaceId", workspaceId))

        val response = ask(
            SearchFormsQuery(
                workspaceId,
                userId,
                criteria,
                cursorRequestPageable.size,
                cursorRequestPageable.cursor,
                cursorRequestPageable.sort?.let { if (it.isEmpty()) null else sortParser.parse(it) },
            ),
        )
        return ResponseEntity.ok(response)
    }

    /**
     * Creates a criteria object from the cursor request pageable.
     * The criteria object is used to filter the form results based on search and filter properties.
     * Search is used to match form fields including name, header, description, input placeholder,
     * and button text. Filter is used to apply specific filtering conditions on any form field.
     *
     * @param cursorRequestPageable The cursor request pageable containing search and filter parameters.
     * @return The criteria object for form filtering.
     */
    private fun criteria(cursorRequestPageable: CursorRequestPageable): Criteria {
        val search = cursorRequestPageable.search
        val searchQuery = if (!search.isNullOrBlank()) getSearchQuery(search) else emptyList()
        val searchableProperties = mapOf(
            FormEntity::name to searchQuery,
            FormEntity::header to searchQuery,
            FormEntity::description to searchQuery,
            FormEntity::inputPlaceholder to searchQuery,
            FormEntity::buttonText to searchQuery,
        )
        val searchMap = FormEntity::class.memberProperties.associateWith { property ->
            searchableProperties.getOrDefault(property, emptyList())
        }
        val filterMap = FormEntity::class.memberProperties.associateWith { property ->
            cursorRequestPageable.filter.getOrDefault(
                property.name,
                FilterCondition(LogicalOperator.AND, emptyList()),
            )
        }
        val filterCriteriaList = processFilterMap(filterMap)

        val searchCriteria = rhsFilterParser.parse(searchMap, useOr = true)

        val criteriaList = buildList {
            if (filterCriteriaList.isNotEmpty()) {
                add(Criteria.And(filterCriteriaList))
            }
            if (searchCriteria !is Criteria.Empty) {
                add(searchCriteria)
            }
        }

        return if (criteriaList.isNotEmpty()) Criteria.And(criteriaList) else Criteria.Empty
    }

    private fun processFilterMap(
        filterMap: Map<KProperty1<FormEntity, *>, FilterCondition>,
    ): List<Criteria> {
        return filterMap.map { (property, condition) ->
            when (condition.operator) {
                LogicalOperator.OR -> rhsFilterParser.parse(
                    mapOf(property to condition.values),
                    useOr = true,
                )

                LogicalOperator.AND -> rhsFilterParser.parse(
                    mapOf(property to condition.values),
                    useOr = false,
                )

                else -> throw InvalidFilterOperator("Unsupported operator: ${condition.operator}")
            }
        }.filter { it !is Criteria.Empty }
    }

    /**
     * Creates a list of search queries from the given search string.
     * The search query is used to filter form fields (name, header, description,
     * input placeholder, and button text). It creates case-insensitive variations
     * of the search term by generating lowercase, uppercase, and titlecase versions.
     *
     * @param search The search string to match against form fields.
     * @return The list of search queries in different case variations.
     */
    private fun getSearchQuery(search: String): List<String> {
        val trimQuery = search.trim()
        return listOf("ilk:%$trimQuery%")
    }

    companion object {
        private val log = LoggerFactory.getLogger(SearchFormController::class.java)
    }
}
