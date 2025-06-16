package com.hatchgrid.thryve.newsletter.tag.infrastructure.http

import com.hatchgrid.thryve.AppConstants.Paths.API
import com.hatchgrid.thryve.newsletter.tag.application.TagResponse
import com.hatchgrid.thryve.newsletter.tag.application.list.GetAllTagsQuery
import com.hatchgrid.common.domain.bus.Mediator
import com.hatchgrid.common.domain.presentation.PageResponse
import com.hatchgrid.spring.boot.ApiController
import com.hatchgrid.thryve.AppConstants.UUID_PATTERN
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import jakarta.validation.constraints.Pattern
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

/**
 * REST controller for handling requests to get all tags for a specific workspace.
 *
 * @property mediator The mediator to handle queries.
 */
@RestController
@RequestMapping(value = [API], produces = ["application/vnd.api.v1+json"])
class GetAllTagController(
    mediator: Mediator,
) : ApiController(mediator) {

    /**
     * Endpoint to get all tags for a specific workspace.
     *
     * @param workspaceId The ID of the workspace to get tags for.
     * @return A ResponseEntity containing a PageResponse with the list of tags.
     */
    @Operation(summary = "Get all tags for a specific workspace")
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "List of tags"),
        ApiResponse(responseCode = "500", description = "Internal server error"),
    )
    @GetMapping("/workspace/{workspaceId}/tag")
    suspend fun getAllTags(
        @Parameter(
            description = "ID of the workspace to be found",
            required = true,
            schema = Schema(type = "string", format = "uuid")
        )
        @Pattern(
            regexp = UUID_PATTERN,
            message = "Invalid UUID format"
        ) @PathVariable workspaceId: String,
    ): ResponseEntity<PageResponse<TagResponse>> {
        log.debug("Getting all tags for workspace with id: {}", sanitizePathVariable(workspaceId))
        val query = GetAllTagsQuery(workspaceId)
        val response = ask(query)
        return ResponseEntity.ok(response)
    }

    companion object {
        private val log = LoggerFactory.getLogger(GetAllTagController::class.java)
    }
}
