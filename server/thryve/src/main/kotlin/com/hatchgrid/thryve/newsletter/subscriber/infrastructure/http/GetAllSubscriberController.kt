package com.hatchgrid.thryve.newsletter.subscriber.infrastructure.http

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
import com.hatchgrid.thryve.newsletter.subscriber.application.SubscriberResponse
import com.hatchgrid.thryve.newsletter.subscriber.application.search.all.SearchAllSubscribersQuery
import com.hatchgrid.thryve.newsletter.subscriber.infrastructure.persistence.entity.SubscriberEntity
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
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseBody
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping(value = [API], produces = ["application/vnd.api.v1+json"])
class GetAllSubscriberController(
    mediator: Mediator,
    rhsFilterParserFactory: RHSFilterParserFactory,
    sortParserFactory: SortParserFactory,
) : ApiController(mediator) {
    private val rhsFilterParser = rhsFilterParserFactory.create(SubscriberEntity::class)
    private val sortParser = sortParserFactory.create(SubscriberEntity::class)

    @Operation(summary = "Get all subscribers")
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Success"),
        ApiResponse(responseCode = "500", description = "Internal server error"),
    )
    @GetMapping("/workspace/{workspaceId}/newsletter/subscriber")
    @ResponseBody
    suspend fun findAll(
        @Parameter(
            description = "ID of the workspace to be found",
            required = true,
            schema = Schema(type = "string", format = "uuid"),
        )
        @Pattern(
            regexp = UUID_PATTERN,
            message = "Invalid UUID format",
        ) @PathVariable workspaceId: String,
        cursorRequestPageable: CursorRequestPageable
    ): ResponseEntity<CursorPageResponse<SubscriberResponse>> {
        log.debug(
            "Get all subscribers with cursor: {}",
            sanitizeAndJoinPathVariables(workspaceId),
        )

        val userId = userId() ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()

        val criteria: Criteria =
            criteria(cursorRequestPageable).and(Criteria.Equals("workspaceId", workspaceId))

        val response = ask(
            SearchAllSubscribersQuery(
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
     * The criteria object is used to filter the results. It is created from the search and filter
     * properties of the cursor request pageable.
     * Search is used to filter the email, firstname and lastname fields.
     * Filter is used to filter the fields of the entity.
     *
     * @param cursorRequestPageable The cursor request pageable.
     * @return The criteria object.
     */
    private fun criteria(cursorRequestPageable: CursorRequestPageable): Criteria {
        val searchMap = mutableMapOf<KProperty1<SubscriberEntity, *>, List<String>>()
        val filterMap = mutableMapOf<KProperty1<SubscriberEntity, *>, FilterCondition>()

        val search = cursorRequestPageable.search
        val searchQuery = if (!search.isNullOrBlank()) getSearchQuery(search) else emptyList()

        val searchableProperties = mapOf(
            SubscriberEntity::email.name to searchQuery,
        )

        SubscriberEntity::class.memberProperties.forEach { property ->
            val propertySearch = searchableProperties.getOrDefault(property.name, emptyList())
            val propertyFilter = cursorRequestPageable.filter.getOrDefault(
                property.name,
                FilterCondition(LogicalOperator.AND, emptyList()),
            )
            searchMap[property] = propertySearch
            filterMap[property] = propertyFilter
        }

        val filterCriteriaList = mutableListOf<Criteria>()
        processFilterMap(filterMap, filterCriteriaList)

        val searchCriteria = rhsFilterParser.parse(searchMap, useOr = true)

        val criteriaList = mutableListOf<Criteria>()
        if (filterCriteriaList.isNotEmpty()) {
            criteriaList.add(Criteria.And(filterCriteriaList))
        }
        if (searchCriteria !is Criteria.Empty) {
            criteriaList.add(searchCriteria)
        }

        return if (criteriaList.isNotEmpty()) Criteria.And(criteriaList) else Criteria.Empty
    }

    private fun processFilterMap(
        filterMap: Map<KProperty1<SubscriberEntity, *>, FilterCondition>,
        filterCriteriaList: MutableList<Criteria>
    ) {
        filterMap.forEach { (property, condition) ->
            val criteria = when (condition.operator) {
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
            if (criteria !is Criteria.Empty) {
                filterCriteriaList.add(criteria)
            }
        }
    }

    /**
     * Creates a list of search queries from the search string.
     * The search string is split by spaces and each part is used to filter the email, firstname and
     * lastname fields.
     * The search query is used to filter the results.
     * The search query is used to filter the email, firstname and lastname fields.
     *
     * @param search The search string.
     * @return The list of search queries.
     */
    private fun getSearchQuery(search: String): List<String> {
        val trimQuery = search.trim()
        val searchQuery = listOf(
            "ilk:%$trimQuery%",
        )
        return searchQuery
    }

    companion object {
        private val log = LoggerFactory.getLogger(GetAllSubscriberController::class.java)
    }
}
